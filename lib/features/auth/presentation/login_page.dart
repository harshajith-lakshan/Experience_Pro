import 'package:flutter/material.dart';
import '../../data/auth_repository.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final authRepoProvider = Provider((ref) => AuthRepository());

class LoginPage extends ConsumerStatefulWidget {
  const LoginPage({Key? key}) : super(key: key);

  @override
  ConsumerState<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends ConsumerState<LoginPage> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _loading = false;
  String? _error;

  Future<void> _signIn() async {
    setState(() { _loading = true; _error = null; });
    try {
      await ref.read(authRepoProvider).signInWithEmail(
        _emailController.text.trim(), _passwordController.text.trim());
      if (!mounted) return;
      Navigator.of(context).pushReplacementNamed('/');
    } catch (e) {
      setState(() { _error = e.toString(); });
    } finally {
      setState(() { _loading = false; });
    }
  }

  Future<void> _googleSignIn() async {
    setState(() { _loading = true; _error = null; });
    try {
      await ref.read(authRepoProvider).signInWithGoogle();
      if (!mounted) return;
      Navigator.of(context).pushReplacementNamed('/');
    } catch (e) {
      setState(() { _error = e.toString(); });
    } finally {
      setState(() { _loading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Login')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(children: [
          TextField(controller: _emailController, decoration: const InputDecoration(labelText: 'Email')),
          const SizedBox(height: 8),
          TextField(controller: _passwordController, decoration: const InputDecoration(labelText: 'Password'), obscureText: true),
          const SizedBox(height: 16),
          if (_error != null) Text(_error!, style: const TextStyle(color: Colors.red)),
          ElevatedButton(onPressed: _loading ? null : _signIn, child: _loading ? const CircularProgressIndicator() : const Text('Sign in')),
          const SizedBox(height: 8),
          OutlinedButton(onPressed: _loading ? null : _googleSignIn, child: const Text('Sign in with Google')),
        ]),
      ),
    );
  }
}
