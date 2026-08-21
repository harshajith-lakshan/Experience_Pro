import 'package:flutter/material.dart';
import 'package:hive/hive.dart';
import '../../../core/services/local_database.dart';

class WalletsPage extends StatefulWidget {
  const WalletsPage({Key? key}) : super(key: key);

  @override
  State<WalletsPage> createState() => _WalletsPageState();
}

class _WalletsPageState extends State<WalletsPage> {
  final _nameController = TextEditingController();
  Box? _box;

  @override
  void initState() {
    super.initState();
    _box = Hive.box(LocalDatabase.walletsBox);
  }

  void _addWallet() {
    final name = _nameController.text.trim();
    if (name.isEmpty) return;
    _box!.add({'name': name, 'balance': 0.0, 'currency': 'LKR'});
    _nameController.clear();
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final wallets = _box!.values.toList();
    return Scaffold(
      appBar: AppBar(title: const Text('Wallets')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(children: [
          Row(children: [
            Expanded(child: TextField(controller: _nameController, decoration: const InputDecoration(labelText: 'Wallet name'))),
            IconButton(onPressed: _addWallet, icon: const Icon(Icons.add))
          ]),
          const SizedBox(height: 12),
          Expanded(
            child: ListView.builder(
              itemCount: wallets.length,
              itemBuilder: (_, i) {
                final w = wallets[i] as Map;
                return Card(
                  child: ListTile(
                    leading: CircleAvatar(child: Text((w['name'] as String).substring(0,1).toUpperCase())),
                    title: Text(w['name']),
                    subtitle: Text('Balance: LKR ${w['balance']}'),
                  ),
                );
              },
            ),
          ),
        ]),
      ),
    );
  }
}
