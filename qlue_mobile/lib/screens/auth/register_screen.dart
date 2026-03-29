import 'package:flutter/material.dart';
import 'package:feather_icons/feather_icons.dart';
import 'package:provider/provider.dart';
import 'package:flutter_svg/flutter_svg.dart';
import '../../context/auth_provider.dart';
import '../../core/theme.dart';
import '../../components/glass_card.dart';

class ExactRegisterScreen extends StatefulWidget {
  const ExactRegisterScreen({super.key});
  @override
  State<ExactRegisterScreen> createState() => _ExactRegisterScreenState();
}

class _ExactRegisterScreenState extends State<ExactRegisterScreen> {
  String _name = '';
  String _email = '';
  String _password = '';
  bool _showPw = false;
  bool _agreed = false;
  bool _loading = false;
  bool _googleLoading = false;
  String _error = '';

  Future<void> _handleRegister() async {
    if (_name.trim().isEmpty || _email.trim().isEmpty || _password.isEmpty) { setState(() => _error = "Please fill in all fields"); return; }
    if (_password.length < 8) { setState(() => _error = "Password must be at least 8 characters"); return; }
    if (!_agreed) { setState(() => _error = "Please agree to Terms"); return; }
    setState(() { _error = ''; _loading = true; });
    try {
      await Provider.of<AuthProvider>(context, listen: false).register(_name.trim(), _email.trim(), _password);
      if (mounted) Navigator.of(context).pushReplacementNamed('/tabs');
    } catch (e) {
      if (mounted) setState(() => _error = "Registration failed. Try again.");
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _handleGoogleSignIn() async {
    setState(() { _error = ''; _googleLoading = true; });
    try {
      await Provider.of<AuthProvider>(context, listen: false).signInWithGoogle();
      if (mounted && Provider.of<AuthProvider>(context, listen: false).isAuthenticated) {
        Navigator.of(context).pushReplacementNamed('/tabs');
      }
    } catch (e) {
      if (mounted) setState(() => _error = "Google Sign-Up failed.");
    } finally {
      if (mounted) setState(() => _googleLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = AppThemeColors.of(context);
    
    // EXACT colors for light mode to preserve pixel-perfect UI, mapped to dark mode equivalents
    final Color bgColor = t.isDark ? t.bgSecondary : const Color(0xFFF4F7FC);
    final Color primaryBlue = t.isDark ? t.primary : const Color(0xFF3B82F6);
    final Color textColor = t.text;
    final Color labelColor = t.isDark ? t.textSecondary : const Color(0xFF374151);
    final Color placeholderColor = t.placeholder;
    final Color subtleText = t.textSecondary;

    return Scaffold(
      backgroundColor: bgColor,
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            const SizedBox(height: 10),
            // Header with Back Button
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Stack(
                alignment: Alignment.center,
                children: [
                  Align(
                    alignment: Alignment.centerLeft,
                    child: GlassCard(
                      onTap: () => Navigator.of(context).pop(),
                      borderRadius: 20,
                      padding: EdgeInsets.zero,
                      child: SizedBox(
                        width: 40,
                        height: 40,
                        child: Icon(FeatherIcons.chevronLeft, size: 20, color: t.isDark ? t.textSecondary : subtleText),
                      ),
                    ),
                  ),
                  Text(
                    'Qlue',
                    style: TextStyle(fontSize: 26, fontWeight: FontWeight.w700, color: primaryBlue, letterSpacing: -0.5),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            
            // The Floating Card
            Expanded(
              child: GlassCard(
                margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                borderRadius: 40,
                padding: EdgeInsets.zero,
                child: SingleChildScrollView(
                  padding: const EdgeInsets.only(top: 40, left: 24, right: 24, bottom: 40),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Text(
                        'Create an Account?',
                        textAlign: TextAlign.center,
                        style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: textColor, letterSpacing: -0.5),
                      ),
                      const SizedBox(height: 36),
                      
                      if (_error.isNotEmpty) ...[
                        Text(_error, style: const TextStyle(color: Colors.red, fontSize: 13), textAlign: TextAlign.center),
                        const SizedBox(height: 16),
                      ],
                      
                      // Name Field
                      Text('Name', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: labelColor)),
                      const SizedBox(height: 8),
                      GlassCard(
                        borderRadius: 30,
                        padding: const EdgeInsets.symmetric(horizontal: 20),
                        child: SizedBox(
                          height: 56,
                          child: Align(
                            alignment: Alignment.centerLeft,
                            child: TextField(
                              onChanged: (v) => _name = v,
                              textCapitalization: TextCapitalization.words,
                              style: TextStyle(fontSize: 15, color: textColor),
                              decoration: InputDecoration(
                                border: InputBorder.none,
                                hintText: 'Johan orindo',
                                hintStyle: TextStyle(fontSize: 15, color: placeholderColor, fontWeight: FontWeight.w400),
                                isDense: true,
                                contentPadding: EdgeInsets.zero,
                              ),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 20),

                      // Email Field
                      Text('Email', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: labelColor)),
                      const SizedBox(height: 8),
                      GlassCard(
                        borderRadius: 30,
                        padding: const EdgeInsets.symmetric(horizontal: 20),
                        child: SizedBox(
                          height: 56,
                          child: Align(
                            alignment: Alignment.centerLeft,
                            child: TextField(
                              onChanged: (v) => _email = v,
                              keyboardType: TextInputType.emailAddress,
                              style: TextStyle(fontSize: 15, color: textColor),
                              decoration: InputDecoration(
                                border: InputBorder.none,
                                hintText: 'joedoe75@gmail.com',
                                hintStyle: TextStyle(fontSize: 15, color: placeholderColor, fontWeight: FontWeight.w400),
                                isDense: true,
                                contentPadding: EdgeInsets.zero,
                              ),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 20),
                      
                      // Password Field
                      Text('Password', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: labelColor)),
                      const SizedBox(height: 8),
                      GlassCard(
                        borderRadius: 30,
                        padding: const EdgeInsets.only(left: 20, right: 10),
                        child: SizedBox(
                          height: 56,
                          child: Row(
                            children: [
                              Expanded(
                                child: TextField(
                                  onChanged: (v) => _password = v,
                                  obscureText: !_showPw,
                                  style: TextStyle(fontSize: 15, color: textColor),
                                  decoration: InputDecoration(
                                    border: InputBorder.none,
                                    hintText: '••••••••',
                                    hintStyle: TextStyle(fontSize: 15, color: placeholderColor, fontWeight: FontWeight.w400),
                                    isDense: true,
                                    contentPadding: EdgeInsets.zero,
                                  ),
                                ),
                              ),
                              IconButton(
                                icon: Icon(_showPw ? FeatherIcons.eye : FeatherIcons.eyeOff, size: 18, color: placeholderColor),
                                onPressed: () => setState(() => _showPw = !_showPw),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                      
                      // Terms Agreement
                      GestureDetector(
                        onTap: () => setState(() => _agreed = !_agreed),
                        behavior: HitTestBehavior.opaque,
                        child: Row(
                          children: [
                            GlassCard(
                              padding: EdgeInsets.zero,
                              borderRadius: 4,
                              fillAlpha: _agreed ? (t.isDark ? 0.3 : 0.8) : 0.0,
                              tintColor: _agreed ? primaryBlue : null,
                              child: SizedBox(
                                width: 18,
                                height: 18,
                                child: _agreed ? Icon(Icons.check, size: 14, color: Colors.white) : null,
                              ),
                            ),
                            const SizedBox(width: 8),
                            RichText(
                              text: TextSpan(
                                style: TextStyle(fontSize: 13, color: placeholderColor, fontWeight: FontWeight.w500),
                                children: [
                                  const TextSpan(text: 'I agree to the '),
                                  TextSpan(text: 'Terms of Service', style: TextStyle(color: primaryBlue, fontWeight: FontWeight.w500)),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 32),
                      
                      // Create Account Button
                      GlassCard(
                        onTap: _loading ? null : _handleRegister,
                        tintColor: primaryBlue,
                        fillAlpha: t.isDark ? 0.4 : 0.8,
                        borderRadius: 30,
                        padding: EdgeInsets.zero,
                        child: SizedBox(
                          height: 56,
                          child: Center(
                            child: _loading 
                                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                                : const Text('Create account', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: Colors.white)),
                          ),
                        ),
                      ),
                      const SizedBox(height: 32),
                      
                      // Or Sign up with
                      Center(child: Text('Or Sign up with', style: TextStyle(fontSize: 13, color: placeholderColor, fontWeight: FontWeight.w500))),
                      const SizedBox(height: 20),
                      
                      // Continue with Google Button
                      GlassCard(
                        onTap: _googleLoading ? null : _handleGoogleSignIn,
                        borderRadius: 30,
                        padding: EdgeInsets.zero,
                        child: SizedBox(
                          height: 54,
                          child: Center(
                            child: _googleLoading
                                ? SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: primaryBlue))
                                : Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      SvgPicture.string(
                                        '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                                          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                                          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                                          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                                          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                                          <path fill="none" d="M0 0h48v48H0z"/>
                                        </svg>''',
                                        width: 22,
                                        height: 22,
                                      ),
                                      const SizedBox(width: 10),
                                      Text('Sign up with Google', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: textColor)),
                                    ],
                                  ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 30),         ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
