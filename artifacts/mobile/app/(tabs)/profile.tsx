import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { useInterviews } from "@/context/InterviewContext";
import { useResumes } from "@/context/ResumeContext";
import { useTheme } from "@/hooks/useTheme";
import { GlassCard } from "@/components/GlassCard";

function Avatar({ name, size = 80 }: { name: string; size?: number }) {
  const theme = useTheme();
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <View style={[styles.avatarBox, { width: size, height: size, borderRadius: size / 2, backgroundColor: theme.primaryMuted }]}>
      <Text style={[styles.avatarText, { color: theme.primary, fontSize: size * 0.35 }]}>{initials}</Text>
    </View>
  );
}

function SettingRow({
  icon, label, right, onPress, destructive,
}: {
  icon: string; label: string;
  right?: React.ReactNode; onPress?: () => void; destructive?: boolean;
}) {
  const theme = useTheme();
  return (
    <Pressable
      style={({ pressed }) => [styles.settingRow, { opacity: pressed && !!onPress ? 0.65 : 1 }]}
      onPress={onPress}
    >
      <View style={styles.settingMain}>
        <Feather name={icon as any} size={18} color={destructive ? theme.error : theme.textSecondary} />
        <Text style={[styles.settingLabel, { color: destructive ? theme.error : theme.text }]}>{label}</Text>
      </View>
      {right ?? (onPress && !destructive && <Feather name="chevron-right" size={16} color={theme.textTertiary} />)}
    </Pressable>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>{title}</Text>
      <GlassCard borderRadius={30} padding={0}>
        <View style={styles.sectionContent}>
          {children}
        </View>
      </GlassCard>
    </View>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { user, logout, updateUser } = useAuth();
  const { sessions } = useInterviews();
  const { resumes } = useResumes();
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || "");
  const [notifs, setNotifs] = useState(true);
  const [voice, setVoice] = useState(true);

  const avgScore = sessions.length > 0
    ? Math.round(sessions.reduce((a, s) => a + s.score, 0) / sessions.length) : 0;

  const handleSave = async () => {
    if (!editName.trim()) return;
    await updateUser({ name: editName.trim() });
    setEditing(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); logout(); } },
    ]);
  };

  const stats = [
    { val: sessions.length, label: "Sessions" },
    { val: resumes.length, label: "Resumes" },
    { val: avgScore > 0 ? `${avgScore}%` : "—", label: "Avg Score" },
  ];

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={[styles.header, { paddingTop: 10 }]}>
          <Text style={[styles.headerTitle, { color: theme.primary }]}>Profile</Text>
          <Pressable
            onPress={() => {
              if (editing) handleSave();
              else { setEditName(user?.name || ""); setEditing(true); }
            }}
          >
            <Text style={{ color: theme.primary, fontWeight: '700' }}>{editing ? "Save" : "Edit"}</Text>
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* User info */}
          <View style={styles.userSection}>
            <Avatar name={user?.name || "U"} size={90} />
            <View style={styles.userDetails}>
              {editing ? (
                <TextInput
                  style={[styles.nameInput, { color: theme.text, borderBottomColor: theme.primary }]}
                  value={editName}
                  onChangeText={setEditName}
                  autoFocus
                />
              ) : (
                <Text style={[styles.userName, { color: theme.text }]}>{user?.name || "User"}</Text>
              )}
              <Text style={[styles.userEmail, { color: theme.textSecondary }]}>{user?.email || ""}</Text>
            </View>
          </View>

          {/* Stats card */}
          <GlassCard borderRadius={30} padding={20} margin={{ vertical: 10 }}>
            <View style={styles.statsRow}>
              {stats.map((s, i) => (
                <View key={s.label} style={styles.statItem}>
                  <Text style={[styles.statVal, { color: theme.text }]}>{s.val}</Text>
                  <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{s.label}</Text>
                </View>
              ))}
            </View>
          </GlassCard>

          {/* Sections */}
          <View style={styles.sections}>
            <Section title="Account Settings">
              <SettingRow icon="user" label="Personal Info" onPress={() => {}} />
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
              <SettingRow icon="lock" label="Password & Security" onPress={() => {}} />
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
              <SettingRow icon="bell" label="Notifications"
                right={<Switch value={notifs} onValueChange={setNotifs} trackColor={{ false: theme.border, true: theme.primary }} thumbColor="#fff" />} />
            </Section>

            <Section title="Preferences">
              <SettingRow icon="mic" label="Voice Assistance"
                right={<Switch value={voice} onValueChange={setVoice} trackColor={{ false: theme.border, true: theme.primary }} thumbColor="#fff" />} />
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
              <SettingRow icon="globe" label="Language" right={<Text style={{ color: theme.textSecondary }}>English</Text>} onPress={() => {}} />
            </Section>

            <Section title="Danger Zone">
              <SettingRow icon="log-out" label="Sign Out" destructive onPress={handleLogout} />
            </Section>

            <Text style={[styles.version, { color: theme.textTertiary }]}>Version 1.0.0</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: { fontSize: 26, fontWeight: '700', letterSpacing: -0.5 },
  scroll: { paddingHorizontal: 20, paddingBottom: 100 },
  userSection: { flexDirection: 'row', alignItems: 'center', gap: 20, marginBottom: 20 },
  avatarBox: { alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontWeight: '800' },
  userDetails: { flex: 1, gap: 4 },
  userName: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  nameInput: { fontSize: 22, fontWeight: '800', borderBottomWidth: 1, paddingBottom: 2 },
  userEmail: { fontSize: 14, fontWeight: '500' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statItem: { alignItems: 'center', gap: 4 },
  statVal: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },
  sections: { gap: 24, marginTop: 10 },
  section: { gap: 12 },
  sectionTitle: { fontSize: 13, fontWeight: '700', marginLeft: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionContent: { paddingVertical: 8 },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
  settingMain: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  settingLabel: { fontSize: 15, fontWeight: '600' },
  divider: { height: 1.5, marginLeft: 54, opacity: 0.3 },
  version: { textAlign: 'center', fontSize: 12, fontWeight: '600', marginTop: 20 },
});
