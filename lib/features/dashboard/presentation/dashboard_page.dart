import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class DashboardPage extends StatelessWidget {
  const DashboardPage({Key? key}) : super(key: key);

  Widget _summaryCard(String title, double amount, Color color) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(children: [
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(title, style: const TextStyle(fontSize: 14, color: Colors.grey)),
            const SizedBox(height: 8),
            TweenAnimationBuilder<double>(
              tween: Tween<double>(begin: 0, end: amount),
              duration: const Duration(milliseconds: 700),
              builder: (context, value, _) => Text(
                NumberFormat.currency(symbol: 'LKR ').format(value),
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: color),
              ),
            )
          ])),
        ]),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    // Placeholder numbers for now
    return Scaffold(
      appBar: AppBar(title: const Text('Dashboard')),
      floatingActionButton: FloatingActionButton(
        onPressed: () => Navigator.of(context).pushNamed('/wallets'),
        child: const Icon(Icons.add),
      ),
      body: ListView(padding: const EdgeInsets.all(16), children: [
        Row(children: [
          Expanded(child: _summaryCard('Total Balance', 12500.0, Colors.blue)),
          const SizedBox(width: 12),
          Expanded(child: _summaryCard('Total Expenses', 4200.0, Colors.red)),
        ]),
        const SizedBox(height: 16),
        Card(child: ListTile(title: const Text('Recent Transactions'), subtitle: Text('No transactions yet'))),
      ]),
    );
  }
}
