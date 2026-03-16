import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Resume, ResumeStatus, useResumes } from "@/context/ResumeContext";
import { useTheme } from "@/hooks/useTheme";

const STATUS_CONFIG: Record<ResumeStatus, { label: string; icon: string }> = {
  parsed:  { label: "Parsed",    icon: "check-circle" },
  parsing: { label: "Parsing",   icon: "loader" },
  failed:  { label: "Failed",    icon: "x-circle" },
  pending: { label: "Pending",   icon: "clock" },
};

function ResumeCard({ resume, onDelete }: { resume: Resume; onDelete: () => void }) {
  const theme = useTheme();
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const cfg = STATUS_CONFIG[resume.status];

  const statusColor = {
    parsed: theme.success,
    parsing: theme.warning,
    failed: theme.error,
    pending: theme.primary,
  }[resume.status];

  const statusBg = {
    parsed: theme.successMuted,
    parsing: theme.warningMuted,
    failed: theme.errorMuted,
    pending: theme.primaryMuted,
  }[resume.status];

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPressIn={() => { scale.value = withSpring(0.97, { damping: 20 }); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 20 }); }}
        onPress={() => router.push({ pathname: "/resume/[id]", params: { id: resume.id } })}
        style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
      >
        {/* Top Row */}
        <View style={styles.cardTop}>
          <View style={[styles.fileIcon, { backgroundColor: theme.moduleResumeLight }]}>
            <Feather name="file-text" size={20} color={theme.moduleResume} />
          </View>
          <View style={styles.fileInfo}>
            <Text style={[styles.fileName, { color: theme.text }]} numberOfLines={1}>{resume.filename}</Text>
            <Text style={[styles.fileDate, { color: theme.textTertiary }]}>Uploaded {resume.uploadDate}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
            {resume.status === "parsing"
              ? <ActivityIndicator size="small" color={statusColor} style={{ marginRight: 4 }} />
              : <Feather name={cfg.icon as any} size={12} color={statusColor} style={{ marginRight: 4 }} />}
            <Text style={[styles.statusText, { color: statusColor }]}>{cfg.label}</Text>
          </View>
        </View>

        {/* Meta */}
        <View style={styles.metaRow}>
          <View style={[styles.metaChip, { backgroundColor: theme.bgSecondary }]}>
            <Feather name="hard-drive" size={10} color={theme.textTertiary} />
            <Text style={[styles.metaText, { color: theme.textTertiary }]}>{resume.fileSize}</Text>
          </View>
          <View style={[styles.metaChip, { backgroundColor: theme.bgSecondary }]}>
            <Feather name="file" size={10} color={theme.textTertiary} />
            <Text style={[styles.metaText, { color: theme.textTertiary }]}>{resume.format.toUpperCase()}</Text>
          </View>
          {resume.skills.length > 0 && (
            <View style={[styles.metaChip, { backgroundColor: theme.moduleResumeLight }]}>
              <Feather name="tag" size={10} color={theme.moduleResume} />
              <Text style={[styles.metaText, { color: theme.moduleResume }]}>{resume.skills.length} skills</Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {resume.status === "parsed" && (
            <Pressable
              style={({ pressed }) => [styles.startBtn, { backgroundColor: theme.moduleResume, opacity: pressed ? 0.85 : 1 }]}
              onPress={(e) => {
                e.stopPropagation();
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push("/interview/session");
              }}
            >
              <Feather name="mic" size={14} color="#fff" />
              <Text style={styles.startBtnText}>Start Interview</Text>
            </Pressable>
          )}
          <Pressable
            style={({ pressed }) => [styles.deleteBtn, { backgroundColor: theme.errorMuted, opacity: pressed ? 0.8 : 1 }]}
            onPress={(e) => { e.stopPropagation(); onDelete(); }}
          >
            <Feather name="trash-2" size={15} color={theme.error} />
          </Pressable>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const SAMPLE_FILES = ["software_engineer", "product_manager", "data_analyst", "frontend_developer", "ux_designer"];

export default function ResumeScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { resumes, addResume, deleteResume } = useResumes();
  const [uploading, setUploading] = useState(false);
  const webTop = Platform.OS === "web" ? 67 : 0;

  const handleUpload = async () => {
    setUploading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const name = SAMPLE_FILES[Math.floor(Math.random() * SAMPLE_FILES.length)];
    const fmt = Math.random() > 0.5 ? "pdf" : "docx" as "pdf" | "docx";
    addResume(`${name}.${fmt}`, fmt);
    setUploading(false);
  };

  const confirmDelete = (id: string, name: string) => {
    Alert.alert("Delete Resume", `Remove "${name}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteResume(id) },
    ]);
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { paddingTop: insets.top + webTop + 16, backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: theme.text }]}>My Resumes</Text>
          <Text style={[styles.headerSub, { color: theme.textSecondary }]}>
            {resumes.length === 0 ? "Upload your first resume" : `${resumes.length} file${resumes.length > 1 ? "s" : ""} uploaded`}
          </Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.uploadBtn, { backgroundColor: theme.moduleResume, opacity: pressed ? 0.85 : 1 }, uploading && { backgroundColor: theme.border }]}
          onPress={handleUpload}
          disabled={uploading}
        >
          {uploading
            ? <ActivityIndicator color="#fff" size="small" />
            : <>
              <Feather name="upload" size={15} color="#fff" />
              <Text style={styles.uploadBtnText}>Upload</Text>
            </>}
        </Pressable>
      </View>

      <FlatList
        data={resumes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ResumeCard resume={item} onDelete={() => confirmDelete(item.id, item.filename)} />
        )}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
        scrollEnabled={!!resumes.length}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={[styles.emptyIcon, { backgroundColor: theme.moduleResumeLight }]}>
              <Feather name="file-plus" size={36} color={theme.moduleResume} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No resumes yet</Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Upload your resume to enable resume-based interview practice
            </Text>
            <Pressable
              style={({ pressed }) => [styles.emptyBtn, { backgroundColor: theme.moduleResume, opacity: pressed ? 0.85 : 1 }]}
              onPress={handleUpload}
            >
              <Feather name="upload" size={16} color="#fff" />
              <Text style={styles.emptyBtnText}>Upload Resume</Text>
            </Pressable>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 16, paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 26, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  headerSub: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  uploadBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12,
  },
  uploadBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#fff" },
  list: { padding: 14, gap: 12 },
  card: {
    borderRadius: 18, padding: 16, borderWidth: 1, gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 10, elevation: 2,
  },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  fileIcon: { width: 46, height: 46, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  fileInfo: { flex: 1 },
  fileName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  fileDate: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  statusBadge: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
  },
  statusText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  metaRow: { flexDirection: "row", gap: 6 },
  metaChip: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
  },
  metaText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  actions: { flexDirection: "row", gap: 8 },
  startBtn: {
    flex: 1, flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 6,
    height: 38, borderRadius: 10,
  },
  startBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#fff" },
  deleteBtn: {
    width: 38, height: 38, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },
  empty: { paddingTop: 80, alignItems: "center", gap: 12, paddingHorizontal: 32 },
  emptyIcon: { width: 88, height: 88, borderRadius: 26, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },
  emptyBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 24, paddingVertical: 13, borderRadius: 13, marginTop: 8,
  },
  emptyBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#fff" },
});
