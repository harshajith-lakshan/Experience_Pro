// Minor-unit Money value object. Stores amounts as integer minor units to avoid floating point errors.
// Example: For currencies with 2 decimals (LKR, USD), 1.00 => minorUnits = 100
import 'package:meta/meta.dart';

@immutable
class Money implements Comparable<Money> {
  final int minorUnits;
  final String currency; // ISO code, e.g., 'LKR', 'USD'
  final int decimals; // number of decimal places for this currency, default 2

  const Money({
    required this.minorUnits,
    this.currency = 'LKR',
    this.decimals = 2,
  });

  // Create from major units as integer minorUnits = major * (10^decimals)
  factory Money.fromMajor(int major, {String currency = 'LKR', int decimals = 2}) {
    final factor = pow10(decimals);
    return Money(minorUnits: major * factor, currency: currency, decimals: decimals);
  }

  // Create from a string amount like "1234.56" (parses safely)
  factory Money.parse(String amount, {String currency = 'LKR', int decimals = 2}) {
    final parts = amount.trim();
    if (parts.isEmpty) throw FormatException('Empty money string');
    final negative = parts.startsWith('-');
    final cleaned = negative ? parts.substring(1) : parts;
    final split = cleaned.split('.');
    final major = int.tryParse(split[0]) ?? 0;
    final factor = pow10(decimals);
    int minor = major * factor;
    if (split.length > 1) {
      final fractional = split[1].padRight(decimals, '0').substring(0, decimals);
      minor += int.tryParse(fractional) ?? 0;
    }
    if (negative) minor = -minor;
    return Money(minorUnits: minor, currency: currency, decimals: decimals);
  }

  // Use when you already have minor units
  const Money.minor(this.minorUnits, {this.currency = 'LKR', this.decimals = 2});

  Money operator +(Money other) {
    _assertSameCurrency(other);
    return Money.minor(minorUnits + other.minorUnits, currency: currency, decimals: decimals);
  }

  Money operator -(Money other) {
    _assertSameCurrency(other);
    return Money.minor(minorUnits - other.minorUnits, currency: currency, decimals: decimals);
  }

  Money operator *(int multiplier) {
    return Money.minor(minorUnits * multiplier, currency: currency, decimals: decimals);
  }

  // multiply by decimal ratio given as numerator/denominator to avoid double
  Money multiplyRatio(int numerator, int denominator) {
    if (denominator == 0) throw ArgumentError('denominator must not be zero');
    final result = (minorUnits * numerator) ~/ denominator;
    return Money.minor(result, currency: currency, decimals: decimals);
  }

  Money abs() => Money.minor(minorUnits.abs(), currency: currency, decimals: decimals);

  bool get isNegative => minorUnits < 0;
  bool get isZero => minorUnits == 0;

  int toMinorUnits() => minorUnits;

  double toDoubleMajor() {
    return minorUnits / pow10(decimals);
  }

  String toMajorString() {
    final sign = minorUnits < 0 ? '-' : '';
    final absVal = minorUnits.abs();
    final factor = pow10(decimals);
    final major = absVal ~/ factor;
    final fractional = (absVal % factor).toString().padLeft(decimals, '0');
    return '$sign$major.$fractional';
  }

  @override
  int compareTo(Money other) {
    _assertSameCurrency(other);
    return minorUnits.compareTo(other.minorUnits);
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is Money &&
          runtimeType == other.runtimeType &&
          minorUnits == other.minorUnits &&
          currency == other.currency &&
          decimals == other.decimals;

  @override
  int get hashCode => minorUnits.hashCode ^ currency.hashCode ^ decimals.hashCode;

  void _assertSameCurrency(Money other) {
    if (currency != other.currency || decimals != other.decimals) {
      throw ArgumentError('Currency/decimals mismatch: $currency/$decimals vs ${other.currency}/${other.decimals}');
    }
  }

  @override
  String toString() => '$currency ${toMajorString()}';
}

// Helper for power of 10 integer
int pow10(int n) {
  var v = 1;
  for (var i = 0; i < n; i++) v *= 10;
  return v;
}
