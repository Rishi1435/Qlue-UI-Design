import 'package:flutter/material.dart';
import 'package:feather_icons/feather_icons.dart';
import 'package:provider/provider.dart';
import '../../core/theme.dart';
import '../../core/mock_data.dart';
import '../../context/auth_provider.dart';
import '../../components/input_field.dart';
import '../profile/help_support_screen.dart';
import '../../components/glass_card.dart';

class Avatar extends StatelessWidget {
  final String name;
  final double size;

  const Avatar({super.key, required this.name, this.size = 80});

  @override
  Widget build(BuildContext context) {
    String initials = name.trim().split(' ').map((n) {
      if (n.isNotEmpty) return n[0].toUpperCase();
      return '';
    }).join('');
    if (initials.length > 2) initials = initials.substring(0, 2);
    if (initials.isEmpty) initials = 'U';

    return Container(
      width: size + 8,
      height: size + 8,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        border: Border.all(
          color: Colors.white.withValues(alpha: 0.35),
          width: 2.5,
        ),
      ),
      child: Center(
        child: Container(
          width: size,
          height: size,
          decoration: const BoxDecoration(
            shape: BoxShape.circle,
            gradient: LinearGradient(
              colors: [Color(0xFF2563EB), Color(0xFF7C3AED)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
          child: Center(
            child: Text(
              initials,
              style: TextStyle(
                fontSize: size * 0.32,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class SettingRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color iconColor;
  final Color iconBg;
  final Widget? right;
  final VoidCallback? onPress;
  final bool destructive;

  const SettingRow({
    super.key,
    required this.icon,
    required this.label,
    required this.iconColor,
    required this.iconBg,
    this.right,
    this.onPress,
    this.destructive = false,
  });

  @override
  Widget build(BuildContext context) {
    final t = AppThemeColors.of(context);
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onPress,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 13),
          child: Row(
            children: [
              Container(
                width: 34,
                height: 34,
                decoration: BoxDecoration(
                  color: iconBg,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Center(
                  child: Icon(icon, size: 15, color: iconColor),
                ),
              ),
              const SizedBox(width: 12),
              Text(
                label,
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w500,
                  color: destructive ? t.error : t.text,
                ),
              ),
              const Spacer(),
              if (right != null)
                right!
              else if (onPress != null && !destructive)
                Icon(FeatherIcons.chevronRight, size: 16, color: t.textTertiary),
            ],
          ),
        ),
      ),
    );
  }
}

class ProfileSection extends StatelessWidget {
  final String title;
  final Widget child;

  const ProfileSection({super.key, required this.title, required this.child});

  @override
  Widget build(BuildContext context) {
    final t = AppThemeColors.of(context);
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.only(left: 4.0, bottom: 8.0),
            child: Text(
              title,
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                letterSpacing: 0.8,
                color: t.textTertiary,
              ),
            ),
          ),
          GlassCard(
            borderRadius: 18,
            padding: EdgeInsets.zero,
            child: child,
          ),
        ],
      ),
    );
  }
}

class ProfileDiv extends StatelessWidget {
  const ProfileDiv({super.key});

