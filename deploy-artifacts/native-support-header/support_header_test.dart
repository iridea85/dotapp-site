import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:oils_inventory/main.dart';
import 'package:oils_inventory/settings_bridge.dart';
import 'package:oils_inventory/pwa_install_layout.dart';

void main() {
  final seed = <String, Object>{
    'doterra_inventory_v2': jsonEncode([InventoryItem(id: 'preserved', name: 'Lavanda', category: doterraCatalog.firstWhere((p) => p.name == 'Lavanda').category, stock: 3, openedQuantity: 1, quantitySet: true, autoShoppingEnabled: false).toJson()]),
    'oils_inventory_v1': '[]',
    'doterra_custom_products_v1': '[]',
    'doterra_personal_recipes_v1': '[]',
    'doterra_inventory_order_v1': '["preserved"]',
    'doterra_bottom_nav_order_v1': '["catalog","scorta","shopping","recipes"]',
    'doterra_catalog_shopping_v1': '[]',
    'unrelated-preference': 'unchanged',
  };
  for (final width in [320.0, 390.0, 430.0, 768.0]) {
    for (final install in [false, true]) {
      testWidgets('native support/settings header in every section $width install=$install', (t) async {
        t.view.physicalSize = Size(width, 900);
        t.view.devicePixelRatio = 1;
        addTearDown(t.view.resetPhysicalSize);
        addTearDown(t.view.resetDevicePixelRatio);
        SharedPreferences.setMockInitialValues(seed);
        var settingsOpened = 0;
        SettingsBridge.testOpen = () => settingsOpened++;
        addTearDown(() {SettingsBridge.testOpen = null;});
        await t.pumpWidget(const DoterraStockApp());
        await t.pumpAndSettle();
        PwaInstallLayout.listener!(install);
        await t.pumpAndSettle();
        for (final section in ['home', 'catalog', 'scorta', 'shopping', 'recipes']) {
          if (section != 'home') {
            await t.tap(find.byKey(section == 'recipes' ? const ValueKey('personal-recipes') : ValueKey('bottom-nav-$section')));
            await t.pumpAndSettle();
          }
          final heart = find.byKey(const ValueKey('header-support-heart'));
          final gear = find.byKey(const ValueKey('assistant-settings-menu'));
          final row = find.byKey(const ValueKey('header-settings-actions'));
          expect(heart, findsOneWidget, reason: section);
          expect(gear, findsOneWidget);
          expect(find.ancestor(of: row, matching: find.byType(AppBar)), findsOneWidget);
          expect(find.descendant(of: row, matching: heart), findsOneWidget);
          expect(find.descendant(of: row, matching: gear), findsOneWidget);
          final h = t.getRect(heart), g = t.getRect(gear);
          expect(h.size, const Size(36, 36));
          expect(g.size, const Size(48, 48));
          expect(h.center.dy, g.center.dy);
          expect(h.right, g.left);
          expect(h.left, greaterThanOrEqualTo(0));
          expect(g.right, lessThanOrEqualTo(width));
          final appbar = t.widget<AppBar>(find.byType(AppBar));
          if (appbar.title != null) {
            final title = t.getRect(find.byWidget(appbar.title!));
            expect(title.right, lessThanOrEqualTo(h.left));
          }
          final button = t.widget<IconButton>(heart);
          final icon = button.icon as Icon;
          expect(icon.size, 20);
          expect(icon.icon, Icons.favorite_rounded);
          expect(t.widget<IconButton>(gear).tooltip, 'Impostazioni');
          expect((t.widget<IconButton>(gear).icon as Icon).icon, Icons.settings_outlined);
          expect(find.byType(AlertDialog), findsNothing);
          final settingsBeforeSupport = settingsOpened;
          await t.tap(heart);
          await t.pumpAndSettle();
          expect(find.byKey(const ValueKey('native-support-dialog')), findsOneWidget);
          expect(find.byType(AlertDialog), findsOneWidget);
          expect(find.text('Sostieni dōtapp'), findsOneWidget);
          expect(settingsOpened, settingsBeforeSupport);
          final dialogIcon = t.widget<Icon>(find.descendant(
            of: find.byType(AlertDialog), matching: find.byType(Icon)));
          expect(dialogIcon.icon, Icons.favorite_rounded);
          expect(dialogIcon.color, const Color(0xFFD63B4C));
          await t.tap(find.byKey(const ValueKey('native-support-close')));
          await t.pumpAndSettle();
          expect(find.byType(AlertDialog), findsNothing);
          final settingsBefore = settingsOpened;
          await t.tap(gear);
          expect(settingsOpened, settingsBefore + 1);
          expect(find.byKey(const ValueKey('global-assistant')), findsOneWidget);
          expect(t.takeException(), isNull, reason: section);
          final prefs = await SharedPreferences.getInstance();
          for (final entry in seed.entries) expect(prefs.get(entry.key), entry.value, reason: entry.key);
          expect(prefs.getKeys(), seed.keys.toSet());
        }
        // An editor without Settings must have no support action.
        await t.tap(find.byKey(const ValueKey('personal-recipes')));
        await t.pumpAndSettle();
        final add = find.byIcon(Icons.add);
        if (add.evaluate().isNotEmpty) {
          await t.tap(add.first);
          await t.pumpAndSettle();
          expect(find.byKey(const ValueKey('assistant-settings-menu')), findsNothing);
          expect(find.byKey(const ValueKey('header-support-heart')), findsNothing);
        }
      });
    }
  }
}
