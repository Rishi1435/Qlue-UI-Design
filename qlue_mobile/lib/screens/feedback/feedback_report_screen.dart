import 'dart:math';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:feather_icons/feather_icons.dart';
import '../../core/theme.dart';
import '../../core/mock_data.dart';
import '../../components/glass_card.dart';

class FeedbackReportScreen extends StatefulWidget {
  final Session? session;
  const FeedbackReportScreen({super.key, this.session});

  @override
  State<FeedbackReportScreen> createState() => _FeedbackReportScreenState();
}

class _FeedbackReportScreenState extends State<FeedbackReportScreen> {
  int _activeTabIndex = 0;
  final List<String> _tabs = ["Summary", "Strengths", "Weaknesses"];

  @override
  Widget build(BuildContext context) {
    // Force Dark Theme Colors for this screen
    final t = AppThemeColors.dark;
    final topPadding = MediaQuery.of(context).padding.top;

    return AppThemeColorsProvider(
      colors: t,
      child: Scaffold(
        backgroundColor: t.bg,
        body: Stack(
          children: [
            // Background Glows
            Positioned(
              top: -100,
              right: -100,
              child: Container(
                width: 300,
                height: 300,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: t.primary.withOpacity(0.15),
                ),
                child: BackdropFilter(filter: ImageFilter.blur(sigmaX: 80, sigmaY: 80), child: Container()),
              ),
            ),

            SingleChildScrollView(
              padding: EdgeInsets.only(top: topPadding + 20, bottom: 60, left: 24, right: 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  _buildHeader(context, t),
                  const SizedBox(height: 24),
                  
                  // TOP SCORE CARD
                  _buildScoreCard(t),
                  const SizedBox(height: 24),

                  // SPIDER CHART
                  _buildSpiderChartCard(t),
                  const SizedBox(height: 32),

                  // NAVIGATION TABS
                  _buildNavigationTabs(t),
                  const SizedBox(height: 20),

                  // CONTENT AREA (Summary, Strengths, Weaknesses)
                  _buildContentArea(t),
                  const SizedBox(height: 40),

                  // Q&A TRANSCRIPT (Now as a persistent section)
                  _buildTranscriptSection(t),
                ],
              ),
            ),
            
            // Back Button
            Positioned(
              top: topPadding + 10,
              left: 16,
              child: IconButton(
                icon: Icon(FeatherIcons.chevronLeft, color: t.text),
                onPressed: () => Navigator.pop(context),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context, AppThemeColors t) {
    return Column(
      children: [
        Text(
          "Performance Analysis",
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: t.textSecondary, letterSpacing: 1.2),
        ),
        const SizedBox(height: 4),
        Text(
          widget.session?.topic ?? "Interview Feedback",
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: t.text),
        ),
      ],
    );
  }

  Widget _buildScoreCard(AppThemeColors t) {
    final score = widget.session?.score ?? 84;
    return GlassCard(
      padding: const EdgeInsets.symmetric(vertical: 40),
      borderRadius: 32,
      blurSigma: 30,
      child: Column(
        children: [
          Text(
            "OVERALL SCORE",
            style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: t.textSecondary, letterSpacing: 2),
          ),
          const SizedBox(height: 12),
          Stack(
            alignment: Alignment.center,
            children: [
              // Glow Effect
              Container(
                width: 120,
                height: 120,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(color: t.primary.withOpacity(0.3), blurRadius: 40, spreadRadius: 10),
                  ],
                ),
              ),
              Text(
                "$score",
                style: TextStyle(
                  fontSize: 72, 
                  fontWeight: FontWeight.w900, 
                  color: t.text,
                  height: 1.0,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
            decoration: BoxDecoration(
              color: t.success.withOpacity(0.1),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: t.success.withOpacity(0.2)),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(FeatherIcons.trendingUp, size: 14, color: t.success),
                const SizedBox(width: 6),
                Text(
                  score >= 80 ? "Top 15% of candidates" : "Great effort, keep practicing!",
                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: t.success),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSpiderChartCard(AppThemeColors t) {
    return GlassCard(
      padding: const EdgeInsets.all(24),
      borderRadius: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            "Dimension Breakdown",
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: t.text),
          ),
          const SizedBox(height: 30),
          Center(
            child: SizedBox(
              width: 220,
              height: 220,
              child: CustomPaint(
                painter: RadarChartPainter(
                  t: t,
                  data: [0.85, 0.70, 0.92], // Clarity, Fluency, Vocabulary
                  labels: ["Clarity", "Fluency", "Vocabulary"],
                ),
              ),
            ),
          ),
          const SizedBox(height: 20),
        ],
      ),
    );
  }

  Widget _buildNavigationTabs(AppThemeColors t) {
    return GlassCard(
      padding: const EdgeInsets.all(6),
      borderRadius: 30,
      blurSigma: 10,
      child: Row(
        children: List.generate(_tabs.length, (index) {
          final isActive = _activeTabIndex == index;
          return Expanded(
            child: GestureDetector(
              onTap: () => setState(() => _activeTabIndex = index),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                padding: const EdgeInsets.symmetric(vertical: 12),
                decoration: BoxDecoration(
                  color: isActive ? t.primary.withOpacity(0.25) : Colors.transparent,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(
                    color: isActive ? t.primary.withOpacity(0.4) : Colors.transparent,
                    width: 1,
                  ),
                  boxShadow: isActive ? [
                    BoxShadow(
                      color: t.primary.withOpacity(0.2),
                      blurRadius: 15,
                      spreadRadius: 1,
                    )
                  ] : null,
                  gradient: isActive ? LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      t.primary.withOpacity(0.3),
                      t.primary.withOpacity(0.1),
                    ],
                  ) : null,
                ),
                child: Center(
                  child: Text(
                    _tabs[index],
                    style: TextStyle(
                      fontSize: 13, 
                      fontWeight: isActive ? FontWeight.w900 : FontWeight.w600,
                      color: isActive ? Colors.white : t.textSecondary,
                      letterSpacing: 0.4,
                    ),
                  ),
                ),
              ),
            ),
          );
        }),
      ),
    );
  }

