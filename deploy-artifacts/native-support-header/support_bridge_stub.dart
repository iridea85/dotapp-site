class SupportBridge {
  static void Function()? testOpen;
  static void open() => testOpen?.call();
}
