import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'core/theme.dart';
import 'context/auth_provider.dart';
import 'screens/auth/login_screen.dart';
import 'screens/auth/register_screen.dart';
import 'screens/auth/onboarding_screen.dart';
import 'screens/tabs/tabs_screen.dart';
import 'screens/interview/interview_session_screen.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => ThemeNotifier()),
      ],
      child: Consumer<ThemeNotifier>(
        builder: (context, themeNotifier, _) {
          return AppThemeColorsProvider(
            colors: themeNotifier.colors,
            child: MaterialApp(
              title: 'Qlue',
              debugShowCheckedModeBanner: false,
              theme: AppTheme.lightTheme.copyWith(
                textTheme: GoogleFonts.interTextTheme(AppTheme.lightTheme.textTheme),
              ),
              darkTheme: AppTheme.darkTheme.copyWith(
                textTheme: GoogleFonts.interTextTheme(AppTheme.darkTheme.textTheme),
              ),
              themeMode: themeNotifier.themeMode,
              initialRoute: '/onboarding',
              routes: {
                '/onboarding': (context) => const ExactOnboardingScreen(),
                '/login': (context) => const ExactLoginScreen(),
                '/register': (context) => const ExactRegisterScreen(),
                '/tabs': (context) => const TabsScreen(),
                '/interview/session': (context) => const InterviewSessionScreen(),
              },
            ),
          );
        },
      ),
    );
  }
}
