import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../core/mock_data.dart';
import '../tabs/sessions_screen.dart' show ScoreRing;
import 'package:feather_icons/feather_icons.dart';

class SessionFeedbackScreen extends StatelessWidget {
  final Session session;

  const SessionFeedbackScreen({super.key, required this.session});

  @override
  Widget build(BuildContext context) {
    final t = AppThemeColors.of(context);

    int total = session.totalQuestions;
    int correct = session.answeredQuestions;
    int pct = total > 0 ? ((correct / total) * 100).round() : 0;

    return Scaffold(
      backgroundColor: t.bg,
      appBar: AppBar(
        backgroundColor: t.bg,
        elevation: 0,
        scrolledUnderElevation: 0,
        leading: IconButton(
          icon: Icon(FeatherIcons.chevronLeft, color: t.text),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text("Session Feedback", style: TextStyle(color: t.text, fontSize: 16, fontWeight: FontWeight.bold)),
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(session.topic, style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: t.text, letterSpacing: -0.5)),
                  const SizedBox(height: 6),
                  Text("${session.date} • ${session.duration ~/ 60} mins", style: TextStyle(fontSize: 14, color: t.textSecondary)),
                ],
              ),
            ),
            
            // Score Section
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 32),
              margin: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
              decoration: BoxDecoration(
                color: t.bgSecondary,
                borderRadius: BorderRadius.circular(24),
              ),
              child: Column(
                children: [
                  ScoreRing(score: session.score, size: 140),
                  const SizedBox(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      _StatPip(label: "Answered", value: "$correct", color: t.text),
                      Container(width: 1, height: 30, color: t.border, margin: const EdgeInsets.symmetric(horizontal: 24)),
                      _StatPip(label: "Completion", value: "$pct%", color: t.primary),
                    ],
                  ),
                ],
              ),
            ),

            const Padding(
              padding: EdgeInsets.only(left: 24.0, top: 32, bottom: 16),
              child: Text("Detailed Analysis", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            ),

            // Feedback Blocks
            _FeedbackBlock(
              t: t,
              icon: FeatherIcons.checkCircle,
              color: t.success,
              title: "What went well",
              content: "You demonstrated a strong understanding of core concepts and answered structural questions with confidence and clarity.",
            ),
            _FeedbackBlock(
              t: t,
              icon: FeatherIcons.alertCircle,
              color: t.warning,
              title: "Areas for improvement",
              content: "Try to dive deeper into practical examples when discussing abstract scenarios to provide a more holistic answer.",
            ),
            _FeedbackBlock(
              t: t,
              icon: FeatherIcons.barChart2,
              color: t.primary,
              title: "Pacing & Delivery",
              content: "Your response time was consistently fast, averaging 45 seconds per question. Good confidence overall.",
            ),
            
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }
}

class _StatPip extends StatelessWidget {
  final String label;
  final String value;
  final Color color;

  const _StatPip({required this.label, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(value, style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: color)),
        const SizedBox(height: 4),
        Text(label, style: const TextStyle(fontSize: 12, color: Colors.grey)),
      ],
    );
  }
}

class _FeedbackBlock extends StatelessWidget {
  final AppThemeColors t;
  final IconData icon;
  final Color color;
  final String title;
  final String content;

  const _FeedbackBlock({
    required this.t, required this.icon, required this.color, required this.title, required this.content,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 8.0),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: t.bg,
          border: Border.all(color: t.border),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, color: color, size: 20),
                const SizedBox(width: 12),
                Text(title, style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: t.text)),
              ],
            ),
            const SizedBox(height: 12),
            Text(content, style: TextStyle(fontSize: 14, color: t.textSecondary, height: 1.5)),
          ],
        ),
      ),
    );
  }
}
