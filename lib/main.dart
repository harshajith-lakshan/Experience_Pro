import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/app.dart';
import 'core/services/local_database.dart';
import 'firebase_options.dart'; // Generated when you configure Firebase (see instructions)

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await EasyLocalization.ensureInitialized();
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
  await LocalDatabase.init();
  runApp(ProviderScope(child: EasyLocalization(
    supportedLocales: const [Locale('en'), Locale('si'), Locale('ta')],
    path: 'assets/translations',
    fallbackLocale: const Locale('en'),
    child: const WalletIQApp(),
  )));
}
