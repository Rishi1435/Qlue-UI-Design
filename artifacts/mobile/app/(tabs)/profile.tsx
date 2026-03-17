import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
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

function Avatar({ name, size = 80 }: { name: string; size?: number }) {
  const theme = useTheme();
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <View style={[styles.avatarRing, { width: size + 8, height: size + 8, borderRadius: (size + 8) / 2, borderColor: "rgba(255,255,255,0.35)" }]}>
      <LinearGradient
        colors={["#2563EB", "#7C3AED"]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={[styles.avatarGradient, { width: size, height: size, borderRadius: size / 2 }]}
      >
        <Text style={[styles.avatarInitials, { fontSize: size * 0.32 }]}>{initials}</Text>
      </LinearGradient>
    </View>
  );
}

function SettingRow({
  icon, label, iconColor, iconBg, right, onPress, destructive,
}: {
  icon: string; label: string; iconColor: string; iconBg: string;
  right?: React.ReactNode; onPress?: () => void; destructive?: boolean;
}) {
  const theme = useTheme();
  return (
    <Pressable
      style={({ pressed }) => [styles.settingRow, { opacity: pressed && !!onPress ? 0.65 : 1 }]}
      onPress={onPress}
    >
      <View style={[styles.settingIconBox, { backgroundColor: iconBg }]}>
        <Feather name={icon as any} size={15} color={iconColor} />
      </View>
      <Text style={[styles.settingLabel, { color: destructive ? theme.error : theme.text }]}>{label}</Text>
      <View style={{ flex: 1 }} />
      {right ?? (onPress && !destructive && <Feather name="chevron-right" size={16} color={theme.textTertiary} />)}
    </Pressable>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.textTertiary }]}>{title}</Text>
      <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        {children}
      </View>
    </View>
  );
}

