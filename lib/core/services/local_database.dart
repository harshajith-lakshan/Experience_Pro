import 'package:hive_flutter/hive_flutter.dart';

class LocalDatabase {
  static const walletsBox = 'wallets';
  static Future<void> init() async {
    await Hive.initFlutter();
    await Hive.openBox(walletsBox);
  }
}
