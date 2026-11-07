import 'dart:js_interop';

@JS('dotappOpenSupport')
external void _open();

class SupportBridge {
  static void open() {
    _open();
  }
}
