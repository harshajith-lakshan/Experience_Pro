import 'package:flutter/material.dart';
import 'theme_controller.dart';

class AppTheme {
  static ThemeData lightTheme(ThemeControllerState state) {
    final primary = state.primaryColor;
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(seedColor: primary, brightness: Brightness.light),
      brightness: Brightness.light,
      cardTheme: CardTheme(shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(state.cornerRadius))),
      scaffoldBackgroundColor: Colors.grey[50],
      textTheme: Typography.material2021().black.apply(fontSizeFactor: state.fontSizeScale),
    );
  }

  static ThemeData darkTheme(ThemeControllerState state) {
    final primary = state.primaryColor;
    final base = ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(seedColor: primary, brightness: Brightness.dark),
      brightness: Brightness.dark,
      cardTheme: CardTheme(shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(state.cornerRadius))),
      textTheme: Typography.material2021().white.apply(fontSizeFactor: state.fontSizeScale),
    );
    if (state.amOLED) {
      return base.copyWith(scaffoldBackgroundColor: Colors.black);
    }
    return base;
  }
}
