import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/constants/colors";
import { Resume, ResumeStatus, useResumes } from "@/context/ResumeContext";

const STATUS_CONFIG: Record<ResumeStatus, { label: string; bg: string; text: string }> = {
  parsed: { label: "Parsed", bg: "#EDFDF3", text: Colors.semantic.success },
  parsing: { label: "Parsing...", bg: "#FFF7D4", text: Colors.semantic.warning },
  failed: { label: "Failed", bg: "#FEE5E5", text: Colors.semantic.error },
  pending: { label: "Pending", bg: "#E0EFFF", text: Colors.primary[600] },
};

function ResumeCard({ resume, onDelete }: { resume: Resume; onDelete: () => void }) {
  const cfg = STATUS_CONFIG[resume.status];
  return (
    <Pressable
      style={({ pressed }) => [styles.card, { opacity: pressed ? 0.9 : 1 }]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push({ pathname: "/resume/[id]", params: { id: resume.id } });
      }}
    >
      <View style={styles.cardTop}>
        <View style={styles.cardIconWrap}>
          <Feather
            name={resume.format === "pdf" ? "file" : "file-text"}
            size={20}
            color={Colors.module.resume}
          />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName} numberOfLines={1}>{resume.filename}</Text>
          <Text style={styles.cardDate}>Uploaded {resume.uploadDate}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
          {resume.status === "parsing" && (
            <ActivityIndicator size="small" color={cfg.text} style={{ marginRight: 4 }} />
          )}
          <Text style={[styles.badgeText, { color: cfg.text }]}>{cfg.label}</Text>
        </View>
      </View>

      <View style={styles.cardMeta}>
        <View style={styles.metaItem}>
          <Feather name="hard-drive" size={12} color={Colors.neutral[400]} />
          <Text style={styles.metaText}>{resume.fileSize}</Text>
        </View>
        <View style={styles.metaItem}>
          <Feather name="file" size={12} color={Colors.neutral[400]} />
          <Text style={styles.metaText}>{resume.format.toUpperCase()}</Text>
        </View>
        {resume.skills.length > 0 && (
          <View style={styles.metaItem}>
            <Feather name="tag" size={12} color={Colors.neutral[400]} />
            <Text style={styles.metaText}>{resume.skills.length} skills</Text>
          </View>
        )}
      </View>

      <View style={styles.cardActions}>
        {resume.status === "parsed" && (
          <Pressable
            style={({ pressed }) => [styles.actionBtn, styles.primaryAction, { opacity: pressed ? 0.85 : 1 }]}
            onPress={(e) => {
              e.stopPropagation();
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push("/interview/session");
            }}
          >
            <Feather name="mic" size={14} color={Colors.white} />
            <Text style={styles.primaryActionText}>Start Interview</Text>
          </Pressable>
        )}
        <Pressable
          style={({ pressed }) => [styles.actionBtn, styles.deleteAction, { opacity: pressed ? 0.85 : 1 }]}
          onPress={(e) => {
            e.stopPropagation();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            onDelete();
          }}
        >
          <Feather name="trash-2" size={14} color={Colors.semantic.error} />
        </Pressable>
      </View>
    </Pressable>
  );
}

const SAMPLE_FILENAMES = [
  "software_engineer_resume",
  "product_manager_cv",
  "data_scientist_resume",
  "frontend_developer",
  "ux_designer_portfolio",
];

export default function ResumeScreen() {
  const insets = useSafeAreaInsets();
  const { resumes, addResume, deleteResume } = useResumes();
  const [uploading, setUploading] = useState(false);
  const webTopPadding = Platform.OS === "web" ? 67 : 0;

  const handleUpload = async () => {
    setUploading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const name = SAMPLE_FILENAMES[Math.floor(Math.random() * SAMPLE_FILENAMES.length)];
    const format = Math.random() > 0.5 ? "pdf" : "docx";
    addResume(`${name}.${format}`, format);
    setUploading(false);
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert("Delete Resume", `Remove "${name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteResume(id),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + webTopPadding + 16 }]}>
        <View>
          <Text style={styles.headerTitle}>My Resumes</Text>
          <Text style={styles.headerSub}>{resumes.length} uploaded</Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.uploadBtn, { opacity: pressed ? 0.85 : 1 }, uploading && styles.uploadBtnDisabled]}
          onPress={handleUpload}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color={Colors.white} size="small" />
          ) : (
            <>
              <Feather name="upload" size={16} color={Colors.white} />
              <Text style={styles.uploadBtnText}>Upload</Text>
            </>
          )}
        </Pressable>
      </View>

      <FlatList
        data={resumes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ResumeCard
            resume={item}
            onDelete={() => handleDelete(item.id, item.filename)}
          />
        )}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!!resumes.length}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIconWrap}>
              <Feather name="file-text" size={36} color={Colors.module.resume} />
            </View>
            <Text style={styles.emptyTitle}>No resumes yet</Text>
            <Text style={styles.emptyText}>
              Upload your resume to start practicing with resume-based interview questions
            </Text>
            <Pressable
              style={({ pressed }) => [styles.emptyBtn, { opacity: pressed ? 0.85 : 1 }]}
              onPress={handleUpload}
            >
              <Feather name="upload" size={16} color={Colors.white} />
              <Text style={styles.emptyBtnText}>Upload Resume</Text>
            </Pressable>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.neutral[50] },
  header: {
    flexDirection: "row", alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 20, paddingBottom: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1, borderBottomColor: Colors.neutral[100],
  },
  headerTitle: { fontSize: 24, fontFamily: "Inter_700Bold", color: Colors.neutral[900] },
  headerSub: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.neutral[500], marginTop: 2 },
  uploadBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: Colors.module.resume,
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 10,
  },
  uploadBtnDisabled: { backgroundColor: Colors.neutral[300] },
  uploadBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.white },
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: Colors.white, borderRadius: 16,
    padding: 16,
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
    gap: 12,
  },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  cardIconWrap: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: Colors.module.resume + "18",
    alignItems: "center", justifyContent: "center",
  },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: Colors.neutral[900] },
  cardDate: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.neutral[400], marginTop: 2 },
  badge: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  cardMeta: { flexDirection: "row", gap: 16 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.neutral[400] },
  cardActions: { flexDirection: "row", gap: 8, alignItems: "center" },
  actionBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 14, paddingVertical: 9,
    borderRadius: 9,
  },
  primaryAction: { backgroundColor: Colors.module.resume, flex: 1, justifyContent: "center" },
  primaryActionText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.white },
  deleteAction: {
    width: 40, height: 38,
    backgroundColor: "#FEE5E5",
    justifyContent: "center",
    paddingHorizontal: 0,
  },
  empty: {
    flex: 1, alignItems: "center", paddingTop: 80, paddingHorizontal: 32, gap: 12,
  },
  emptyIconWrap: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: Colors.module.resume + "12",
    alignItems: "center", justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold", color: Colors.neutral[700] },
  emptyText: {
    fontSize: 14, fontFamily: "Inter_400Regular",
    color: Colors.neutral[400], textAlign: "center", lineHeight: 22,
  },
  emptyBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: Colors.module.resume,
    paddingHorizontal: 20, paddingVertical: 12,
    borderRadius: 12, marginTop: 8,
  },
  emptyBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: Colors.white },
});
