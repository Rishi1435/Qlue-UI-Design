import 'package:flutter/material.dart';
import 'package:feather_icons/feather_icons.dart';
import 'package:file_picker/file_picker.dart';
import 'dart:ui';
import '../../core/theme.dart';
import '../../core/mock_data.dart';
import '../../components/glass_card.dart';

class ResumeUploadScreen extends StatefulWidget {
  const ResumeUploadScreen({super.key});

  @override
  State<ResumeUploadScreen> createState() => _ResumeUploadScreenState();
}

class _ResumeUploadScreenState extends State<ResumeUploadScreen> {
  bool _isUploading = false;

  void _handleUpload() async {
    if (mockResumes.length >= 5) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(backgroundColor: Colors.redAccent, content: Text("Maximum of 5 resumes allowed.", style: TextStyle(color: Colors.white)))
      );
      return;
    }

    FilePickerResult? result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf', 'doc', 'docx'],
    );

    if (result != null && result.files.single.name.isNotEmpty) {
      final file = result.files.single;
      final fileName = file.name;
      final String fileExtension = file.extension?.toLowerCase() ?? 'pdf';
      final String fileSizeMB = file.size > 0 ? "${(file.size / (1024 * 1024)).toStringAsFixed(1)} MB" : "1.2 MB";

      setState(() => _isUploading = true);
      
      // Simulate mapping extraction from file contents
      await Future.delayed(const Duration(seconds: 2));
      
      if (!mounted) return;
      setState(() {
        _isUploading = false;
        mockResumes.insert(0, Resume(
          id: DateTime.now().millisecondsSinceEpoch.toString(),
          filename: fileName,
          uploadDate: "Just now",
          status: "parsed",
          skills: ["Flutter", "Dart", "Firebase", "UI/UX", "REST API", "SQL"],
          format: (fileExtension == 'pdf') ? 'pdf' : 'docx',
          fileSize: fileSizeMB,
          summary: "Parsed file successfully. Extracted key metrics from document mapping directly to the UI.",
          experience: [
            Experience(role: "Uploaded Candidate", company: "Local File", years: "2024", description: "This data was dynamically rendered matching the specific $fileName upload event."),
          ],
          education: [
            Education(degree: "Real Device File", institution: fileSizeMB, year: ""),
          ]
        ));
      });
    }
  }

  void _handleDelete(int index) {
    setState(() {
      mockResumes.removeAt(index);
    });
  }

  void _showParsedPreview(Resume r) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        final t = AppThemeColors.of(ctx);
        return Container(
          height: MediaQuery.of(ctx).size.height * 0.85,
          decoration: BoxDecoration(
            color: t.cardElevated,
            border: Border.all(color: t.border),
            borderRadius: const BorderRadius.vertical(top: Radius.circular(30)),
          ),
          child: Stack(
            children: [
              // ambient blue glow smoothly themed
              Positioned(
                top: 100, left: -50, right: -50,
                child: Container(
                  height: 300,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: t.primaryMuted,
                        blurRadius: 100,
                        spreadRadius: 50,
                      )
                    ]
                  ),
                ),
              ),
              Column(
                children: [
                   const SizedBox(height: 12),
                   Container(width: 40, height: 4, decoration: BoxDecoration(color: t.border, borderRadius: BorderRadius.circular(2))),
                   const SizedBox(height: 24),
                   
                   Padding(
                     padding: const EdgeInsets.symmetric(horizontal: 24.0),
                     child: Row(
                       crossAxisAlignment: CrossAxisAlignment.start,
                       children: [
                         Container(
                           padding: const EdgeInsets.all(12),
                           decoration: BoxDecoration(color: t.primaryMuted, shape: BoxShape.circle),
                           child: Icon(FeatherIcons.fileText, color: t.primary, size: 24),
                         ),
                         const SizedBox(width: 16),
                         Expanded(
                           child: Column(
                             crossAxisAlignment: CrossAxisAlignment.start,
                             children: [
                               Text("Parsed Data", style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: t.text)),
                               const SizedBox(height: 4),
                               Text(r.filename, style: TextStyle(fontSize: 14, color: t.textSecondary)),
                             ],
                           )
                         ),
                         IconButton(
                           icon: Icon(FeatherIcons.x, color: t.textTertiary),
                           onPressed: () => Navigator.pop(ctx),
                         )
                       ],
                     ),
                   ),
                   const SizedBox(height: 16),
                   Expanded(
                     child: ListView(
                       padding: const EdgeInsets.all(24),
                       children: [
                         if (r.summary != null) ...[
                           _buildSectionHeader("SUMMARY", t),
                           const SizedBox(height: 12),
                           Text(r.summary!, style: TextStyle(fontSize: 15, color: t.textSecondary, height: 1.6)),
                           const SizedBox(height: 32),
                         ],
                         if (r.skills.isNotEmpty) ...[
                           _buildSectionHeader("SKILLS", t),
                           const SizedBox(height: 16),
                           Wrap(
                             spacing: 12, runSpacing: 12,
                             children: r.skills.map((s) => _buildSkillPill(s, t)).toList()
                           ),
                           const SizedBox(height: 32),
                         ],
                         if (r.experience != null && r.experience!.isNotEmpty) ...[
                           _buildSectionHeader("INTERNSHIPS & EXPERIENCE", t),
                           const SizedBox(height: 16),
                           ...r.experience!.map((e) => Padding(
                             padding: const EdgeInsets.only(bottom: 24.0),
                             child: Column(
                               crossAxisAlignment: CrossAxisAlignment.start,
                               children: [
                                 Text(e.role, style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: t.text)),
                                 const SizedBox(height: 4),
                                 Text("${e.company} • ${e.years}", style: TextStyle(fontSize: 14, color: t.primary)),
                                 if (e.description != null) ...[
                                   const SizedBox(height: 8),
                                   Text(e.description!, style: TextStyle(fontSize: 14, color: t.textSecondary, height: 1.5)),
                                 ]
                               ],
                             ),
                           )).toList(),
                         ],
                         if (r.education != null && r.education!.isNotEmpty) ...[
                           _buildSectionHeader("EDUCATION", t),
                           const SizedBox(height: 16),
                           ...r.education!.map((e) => Padding(
                             padding: const EdgeInsets.only(bottom: 24.0),
                             child: Column(
                               crossAxisAlignment: CrossAxisAlignment.start,
                               children: [
                                 Text(e.degree, style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: t.text)),
                                 const SizedBox(height: 4),
                                 Text("${e.institution} • ${e.year}", style: TextStyle(fontSize: 14, color: t.textSecondary)),
                               ],
                             ),
                           )).toList(),
                         ]
                       ],
                     ),
                   )
                ],
              )
            ],
          )
        );
      }
    );
  }

  Widget _buildSectionHeader(String title, AppThemeColors t) {
    return Row(
      children: [
        Text(title, style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 1.2, color: t.textTertiary)),
        const SizedBox(width: 16),
        Expanded(child: Container(height: 1, color: t.border)),
      ],
    );
  }

  Widget _buildSkillPill(String skill, AppThemeColors t) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: t.bgSecondary,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: t.border),
      ),
      child: Text(skill, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: t.text)),
    );
  }

  @override
  Widget build(BuildContext context) {
    final t = AppThemeColors.of(context);
    final topPadding = MediaQuery.of(context).padding.top;

    return Scaffold(
      backgroundColor: t.bg,
      appBar: PreferredSize(
        preferredSize: Size.fromHeight(topPadding + 60),
        child: Container(
          padding: EdgeInsets.only(top: topPadding, left: 24, right: 24, bottom: 16),
          color: t.bg,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  GestureDetector(
                    onTap: () => Navigator.pop(context),
                    child: Padding(
                      padding: const EdgeInsets.only(bottom: 6.0, right: 12.0),
                      child: Icon(FeatherIcons.arrowLeft, color: t.textSecondary, size: 22),
                    ),
                  ),
                  Text("Resumes", style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: t.text)),
                ],
              ),
              GestureDetector(
                onTap: _isUploading ? null : _handleUpload,
                child: Row(
                  children: [
                    if (_isUploading) SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2, color: t.primary))
                    else Icon(FeatherIcons.uploadCloud, size: 16, color: t.primary),
                    const SizedBox(width: 6),
                    Text(_isUploading ? "Uploading" : "Upload", style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: t.primary))
                  ],
                ),
              )
            ]
          ),
        ),
      ),
      body: mockResumes.isEmpty 
        ? Center(child: Text("No resumes uploaded.\nTap Upload to add one.", textAlign: TextAlign.center, style: TextStyle(color: t.textSecondary, fontSize: 16)))
        : ListView.builder(
        padding: const EdgeInsets.only(top: 10, bottom: 40, left: 16, right: 16),
        itemCount: mockResumes.length,
        itemBuilder: (context, index) {
          final resume = mockResumes[index];
          final isPDF = resume.format.toLowerCase() == "pdf";
          final headerColor = isPDF ? t.moduleHR : t.moduleResume;
          
          return GestureDetector(
            onTap: () => _showParsedPreview(resume),
            child: GlassCard(
              margin: const EdgeInsets.only(bottom: 20),
              padding: const EdgeInsets.all(0),
              borderRadius: 24,
              tintColor: headerColor,
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                    decoration: BoxDecoration(
                      color: headerColor.withOpacity(0.15),
                      border: Border(bottom: BorderSide(color: headerColor.withOpacity(0.2)))
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Icon(FeatherIcons.fileText, color: headerColor, size: 20),
                            const SizedBox(width: 12),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(resume.format.toUpperCase(), style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: t.text)),
                                Text(resume.fileSize, style: TextStyle(fontSize: 12, color: t.textSecondary)),
                              ]
                            )
                          ],
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(color: headerColor.withOpacity(0.15), borderRadius: BorderRadius.circular(20), border: Border.all(color: headerColor.withOpacity(0.3))),
                          child: Row(
                            children: [
                              Icon(FeatherIcons.checkCircle, color: headerColor, size: 14),
                              const SizedBox(width: 6),
                              Text("Ready", style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: headerColor)),
                            ],
                          )
                        )
                      ],
                    ),
                  ),
                  
                  Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(resume.filename, style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: t.text)),
                        const SizedBox(height: 6),
                        Text("Uploaded ${resume.uploadDate}", style: TextStyle(fontSize: 13, color: t.textSecondary)),
                        const SizedBox(height: 16),
                        
                        if (resume.skills.isNotEmpty)
                          Row(
                            children: [
                              ...resume.skills.take(3).map((s) => Padding(
                                padding: const EdgeInsets.only(right: 8.0),
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                  decoration: BoxDecoration(color: t.primaryMuted, borderRadius: BorderRadius.circular(16)),
                                  child: Text(s, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: t.primary)),
                                ),
                              )),
                              if (resume.skills.length > 3)
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                                  decoration: BoxDecoration(color: t.bgSecondary, borderRadius: BorderRadius.circular(16), border: Border.all(color: t.border)),
                                  child: Text("+${resume.skills.length - 3}", style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: t.textSecondary)),
                                ),
                            ],
                          ),
                          
                        const SizedBox(height: 24),
                        
                        Row(
                          children: [
                            Expanded(
                              child: GestureDetector(
                                onTap: () => Navigator.pop(context),
                                child: Container(
                                  padding: const EdgeInsets.symmetric(vertical: 14),
                                  decoration: BoxDecoration(color: t.primary, borderRadius: BorderRadius.circular(16)),
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: const [
                                      Icon(FeatherIcons.mic, color: Colors.white, size: 18),
                                      SizedBox(width: 8),
                                      Text("Start Interview", style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white)),
                                    ]
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            GestureDetector(
                              onTap: () => _handleDelete(index),
                              child: Container(
                                padding: const EdgeInsets.all(14),
                                decoration: BoxDecoration(color: t.errorMuted, borderRadius: BorderRadius.circular(16), border: Border.all(color: t.errorMuted)),
                                child: Icon(FeatherIcons.trash2, color: t.error, size: 18),
                              ),
                            )
                          ],
                        )
                      ],
                    ),
                  )
                ],
              ),
            ),
          );
        },
      )
    );
  }
}
