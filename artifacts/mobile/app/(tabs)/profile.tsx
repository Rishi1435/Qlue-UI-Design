import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
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

import { Colors } from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";

function SettingRow({
  icon,
  label,
  value,
  onPress,
  isToggle,
  toggleValue,
  onToggle,
  destructive,
}: {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  isToggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (v: boolean) => void;
  destructive?: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.settingRow, { opacity: pressed && !isToggle ? 0.7 : 1 }]}
      onPress={onPress}
      disabled={isToggle}
    >
      <View style={[styles.settingIcon, { backgroundColor: destructive ? "#FEE5E5" : Colors.primary[50] }]}>
        <Feather name={icon as any} size={16} color={destructive ? Colors.semantic.error : Colors.primary[500]} />
      </View>
      <Text style={[styles.settingLabel, destructive && { color: Colors.semantic.error }]}>{label}</Text>
      <View style={{ flex: 1 }} />
      {isToggle ? (
        <Switch
          value={!!toggleValue}
          onValueChange={onToggle}
          trackColor={{ false: Colors.neutral[200], true: Colors.primary[500] }}
          thumbColor={Colors.white}
        />
      ) : value ? (
        <Text style={styles.settingValue}>{value}</Text>
      ) : (
        <Feather name="chevron-right" size={16} color={Colors.neutral[300]} />
      )}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || "");
  const [notifications, setNotifications] = useState(true);
  const [voiceAssist, setVoiceAssist] = useState(true);
  const webTopPadding = Platform.OS === "web" ? 67 : 0;

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
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          logout();
        },
      },
    ]);
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + 100 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.headerBg, { paddingTop: insets.top + webTopPadding + 16 }]}>
        <Pressable
          style={styles.editBtn}
          onPress={() => {
            if (isEditing) handleSave();
            else {
              setEditName(user?.name || "");
              setIsEditing(true);
            }
          }}
        >
          <Feather name={isEditing ? "check" : "edit-2"} size={16} color={Colors.white} />
        </Pressable>

        <View style={styles.avatarWrap}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>

        {isEditing ? (
          <TextInput
            style={styles.nameInput}
            value={editName}
            onChangeText={setEditName}
            autoFocus
            selectTextOnFocus
          />
        ) : (
          <Text style={styles.userName}>{user?.name || "User"}</Text>
        )}
        <Text style={styles.userEmail}>{user?.email || ""}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <View style={styles.card}>
          <SettingRow icon="user" label="Full Name" value={user?.name} />
          <View style={styles.divider} />
          <SettingRow icon="mail" label="Email" value={user?.email} />
          <View style={styles.divider} />
          <SettingRow icon="phone" label="Phone" value="Not set" onPress={() => {}} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.card}>
          <SettingRow
            icon="bell"
            label="Notifications"
            isToggle
            toggleValue={notifications}
            onToggle={setNotifications}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="mic"
            label="Voice Assistance"
            isToggle
            toggleValue={voiceAssist}
            onToggle={setVoiceAssist}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.card}>
          <SettingRow icon="lock" label="Change Password" onPress={() => {}} />
          <View style={styles.divider} />
          <SettingRow icon="help-circle" label="Help & Support" onPress={() => {}} />
          <View style={styles.divider} />
          <SettingRow icon="info" label="About Qlue" value="v1.0.0" />
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [styles.logoutBtn, { opacity: pressed ? 0.85 : 1 }]}
        onPress={handleLogout}
      >
        <Feather name="log-out" size={18} color={Colors.semantic.error} />
        <Text style={styles.logoutText}>Sign Out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.neutral[50] },
  content: { gap: 0 },
  headerBg: {
    backgroundColor: Colors.primary[600],
    paddingHorizontal: 20,
    paddingBottom: 32,
    alignItems: "center",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  editBtn: {
    position: "absolute", right: 20, top: 16,
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center", justifyContent: "center",
    zIndex: 1,
  },
  avatarWrap: {
    width: 84, height: 84, borderRadius: 42,
    backgroundColor: Colors.white,
    alignItems: "center", justifyContent: "center",
    marginBottom: 12,
    shadowColor: Colors.primary[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  avatarText: { fontSize: 28, fontFamily: "Inter_700Bold", color: Colors.primary[600] },
  userName: { fontSize: 20, fontFamily: "Inter_700Bold", color: Colors.white },
  nameInput: {
    fontSize: 20, fontFamily: "Inter_700Bold", color: Colors.white,
    borderBottomWidth: 1.5, borderBottomColor: "rgba(255,255,255,0.5)",
    paddingBottom: 4, minWidth: 160, textAlign: "center",
  },
  userEmail: {
    fontSize: 13, fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.75)", marginTop: 4,
  },
  section: { paddingHorizontal: 16, paddingTop: 24 },
  sectionTitle: {
    fontSize: 12, fontFamily: "Inter_600SemiBold",
    color: Colors.neutral[500], textTransform: "uppercase",
    letterSpacing: 0.8, marginBottom: 8,
  },
  card: {
    backgroundColor: Colors.white, borderRadius: 16,
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  settingRow: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 13, gap: 12,
  },
  settingIcon: {
    width: 32, height: 32, borderRadius: 8,
    alignItems: "center", justifyContent: "center",
  },
  settingLabel: {
    fontSize: 15, fontFamily: "Inter_500Medium", color: Colors.neutral[800],
  },
  settingValue: {
    fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.neutral[400],
  },
  divider: { height: 1, backgroundColor: Colors.neutral[100], marginLeft: 60 },
  logoutBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10, marginHorizontal: 16, marginTop: 24,
    backgroundColor: Colors.white, borderRadius: 14,
    paddingVertical: 15,
    borderWidth: 1.5, borderColor: "#FEE5E5",
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  logoutText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: Colors.semantic.error },
});
