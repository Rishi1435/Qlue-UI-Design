import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:feather_icons/feather_icons.dart';
import '../../core/theme.dart';
import 'home_screen.dart';
import 'sessions_screen.dart';
import 'profile_screen.dart';
import '../../components/glass_card.dart';

class TabsScreen extends StatefulWidget {
  const TabsScreen({super.key});

  @override
  State<TabsScreen> createState() => _TabsScreenState();
}

class _TabsScreenState extends State<TabsScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    HomeScreen(),
    SessionsScreen(),
    ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    final t = AppThemeColors.of(context);
    return Scaffold(
      extendBody: true, // Allows body to flow underneath the transparent nav bar
      backgroundColor: t.bg,
      body: Stack(
        children: [
          IndexedStack(
            index: _currentIndex,
            children: _screens,
          ),
          Align(
            alignment: Alignment.bottomCenter,
            child: GlassCard(
              margin: const EdgeInsets.only(bottom: 30, left: 24, right: 24),
              borderRadius: 40,
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 0),
              child: SizedBox(
                height: 72,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _buildNavItem(0, FeatherIcons.home, "Home", t),
                    _buildNavItem(1, FeatherIcons.barChart2, "Progress", t),
                    _buildNavItem(2, FeatherIcons.user, "Profile", t),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNavItem(int index, IconData icon, String label, AppThemeColors t) {
    final isSelected = _currentIndex == index;
    
    return GestureDetector(
      onTap: () => setState(() => _currentIndex = index),
      behavior: HitTestBehavior.opaque,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 350),
        curve: Curves.easeOutCubic,
        padding: EdgeInsets.symmetric(
          horizontal: isSelected ? 22 : 12,
          vertical: 12,
        ),
        decoration: BoxDecoration(
          color: isSelected ? t.primary.withOpacity(0.15) : Colors.transparent,
          borderRadius: BorderRadius.circular(30),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              color: isSelected ? t.primary : t.iconDefault.withOpacity(0.5),
              size: 22,
            ),
            if (isSelected) ...[
              const SizedBox(width: 8),
              Text(
                label,
                style: TextStyle(
                  color: t.primary,
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
