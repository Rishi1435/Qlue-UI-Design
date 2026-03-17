import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
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

const FILE_NAMES = ["software_engineer", "product_manager", "data_analyst", "frontend_dev", "ux_designer"];

function ResumeCard({ resume, onDelete }: { resume: Resume; onDelete: () => void }) {
  const theme = useTheme();
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const isParsed = resume.status === "parsed";
  const isParsing = resume.status === "parsing";
  const isFailed = resume.status === "failed";

  const headerColor = resume.format === "pdf" ? "#EF4444" : "#3B82F6";

  return (
    <Animated.View style={[anim, styles.cardOuter]}>
      <Pressable
        onPressIn={() => { scale.value = withSpring(0.97, { damping: 20 }); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 20 }); }}
        onPress={() => router.push({ pathname: "/resume/[id]", params: { id: resume.id } })}
        style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
      >
        {/* Header strip */}
        <LinearGradient
          colors={[headerColor, headerColor + "BB"]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={styles.cardHeader}
        >
          <View style={styles.cardHeaderLeft}>
            <Feather name="file-text" size={18} color="rgba(255,255,255,0.9)" />
            <View style={styles.cardHeaderLabels}>
              <Text style={styles.cardFormat}>{resume.format.toUpperCase()}</Text>
              <Text style={styles.cardSize}>{resume.fileSize}</Text>
            </View>
          </View>
          {/* Status badge */}
          {isParsed && (
            <View style={styles.statusBadge}>
              <Feather name="check-circle" size={12} color="#fff" />
              <Text style={styles.statusBadgeText}>Ready</Text>
            </View>
          )}
          {isParsing && (
            <View style={[styles.statusBadge, { backgroundColor: "rgba(245,158,11,0.25)" }]}>
              <ActivityIndicator size="small" color="#fff" style={{ transform: [{ scale: 0.65 }] }} />
              <Text style={styles.statusBadgeText}>Parsing</Text>
            </View>
          )}
          {isFailed && (
            <View style={[styles.statusBadge, { backgroundColor: "rgba(239,68,68,0.25)" }]}>
              <Feather name="x-circle" size={12} color="#fff" />
              <Text style={styles.statusBadgeText}>Failed</Text>
            </View>
          )}
        </LinearGradient>

        {/* Body */}
        <View style={styles.cardBody}>
          <View style={styles.cardBodyLeft}>
            <Text style={[styles.fileName, { color: theme.text }]} numberOfLines={1}>{resume.filename}</Text>
            <Text style={[styles.fileDate, { color: theme.textTertiary }]}>Uploaded {resume.uploadDate}</Text>
            {isParsed && resume.skills.length > 0 && (
              <View style={styles.skillsRow}>
                {resume.skills.slice(0, 3).map((sk) => (
                  <View key={sk} style={[styles.skillChip, { backgroundColor: theme.primaryMuted }]}>
                    <Text style={[styles.skillText, { color: theme.primary }]}>{sk}</Text>
                  </View>
                ))}
                {resume.skills.length > 3 && (
                  <View style={[styles.skillChip, { backgroundColor: theme.bgSecondary }]}>
                    <Text style={[styles.skillText, { color: theme.textTertiary }]}>+{resume.skills.length - 3}</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>

        {/* Actions */}
        <View style={[styles.cardActions, { borderTopColor: theme.borderSubtle }]}>
          {isParsed ? (
            <Pressable
              style={({ pressed }) => [styles.startBtn, { backgroundColor: theme.moduleResume, opacity: pressed ? 0.85 : 1 }]}
              onPress={(e) => { e.stopPropagation(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push("/interview/session"); }}
            >
              <Feather name="mic" size={14} color="#fff" />
              <Text style={styles.startBtnText}>Start Interview</Text>
            </Pressable>
          ) : (
            <View style={{ flex: 1 }} />
          )}
          <Pressable
            style={({ pressed }) => [styles.deleteBtn, { backgroundColor: theme.errorMuted, opacity: pressed ? 0.75 : 1 }]}
            onPress={(e) => { e.stopPropagation(); onDelete(); }}
          >
            <Feather name="trash-2" size={15} color={theme.error} />
          </Pressable>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function ResumeScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { resumes, addResume, deleteResume } = useResumes();
  const [uploading, setUploading] = useState(false);
  const webTop = Platform.OS === "web" ? 67 : 0;

  const handleUpload = async () => {
    setUploading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const name = FILE_NAMES[Math.floor(Math.random() * FILE_NAMES.length)];
    const fmt = Math.random() > 0.5 ? "pdf" : "docx" as "pdf" | "docx";
    addResume(`${name}.${fmt}`, fmt);
    setTimeout(() => setUploading(false), 400);
  };

  const confirmDelete = (id: string, name: string) => {
    Alert.alert("Remove Resume", `Delete "${name}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteResume(id) },
    ]);
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      {/* Header */}
      <LinearGradient
        colors={theme.dark ? ["#0A1628", "#0D1B38"] : ["#EBF4FF", "#F4F6FB"]}
        style={[styles.header, { paddingTop: insets.top + webTop + 20 }]}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Resumes</Text>
            <Text style={[styles.headerSub, { color: theme.dark ? "rgba(255,255,255,0.4)" : theme.textSecondary }]}>
              {resumes.length === 0 ? "No files yet" : `${resumes.length} file${resumes.length > 1 ? "s" : ""}`}
            </Text>
          </View>
          <Pressable
            style={({ pressed }) => [styles.uploadBtn, { opacity: pressed ? 0.85 : 1 }]}
            onPress={handleUpload}
            disabled={uploading}
          >
            <LinearGradient colors={["#2563EB", "#1D4ED8"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.uploadBtnInner}>
              {uploading
                ? <ActivityIndicator color="#fff" size="small" />
                : <>
                  <Feather name="upload" size={15} color="#fff" />
                  <Text style={styles.uploadBtnText}>Upload</Text>
                </>}
            </LinearGradient>
          </Pressable>
        </View>
      </LinearGradient>

      <FlatList
        data={resumes}
        keyExtractor={(r) => r.id}
        renderItem={({ item }) => (
          <ResumeCard resume={item} onDelete={() => confirmDelete(item.id, item.filename)} />
        )}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={[styles.emptyIllustration, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={[styles.emptyDocLine, { backgroundColor: theme.border }]} />
              <View style={[styles.emptyDocLine, { backgroundColor: theme.border, width: "60%" }]} />
              <View style={[styles.emptyDocLine, { backgroundColor: theme.border, width: "80%" }]} />
              <View style={[styles.emptyDocLine, { backgroundColor: theme.border, width: "50%" }]} />
              <View style={[styles.emptyDocIcon, { backgroundColor: theme.primaryMuted }]}>
                <Feather name="upload-cloud" size={26} color={theme.primary} />
              </View>
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No resumes uploaded</Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Upload your resume to unlock personalized interview questions tailored to your skills
            </Text>
            <Pressable
              style={({ pressed }) => [styles.emptyBtnOuter, { opacity: pressed ? 0.85 : 1 }]}
              onPress={handleUpload}
            >
              <LinearGradient colors={["#2563EB", "#1D4ED8"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.emptyBtn}>
                <Feather name="upload" size={17} color="#fff" />
                <Text style={styles.emptyBtnText}>Upload Resume</Text>
              </LinearGradient>
            </Pressable>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  headerTitle: { fontSize: 30, fontFamily: "Inter_700Bold", letterSpacing: -0.6 },
  headerSub: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 3 },
  uploadBtn: { borderRadius: 13, overflow: "hidden" },
  uploadBtnInner: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, paddingVertical: 10 },
  uploadBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#fff" },
  list: { padding: 14, gap: 14 },
  cardOuter: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 16, elevation: 4,
  },
  card: { borderRadius: 20, borderWidth: 1, overflow: "hidden" },
  cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12 },
  cardHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  cardHeaderLabels: { gap: 1 },
  cardFormat: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#fff" },
  cardSize: { fontSize: 11, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.7)" },
  statusBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
  },
  statusBadgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: "#fff" },
  cardBody: { padding: 16, gap: 8 },
  cardBodyLeft: { gap: 4 },
  fileName: { fontSize: 15, fontFamily: "Inter_700Bold" },
  fileDate: { fontSize: 12, fontFamily: "Inter_400Regular" },
  skillsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6 },
  skillChip: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  skillText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  cardActions: { flexDirection: "row", alignItems: "center", gap: 10, borderTopWidth: 1, padding: 12 },
  startBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, height: 38, borderRadius: 11 },
  startBtnText: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#fff" },
  deleteBtn: { width: 38, height: 38, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  empty: { paddingTop: 60, alignItems: "center", gap: 14, paddingHorizontal: 32 },
  emptyIllustration: {
    width: 140, height: 160, borderRadius: 20, borderWidth: 1,
    padding: 24, gap: 10, alignItems: "center", justifyContent: "center",
    position: "relative", marginBottom: 8,
  },
  emptyDocLine: { height: 8, width: "100%", borderRadius: 4 },
  emptyDocIcon: { position: "absolute", width: 52, height: 52, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 20, fontFamily: "Inter_700Bold", textAlign: "center" },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },
  emptyBtnOuter: { borderRadius: 14, overflow: "hidden", marginTop: 4 },
  emptyBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 28, paddingVertical: 14 },
  emptyBtnText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },
});