  Widget _buildContentArea(AppThemeColors t) {
    return GlassCard(
      padding: const EdgeInsets.all(24),
      borderRadius: 24,
      child: AnimatedSwitcher(
        duration: const Duration(milliseconds: 300),
        child: _buildTabContent(t),
      ),
    );
  }

  Widget _buildTabContent(AppThemeColors t) {
    switch (_activeTabIndex) {
      case 0: // Summary
        return Column(
          key: const ValueKey("summary"),
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildSectionTitle(t, "Executive Summary", FeatherIcons.fileText),
            const SizedBox(height: 16),
            Text(
              "Your performance was exceptionally strong in technical accuracy and vocabulary. You demonstrated a deep understanding of the core concepts, though your fluency could be improved by reducing filler words.",
              style: TextStyle(fontSize: 15, height: 1.6, color: t.textSecondary),
            ),
            const SizedBox(height: 20),
            _buildMetricRow(t, "Confidence Level", "High", t.primary),
            _buildMetricRow(t, "Pace", "Steady", t.success),
          ],
        );
      case 1: // Strengths
        return Column(
          key: const ValueKey("strengths"),
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildSectionTitle(t, "Your Strengths", FeatherIcons.zap),
            const SizedBox(height: 16),
            _buildBulletPoint(t, "Precise use of industry terminology.", t.success),
            _buildBulletPoint(t, "Excellent structural integrity in answers.", t.success),
            _buildBulletPoint(t, "Strong logical flow when explaining complex topics.", t.success),
          ],
        );
      case 2: // Weaknesses
        return Column(
          key: const ValueKey("weaknesses"),
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildSectionTitle(t, "Areas for Improvement", FeatherIcons.alertCircle),
            const SizedBox(height: 16),
            _buildBulletPoint(t, "Moderate usage of filler words ('um', 'ah').", t.warning),
            _buildBulletPoint(t, "Tendency to speed up during technical deep-dives.", t.warning),
            _buildBulletPoint(t, "Eye contact (simulated) could be more consistent.", t.warning),
          ],
        );
      default:
        return const SizedBox();
    }
  }

  Widget _buildTranscriptSection(AppThemeColors t) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionTitle(t, "Q&A Transcript", FeatherIcons.messageSquare),
        const SizedBox(height: 20),
        GlassCard(
          padding: const EdgeInsets.all(24),
          borderRadius: 24,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildTranscriptItem(t, "Q: Tell me about your experience with Flutter.", "A: I've been working with Flutter for 3 years, focusing on premium UI..."),
              const Divider(height: 48, thickness: 1, color: Colors.white12),
              _buildTranscriptItem(t, "Q: How do you handle State Management?", "A: I prefer using Provider or Bloc depending on the complexity..."),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildSectionTitle(AppThemeColors t, String title, IconData icon) {
    return Row(
      children: [
        Icon(icon, size: 20, color: t.primary),
        const SizedBox(width: 10),
        Text(title, style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: t.text)),
      ],
    );
  }

  Widget _buildMetricRow(AppThemeColors t, String label, String value, Color color) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(color: t.textSecondary)),
          Text(value, style: TextStyle(fontWeight: FontWeight.bold, color: color)),
        ],
      ),
    );
  }

  Widget _buildBulletPoint(AppThemeColors t, String text, Color color) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            margin: const EdgeInsets.only(top: 6),
            width: 8,
            height: 8,
            decoration: BoxDecoration(shape: BoxShape.circle, color: color),
          ),
          const SizedBox(width: 12),
          Expanded(child: Text(text, style: TextStyle(fontSize: 14, color: t.textSecondary, height: 1.4))),
        ],
      ),
    );
  }

  Widget _buildTranscriptItem(AppThemeColors t, String question, String answer) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(question, style: TextStyle(fontWeight: FontWeight.bold, color: t.text)),
        const SizedBox(height: 8),
        Text(answer, style: TextStyle(color: t.textSecondary, fontStyle: FontStyle.italic)),
      ],
    );
  }
}

