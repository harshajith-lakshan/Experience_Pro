import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class ThemeControllerState {
  final Color primaryColor;
  final double cornerRadius;
  final double fontSizeScale;
  final ThemeMode themeMode;
  final bool amOLED;

  ThemeControllerState({
    required this.primaryColor,
    required this.cornerRadius,
    required this.fontSizeScale,
    required this.themeMode,
    required this.amOLED,
  });

  ThemeControllerState copyWith({
    Color? primaryColor,
    double? cornerRadius,
    double? fontSizeScale,
    ThemeMode? themeMode,
    bool? amOLED,
  }) {
    return ThemeControllerState(
      primaryColor: primaryColor ?? this.primaryColor,
      cornerRadius: cornerRadius ?? this.cornerRadius,
      fontSizeScale: fontSizeScale ?? this.fontSizeScale,
      themeMode: themeMode ?? this.themeMode,
      amOLED: amOLED ?? this.amOLED,
    );
  }
}

class ThemeController extends StateNotifier<ThemeControllerState> {
  ThemeController()
      : super(ThemeControllerState(
          primaryColor: Colors.teal,
          cornerRadius: 12.0,
          fontSizeScale: 1.0,
          themeMode: ThemeMode.system,
          amOLED: false,
        ));

  void setPrimary(Color c) => state = state.copyWith(primaryColor: c);
  void setCornerRadius(double r) => state = state.copyWith(cornerRadius: r);
  void setFontScale(double s) => state = state.copyWith(fontSizeScale: s);
  void setThemeMode(ThemeMode m) => state = state.copyWith(themeMode: m);
  void setAmoled(bool v) => state = state.copyWith(amOLED: v);
}

final themeControllerProvider = StateNotifierProvider<ThemeController, ThemeControllerState>((ref) => ThemeController());