  @override
  Widget build(BuildContext context) {
    final t = AppThemeColors.of(context);
    return Container(
      height: 1,
      margin: const EdgeInsets.only(left: 62),
      color: t.borderSubtle,
    );
  }
}

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final String userEmail = "jane.doe@example.com";
  String editName = "Jane Doe";
  bool editing = false;
  bool notifs = true;
  bool voice = true;

  final TextEditingController _nameController = TextEditingController();
  final FocusNode _nameFocusNode = FocusNode();

  @override
  void initState() {
    super.initState();
    _nameController.text = editName;
  }

  @override
  void dispose() {
    _nameController.dispose();
    _nameFocusNode.dispose();
    super.dispose();
  }

  void _handleSave() {
    if (_nameController.text.trim().isEmpty) return;
    setState(() {
      editName = _nameController.text.trim();
      editing = false;
    });
  }

  void _handleLogout() {
    final t = AppThemeColors.of(context);
    showDialog(
      context: context,
      builder: (context) => Dialog(
        backgroundColor: Colors.transparent,
        elevation: 0,
        insetPadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
        child: GlassCard(
          borderRadius: 24,
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text("Sign Out", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: t.text)),
              const SizedBox(height: 12),
              Text("Are you sure you want to sign out?", style: TextStyle(color: t.textSecondary)),
              const SizedBox(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  TextButton(
                    child: Text("Cancel", style: TextStyle(color: t.textSecondary)),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                  const SizedBox(width: 8),
                  TextButton(
                    style: TextButton.styleFrom(foregroundColor: t.error),
                    child: const Text("Sign Out"),
                    onPressed: () {
                      Navigator.of(context).pop();
                      Provider.of<AuthProvider>(context, listen: false).logout();
                      if (context.mounted) Navigator.of(context).pushReplacementNamed('/login');
                    },
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showChangePasswordSheet() {
    final t = AppThemeColors.of(context);
    String oldPw = '';
    String newPw = '';
    String confirmPw = '';
    bool saving = false;
    bool showOld = false;
    bool showNew = false;
    String error = '';
    
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (ctx) => StatefulBuilder(
        builder: (BuildContext context, StateSetter setModalState) {
          final bottomInset = MediaQuery.of(context).viewInsets.bottom;
          return Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            child: GlassCard(
              margin: const EdgeInsets.only(bottom: 24),
              padding: EdgeInsets.only(left: 24, right: 24, top: 24, bottom: bottomInset > 0 ? bottomInset + 24 : 32),
              borderRadius: 32,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Center(child: Container(width: 40, height: 4, decoration: BoxDecoration(color: t.border, borderRadius: BorderRadius.circular(2)))),
                const SizedBox(height: 24),
                Text('Change Password', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: t.text, letterSpacing: -0.5)),
                const SizedBox(height: 20),
                if (error.isNotEmpty) ...[
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(color: t.errorMuted, borderRadius: BorderRadius.circular(10)),
                    child: Row(children: [
                      Icon(FeatherIcons.alertCircle, size: 14, color: t.error),
                      const SizedBox(width: 8),
                      Expanded(child: Text(error, style: TextStyle(fontSize: 13, color: t.error))),
                    ]),
                  ),
                  const SizedBox(height: 16),
                ],
                InputField(
                  icon: FeatherIcons.lock, label: 'Current Password', placeholder: '••••••••', value: oldPw,
                  onChangeText: (v) => setModalState(() => oldPw = v), secure: !showOld,
                  right: GestureDetector(
                    onTap: () => setModalState(() => showOld = !showOld),
                    behavior: HitTestBehavior.opaque,
                    child: Padding(padding: const EdgeInsets.all(14.0), child: Icon(showOld ? FeatherIcons.eyeOff : FeatherIcons.eye, size: 17, color: t.iconDefault)),
                  ),
                ),
                const SizedBox(height: 14),
                InputField(
                  icon: FeatherIcons.shield, label: 'New Password', placeholder: 'Min. 8 characters', value: newPw,
                  onChangeText: (v) => setModalState(() => newPw = v), secure: !showNew,
                  right: GestureDetector(
                    onTap: () => setModalState(() => showNew = !showNew),
                    behavior: HitTestBehavior.opaque,
                    child: Padding(padding: const EdgeInsets.all(14.0), child: Icon(showNew ? FeatherIcons.eyeOff : FeatherIcons.eye, size: 17, color: t.iconDefault)),
                  ),
                ),
                const SizedBox(height: 14),
                InputField(
                  icon: FeatherIcons.checkCircle, label: 'Confirm New Password', placeholder: 'Re-enter new password', value: confirmPw,
                  onChangeText: (v) => setModalState(() => confirmPw = v), secure: !showNew,
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: saving ? null : () async {
                    if (oldPw.isEmpty || newPw.isEmpty || confirmPw.isEmpty) { setModalState(() => error = "Please fill in all fields"); return; }
                    if (newPw != confirmPw) { setModalState(() => error = "New passwords do not match"); return; }
                    if (newPw.length < 8) { setModalState(() => error = "Password must be at least 8 characters"); return; }
                    
                    setModalState(() { error = ''; saving = true; });
                    await Future.delayed(const Duration(milliseconds: 800)); // Mock network delay
                    if (ctx.mounted) {
                      Navigator.of(ctx).pop();
                      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: const Text('Password updated successfully!'), backgroundColor: t.success));
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF2563EB), foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    elevation: 0,
                  ),
                  child: saving
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : const Text('Save Password', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                ),
              ],
            ),
            ),
          );
        },
      ),
    );
  }

  void _showRatingDialog() {
    final t = AppThemeColors.of(context);
    int rating = 0;
    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDialogState) {
          return Dialog(
            backgroundColor: Colors.transparent,
            elevation: 0,
            insetPadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
            child: GlassCard(
              borderRadius: 24,
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                Container(
                  width: 64, height: 64, margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(color: const Color(0xFFFCD34D).withOpacity(0.15), shape: BoxShape.circle),
                  child: const Center(child: Icon(FeatherIcons.star, size: 32, color: Color(0xFFF59E0B))),
                ),
                Text("Rate your experience", style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: t.text, letterSpacing: -0.5)),
                const SizedBox(height: 8),
                Text("How are you liking Qlue so far?", textAlign: TextAlign.center, style: TextStyle(fontSize: 14, color: t.textSecondary, height: 1.5)),
                const SizedBox(height: 24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: List.generate(5, (index) {
                    return GestureDetector(
                      onTap: () => setDialogState(() => rating = index + 1),
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 4.0),
                        child: Icon(
                          index < rating ? Icons.star_rounded : Icons.star_border_rounded,
                          size: 40,
                          color: index < rating ? const Color(0xFFF59E0B) : t.border,
                        ),
                      ),
                    );
                  }),
                ),
                const SizedBox(height: 24),
                TextField(
                  onChanged: (v) {},
                  maxLines: 3,
                  style: TextStyle(fontSize: 14, color: t.text),
                  decoration: InputDecoration(
                    hintText: "Tell us what you think (optional)",
                    hintStyle: TextStyle(fontSize: 14, color: t.textTertiary),
                    filled: true,
                    fillColor: t.bgSecondary,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                    contentPadding: const EdgeInsets.all(16),
                  ),
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: rating > 0 ? () async {
                      Navigator.of(ctx).pop();
                      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: const Text('Thank you for your feedback!'), backgroundColor: t.success));
                    } : null,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF2563EB), foregroundColor: Colors.white,
                      disabledBackgroundColor: t.border, disabledForegroundColor: t.textTertiary,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      elevation: 0,
                    ),
                    child: const Text('Submit', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  ),
                ),
                const SizedBox(height: 8),
                SizedBox(
                  width: double.infinity,
                  child: TextButton(
                    onPressed: () => Navigator.of(ctx).pop(),
                    style: TextButton.styleFrom(foregroundColor: t.textSecondary),
                    child: const Text('Not right now'),
                  ),
                ),
              ],
            ),
            ),
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final t = AppThemeColors.of(context);
    final themeNotifier = Provider.of<ThemeNotifier>(context);
    final topPadding = MediaQuery.of(context).padding.top;
    final bottomPadding = MediaQuery.of(context).padding.bottom;

    final sessionsCount = mockSessions.length;
    final resumesCount = 2;
    final avgScore = sessionsCount > 0
        ? (mockSessions.fold(0, (sum, s) => sum + s.score) / sessionsCount).round()
        : 0;

    final stats = [
      {"val": sessionsCount.toString(), "label": "Sessions"},
      {"val": resumesCount.toString(), "label": "Resumes"},
      {"val": avgScore > 0 ? "$avgScore%" : "—", "label": "Avg Score"},
    ];

    return Scaffold(
      backgroundColor: t.bg,
      body: SingleChildScrollView(
        padding: EdgeInsets.only(bottom: bottomPadding + 100),
        child: Column(
          children: [
            // Hero Header
            GlassCard(
              margin: EdgeInsets.only(left: 16, right: 16, top: topPadding > 0 ? topPadding : 16, bottom: 20),
              padding: const EdgeInsets.only(top: 24, bottom: 28, left: 20, right: 20),
              borderRadius: 32,
              child: Column(
                children: [
                  Align(
                    alignment: Alignment.centerRight,
                    child: Padding(
                      padding: const EdgeInsets.only(bottom: 4.0),
                      child: GestureDetector(
                        onTap: () {
                          if (editing) {
                            _handleSave();
                          } else {
                            setState(() {
                              _nameController.text = editName;
                              editing = true;
                            });
                            _nameFocusNode.requestFocus();
                          }
                        },
                        child: Container(
                          width: 36,
                          height: 36,
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(11),
                          ),
                          child: Center(
                            child: Icon(
                              editing ? FeatherIcons.check : FeatherIcons.edit2,
                              size: 15,
                              color: Colors.white.withValues(alpha: 0.9),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.only(bottom: 4.0),
                    child: Avatar(name: editName, size: 84),
                  ),
                  Column(
                    children: [
                      editing
                          ? IntrinsicWidth(
                              child: TextField(
                                controller: _nameController,
                                focusNode: _nameFocusNode,
                                textCapitalization: TextCapitalization.words,
                                textAlign: TextAlign.center,
                                style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white),
                                decoration: InputDecoration(
                                  isDense: true,
                                  contentPadding: const EdgeInsets.only(bottom: 3),
                                  enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.5), width: 1.5)),
                                  focusedBorder: const UnderlineInputBorder(borderSide: BorderSide(color: Colors.white, width: 2.0)),
                                ),
                              ),
                            )
                          : Text(
                              editName,
                              style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white, letterSpacing: -0.3),
                            ),
                      const SizedBox(height: 5),
                      Text(userEmail, style: TextStyle(fontSize: 14, color: Colors.white.withValues(alpha: 0.6))),
                    ],
                  ),
                  Container(
                    margin: const EdgeInsets.only(top: 14),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(18),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: stats.asMap().entries.map((entry) {
                        int index = entry.key;
                        var stat = entry.value;
                        return Row(
                          children: [
                            if (index > 0)
                              Container(width: 1, height: 30, margin: const EdgeInsets.symmetric(horizontal: 16), color: Colors.white.withValues(alpha: 0.15)),
                            Column(
                              children: [
                                Text(stat["val"]!, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white)),
                                const SizedBox(height: 3),
                                Text(stat["label"]!, style: TextStyle(fontSize: 11, color: Colors.white.withValues(alpha: 0.6))),
                              ],
                            ),
                          ],
                        );
                      }).toList(),
                    ),
                  ),
                ],
              ),
            ),

            // Settings
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  ProfileSection(
                    title: "ACCOUNT",
                    child: Column(
                      children: [
                        SettingRow(
                          icon: FeatherIcons.user,
                          label: editName.isEmpty ? "Name" : editName,
                          iconColor: const Color(0xFF60A5FA),
                          iconBg: const Color(0xFF60A5FA).withValues(alpha: 0.15),
                          right: Text(editName, maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(fontSize: 13, color: t.textSecondary)),
                        ),
                        const ProfileDiv(),
                        SettingRow(
                          icon: FeatherIcons.mail,
                          label: "Email",
                          iconColor: const Color(0xFF34D399),
                          iconBg: const Color(0xFF34D399).withValues(alpha: 0.15),
                          right: Text(userEmail, maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(fontSize: 13, color: t.textSecondary)),
                        ),
                        const ProfileDiv(),
                        SettingRow(
                          icon: FeatherIcons.lock,
                          label: "Change Password",
                          iconColor: const Color(0xFFFBBF24),
                          iconBg: const Color(0xFFFBBF24).withValues(alpha: 0.15),
                          onPress: _showChangePasswordSheet,
                        ),
                      ],
                    ),
                  ),

                  // ──── PREFERENCES (with dark mode toggle) ────
                  ProfileSection(
                    title: "PREFERENCES",
                    child: Column(
                      children: [
                        SettingRow(
                          icon: t.isDark ? FeatherIcons.moon : FeatherIcons.sun,
                          label: "Dark Mode",
                          iconColor: t.isDark ? const Color(0xFF818CF8) : const Color(0xFFF59E0B),
                          iconBg: t.isDark
                              ? const Color(0xFF818CF8).withValues(alpha: 0.15)
                              : const Color(0xFFF59E0B).withValues(alpha: 0.15),
                          right: Switch(
                            value: themeNotifier.isDark,
                            onChanged: (_) => themeNotifier.toggle(),
                            activeColor: Colors.white,
                            activeTrackColor: t.primary,
                            inactiveTrackColor: t.border,
                          ),
                        ),
                        const ProfileDiv(),
                        SettingRow(
                          icon: FeatherIcons.bell,
                          label: "Push Notifications",
                          iconColor: const Color(0xFFA78BFA),
                          iconBg: const Color(0xFFA78BFA).withValues(alpha: 0.15),
                          right: Switch(
                            value: notifs,
                            onChanged: (val) => setState(() => notifs = val),
                            activeColor: Colors.white,
                            activeTrackColor: t.primary,
                            inactiveTrackColor: t.border,
                          ),
                        ),
                        const ProfileDiv(),
                        SettingRow(
                          icon: FeatherIcons.mic,
                          label: "Voice Assistance",
                          iconColor: t.primary,
                          iconBg: t.primaryMuted,
                          right: Switch(
                            value: voice,
                            onChanged: (val) => setState(() => voice = val),
                            activeColor: Colors.white,
                            activeTrackColor: t.primary,
                            inactiveTrackColor: t.border,
                          ),
                        ),
                      ],
                    ),
                  ),

                  ProfileSection(
                    title: "SUPPORT",
                    child: Column(
                      children: [
                        SettingRow(
                          icon: FeatherIcons.helpCircle,
                          label: "Help & Support",
                          iconColor: const Color(0xFF22D3EE),
                          iconBg: const Color(0xFF22D3EE).withValues(alpha: 0.15),
                          onPress: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const HelpSupportScreen())),
                        ),
                        const ProfileDiv(),
                        SettingRow(
                          icon: FeatherIcons.star,
                          label: "Rate Qlue",
                          iconColor: const Color(0xFFFCD34D),
                          iconBg: const Color(0xFFFCD34D).withValues(alpha: 0.15),
                          onPress: _showRatingDialog,
                        ),
                        const ProfileDiv(),
                        SettingRow(
                          icon: FeatherIcons.info,
                          label: "Version 1.0.0",
                          iconColor: t.textTertiary,
                          iconBg: t.bgSecondary,
                          right: Text("Latest", style: TextStyle(fontSize: 13, color: t.textTertiary)),
                        ),
                      ],
                    ),
                  ),

                  // Logout
                  Padding(
                    padding: const EdgeInsets.only(top: 4.0),
                    child: GlassCard(
                      tintColor: t.error,
                      padding: EdgeInsets.zero,
                      borderRadius: 16,
                      child: Material(
                        color: Colors.transparent,
                        child: InkWell(
                          onTap: _handleLogout,
                          borderRadius: BorderRadius.circular(16),
                          child: Container(
                            height: 52,
                            alignment: Alignment.center,
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(FeatherIcons.logOut, size: 17, color: t.error),
                                const SizedBox(width: 10),
                                Text("Sign Out", style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: t.error)),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ),
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