class RadarChartPainter extends CustomPainter {
  final AppThemeColors t;
  final List<double> data; // values 0.0 to 1.0
  final List<String> labels;

  RadarChartPainter({required this.t, required this.data, required this.labels});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = min(size.width, size.height) / 2;
    final angleStep = (2 * pi) / data.length;

    // 1. Draw Background Grid (Concentric Pentagons/Polygons)
    final gridPaint = Paint()
      ..color = t.border.withOpacity(0.2)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.0;

    for (var i = 1; i <= 4; i++) {
        final r = radius * (i / 4);
        final path = Path();
        for (var j = 0; j < data.length; j++) {
           final angle = j * angleStep - (pi / 2);
           final point = Offset(center.dx + r * cos(angle), center.dy + r * sin(angle));
           if (j == 0) {
             path.moveTo(point.dx, point.dy);
           } else {
             path.lineTo(point.dx, point.dy);
           }
        }
        path.close();
        canvas.drawPath(path, gridPaint);
    }

    // 2. Draw Axis Lines
    for (var i = 0; i < data.length; i++) {
       final angle = i * angleStep - (pi / 2);
       canvas.drawLine(center, Offset(center.dx + radius * cos(angle), center.dy + radius * sin(angle)), gridPaint);
       
       // Labels
       final labelOffset = Offset(center.dx + (radius + 20) * cos(angle), center.dy + (radius + 15) * sin(angle));
       _drawText(canvas, labels[i], labelOffset, t);
    }

    // 3. Draw Data Polygon
    final dataPath = Path();
    for (var i = 0; i < data.length; i++) {
       final r = radius * data[i];
       final angle = i * angleStep - (pi / 2);
       final point = Offset(center.dx + r * cos(angle), center.dy + r * sin(angle));
       if (i == 0) {
         dataPath.moveTo(point.dx, point.dy);
       } else {
         dataPath.lineTo(point.dx, point.dy);
       }
    }
    dataPath.close();

    final fillPaint = Paint()
      ..shader = RadialGradient(
        colors: [t.primary.withOpacity(0.4), t.primary.withOpacity(0.1)],
      ).createShader(Rect.fromCircle(center: center, radius: radius))
      ..style = PaintingStyle.fill;

    final outlinePaint = Paint()
      ..color = t.primary
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0
      ..maskFilter = const MaskFilter.blur(BlurStyle.solid, 2);

    canvas.drawPath(dataPath, fillPaint);
    canvas.drawPath(dataPath, outlinePaint);
    
    // Draw dots at vertices
    final dotPaint = Paint()..color = t.primary..style = PaintingStyle.fill;
    for (var i = 0; i < data.length; i++) {
       final r = radius * data[i];
       final angle = i * angleStep - (pi / 2);
       canvas.drawCircle(Offset(center.dx + r * cos(angle), center.dy + r * sin(angle)), 4, dotPaint);
    }
  }

  void _drawText(Canvas canvas, String text, Offset offset, AppThemeColors t) {
    final span = TextSpan(style: TextStyle(color: t.textSecondary, fontSize: 11, fontWeight: FontWeight.bold), text: text);
    final tp = TextPainter(text: span, textAlign: TextAlign.center, textDirection: TextDirection.ltr);
    tp.layout();
    tp.paint(canvas, offset - Offset(tp.width / 2, tp.height / 2));
  }

  @override
  bool shouldRepaint(covariant RadarChartPainter oldDelegate) => false;
}
