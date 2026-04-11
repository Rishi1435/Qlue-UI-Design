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
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { GlassCard } from "@/components/GlassCard";
import { Resume, useResumes } from "@/context/ResumeContext";
import { useTheme } from "@/hooks/useTheme";

const FILE_NAMES = ["software_engineer", "product_manager", "data_analyst", "frontend_dev", "ux_designer"];

function ResumeCard({ resume, onDelete }: { resume: Resume; onDelete: () => void }) {
  const theme = useTheme();
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const isParsed = resume.status === "parsed";
  const isParsing = resume.status === "parsing";
  const isFailed = resume.status === "failed";

  const accentColor = resume.format === "pdf" ? "#EF4444" : "#3B82F6";

  return (
    <Animated.View style={[anim, { marginBottom: 12 }]}>
      <GlassCard
        borderRadius={24}
        padding={0}
        onTap={() => router.push({ pathname: "/resume/[id]", params: { id: resume.id } })}
      >
        <View style={styles.cardContent}>
          {/* Vertical Accent */}
          <View style={[styles.cardAccent, { backgroundColor: accentColor }]} />
          
          <View style={styles.cardBody}>
            <View style={styles.cardTop}>
              <View style={styles.cardMainInfo}>
                <Text style={[styles.fileName, { color: theme.text }]} numberOfLines={1}>{resume.filename}</Text>
                <Text style={[styles.fileMeta, { color: theme.textSecondary }]}>
                  {resume.format.toUpperCase()} · {resume.fileSize}
                </Text>
              </View>
              {/* Status */}
              <View style={styles.statusBox}>
                {isParsing && <ActivityIndicator size="small" color={theme.primary} />}
                {isParsed && <Feather name="check-circle" size={16} color={theme.success} />}
                {isFailed && <Feather name="alert-circle" size={16} color={theme.error} />}
              </View>
            </View>

            {isParsed && resume.skills?.length > 0 && (
              <View style={styles.skillsRow}>
                {resume.skills.slice(0, 3).map((sk) => (
                  <View key={sk} style={[styles.skillChip, { backgroundColor: theme.primaryMuted }]}>
                    <Text style={[styles.skillText, { color: theme.primary }]}>{sk}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.cardActions}>
              <Text style={[styles.uploadDate, { color: theme.textTertiary }]}>{resume.uploadDate}</Text>
              <View style={styles.actionButtons}>
                <Pressable
                  onPress={(e) => { e.stopPropagation(); onDelete(); }}
                  style={({ pressed }) => [styles.iconBtn, { opacity: pressed ? 0.6 : 1 }]}
                >
                  <Feather name="trash-2" size={16} color={theme.error} />
                </Pressable>
                {isParsed && (
                  <Pressable
                    onPress={(e) => { e.stopPropagation(); router.push("/interview/session"); }}
                    style={({ pressed }) => [styles.startBtn, { backgroundColor: theme.primary, opacity: pressed ? 0.8 : 1 }]}
                  >
                    <Text style={styles.startBtnText}>Start Practice</Text>
                  </Pressable>
                )}
              </View>
            </View>
          </View>
        </View>
      </GlassCard>
    </Animated.View>
  );
}

export default function ResumeScreen() {
  const theme = useTheme();
  const { resumes, addResume, deleteResume } = useResumes();
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    setUploading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const name = FILE_NAMES[Math.floor(Math.random() * FILE_NAMES.length)];
    const fmt = Math.random() > 0.5 ? "pdf" : "docx" as "pdf" | "docx";
    addResume(`${name}.${fmt}`, fmt);
    setTimeout(() => setUploading(false), 800);
  };

  const confirmDelete = (id: string, name: string) => {
    Alert.alert("Delete Resume", `Permanently remove "${name}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteResume(id) },
    ]);
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.headerSub, { color: theme.textSecondary }]}>YOUR REPOSITORY</Text>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Resumes</Text>
          </View>
          <Pressable
            style={({ pressed }) => [styles.uploadBtn, { backgroundColor: theme.primary, opacity: pressed ? 0.9 : 1 }]}
            onPress={handleUpload}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Feather name="plus" size={20} color="#fff" />
            )}
          </Pressable>
        </View>

        <FlatList
          data={resumes}
          keyExtractor={(r) => r.id}
          renderItem={({ item }) => (
            <ResumeCard resume={item} onDelete={() => confirmDelete(item.id, item.filename)} />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <GlassCard borderRadius={30} padding={32} style={styles.emptyCard}>
                <Feather name="upload" size={40} color={theme.primary} style={{ opacity: 0.5 }} />
                <Text style={[styles.emptyTitle, { color: theme.text }]}>No Files Yet</Text>
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                  Upload your resume to get interview questions tailored to your experience.
                </Text>
                <Pressable
                  style={[styles.bigUploadBtn, { backgroundColor: theme.primary }]}
                  onPress={handleUpload}
                >
                  <Text style={styles.bigUploadBtnText}>Select a File</Text>
                </Pressable>
              </GlassCard>
            </View>
          }
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  headerSub: { fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  headerTitle: { fontSize: 32, fontWeight: "800", letterSpacing: -1 },
  uploadBtn: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  list: { paddingHorizontal: 20, paddingBottom: 100 },
  cardContent: { flexDirection: "row", height: 140 },
  cardAccent: { width: 6, height: "100%", borderTopLeftRadius: 24, borderBottomLeftRadius: 24 },
  cardBody: { flex: 1, padding: 20, justifyContent: "space-between" },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  cardMainInfo: { flex: 1, gap: 2 },
  fileName: { fontSize: 17, fontWeight: "700" },
  fileMeta: { fontSize: 12, fontWeight: "600" },
  statusBox: { width: 24, height: 24, alignItems: "center", justifyContent: "center" },
  skillsRow: { flexDirection: "row", gap: 6 },
  skillChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  skillText: { fontSize: 11, fontWeight: "700" },
  cardActions: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  uploadDate: { fontSize: 11, fontWeight: "500" },
  actionButtons: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconBtn: { padding: 4 },
  startBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  startBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  empty: { flex: 1, padding: 24, justifyContent: "center" },
  emptyCard: { alignItems: "center", gap: 16 },
  emptyTitle: { fontSize: 20, fontWeight: "800" },
  emptyText: { fontSize: 14, textAlign: "center", lineHeight: 22, opacity: 0.8 },
  bigUploadBtn: { paddingHorizontal: 32, paddingVertical: 14, borderRadius: 20, marginTop: 10 },
  bigUploadBtnText: { color: "#fff", fontSize: 15, fontWeight: "800" },
});

