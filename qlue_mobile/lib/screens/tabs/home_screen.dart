import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:feather_icons/feather_icons.dart';
import '../../core/theme.dart';
import '../../core/mock_data.dart';
import '../interview/interview_session_screen.dart';
import '../../components/resume_card.dart';
import '../../components/glass_card.dart';

class ModuleCard extends StatefulWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final List<Color> colors;
  final VoidCallback onPress;
  final String tag;

  const ModuleCard({
    super.key,
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.colors,
    required this.onPress,
    required this.tag,
  });

  @override
  State<ModuleCard> createState() => _ModuleCardState();
}

class _ModuleCardState extends State<ModuleCard> with SingleTickerProviderStateMixin {
  late AnimationController _animController;
  late Animation<double> _scaleAnim;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(vsync: this, duration: const Duration(milliseconds: 100));
    _scaleAnim = Tween<double>(begin: 1.0, end: 0.97).animate(
      CurvedAnimation(parent: _animController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final t = AppThemeColors.of(context);
    final primaryColor = widget.colors.first;

    return GestureDetector(
      onTapDown: (_) => _animController.forward(),
      onTapUp: (_) {
        _animController.reverse();
        widget.onPress();
      },
      onTapCancel: () => _animController.reverse(),
      child: AnimatedBuilder(
        animation: _scaleAnim,
        builder: (context, child) => Transform.scale(scale: _scaleAnim.value, child: child),
        child: GlassCard(
          tintColor: primaryColor,
          borderRadius: 18,
          padding: EdgeInsets.zero,
          child: Stack(
            children: [
              Padding(
                padding: const EdgeInsets.all(20.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        GlassCard(
                          padding: const EdgeInsets.all(12),
                          borderRadius: 30,
                          child: Icon(widget.icon, size: 22, color: primaryColor),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: primaryColor.withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: primaryColor.withValues(alpha: 0.3)),
                          ),
                          child: Text(widget.tag, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: primaryColor)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Text(widget.title, style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: t.text, letterSpacing: -0.3)),
                    const SizedBox(height: 4),
                    Text(widget.subtitle, style: TextStyle(fontSize: 13, color: t.textSecondary, height: 1.38)),
                  ],
                ),
              ),
              Positioned(
                right: 20, bottom: 20,
                child: Container(
                  width: 32, height: 32,
                  decoration: BoxDecoration(
                    color: primaryColor.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Center(child: Icon(FeatherIcons.arrowRight, size: 18, color: primaryColor)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class StatPill extends StatelessWidget {
  final String value;
  final String label;
  final IconData icon;

  const StatPill({super.key, required this.value, required this.label, required this.icon});

  @override
  Widget build(BuildContext context) {
    final t = AppThemeColors.of(context);
    return GlassCard(
      borderRadius: 16,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Container(
        constraints: const BoxConstraints(minWidth: 80),
        child: Column(
          children: [
            Icon(icon, size: 14, color: t.primary),
            const SizedBox(height: 4),
            Text(value, style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, letterSpacing: -0.3, color: t.text)),
            Text(label, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w500, color: t.textSecondary)),
          ],
        ),
      ),
    );
  }
}

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<Resume> resumes = List.from(mockResumes);
  bool uploading = false;

  void _handleUpload() async {
    setState(() => uploading = true);
    await Future.delayed(const Duration(milliseconds: 600));
    final randomNames = ["software_engineer", "product_manager", "data_analyst", "frontend_dev", "ux_designer"];
    String name = randomNames[math.Random().nextInt(randomNames.length)];
    String fmt = math.Random().nextDouble() > 0.5 ? "pdf" : "docx";
    setState(() {
      resumes.insert(0, Resume(id: DateTime.now().millisecondsSinceEpoch.toString(), filename: "$name.$fmt", uploadDate: "Just now", status: "parsing", skills: [], format: fmt, fileSize: "Unknown"));
      uploading = false;
    });
  }

  void _confirmDelete(String id, String name) {
    final t = AppThemeColors.of(context);
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: t.card,
        title: Text("Remove Resume", style: TextStyle(color: t.text)),
        content: Text('Delete "$name"?', style: TextStyle(color: t.textSecondary)),
        actions: [
          TextButton(child: Text("Cancel", style: TextStyle(color: t.textSecondary)), onPressed: () => Navigator.of(ctx).pop()),
          TextButton(style: TextButton.styleFrom(foregroundColor: t.error), child: const Text("Delete"), onPressed: () { setState(() => resumes.removeWhere((r) => r.id == id)); Navigator.of(ctx).pop(); }),
        ],
      ),
    );
  }

  void _showResumePreview(Resume r) {
    if (r.status != 'parsed') return;
    
    final t = AppThemeColors.of(context);
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (ctx) {
        final maxHeight = MediaQuery.of(context).size.height * 0.85;
        return Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0),
          child: GlassCard(
            margin: const EdgeInsets.only(bottom: 24),
            padding: const EdgeInsets.all(24),
            borderRadius: 32,
            child: ConstrainedBox(
              constraints: BoxConstraints(maxHeight: maxHeight),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                   Center(child: Container(width: 40, height: 4, decoration: BoxDecoration(color: t.border, borderRadius: BorderRadius.circular(2)))),
                   const SizedBox(height: 24),
                   Row(
                     children: [
                       Container(
                         padding: const EdgeInsets.all(10),
                         decoration: BoxDecoration(color: t.primary.withValues(alpha: 0.15), shape: BoxShape.circle),
                         child: Icon(FeatherIcons.fileText, color: t.primary, size: 20),
                       ),
                       const SizedBox(width: 12),
                       Expanded(
                         child: Column(
                           crossAxisAlignment: CrossAxisAlignment.start,
                           children: [
                             Text("Parsed Data", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: t.text)),
                             Text(r.filename, maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(fontSize: 13, color: t.textSecondary)),
                           ]
                         )
                       ),
                       IconButton(
                         icon: Icon(FeatherIcons.x, color: t.textSecondary),
                         onPressed: () => Navigator.pop(ctx),
                       )
                     ]
                   ),
                   const SizedBox(height: 20),
                   Flexible(
                     child: SingleChildScrollView(
                       child: Column(
                         crossAxisAlignment: CrossAxisAlignment.start,
                         children: [
                           if (r.summary != null) ...[
                             _buildSectionHeader(t, "Summary"),
                             Text(r.summary!, style: TextStyle(fontSize: 14, color: t.textSecondary, height: 1.5)),
                             const SizedBox(height: 24),
                           ],
                           if (r.skills.isNotEmpty) ...[
                             _buildSectionHeader(t, "Skills"),
                             Wrap(
                               spacing: 8, runSpacing: 8,
                               children: r.skills.map((s) => Container(
                                 padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                 decoration: BoxDecoration(color: t.card, borderRadius: BorderRadius.circular(20), border: Border.all(color: t.border)),
                                 child: Text(s, style: TextStyle(fontSize: 13, color: t.text)),
                               )).toList()
                             ),
                             const SizedBox(height: 24),
                           ],
                           if (r.experience != null && r.experience!.isNotEmpty) ...[
                             _buildSectionHeader(t, "Internships & Experience"),
                             ...r.experience!.map((e) => Padding(
                               padding: const EdgeInsets.only(bottom: 16.0),
                               child: Column(
                                 crossAxisAlignment: CrossAxisAlignment.start,
                                 children: [
                                   Text(e.role, style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: t.text)),
                                   const SizedBox(height: 2),
                                   Text("${e.company} • ${e.years}", style: TextStyle(fontSize: 13, color: t.primary)),
                                   if (e.description != null) ...[
                                     const SizedBox(height: 6),
                                     Text(e.description!, style: TextStyle(fontSize: 14, color: t.textSecondary, height: 1.4)),
                                   ]
                                 ]
                               )
                             )),
                             const SizedBox(height: 8),
                           ],
                           if (r.education != null && r.education!.isNotEmpty) ...[
                             _buildSectionHeader(t, "Education"),
                             ...r.education!.map((e) => Padding(
                               padding: const EdgeInsets.only(bottom: 16.0),
                               child: Column(
                                 crossAxisAlignment: CrossAxisAlignment.start,
                                 children: [
                                   Text(e.degree, style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: t.text)),
                                   const SizedBox(height: 2),
                                   Text("${e.institution} • ${e.year}", style: TextStyle(fontSize: 13, color: t.textTertiary)),
                                 ]
                               )
                             )),
                           ],
                         ]
                       )
                     )
                   )
                ]
              )
            )
          )
        );
      }
    );
  }

  Widget _buildSectionHeader(AppThemeColors t, String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: Row(
        children: [
          Text(title.toUpperCase(), style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 1.2, color: t.textTertiary)),
          const SizedBox(width: 8),
          Expanded(child: Container(height: 1, color: t.borderSubtle)),
        ]
      )
    );
  }

  @override
  Widget build(BuildContext context) {
    final t = AppThemeColors.of(context);
    final topPadding = MediaQuery.of(context).padding.top;
    final bottomPadding = MediaQuery.of(context).padding.bottom;

    final sessions = mockSessions;
    final avgScore = sessions.isNotEmpty
        ? (sessions.fold(0, (sum, s) => sum + s.score) / sessions.length).round()
        : 0;
    final totalMin = sessions.fold(0, (sum, s) => sum + (s.duration ~/ 60));

    final hour = DateTime.now().hour;
    final greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
    const firstName = "Jane";

    return Scaffold(
      backgroundColor: t.bg,
      body: SingleChildScrollView(
        padding: EdgeInsets.only(bottom: bottomPadding + 100),
        child: Column(
          children: [
            // Header
            GlassCard(
              margin: EdgeInsets.only(left: 16, right: 16, top: topPadding > 0 ? topPadding : 16, bottom: 10),
              padding: const EdgeInsets.only(top: 20, bottom: 20, left: 20),
              borderRadius: 30,
              child: Column(
                children: [
                  Padding(
                    padding: const EdgeInsets.only(right: 20.0),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(greeting, style: TextStyle(fontSize: 13, color: t.textSecondary)),
                            const SizedBox(height: 2),
                            Text(firstName, style: TextStyle(fontSize: 30, fontWeight: FontWeight.bold, letterSpacing: -0.6, color: t.text)),
                          ],
                        ),
                        GlassCard(
                          padding: EdgeInsets.zero,
                          borderRadius: 13,
                          child: SizedBox(
                            width: 42, height: 42,
                            child: Center(child: Icon(FeatherIcons.bell, size: 18, color: t.iconDefault)),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.only(right: 20),
                    child: Row(
                      children: [
                        StatPill(value: sessions.length.toString(), label: "Sessions", icon: FeatherIcons.mic),
                        const SizedBox(width: 10),
                        StatPill(value: avgScore > 0 ? "$avgScore%" : "—", label: "Avg Score", icon: FeatherIcons.trendingUp),
                        const SizedBox(width: 10),
                        StatPill(value: resumes.length.toString(), label: "Resumes", icon: FeatherIcons.fileText),
                        const SizedBox(width: 10),
                        StatPill(value: "${totalMin}m", label: "Practice", icon: FeatherIcons.clock),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Modules
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    crossAxisAlignment: CrossAxisAlignment.baseline,
                    textBaseline: TextBaseline.alphabetic,
                    children: [
                      Text("Practice", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, letterSpacing: -0.4, color: t.text)),
                      Text("Choose your session type", style: TextStyle(fontSize: 12, color: t.textTertiary)),
                    ],
                  ),
                  const SizedBox(height: 14),
                  ModuleCard(title: "Resume Interview", subtitle: "Questions based on your resume & skills", icon: FeatherIcons.fileText, colors: const [Color(0xFF1D4ED8), Color(0xFF2563EB)], tag: "Personalized", onPress: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const InterviewSessionScreen()))),
                  const SizedBox(height: 12),
                  ModuleCard(title: "HR & Behavioral", subtitle: "STAR method, culture-fit questions", icon: FeatherIcons.users, colors: const [Color(0xFFBE185D), Color(0xFFDB2777)], tag: "Popular", onPress: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const InterviewSessionScreen()))),
                  const SizedBox(height: 12),
                  ModuleCard(title: "Job Posting Practice", subtitle: "Role-specific questions from job URLs", icon: FeatherIcons.globe, colors: const [Color(0xFF0369A1), Color(0xFF0891B2)], tag: "New", onPress: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const InterviewSessionScreen()))),
                ],
              ),
            ),

            // Recent Sessions
            if (sessions.isNotEmpty)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.baseline,
                      textBaseline: TextBaseline.alphabetic,
                      children: [
                        Text("Recent", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, letterSpacing: -0.4, color: t.text)),
                        Text("See all", style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: t.primary)),
                      ],
                    ),
                    const SizedBox(height: 14),
                    GlassCard(
                      borderRadius: 20,
                      padding: EdgeInsets.zero,
                      child: Column(
                        children: sessions.take(3).toList().asMap().entries.map((entry) {
                          int i = entry.key;
                          Session s = entry.value;
                          Map<String, Color> moduleColors = {"resume": t.moduleResume, "hr": t.moduleHR, "website": t.moduleWeb};
                          Map<String, IconData> moduleIcons = {"resume": FeatherIcons.fileText, "hr": FeatherIcons.users, "website": FeatherIcons.globe};
                          Color c = moduleColors[s.module] ?? t.primary;
                          IconData icon = moduleIcons[s.module] ?? FeatherIcons.activity;
                          Color scoreColor = s.score >= 80 ? t.success : s.score >= 65 ? t.warning : t.error;

                          return Column(
                            children: [
                              if (i > 0) Container(height: 1, color: t.borderSubtle),
                              Padding(
                                padding: const EdgeInsets.all(14.0),
                                child: Row(
                                  children: [
                                    Container(
                                      width: 38, height: 38,
                                      decoration: BoxDecoration(color: c.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(11)),
                                      child: Center(child: Icon(icon, size: 15, color: c)),
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(s.topic, maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: t.text)),
                                          const SizedBox(height: 2),
                                          Text("${s.date} · ${s.duration ~/ 60}m", style: TextStyle(fontSize: 12, color: t.textTertiary)),
                                        ],
                                      ),
                                    ),
                                    const SizedBox(width: 12),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                      decoration: BoxDecoration(color: scoreColor.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(10)),
                                      child: Text("${s.score}%", style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: scoreColor)),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          );
                        }).toList(),
                      ),
                    ),
                  ],
                ),
              ),

            if (sessions.isEmpty)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0),
                child: GlassCard(
                  tintColor: t.primary,
                  padding: const EdgeInsets.all(24),
                  borderRadius: 20,
                  child: Column(
                    children: [
                      GlassCard(
                        tintColor: t.primary,
                        borderRadius: 18,
                        padding: EdgeInsets.zero,
                        child: SizedBox(
                          width: 56, height: 56,
                          child: Center(child: Icon(FeatherIcons.zap, size: 24, color: t.primary)),
                        ),
                      ),
                      const SizedBox(height: 14),
                      Text("Start your first session", style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: t.text)),
                      const SizedBox(height: 10),
                      Text("Pick a module above to begin practicing and get AI-powered feedback", textAlign: TextAlign.center, style: TextStyle(fontSize: 13, color: t.textSecondary, height: 1.5)),
                    ],
                  ),
                ),
              ),

            // Resumes Section
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    crossAxisAlignment: CrossAxisAlignment.baseline,
                    textBaseline: TextBaseline.alphabetic,
                    children: [
                      Text("Resumes", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, letterSpacing: -0.4, color: t.text)),
                      GestureDetector(
                        onTap: uploading ? null : _handleUpload,
                        child: Row(
                          children: [
                            if (uploading) SizedBox(width: 12, height: 12, child: CircularProgressIndicator(strokeWidth: 2, color: t.primary))
                            else Icon(FeatherIcons.uploadCloud, size: 14, color: t.primary),
                            const SizedBox(width: 6),
                            Text("Upload", style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: t.primary)),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  if (resumes.isEmpty)
                     GlassCard(
                       padding: const EdgeInsets.all(24),
                       borderRadius: 20,
                       child: Center(
                         child: Column(
                           children: [
                             Icon(FeatherIcons.fileText, size: 32, color: t.textTertiary),
                             const SizedBox(height: 12),
                             Text("No resumes uploaded", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: t.text)),
                             const SizedBox(height: 6),
                             Text("Upload your resume to unlock personalized interview questions", textAlign: TextAlign.center, style: TextStyle(fontSize: 13, color: t.textSecondary)),
                           ],
                         ),
                       ),
                     )
                  else
                     Column(
                       children: resumes.map((r) => ResumeCard(
                         resume: r, 
                         onDelete: () => _confirmDelete(r.id, r.filename),
                         onPress: () => _showResumePreview(r),
                       )).toList(),
                     ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
