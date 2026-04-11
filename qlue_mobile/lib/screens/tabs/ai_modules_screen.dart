import 'package:flutter/material.dart';
import 'package:feather_icons/feather_icons.dart';
import '../../core/theme.dart';
import '../../core/mock_data.dart';
import '../../components/glass_card.dart';
import '../interview/interview_session_screen.dart';

// --- Line Art Icons exactly matching the mockup ---

class LineArtResume extends StatelessWidget {
  final AppThemeColors t;
  const LineArtResume(this.t, {super.key});

  @override
  Widget build(BuildContext context) {
    final strokeColor = t.isDark ? Colors.white : Colors.black;
    final fillColor = t.isDark ? t.bgSecondary : Colors.white;

    return SizedBox(
      width: 70, height: 80,
      child: Stack(
        children: [
          Positioned(
            left: 0, top: 10,
            child: Container(
              width: 50, height: 65,
              decoration: BoxDecoration(color: fillColor, border: Border.all(color: strokeColor, width: 2), borderRadius: BorderRadius.circular(4)),
            ),
          ),
          Positioned(
            right: 0, top: 0,
            child: Container(
              width: 52, height: 75,
              decoration: BoxDecoration(color: fillColor, border: Border.all(color: strokeColor, width: 2), borderRadius: BorderRadius.circular(4)),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: List.generate(5, (i) => Padding(
                  padding: const EdgeInsets.only(left: 8.0),
                  child: Container(height: 2, width: i == 4 ? 20 : 32, color: strokeColor),
                )),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class LineArtGlobe extends StatelessWidget {
  final AppThemeColors t;
  const LineArtGlobe(this.t, {super.key});

  @override
  Widget build(BuildContext context) {
    final strokeColor = t.isDark ? Colors.white : Colors.black;
    final fillColor = t.isDark ? t.bgSecondary : Colors.white;

    return Container(
      width: 66, height: 66,
      decoration: BoxDecoration(color: fillColor, shape: BoxShape.circle, border: Border.all(color: strokeColor, width: 2.5)),
      child: Stack(
        alignment: Alignment.center,
        children: [
          Container(width: 2, height: 66, color: strokeColor),
          Container(width: 36, height: 66, decoration: BoxDecoration(border: Border.all(color: strokeColor, width: 2), borderRadius: BorderRadius.circular(33))),
          Container(height: 2.5, width: 66, color: strokeColor),
          Positioned(top: 14, child: Container(width: 58, height: 2, color: strokeColor)),
          Positioned(bottom: 14, child: Container(width: 58, height: 2, color: strokeColor)),
          // Masking center with text overlay
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 4),
            color: fillColor,
            child: Text(
              "WWW",
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w900,
                color: strokeColor,
                letterSpacing: 1.0,
                height: 1.0,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class LineArtHR extends StatelessWidget {
  final AppThemeColors t;
  const LineArtHR(this.t, {super.key});

  @override
  Widget build(BuildContext context) {
    final strokeColor = t.isDark ? Colors.white : Colors.black;
    final fillColor = t.isDark ? t.bgSecondary : Colors.white;

    return SizedBox(
      width: 90, height: 75,
      child: Stack(
        children: [
          Positioned(
            left: 5, bottom: 0,
            child: Column(
              children: [
                Container(width: 22, height: 22, decoration: BoxDecoration(color: fillColor, shape: BoxShape.circle, border: Border.all(color: strokeColor, width: 2))),
                Container(
                  width: 32, height: 16,
                  decoration: BoxDecoration(
                    color: fillColor,
                    border: Border.all(color: strokeColor, width: 2),
                    borderRadius: const BorderRadius.only(topLeft: Radius.circular(16), topRight: Radius.circular(16)),
                  ),
                ),
              ],
            ),
          ),
          Positioned(
            right: 5, bottom: 0,
            child: Column(
              children: [
                Container(width: 22, height: 22, decoration: BoxDecoration(color: fillColor, shape: BoxShape.circle, border: Border.all(color: strokeColor, width: 2))),
                Container(
                  width: 32, height: 16,
                  decoration: BoxDecoration(color: fillColor, border: Border.all(color: strokeColor, width: 2), borderRadius: const BorderRadius.only(topLeft: Radius.circular(16), topRight: Radius.circular(16))),
                ),
              ],
            ),
          ),
          Positioned(
            left: 15, top: 12,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
              decoration: BoxDecoration(color: fillColor, border: Border.all(color: strokeColor, width: 2), borderRadius: BorderRadius.circular(4)),
              child: Row(
                children: [
                   Container(width: 6, height: 2, color: strokeColor),
                   const SizedBox(width: 2),
                   Container(width: 6, height: 2, color: strokeColor),
                ]
              )
            ),
          ),
          Positioned(
            right: 0, top: 2,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 4),
              decoration: BoxDecoration(color: fillColor, border: Border.all(color: strokeColor, width: 2), borderRadius: BorderRadius.circular(4)),
              child: Column(
                children: [
                   Container(width: 14, height: 2, color: strokeColor, margin: const EdgeInsets.only(bottom: 2)),
                   Container(width: 14, height: 2, color: strokeColor, margin: const EdgeInsets.only(bottom: 2)),
                   Container(width: 8, height: 2, color: strokeColor),
                ]
              )
            ),
          ),
          Positioned(
            left: 35, top: 22,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
              decoration: BoxDecoration(color: fillColor, border: Border.all(color: strokeColor, width: 2), borderRadius: BorderRadius.circular(4)),
              child: Container(width: 4, height: 2, color: strokeColor),
            ),
          ),
        ],
      ),
    );
  }
}

class LineArtAudio extends StatelessWidget {
  final AppThemeColors t;
  const LineArtAudio(this.t, {super.key});

  @override
  Widget build(BuildContext context) {
    final strokeColor = t.isDark ? Colors.white : Colors.black;
    final fillColor = t.isDark ? t.bgSecondary : Colors.white;

    return SizedBox(
      width: 75, height: 75,
      child: Stack(
        children: [
          Positioned(
            left: 0, bottom: 0,
            child: Column(
              children: [
                Container(width: 28, height: 28, decoration: BoxDecoration(color: fillColor, shape: BoxShape.circle, border: Border.all(color: strokeColor, width: 2))),
                Container(
                  width: 45, height: 20,
                  decoration: BoxDecoration(color: fillColor, border: Border.all(color: strokeColor, width: 2), borderRadius: const BorderRadius.only(topLeft: Radius.circular(20), topRight: Radius.circular(20))),
                ),
              ],
            ),
          ),
          Positioned(
            right: 15, top: 15,
            child: Container(
              width: 15, height: 30,
              decoration: BoxDecoration(
                border: Border(right: BorderSide(color: strokeColor, width: 2)),
                borderRadius: const BorderRadius.only(topRight: Radius.circular(15), bottomRight: Radius.circular(15)),
              )
            )
          ),
          Positioned(
            right: 5, top: 5,
            child: Container(
              width: 20, height: 50,
              decoration: BoxDecoration(
                border: Border(right: BorderSide(color: strokeColor, width: 2)),
                borderRadius: const BorderRadius.only(topRight: Radius.circular(25), bottomRight: Radius.circular(25)),
              )
            )
          ),
        ],
      ),
    );
  }
}

// --- Main Screen ---

class AIModulesScreen extends StatefulWidget {
  const AIModulesScreen({super.key});

  @override
  State<AIModulesScreen> createState() => _AIModulesScreenState();
}

class _AIModulesScreenState extends State<AIModulesScreen> {
  Resume? _selectedResume;
  List<Resume> get _resumes => mockResumes;

  void _showResumePopup() {
    final t = AppThemeColors.of(context);
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return GlassCard(
              margin: const EdgeInsets.only(top: 100),
              padding: const EdgeInsets.all(24),
              borderRadius: 32,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                   Center(child: Container(width: 40, height: 4, decoration: BoxDecoration(color: t.border, borderRadius: BorderRadius.circular(2)))),
                   const SizedBox(height: 24),
                   Row(
                     mainAxisAlignment: MainAxisAlignment.spaceBetween,
                     children: [
                       Text("Select a Resume", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: t.text)),
                       IconButton(icon: Icon(FeatherIcons.x, color: t.textSecondary), onPressed: () => Navigator.pop(ctx))
                     ]
                   ),
                   const SizedBox(height: 16),
                   if (_resumes.isEmpty)
                      Center(child: Padding(padding: const EdgeInsets.symmetric(vertical: 40.0), child: Text("No resumes uploaded yet.", style: TextStyle(color: t.textSecondary))))
                   else
                      Flexible(
                        child: ListView.builder(
                          shrinkWrap: true,
                          itemCount: _resumes.length,
                          itemBuilder: (context, index) {
                            final r = _resumes[index];
                            final isSelected = _selectedResume?.id == r.id;
                            return GestureDetector(
                              onTap: () {
                                setState(() => _selectedResume = r);
                                setModalState(() {});
                                Navigator.pop(ctx);
                              },
                              child: Container(
                                margin: const EdgeInsets.only(bottom: 12),
                                padding: const EdgeInsets.all(16),
                                decoration: BoxDecoration(
                                  color: isSelected ? t.primary.withOpacity(0.2) : t.bgSecondary,
                                  border: Border.all(color: isSelected ? t.primary : t.border),
                                  borderRadius: BorderRadius.circular(16)
                                ),
                                child: Row(
                                  children: [
                                    Icon(FeatherIcons.fileText, color: isSelected ? t.primary : t.textSecondary),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(r.filename, style: TextStyle(fontWeight: FontWeight.w600, color: t.text)),
                                          const SizedBox(height: 4),
                                          Text("Parsed - ${r.uploadDate}", style: TextStyle(fontSize: 12, color: t.textTertiary)),
                                        ]
                                      )
                                    ),
                                    if (isSelected) Icon(FeatherIcons.checkCircle, color: t.primary)
                                  ]
                                )
                              )
                            );
                          }
                        )
                      ),
                ],
              )
            );
          }
        );
      }
    );
  }



  void _startInterview() {
    Navigator.push(context, MaterialPageRoute(builder: (context) => const InterviewSessionScreen()));
  }

  @override
  Widget build(BuildContext context) {
    final t = AppThemeColors.of(context);
    final topPadding = MediaQuery.of(context).padding.top;
    final bottomPadding = MediaQuery.of(context).padding.bottom;

    return Scaffold(
      backgroundColor: t.bg,
      body: SingleChildScrollView(
        padding: EdgeInsets.only(top: topPadding > 0 ? topPadding : 20, bottom: bottomPadding + 100),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 30),
              const SizedBox(height: 30),
              Text(
                "AI Modules",
                style: TextStyle(
                  fontSize: 32, 
                  fontWeight: FontWeight.bold, 
                  color: t.text,
                )
              ),
              const SizedBox(height: 30),

              // SECTION 1: Mock Interview
              _buildSectionHeader(t, "Mock Interview", "Practice with AI for your dream job."),
              const SizedBox(height: 16),
              
              // CARD 1: Resume
              _buildActionCard(
                t: t,
                title: "Resume",
                description: "Analyze key skills and work history from your resume to tailor questions.",
                customIcon: LineArtResume(t),
                isIconRight: true,
                leftAction: Expanded(
                  child: GestureDetector(
                    onTap: _showResumePopup,
                    child: Padding(
                      padding: const EdgeInsets.only(right: 12.0),
                      child: Text(
                        _selectedResume != null ? _selectedResume!.filename : "Select Resume", 
                        style: TextStyle(fontSize: 14, color: t.text, fontWeight: FontWeight.w500),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ),
                ),
                rightAction: _buildStartButton(),
              ),

              // CARD 3: HR
              _buildActionCard(
                t: t,
                title: "HR",
                description: "Practice behavioral and situational HR questions with AI analysis.",
                customIcon: LineArtHR(t),
                isIconRight: true,
                leftAction: const SizedBox(), // empty left
                rightAction: _buildStartButton(),
              ),

              const SizedBox(height: 24),

              // SECTION 2: AI Tutor Mode
              _buildSectionHeader(t, "AI Tutor Mode", "Master any topic with interactive AI guidance."),
              const SizedBox(height: 16),

              // CARD 2: Website
              _buildActionCard(
                t: t,
                title: "Website",
                description: "AI asks targeted revision questions based on a educational URL content.",
                customIcon: LineArtGlobe(t),
                isIconRight: false,
                leftAction: Expanded(
                  child: Container(
                    height: 36,
                    margin: const EdgeInsets.only(right: 8),
                    child: TextField(
                      style: TextStyle(color: t.text, fontSize: 12),
                      decoration: InputDecoration(
                        hintText: "Paste job URL...",
                        hintStyle: TextStyle(color: t.textSecondary, fontSize: 12),
                        filled: true,
                        fillColor: t.isDark ? t.bgSecondary : Colors.white,
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 0),
                      ),
                    ),
                  ),
                ),
                rightAction: _buildStartButton(),
              ),

              // CARD 4: Self-Intro
              _buildActionCard(
                t: t,
                title: "Self-Intro",
                description: "Record your professional introduction. AI evaluates clarity and delivery.",
                customIcon: LineArtAudio(t),
                isIconRight: false,
                leftAction: const Spacer(), // pushes right
                rightAction: _buildStartButton(),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionHeader(AppThemeColors t, String title, String subtitle) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Container(
              width: 4,
              height: 24,
              decoration: BoxDecoration(
                color: t.primary,
                borderRadius: BorderRadius.circular(2),
                boxShadow: [
                  BoxShadow(color: t.primary.withOpacity(0.5), blurRadius: 8, offset: const Offset(0, 0))
                ],
              ),
            ),
            const SizedBox(width: 12),
            Text(
              title,
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: t.text),
            ),
          ],
        ),
        const SizedBox(height: 4),
        Padding(
          padding: const EdgeInsets.only(left: 16.0),
          child: Text(
            subtitle,
            style: TextStyle(fontSize: 13, color: t.textSecondary),
          ),
        ),
      ],
    );
  }

  Widget _buildActionCard({
    required AppThemeColors t,
    required String title,
    required String description,
    required Widget customIcon,
    required bool isIconRight,
    required Widget leftAction,
    required Widget rightAction,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 24),
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          // Main Card Body
          GlassCard(
            margin: const EdgeInsets.only(top: 24), // Push down to let icon overflow top
            padding: const EdgeInsets.only(top: 32, bottom: 20, left: 24, right: 24),
            borderRadius: 24,
            child: Column(
              crossAxisAlignment: isIconRight ? CrossAxisAlignment.start : CrossAxisAlignment.end,
              children: [
                // Title
                Text(
                  title,
                  style: TextStyle(
                    fontSize: 28, 
                    fontWeight: FontWeight.bold, 
                    color: t.text,
                  ),
                ),
                const SizedBox(height: 8),
                
                // Description Text
                SizedBox(
                  width: double.infinity,
                  child: Text(
                     description,
                     textAlign: isIconRight ? TextAlign.left : TextAlign.right,
                     style: TextStyle(fontSize: 12, height: 1.4, color: t.textSecondary),
                  )
                ),
                const SizedBox(height: 20),
                
                // Actions precisely mimicking the design alignments
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    leftAction,
                    rightAction,
                  ],
                ),
              ],
            ),
          ),
          
          // Custom Drawn Line Art Icon perfectly positioned on top offsets
          Positioned(
            top: 0,
            right: isIconRight ? 16 : null,
            left: !isIconRight ? 16 : null,
            child: Container(
              decoration: BoxDecoration(
                boxShadow: [
                  BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 10, offset: const Offset(0, 4))
                ]
              ),
              child: customIcon,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStartButton() {
    return GestureDetector(
      onTap: _startInterview,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 8),
        decoration: BoxDecoration(
          color: const Color(0xFF4A729A), // Accurate Slate Blue matching the mockup
          borderRadius: BorderRadius.circular(8),
        ),
        child: const Text(
          "Start", 
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)
        ),
      ),
    );
  }
}
