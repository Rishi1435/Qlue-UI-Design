import 'dart:ui';
import 'package:flutter/material.dart';
import '../core/theme.dart';

class GlassCard extends StatelessWidget {
  final Widget child;
  final double borderRadius;
  final EdgeInsetsGeometry padding;
  final EdgeInsetsGeometry margin;
  final double blurSigma;
  final double? fillAlpha;
  final double? borderAlpha;
  final Color? tintColor;
  final VoidCallback? onTap;

  const GlassCard({
    super.key,
    required this.child,
    this.borderRadius = 20.0,
    this.padding = const EdgeInsets.all(16.0),
    this.margin = EdgeInsets.zero,
    this.blurSigma = 20.0,
    this.fillAlpha,
    this.borderAlpha,
    this.tintColor,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final t = AppThemeColors.of(context);
    
    // For pure minimal glassmorphism against solid backgrounds, we need to counter-tint
    // so the pane is visible. White tint on dark mode, black tint on light mode.
    final Color defaultTint = t.isDark ? Colors.white : Colors.black; 
    final Color effectiveTint = tintColor ?? defaultTint;

    final double activeFillAlpha = fillAlpha ?? (tintColor != null ? 0.15 : (t.isDark ? 0.05 : 0.02));
    final double activeBorderAlpha = borderAlpha ?? (tintColor != null ? 0.3 : (t.isDark ? 0.12 : 0.06));

    final cardLayout = Padding(
      padding: margin,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(borderRadius),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: blurSigma, sigmaY: blurSigma),
          child: Container(
            padding: padding,
            decoration: BoxDecoration(
              color: effectiveTint.withValues(alpha: activeFillAlpha),
              borderRadius: BorderRadius.circular(borderRadius),
              border: Border.all(
                color: effectiveTint.withValues(alpha: activeBorderAlpha),
                width: 1.0,
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.03),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: child,
          ),
        ),
      ),
    );

    if (onTap != null) {
      return GestureDetector(
        onTap: onTap,
        behavior: HitTestBehavior.opaque,
        child: cardLayout,
      );
    }

    return cardLayout;
  }
}
