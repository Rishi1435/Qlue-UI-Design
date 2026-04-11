import 'dart:math' as math;
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:feather_icons/feather_icons.dart';
import '../../core/theme.dart';
import '../../core/mock_data.dart';
import '../../components/staggered_fade_in.dart';
import '../../components/premium_flip_card.dart';
import '../feedback/feedback_report_screen.dart';
import 'tabs_screen.dart';
import '../../components/glass_card.dart';
import '../../components/spider_chart.dart';
import '../resume/resume_upload_screen.dart';

class GlassHeaderPane extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry padding;
  final EdgeInsetsGeometry margin;
  
  const GlassHeaderPane({super.key, required this.child, required this.padding, this.margin = EdgeInsets.zero});

  @override
  Widget build(BuildContext context) {
    final t = AppThemeColors.of(context);
    final Color tint = t.isDark ? Colors.white : Colors.black;
    final double fillAlpha = t.isDark ? 0.05 : 0.02;
    final double borderAlpha = t.isDark ? 0.12 : 0.06;

    return Padding(
      padding: margin,
      child: ClipRRect(
        borderRadius: const BorderRadius.only(bottomLeft: Radius.circular(36), bottomRight: Radius.circular(36)),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
          child: Container(
            padding: padding,
            decoration: BoxDecoration(
              color: tint.withOpacity(fillAlpha),
              borderRadius: const BorderRadius.only(bottomLeft: Radius.circular(36), bottomRight: Radius.circular(36)),
              border: Border(
                bottom: BorderSide(color: tint.withOpacity(borderAlpha), width: 1.0),
              ),
            ),
            child: child,
          ),
        ),
      ),
    );
  }
}

class ScoreRing extends StatelessWidget {
  final int score;
  final double size;

  const ScoreRing({super.key, required this.score, this.size = 120});

  @override
  Widget build(BuildContext context) {
    final t = AppThemeColors.of(context);
    Color color = score >= 80 ? const Color(0xFF22C55E) : score >= 65 ? const Color(0xFFF59E0B) : const Color(0xFFEF4444);
    String grade = score >= 80 ? "Excellent" : score >= 65 ? "Good" : "Fair";

    return Column(
      children: [
        SizedBox(
          width: size, height: size,
          child: Stack(
            alignment: Alignment.center,
            children: [
              Container(
                width: size, height: size,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: t.isDark ? Colors.white.withOpacity(0.08) : Colors.black.withOpacity(0.06), width: 8),
                ),
              ),
              SizedBox(
                width: size, height: size,
                child: TweenAnimationBuilder<double>(
                  tween: Tween<double>(begin: 0, end: score / 100),
                  duration: const Duration(milliseconds: 1000),
                  builder: (context, value, child) {
                    return CircularProgressIndicator(value: value, color: color, strokeWidth: 8, backgroundColor: Colors.transparent, strokeCap: StrokeCap.round);
                  },
                ),
              ),
              Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(score.toString(), style: TextStyle(fontSize: size * 0.3, fontWeight: FontWeight.bold, color: color, letterSpacing: -1)),
                  Text("/ 100", style: TextStyle(fontSize: size * 0.1, fontWeight: FontWeight.w500, color: t.textTertiary)),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 4),
        Text(grade, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: color)),
      ],
    );
  }
}

class ScoreTrend extends StatelessWidget {
  final List<Session> sessions;
  const ScoreTrend({super.key, required this.sessions});

  @override
  Widget build(BuildContext context) {
    final t = AppThemeColors.of(context);
    if (sessions.length < 2) return const SizedBox.shrink();
    final last = sessions.take(7).toList().reversed.toList();
    int maxScore = last.map((s) => s.score).reduce(math.max);
    int minScore = last.map((s) => s.score).reduce(math.min);
    int range = math.max(1, maxScore - minScore);

    return GlassCard(
      padding: const EdgeInsets.all(14),
      borderRadius: 18,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text("SCORE TREND", style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 0.8, color: t.textTertiary)),
          const SizedBox(height: 10),
          SizedBox(
            height: 80,
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: last.asMap().entries.map((entry) {
                int i = entry.key;
                Session s = entry.value;
                double h = 20 + ((s.score - minScore) / range) * 36;
                Color c = s.score >= 80 ? const Color(0xFF22C55E) : s.score >= 65 ? const Color(0xFFF59E0B) : const Color(0xFFEF4444);
                return Expanded(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      Container(
                        width: double.infinity, height: h,
                        margin: const EdgeInsets.symmetric(horizontal: 4),
                        decoration: BoxDecoration(color: c.withOpacity(i == last.length - 1 ? 1.0 : 0.55), borderRadius: BorderRadius.circular(4)),
                      ),
                      const SizedBox(height: 4),
                      Text(s.score.toString(), style: TextStyle(fontSize: 9, fontWeight: FontWeight.w500, color: t.textTertiary)),
                    ],
                  ),
                );
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }
}

class SessionCard extends StatelessWidget {
  final Session s;
  final int index;
  const SessionCard({super.key, required this.s, required this.index});

