import 'package:flutter_test/flutter_test.dart';
import 'package:walletiq/core/utils/money.dart';
import 'package:walletiq/models/wallet.dart';
import 'package:walletiq/models/transaction_model.dart';

void main() {
  test('Case 1: Income 10000, Expense 3000 => balance 7000', () {
    final wallet = WalletModel(
      id: 'w1',
      name: 'Cash',
      balance: const Money.minor(0),
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    );

    final income = TransactionModel(
      id: 't1',
      amount: const Money.minor(10000 * 100), // 10000.00
      type: TransactionType.income,
      categoryId: 'c_income',
      walletId: wallet.id,
      date: DateTime.now(),
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    );

    final expense = TransactionModel(
      id: 't2',
      amount: const Money.minor(3000 * 100),
      type: TransactionType.expense,
      categoryId: 'c_food',
      walletId: wallet.id,
      date: DateTime.now(),
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    );

    var balance = wallet.balance;
    balance = balance + income.amount; // income increases
    balance = balance - expense.amount; // expense decreases
    expect(balance.toMinorUnits(), (10000 - 3000) * 100);
  });

  test('Case 2: Transfer 2000 from Cash to Bank - totals correct', () {
    final cash = WalletModel(
      id: 'cash',
      name: 'Cash',
      balance: const Money.minor(5000 * 100),
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    );
    final bank = WalletModel(
      id: 'bank',
      name: 'Bank',
      balance: const Money.minor(2000 * 100),
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    );

    final transferAmount = const Money.minor(2000 * 100);

    final newCash = cash.copyWith(balance: cash.balance - transferAmount);
    final newBank = bank.copyWith(balance: bank.balance + transferAmount);

    expect(newCash.balance.toMinorUnits(), 3000 * 100);
    expect(newBank.balance.toMinorUnits(), 4000 * 100);

    // Net worth (sum) should remain the same
    final oldNet = cash.balance.toMinorUnits() + bank.balance.toMinorUnits();
    final newNet = newCash.balance.toMinorUnits() + newBank.balance.toMinorUnits();
    expect(oldNet, newNet);
  });

  test('Case 3 & 4: Delete and edit expense update balances correctly', () {
    var wallet = WalletModel(
      id: 'w2',
      name: 'W',
      balance: const Money.minor(10000 * 100),
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    );

    final expense = TransactionModel(
      id: 'e1',
      amount: const Money.minor(3000 * 100),
      type: TransactionType.expense,
      categoryId: 'c',
      walletId: wallet.id,
      date: DateTime.now(),
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    );

    // Apply expense
    wallet = wallet.copyWith(balance: wallet.balance - expense.amount);
    expect(wallet.balance.toMinorUnits(), 7000 * 100);

    // Edit expense to 4000 (increase by 1000)
    final editedExpense = expense.copyWith(amount: const Money.minor(4000 * 100));
    final delta = editedExpense.amount - expense.amount;
    wallet = wallet.copyWith(balance: wallet.balance - delta);
    expect(wallet.balance.toMinorUnits(), 6000 * 100);

    // Delete (soft-delete) the edited expense: revert its effect
    wallet = wallet.copyWith(balance: wallet.balance + editedExpense.amount);
    expect(wallet.balance.toMinorUnits(), 10000 * 100);
  });

  test('Case 5: Offline transaction storage simulation', () {
    // Simulate storing a transaction in a local queue before sync
    final localQueue = <TransactionModel>[];
    final txn = TransactionModel(
      id: 'offline1',
      amount: const Money.minor(500 * 100),
      type: TransactionType.expense,
      categoryId: 'food',
      walletId: 'wq',
      date: DateTime.now(),
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    );
    localQueue.add(txn);
    // ensure it exists locally
    expect(localQueue.length, 1);
    // Later sync will pop and persist to remote; the model retains createdAt/updatedAt
  });
}
