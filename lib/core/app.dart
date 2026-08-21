import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'theme/theme_controller.dart';
import 'theme/app_theme.dart';
import 'package:easy_localization/easy_localization.dart';
import '../features/auth/presentation/login_page.dart';
import '../features/dashboard/presentation/dashboard_page.dart';
import '../features/wallets/presentation/wallets_page.dart';

final _routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/',
    routes: [
      GoRoute(path: '/', builder: (context, state) => const DashboardPage()),
      GoRoute(path: '/login', builder: (context, state) => const LoginPage()),
      GoRoute(path: '/wallets', builder: (context, state) => const WalletsPage()),
    ],
  );
});

class WalletIQApp extends ConsumerWidget {
  const WalletIQApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(_routerProvider);
    final themeState = ref.watch(themeControllerProvider);
    return MaterialApp.router(
      title: 'WalletIQ',
      themeMode: themeState.themeMode,
      theme: AppTheme.lightTheme(themeState),
      darkTheme: AppTheme.darkTheme(themeState),
      routerConfig: router,
      localizationsDelegates: context.localizationDelegates,
      supportedLocales: context.supportedLocales,
      locale: context.locale,
    );
  }
}
