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

function SettingItem({
  icon, label, iconColor, iconBg, right, onPress, destructive,
}: {
  icon: string; label: string; iconColor: string; iconBg: string;
  right?: React.ReactNode; onPress?: () => void; destructive?: boolean;
}) {
  const theme = useTheme();
  return (
    <Pressable
      style={({ pressed }) => [styles.settingItem, { opacity: pressed && !!onPress ? 0.7 : 1 }]}
      onPress={onPress}
      disabled={!onPress && !right}
    >
      <View style={[styles.settingIconBox, { backgroundColor: iconBg }]}>
        <Feather name={icon as any} size={15} color={iconColor} />
      </View>
      <Text style={[styles.settingLabel, { color: destructive ? theme.error : theme.text }]}>{label}</Text>
      <View style={{ flex: 1 }} />
      {right ?? (onPress && <Feather name="chevron-right" size={16} color={theme.textTertiary} />)}
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

function Divider() {
  const theme = useTheme();
  return <View style={[styles.divider, { backgroundColor: theme.border }]} />;
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { user, logout, updateUser } = useAuth();
  const { sessions } = useInterviews();
  const { resumes } = useResumes();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || "");
  const [notifications, setNotifications] = useState(true);
  const [voiceAssist, setVoiceAssist] = useState(true);
  const webTop = Platform.OS === "web" ? 67 : 0;

  const handleSave = async () => {
    if (!editName.trim()) return;
    await updateUser({ name: editName.trim() });
    setIsEditing(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out", style: "destructive",
        onPress: () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); logout(); },
      },
    ]);
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const avgScore = sessions.length > 0
    ? Math.round(sessions.reduce((a, s) => a + s.score, 0) / sessions.length)
    : 0;

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: theme.bg }]}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <LinearGradient
        colors={theme.dark ? ["#0D1B38", "#142444"] : ["#1A73C7", "#0D5AA8"]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={[styles.profileHeader, { paddingTop: insets.top + webTop + 16 }]}
      >
        <Pressable
          style={styles.editHeaderBtn}
          onPress={() => {
            if (isEditing) handleSave();
            else { setEditName(user?.name || ""); setIsEditing(true); }
          }}
        >
          <Feather name={isEditing ? "check" : "edit-2"} size={16} color="rgba(255,255,255,0.9)" />
        </Pressable>

        <View style={styles.avatarContainer}>
          <View style={styles.avatarBorder}>
            <View style={styles.avatarCircle}>
              <Text style={[styles.avatarText, { color: theme.primary }]}>{initials}</Text>
            </View>
          </View>
        </View>

        {isEditing ? (
          <TextInput
            style={styles.nameInput}
            value={editName}
            onChangeText={setEditName}
            autoFocus selectTextOnFocus
            autoCapitalize="words"
          />
        ) : (
          <Text style={styles.profileName}>{user?.name || "User"}</Text>
        )}
        <Text style={styles.profileEmail}>{user?.email || ""}</Text>

        {/* Quick stats */}
        <View style={styles.profileStats}>
          {[
            { val: sessions.length, label: "Sessions" },
            { val: resumes.length, label: "Resumes" },
            { val: avgScore > 0 ? `${avgScore}%` : "--", label: "Avg Score" },
          ].map((s, i) => (
            <React.Fragment key={s.label}>
              {i > 0 && <View style={styles.profileStatDivider} />}
              <View style={styles.profileStat}>
                <Text style={styles.profileStatVal}>{s.val}</Text>
                <Text style={styles.profileStatLabel}>{s.label}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>
      </LinearGradient>

      {/* Settings */}
      <View style={styles.sections}>
        <Section title="ACCOUNT">
          <SettingItem
            icon="user" label="Full Name"
            iconColor="#60A5FA" iconBg="rgba(96,165,250,0.15)"
            right={<Text style={[styles.settingValue, { color: theme.textSecondary }]}>{user?.name}</Text>}
          />
          <Divider />
          <SettingItem
            icon="mail" label="Email Address"
            iconColor="#34D399" iconBg="rgba(52,211,153,0.15)"
            right={<Text style={[styles.settingValue, { color: theme.textSecondary }]} numberOfLines={1}>{user?.email}</Text>}
          />
          <Divider />
          <SettingItem
            icon="lock" label="Change Password"
            iconColor="#FBBF24" iconBg="rgba(251,191,36,0.15)"
            onPress={() => {}}
          />
        </Section>

        <Section title="PREFERENCES">
          <SettingItem
            icon="bell" label="Notifications"
            iconColor="#A78BFA" iconBg="rgba(167,139,250,0.15)"
            right={
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor="#fff"
              />
            }
          />
          <Divider />
          <SettingItem
            icon="mic" label="Voice Assistance"
            iconColor={theme.primary} iconBg={theme.primaryMuted}
            right={
              <Switch
                value={voiceAssist}
                onValueChange={setVoiceAssist}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor="#fff"
              />
            }
          />
        </Section>

        <Section title="ABOUT">
          <SettingItem
            icon="help-circle" label="Help & Support"
            iconColor="#22D3EE" iconBg="rgba(34,211,238,0.15)"
            onPress={() => {}}
          />
          <Divider />
          <SettingItem
            icon="star" label="Rate Qlue"
            iconColor="#FCD34D" iconBg="rgba(252,211,77,0.15)"
            onPress={() => {}}
          />
          <Divider />
          <SettingItem
            icon="info" label="App Version"
            iconColor={theme.textTertiary} iconBg={theme.bgSecondary}
            right={<Text style={[styles.settingValue, { color: theme.textTertiary }]}>1.0.0</Text>}
          />
        </Section>

        <Pressable
          style={({ pressed }) => [styles.signOutBtn, { backgroundColor: theme.errorMuted, borderColor: theme.error + "25", opacity: pressed ? 0.8 : 1 }]}
          onPress={handleLogout}
        >
          <Feather name="log-out" size={17} color={theme.error} />
          <Text style={[styles.signOutText, { color: theme.error }]}>Sign Out</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { gap: 0 },
  profileHeader: {
    paddingHorizontal: 20, paddingBottom: 24,
    alignItems: "center",
    borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
    gap: 6,
  },
  editHeaderBtn: {
    position: "absolute", right: 20, top: 20,
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center", justifyContent: "center",
    zIndex: 1,
  },
  avatarContainer: { marginBottom: 4, marginTop: 12 },
  avatarBorder: {
    width: 90, height: 90, borderRadius: 45,
    borderWidth: 3, borderColor: "rgba(255,255,255,0.4)",
    alignItems: "center", justifyContent: "center",
  },
  avatarCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: "#fff",
    alignItems: "center", justifyContent: "center",
  },
  avatarText: { fontSize: 26, fontFamily: "Inter_700Bold" },
  profileName: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#fff" },
  nameInput: {
    fontSize: 20, fontFamily: "Inter_700Bold", color: "#fff",
    borderBottomWidth: 1.5, borderBottomColor: "rgba(255,255,255,0.5)",
    paddingBottom: 3, minWidth: 160, textAlign: "center",
  },
  profileEmail: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.7)" },
  profileStats: {
    flexDirection: "row", marginTop: 16,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 16, padding: 16, width: "100%",
  },
  profileStat: { flex: 1, alignItems: "center", gap: 3 },
  profileStatVal: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#fff" },
  profileStatLabel: { fontSize: 11, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.65)" },
  profileStatDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.2)", marginVertical: 4 },
  sections: { padding: 16, gap: 0 },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 11, fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.8, marginBottom: 8, paddingLeft: 4,
  },
  sectionCard: {
    borderRadius: 18, borderWidth: 1, overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  settingItem: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 13, gap: 13,
  },
  settingIconBox: {
    width: 34, height: 34, borderRadius: 9,
    alignItems: "center", justifyContent: "center",
  },
  settingLabel: { fontSize: 15, fontFamily: "Inter_500Medium" },
  settingValue: { fontSize: 13, fontFamily: "Inter_400Regular", maxWidth: 160 },
  divider: { height: 1, marginLeft: 63 },
  signOutBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10, height: 52, borderRadius: 16, borderWidth: 1,
    marginBottom: 8,
  },
  signOutText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
