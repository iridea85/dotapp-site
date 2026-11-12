import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:oils_inventory/main.dart';
import 'package:oils_inventory/catalog_search.dart';
import 'package:oils_inventory/catalog_shopping.dart';
import 'package:oils_inventory/custom_products.dart';
import 'package:shared_preferences/shared_preferences.dart';

Finder keyed(String key) => find.byKey(ValueKey(key));
Future<void> press(WidgetTester t, String key) async {
  await t.ensureVisible(keyed(key));
  await t.tap(keyed(key));
  await t.pumpAndSettle();
}
Future<void> start(WidgetTester t, double width) async {
  t.view.physicalSize = Size(width, 950);
  t.view.devicePixelRatio = 1;
  addTearDown(t.view.resetPhysicalSize);
  addTearDown(t.view.resetDevicePixelRatio);
  final items = [
    InventoryItem(id:'lav', name:'Lavanda', category:'Oli essenziali singoli', stock:2, notes:'Nota prova', targetReserve:3),
    InventoryItem(id:'cream', name:'Crema corpo', category:'Cura della persona', stock:0, openedQuantity:1, trackOpening:true),
    InventoryItem(id:'lemon', name:'Limone', category:'Oli essenziali singoli', stock:0, autoShoppingEnabled:true),
  ];
  SharedPreferences.setMockInitialValues({
    'doterra_inventory_v2':jsonEncode(items.map((e)=>e.toJson()).toList()),
    'oils_inventory_v1':'[]', customProductsStorageKey:'[]',
    'doterra_personal_recipes_v1':'[]', catalogShoppingStorageKey:'[]',
    'doterra_inventory_order_v1':'["lav","cream","lemon"]',
    'DOTAPP_BACKUP_V1':'fixture backup unchanged',
  });
  await t.pumpWidget(const DoterraStockApp());
  await t.pumpAndSettle();
}
void main() {
  for (final width in [320.0, 360.0, 390.0, 430.0]) {
    testWidgets('Balanced mobile actions at width $width', (t) async {
      await start(t, width);
      final search=t.getRect(keyed('inventory-search'));
      final share=t.getRect(keyed('inventory-share'));
      final select=t.getRect(keyed('inventory-select'));
      expect(share.top, select.top);
      expect(share.width, select.width);
      expect(share.height, greaterThanOrEqualTo(44));
      expect(share.left, search.left);
      expect(select.right, search.right);
      expect(share.top-search.bottom, lessThanOrEqualTo(8));
      expect(select.left-share.right, 8);
      expect(t.getRect(keyed('inventory-actions')).bottom,
          lessThan(t.getRect(keyed('inventory-category-$catalogFilterAll')).top));
      expect(t.takeException(), isNull);
    });
  }
  testWidgets('Share, select, search and both filter groups preserve stored data', (t) async {
    String? copied;
    t.binding.defaultBinaryMessenger.setMockMethodCallHandler(SystemChannels.platform, (call) async {
      if (call.method == 'Clipboard.setData') copied=(call.arguments as Map)['text'] as String;
      return null;
    });
    addTearDown(()=>t.binding.defaultBinaryMessenger.setMockMethodCallHandler(SystemChannels.platform,null));
    await start(t, 390);
    final prefs=await SharedPreferences.getInstance();
    final before={for(final k in prefs.getKeys()) k:prefs.get(k)};
    await press(t,'inventory-share');
    expect(find.text('TUTTO IL MIO INVENTARIO'), findsOneWidget);
    await t.tap(find.text('TUTTO IL MIO INVENTARIO'));
    await t.pumpAndSettle();
    expect(find.byType(SelectableText), findsWidgets);
    await t.tap(find.text('COPIA TESTO')); await t.pumpAndSettle();
    expect(copied, contains('Lavanda'));
    expect(find.byType(AlertDialog), findsNothing);
    await press(t,'inventory-select');
    await press(t,'inventory-select-visible');
    expect(find.text('3 selezionati'), findsOneWidget);
    expect(keyed('inventory-bulk-share'), findsOneWidget);
    await press(t,'inventory-selection-exit');
    await t.enterText(keyed('inventory-search'),'Lavanda'); await t.pumpAndSettle();
    expect(keyed('inventory-card-lav'), findsOneWidget);
    expect(keyed('inventory-card-cream'), findsNothing);
    await t.enterText(keyed('inventory-search'),''); await t.pumpAndSettle();
    await press(t,'inventory-category-$catalogMacroOils');
    expect(keyed('inventory-card-lav'), findsOneWidget);
    expect(keyed('inventory-card-cream'), findsNothing);
    await press(t,'inventory-category-$catalogFilterAll');
    await press(t,'filter-opened');
    expect(keyed('inventory-card-cream'), findsOneWidget);
    expect(keyed('inventory-card-lav'), findsNothing);
    await press(t,'filter-all');
    expect(keyed('inventory-card-lav'), findsOneWidget);
    for(final k in before.keys) {expect(prefs.get(k),before[k],reason:k);}
    expect(t.takeException(),isNull);
  });
}