function Div() {
  const theme = useTheme();
  return <View style={[styles.divider, { backgroundColor: theme.borderSubtle }]} />;
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
  const webTop = Platform.OS === "web" ? 67 : 0;

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
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>
        {/* Hero header */}
        <LinearGradient
          colors={theme.dark ? ["#060C1A", "#0D1B38", "#1A2A4A"] : ["#1A3A6E", "#2563EB", "#1D4ED8"]}
          start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }}
          style={[styles.heroHeader, { paddingTop: insets.top + webTop + 20 }]}
        >
          {/* Edit button */}
          <Pressable
            style={styles.editBtn}
            onPress={() => {
              if (editing) handleSave();
              else { setEditName(user?.name || ""); setEditing(true); }
            }}
          >
            <View style={styles.editBtnInner}>
              <Feather name={editing ? "check" : "edit-2"} size={15} color="rgba(255,255,255,0.9)" />
            </View>
          </Pressable>

          {/* Avatar */}
          <View style={styles.avatarSection}>
            <Avatar name={user?.name || "U"} size={84} />
          </View>

          {/* Name & email */}
          <View style={styles.userInfo}>
            {editing ? (
              <TextInput
                style={styles.nameInput}
                value={editName}
                onChangeText={setEditName}
                autoFocus selectTextOnFocus
                autoCapitalize="words"
              />
            ) : (
              <Text style={styles.userName}>{user?.name || "User"}</Text>
            )}
            <Text style={styles.userEmail}>{user?.email || ""}</Text>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            {stats.map((s, i) => (
              <React.Fragment key={s.label}>
                {i > 0 && <View style={styles.statDivider} />}
                <View style={styles.statItem}>
                  <Text style={styles.statVal}>{s.val}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              </React.Fragment>
            ))}
          </View>
        </LinearGradient>

        {/* Settings */}
        <View style={styles.sections}>
          <Section title="ACCOUNT">
            <SettingRow icon="user" label={user?.name || "Name"} iconColor="#60A5FA" iconBg="rgba(96,165,250,0.15)"
              right={<Text style={[styles.settingVal, { color: theme.textSecondary }]} numberOfLines={1}>{user?.name}</Text>} />
            <Div />
            <SettingRow icon="mail" label="Email" iconColor="#34D399" iconBg="rgba(52,211,153,0.15)"
              right={<Text style={[styles.settingVal, { color: theme.textSecondary }]} numberOfLines={1}>{user?.email}</Text>} />
            <Div />
            <SettingRow icon="lock" label="Change Password" iconColor="#FBBF24" iconBg="rgba(251,191,36,0.15)" onPress={() => {}} />
          </Section>

          <Section title="PREFERENCES">
            <SettingRow icon="bell" label="Push Notifications" iconColor="#A78BFA" iconBg="rgba(167,139,250,0.15)"
              right={<Switch value={notifs} onValueChange={setNotifs} trackColor={{ false: theme.border, true: theme.primary }} thumbColor="#fff" />} />
            <Div />
            <SettingRow icon="mic" label="Voice Assistance" iconColor={theme.primary} iconBg={theme.primaryMuted}
              right={<Switch value={voice} onValueChange={setVoice} trackColor={{ false: theme.border, true: theme.primary }} thumbColor="#fff" />} />
          </Section>

          <Section title="SUPPORT">
            <SettingRow icon="help-circle" label="Help & Support" iconColor="#22D3EE" iconBg="rgba(34,211,238,0.15)" onPress={() => {}} />
            <Div />
            <SettingRow icon="star" label="Rate Qlue" iconColor="#FCD34D" iconBg="rgba(252,211,77,0.15)" onPress={() => {}} />
            <Div />
            <SettingRow icon="info" label="Version 1.0.0" iconColor={theme.textTertiary} iconBg={theme.bgSecondary}
              right={<Text style={[styles.settingVal, { color: theme.textTertiary }]}>Latest</Text>} />
          </Section>

          <Pressable
            style={({ pressed }) => [styles.logoutBtn, { backgroundColor: theme.errorMuted, borderColor: theme.error + "25", opacity: pressed ? 0.75 : 1 }]}
            onPress={handleLogout}
          >
            <Feather name="log-out" size={17} color={theme.error} />
            <Text style={[styles.logoutText, { color: theme.error }]}>Sign Out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  heroHeader: {
    alignItems: "center", paddingHorizontal: 20, paddingBottom: 28,
    borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
    gap: 12,
  },
  editBtn: { alignSelf: "flex-end", marginBottom: 4 },
  editBtnInner: {
    width: 36, height: 36, borderRadius: 11,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center", justifyContent: "center",
  },
  avatarSection: { marginBottom: 4 },
  avatarRing: { borderWidth: 2.5, alignItems: "center", justifyContent: "center" },
  avatarGradient: { alignItems: "center", justifyContent: "center" },
  avatarInitials: { fontFamily: "Inter_700Bold", color: "#fff" },
  userInfo: { alignItems: "center", gap: 5 },
  userName: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: -0.3 },
  nameInput: {
    fontSize: 22, fontFamily: "Inter_700Bold", color: "#fff",
    borderBottomWidth: 1.5, borderBottomColor: "rgba(255,255,255,0.5)",
    paddingBottom: 3, minWidth: 180, textAlign: "center",
  },
  userEmail: { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.6)" },
  statsRow: {
    flexDirection: "row", width: "100%",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 18, padding: 16, marginTop: 4,
  },
  statItem: { flex: 1, alignItems: "center", gap: 3 },
  statVal: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#fff" },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.6)" },
  statDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.15)", marginVertical: 4 },
  sections: { padding: 16, gap: 4 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 0.8, marginBottom: 8, marginLeft: 4 },
  sectionCard: {
    borderRadius: 18, borderWidth: 1, overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 10, elevation: 2,
  },
  settingRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 13, gap: 12 },
  settingIconBox: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  settingLabel: { fontSize: 15, fontFamily: "Inter_500Medium" },
  settingVal: { fontSize: 13, fontFamily: "Inter_400Regular", maxWidth: 160 },
  divider: { height: 1, marginLeft: 62 },
  logoutBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10, height: 52, borderRadius: 16, borderWidth: 1, marginTop: 4,
  },
  logoutText: { fontSize: 15, fontFamily: "Inter_700Bold" },
});
