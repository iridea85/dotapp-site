import 'dart:convert';
import 'dart:io';
import 'dart:ui' as ui;
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:oils_inventory/main.dart';

void main() {
  for (final size in [const Size(320, 568), const Size(390, 844)]) {
    testWidgets('copy/QR preserves data and fits $size', (tester) async {
      tester.view.physicalSize = size;
      tester.view.devicePixelRatio = 1;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);
      final seed = <String, Object>{
        'doterra_inventory_v2': jsonEncode([
          InventoryItem(id: 'copy-qr-fixture', name: 'Lavanda',
            category: doterraCatalog.firstWhere((p) => p.name == 'Lavanda').category,
            stock: 3, openedQuantity: 1, quantitySet: true,
            autoShoppingEnabled: false).toJson(),
        ]),
        'oils_inventory_v1': '[{"id":"legacy-fixture","stock":4}]',
        'doterra_custom_products_v1': '[{"id":"custom-fixture","name":"Prova"}]',
        'doterra_personal_recipes_v1': '[]',
        'doterra_catalog_shopping_v1': '[]',
        'DOTAPP_BACKUP_V1': '{"format":"DOTAPP_BACKUP_V1","fixture":true}',
        'doterra_inventory_order_v1': '["copy-qr-fixture"]',
        'doterra_bottom_nav_order_v1': '["catalog","scorta","shopping","recipes"]',
        'unrelated-fixture': 'unchanged',
      };
      SharedPreferences.setMockInitialValues(seed);
      String? clipboard;
      var clipboardWrites = 0;
      tester.binding.defaultBinaryMessenger.setMockMethodCallHandler(
        SystemChannels.platform, (call) async {
          if (call.method == 'Clipboard.setData') {
            clipboard = (call.arguments as Map)['text'] as String;
            clipboardWrites++;
          }
          if (call.method == 'Clipboard.getData') return {'text': clipboard};
          return null;
        });
      addTearDown(() => tester.binding.defaultBinaryMessenger
        .setMockMethodCallHandler(SystemChannels.platform, null));
      await tester.pumpWidget(RepaintBoundary(
        key: const ValueKey('capture-dialog'), child: const DoterraStockApp()));
      await tester.pumpAndSettle();
      final heart = find.byKey(const ValueKey('header-support-heart'));
      expect(tester.getSize(heart), const Size(36, 36));
      final headerIcon = tester.widget<IconButton>(heart).icon as Icon;
      expect(headerIcon.icon, Icons.favorite_rounded);
      expect(headerIcon.size, 20);
      await tester.tap(heart);
      await tester.pumpAndSettle();
      final dialog = find.byType(AlertDialog);
      expect(dialog, findsOneWidget);
      expect(tester.widget<AlertDialog>(dialog).scrollable, isTrue);
      expect(find.text('Sostieni dōtapp'), findsOneWidget);
      expect(find.text('SOSTIENI DŌTAPP'), findsOneWidget);
      final qr = find.byKey(const ValueKey('native-support-qr'));
      expect(tester.getSize(qr), const Size(176, 176));
      expect(tester.widget<Container>(qr).color, Colors.white);
      expect(find.descendant(of: qr, matching: find.byType(CustomPaint)), findsOneWidget);
      final evidence = Directory(Platform.environment['DOTAPP_QA_EVIDENCE_DIR'] ?? 'build/support-copy-qr-evidence');
      evidence.createSync(recursive: true);
      await tester.ensureVisible(qr);
      await tester.pumpAndSettle();
      final qrRect = tester.getRect(qr);
      expect(qrRect.left, greaterThanOrEqualTo(0));
      expect(qrRect.right, lessThanOrEqualTo(size.width));
      expect(qrRect.top, greaterThanOrEqualTo(0));
      expect(qrRect.bottom, lessThanOrEqualTo(size.height));
      await tester.runAsync(() async {
        final boundary = tester.renderObject<RenderRepaintBoundary>(
          find.byKey(const ValueKey('capture-dialog')));
        final rendered = await boundary.toImage(pixelRatio: 3);
        final bytes = await rendered.toByteData(format: ui.ImageByteFormat.png);
        File('${evidence.path}/dialog-${size.width.toInt()}x${size.height.toInt()}.png')
          .writeAsBytesSync(bytes!.buffer.asUint8List());
      });
      await tester.tap(find.byKey(const ValueKey('native-support-copy')));
      await tester.pumpAndSettle();
      expect(clipboard, 'https://revolut.me/irideaf');
      expect(clipboardWrites, 1);
      expect(find.text('Link Revolut copiato'), findsOneWidget);
      expect(find.byType(AlertDialog), findsOneWidget);
      await tester.tap(find.byKey(const ValueKey('native-support-close')));
      await tester.pumpAndSettle();
      expect(find.byType(AlertDialog), findsNothing);
      expect(tester.takeException(), isNull);
      final preferences = await SharedPreferences.getInstance();
      expect(preferences.getKeys(), seed.keys.toSet());
      for (final entry in seed.entries) {
        expect(preferences.get(entry.key), entry.value, reason: entry.key);
      }
    });
  }
}