  @override
  Widget build(BuildContext context) {
    final t = AppThemeColors.of(context);
    Map<String, Map<String, dynamic>> moduleCfg = {
      "resume": {"label": "Resume", "icon": FeatherIcons.fileText, "color": t.moduleResume},
      "hr": {"label": "HR", "icon": FeatherIcons.users, "color": t.moduleHR},
      "website": {"label": "Web", "icon": FeatherIcons.globe, "color": t.moduleWeb},
    };
    var cfg = moduleCfg[s.module] ?? moduleCfg["resume"]!;
    IconData cfgIcon = cfg["icon"] as IconData;
    Color scoreColor = s.score >= 80 ? t.success : s.score >= 65 ? t.warning : t.error;
    
    return GestureDetector(
      onTap: () {
        Navigator.push(context, MaterialPageRoute(builder: (_) => FeedbackReportScreen(session: s)));
      },
      behavior: HitTestBehavior.opaque,
      child: GlassCard(
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 10),
        borderRadius: 16,
        margin: const EdgeInsets.only(bottom: 8),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Container(
              width: 44, height: 44,
              decoration: BoxDecoration(color: t.bgSecondary, shape: BoxShape.circle),
              child: Center(child: Icon(cfgIcon, size: 20, color: t.text)),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(s.topic, maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: t.text, letterSpacing: -0.3)),
                const SizedBox(height: 4),
                Text("${s.date} • ${s.duration ~/ 60} mins", style: TextStyle(fontSize: 13, color: t.textSecondary)),
              ]),
            ),
            Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
              Text("${s.score}%", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: scoreColor)),
              const SizedBox(height: 4),
              Icon(FeatherIcons.chevronRight, size: 16, color: t.textTertiary),
            ]),
          ],
        ),
      ),
    );
  }
}

class SessionsScreen extends StatefulWidget {
  const SessionsScreen({super.key});
  @override
  State<SessionsScreen> createState() => _SessionsScreenState();
}

class _SessionsScreenState extends State<SessionsScreen> {
  List<Session> sessions = List.from(mockSessions);
  String _selectedRadar = "overall";



