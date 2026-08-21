import '../../models/transaction_model.dart';

abstract class TransactionRepository {
  Future<void> addTransaction(TransactionModel t);
  Future<void> updateTransaction(TransactionModel t);
  Future<void> deleteTransaction(String id);
  Future<TransactionModel?> getTransaction(String id);
  Future<List<TransactionModel>> getAllTransactions();
}