  @override
  Widget build(BuildContext context) {
    final t = AppThemeColors.of(context);
    final topPadding = MediaQuery.of(context).padding.top;
    final bottomPadding = MediaQuery.of(context).padding.bottom;

    final total = sessions.length;
    final avgScore = total > 0 ? (sessions.fold(0, (sum, s) => sum + s.score) / total).round() : 0;
    final best = total > 0 ? sessions.map((s) => s.score).reduce(math.max) : 0;
    final totalMin = sessions.fold(0, (sum, s) => sum + (s.duration ~/ 60));

    Map<String, int> byModule = {"resume": 0, "hr": 0, "website": 0, "intro": 0};
    for (var s in sessions) { if (byModule.containsKey(s.module)) byModule[s.module] = byModule[s.module]! + 1; }

    if (total == 0) {
      return Scaffold(
        backgroundColor: t.bg,
        body: Column(children: [
          StaggeredFadeIn(
            delay: const Duration(milliseconds: 100),
            child: GlassHeaderPane(
              padding: EdgeInsets.only(top: topPadding + 20, bottom: 20, left: 24, right: 24),
              child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, crossAxisAlignment: CrossAxisAlignment.start, children: [
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text("Dashboard", style: TextStyle(fontSize: 30, fontWeight: FontWeight.bold, letterSpacing: -0.6, color: t.text)),
                  const SizedBox(height: 3),
                  Text("Track your interview performance", style: TextStyle(fontSize: 13, color: t.textSecondary)),
                ]),
                GestureDetector(
                  onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ResumeUploadScreen())),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                    decoration: BoxDecoration(color: t.primaryMuted, border: Border.all(color: t.primary.withOpacity(0.25)), borderRadius: BorderRadius.circular(12)),
                    child: Row(children: [Icon(FeatherIcons.uploadCloud, size: 14, color: t.primary), const SizedBox(width: 5), Text("Upload", style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: t.primary))]),
                  ),
                ),
              ]),
            ),
          ),
          Expanded(
            child: StaggeredFadeIn(
              delay: const Duration(milliseconds: 200),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 36.0),
                child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                GlassCard(
                  margin: const EdgeInsets.only(bottom: 8), padding: const EdgeInsets.all(16),
                  borderRadius: 20,
                  child: SizedBox(
                    width: double.infinity, height: 120,
                    child: Stack(alignment: Alignment.center, children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [40.0, 60.0, 45.0, 75.0, 55.0, 80.0, 65.0].map((h) => Expanded(
                        child: Container(margin: const EdgeInsets.symmetric(horizontal: 4), height: h, decoration: BoxDecoration(color: t.bgSecondary, borderRadius: BorderRadius.circular(4))),
                      )).toList(),
                    ),
                    Container(
                      width: 44, height: 44,
                      decoration: BoxDecoration(color: t.primaryMuted, borderRadius: BorderRadius.circular(14)),
                      child: Center(child: Icon(FeatherIcons.lock, size: 18, color: t.primary)),
                    ),
                  ]),
                ),
                ), // Closes GlassCard
                Text("No data yet", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: t.text)),
                const SizedBox(height: 14),
                Text("Complete your first interview session to unlock performance analytics and score tracking", textAlign: TextAlign.center, style: TextStyle(fontSize: 14, color: t.textSecondary, height: 1.57)),
                const SizedBox(height: 18),
                Container(
                  decoration: BoxDecoration(borderRadius: BorderRadius.circular(14), gradient: const LinearGradient(colors: [Color(0xFF2563EB), Color(0xFF1D4ED8)])),
                  child: Material(color: Colors.transparent, child: InkWell(borderRadius: BorderRadius.circular(14), onTap: () {
                      Navigator.pushAndRemoveUntil(context, MaterialPageRoute(builder: (context) => const TabsScreen()), (route) => false);
                    },
                    child: const Padding(padding: EdgeInsets.symmetric(horizontal: 28, vertical: 14),
                      child: Row(mainAxisSize: MainAxisSize.min, children: [Icon(FeatherIcons.mic, size: 16, color: Colors.white), SizedBox(width: 8), Text("Start a Session", style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white))]),
                    ),
                  )),
                ),
                ]),
              ),
            ),
          ),
        ]),
      );
    }

    return Scaffold(
      backgroundColor: t.bg,
      body: CustomScrollView(
        slivers: [
          SliverToBoxAdapter(
            child: StaggeredFadeIn(
              delay: const Duration(milliseconds: 100),
              child: GlassHeaderPane(
                padding: EdgeInsets.only(top: topPadding > 0 ? topPadding + 16 : 36, bottom: 32, left: 20, right: 20),
                child: Column(children: [
                  Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text("Dashboard", style: TextStyle(fontSize: 30, fontWeight: FontWeight.bold, letterSpacing: -0.6, color: t.text)),
                      const SizedBox(height: 3),
                      Text("$total session${total != 1 ? 's' : ''} completed", style: TextStyle(fontSize: 13, color: t.textSecondary)),
                    ]),
                    GestureDetector(
                      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ResumeUploadScreen())),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                        decoration: BoxDecoration(color: t.primaryMuted, border: Border.all(color: t.primary.withOpacity(0.25)), borderRadius: BorderRadius.circular(12)),
                        child: Row(children: [Icon(FeatherIcons.uploadCloud, size: 14, color: t.primary), const SizedBox(width: 5), Text("Upload", style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: t.primary))]),
                      ),
                    ),
                  ]),
                  const SizedBox(height: 16),
                Row(children: [
                  Expanded(
                    child: PremiumFlipCard(
                      front: GlassCard(
                        padding: const EdgeInsets.all(16),
                        borderRadius: 20,
                        child: Column(children: [
                          ScoreRing(score: avgScore, size: 120),
                          const SizedBox(height: 8),
                          Text("Avg Score", style: TextStyle(fontSize: 11, fontWeight: FontWeight.w500, color: t.textTertiary)),
                        ]),
                      ),
                      back: GlassCard(
                        tintColor: const Color(0xFF3B82F6),
                        padding: const EdgeInsets.all(16),
                        borderRadius: 20,
                        child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                          Container(
                            width: 48, height: 48, decoration: BoxDecoration(color: const Color(0xFF3B82F6).withOpacity(0.1), shape: BoxShape.circle),
                            child: const Center(child: Icon(FeatherIcons.trendingUp, color: Color(0xFF3B82F6), size: 24)),
                          ),
                          const SizedBox(height: 12),
                          Text(avgScore >= 80 ? "Top 10%!" : avgScore >= 60 ? "Solid Effort!" : "Keep Practicing!", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: t.text, letterSpacing: -0.5)),
                          const SizedBox(height: 6),
                          Text("Your accuracy score is aggregated across all $total sessions.", textAlign: TextAlign.center, style: TextStyle(fontSize: 12, color: t.textSecondary, height: 1.4)),
                        ]),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(child: Column(children: [
                    _buildSmallStatRow(t, FeatherIcons.award, "Best Score", "$best%", const Color(0xFF22C55E), "Top 5% of all users!"),
                    const SizedBox(height: 8),
                    _buildSmallStatRow(t, FeatherIcons.mic, "Sessions", "$total", const Color(0xFF3B82F6), "Great 3-day streak!"),
                    const SizedBox(height: 8),
                    _buildSmallStatRow(t, FeatherIcons.clock, "Practice", "${totalMin}m", const Color(0xFF8B5CF6), "Amazing focus!"),
                  ])),
                ]),
                const SizedBox(height: 16),
                // Module breakdown grid of FlipCards
                SizedBox(
                  height: 140,
                  child: Row(
                    children: ["resume", "hr", "website", "intro"].map((m) {
                      Map<String, Map<String, dynamic>> moduleCfg = {
                        "resume": {"label": "Resume", "icon": FeatherIcons.fileText, "color": t.moduleResume, "desc": "Technical fit"},
                        "hr": {"label": "HR", "icon": FeatherIcons.users, "color": t.moduleHR, "desc": "Culture fit"},
                        "website": {"label": "Web", "icon": FeatherIcons.globe, "color": t.moduleWeb, "desc": "Skills match"},
                        "intro": {"label": "Intro", "icon": FeatherIcons.mic, "color": t.primary, "desc": "Communication"},
                      };
                      var cfg = moduleCfg[m]!;
                      Color cfgColor = cfg["color"] as Color;
                      String cfgLabel = cfg["label"] as String;
                      IconData cfgIcon = cfg["icon"] as IconData;
                      String cfgDesc = cfg["desc"] as String;
                      int count = byModule[m] ?? 0;
                      double pct = total > 0 ? count / total : 0;
                      
                      return Expanded(
                        child: Padding(
                          padding: EdgeInsets.only(right: m != "intro" ? 8.0 : 0),
                          child: PremiumFlipCard(
                            front: GlassCard(
                              tintColor: cfgColor,
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 16),
                              borderRadius: 18,
                              child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                                GlassCard(
                                  padding: const EdgeInsets.all(8),
                                  borderRadius: 30,
                                  child: Icon(cfgIcon, size: 18, color: cfgColor),
                                ),
                                const SizedBox(height: 10),
                                Text(cfgLabel, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: t.text)),
                                Text("$count Sessions", style: TextStyle(fontSize: 10, color: t.textSecondary)),
                              ]),
                            ),
                            back: GlassCard(
                              tintColor: cfgColor,
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 16),
                              borderRadius: 18,
                              child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                                Text(cfgLabel, style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: t.text)),
                                const SizedBox(height: 6),
                                Text(cfgDesc, textAlign: TextAlign.center, style: TextStyle(fontSize: 10, color: t.textSecondary)),
                                const SizedBox(height: 12),
                                Container(
                                  height: 6, width: double.infinity,
                                  decoration: BoxDecoration(color: cfgColor.withOpacity(0.2), borderRadius: BorderRadius.circular(3)),
                                  child: FractionallySizedBox(
                                    alignment: Alignment.centerLeft, widthFactor: pct,
                                    child: Container(decoration: BoxDecoration(color: cfgColor, borderRadius: BorderRadius.circular(3), boxShadow: [BoxShadow(color: cfgColor.withOpacity(0.5), blurRadius: 4)])),
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text("${(pct * 100).round()}% completion", style: TextStyle(fontSize: 9, fontWeight: FontWeight.w600, color: cfgColor)),
                              ]),
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ),
              ]),
            ),
            ),
          ),
          SliverToBoxAdapter(
            child: StaggeredFadeIn(
              delay: const Duration(milliseconds: 200),
              child: Padding(padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14), child: ScoreTrend(sessions: sessions)),
            ),
          ),
          SliverToBoxAdapter(
            child: StaggeredFadeIn(
              delay: const Duration(milliseconds: 250),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 0),
                child: GlassCard(
                  padding: const EdgeInsets.all(16),
                  borderRadius: 18,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text("PERFORMANCE RADAR", style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 0.8, color: t.textTertiary)),
                          Container(
                            height: 24,
                            padding: const EdgeInsets.symmetric(horizontal: 8),
                            decoration: BoxDecoration(color: t.bgTertiary, borderRadius: BorderRadius.circular(12)),
                            child: DropdownButtonHideUnderline(
                              child: DropdownButton<String>(
                                value: _selectedRadar,
                                icon: Icon(FeatherIcons.chevronDown, size: 14, color: t.textSecondary),
                                style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: t.text),
                                dropdownColor: t.card,
                                items: const [
                                  DropdownMenuItem(value: "overall", child: Text("Overall Avg")),
                                  DropdownMenuItem(value: "resume", child: Text("Resume")),
                                  DropdownMenuItem(value: "website", child: Text("Website")),
                                  DropdownMenuItem(value: "hr", child: Text("HR")),
                                  DropdownMenuItem(value: "intro", child: Text("Self-Intro")),
                                ],
                                onChanged: (val) {
                                  if (val != null) setState(() => _selectedRadar = val);
                                }
                              )
                            )
                          )
                        ]
                      ),
                      const SizedBox(height: 20),
                      Center(
                        child: SpiderChart(
                          data: _getRadarData(_selectedRadar),
                          maxValue: 1.0,
                          size: MediaQuery.of(context).size.width * 0.55,
                        ),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        "Your strongest competency is Problem Solving, keeping you in the top 15% of peers.",
                        textAlign: TextAlign.center,
                        style: TextStyle(fontSize: 12, color: t.textSecondary, height: 1.4),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: StaggeredFadeIn(
              delay: const Duration(milliseconds: 300),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                  Text("Sessions", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, letterSpacing: -0.3, color: t.text)),
                  Text("$total total", style: TextStyle(fontSize: 13, color: t.textTertiary)),
                ]),
              ),
            ),
          ),
          SliverPadding(
            padding: EdgeInsets.only(left: 14, right: 14, bottom: bottomPadding + 100),
            sliver: SliverList(delegate: SliverChildBuilderDelegate(
              (context, index) => StaggeredFadeIn(
                delay: Duration(milliseconds: 300 + (index * 100)),
                child: Padding(padding: const EdgeInsets.only(bottom: 10.0), child: SessionCard(s: sessions[index], index: index)),
              ),
              childCount: sessions.length,
            )),
          ),
        ],
      ),
    );
  }

  Widget _buildSmallStatRow(AppThemeColors t, IconData icon, String label, String val, Color color, String backText) {
    return PremiumFlipCard(
      front: GlassCard(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        borderRadius: 14,
        child: Row(children: [
          Container(
            width: 30, height: 30,
            decoration: BoxDecoration(color: color.withOpacity(0.15), borderRadius: BorderRadius.circular(9)),
            child: Center(child: Icon(icon, size: 13, color: color)),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisAlignment: MainAxisAlignment.center, children: [
              Text(val, style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: t.text)),
              const SizedBox(height: 1),
              Text(label, style: TextStyle(fontSize: 10, color: t.textTertiary)),
            ]),
          ),
        ]),
      ),
      back: GlassCard(
        tintColor: color,
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        borderRadius: 14,
        child: Center(
          child: Text(
            backText,
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: color),
          ),
        ),
      ),
    );
  }

  Map<String, double> _getRadarData(String module) {
    if (module == "resume") return {"Communication": 0.70, "Technical": 0.95, "Problem Solving": 0.85, "Cultural Fit": 0.60, "Confidence": 0.80, "Leadership": 0.50};
    if (module == "website") return {"Communication": 0.80, "Technical": 0.90, "Problem Solving": 0.90, "Cultural Fit": 0.75, "Confidence": 0.70, "Leadership": 0.65};
    if (module == "hr") return {"Communication": 0.95, "Technical": 0.50, "Problem Solving": 0.80, "Cultural Fit": 0.95, "Confidence": 0.90, "Leadership": 0.85};
    if (module == "intro") return {"Communication": 1.0, "Technical": 0.40, "Problem Solving": 0.60, "Cultural Fit": 0.90, "Confidence": 0.95, "Leadership": 0.80};
    return {"Communication": 0.85, "Technical": 0.70, "Problem Solving": 0.90, "Cultural Fit": 0.80, "Confidence": 0.75, "Leadership": 0.60}; // overall
  }
}
