import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/constants/colors";
import { useResumes } from "@/context/ResumeContext";

export default function ResumeDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getResume, deleteResume } = useResumes();
  const resume = getResume(id);
  const webTopPadding = Platform.OS === "web" ? 67 : 0;

  if (!resume) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Feather name="alert-circle" size={48} color={Colors.neutral[300]} />
        <Text style={styles.notFoundText}>Resume not found</Text>
        <Pressable style={styles.backPill} onPress={() => router.back()}>
          <Text style={styles.backPillText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert("Delete Resume", `Remove "${resume.filename}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteResume(resume.id);
          router.back();
        },
      },
    ]);
  };

  const handleStartInterview = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/interview/session");
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + webTopPadding + 8 }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={Colors.neutral[700]} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>Resume Details</Text>
        <Pressable style={styles.deleteHeaderBtn} onPress={handleDelete}>
          <Feather name="trash-2" size={18} color={Colors.semantic.error} />
        </Pressable>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.fileCard}>
          <View style={styles.fileIconBig}>
            <Feather
              name={resume.format === "pdf" ? "file" : "file-text"}
              size={32}
              color={Colors.module.resume}
            />
          </View>
          <View style={styles.fileInfo}>
            <Text style={styles.fileName} numberOfLines={2}>{resume.filename}</Text>
            <View style={styles.metaRow}>
              <MetaPill icon="hard-drive" text={resume.fileSize} />
              <MetaPill icon="file" text={resume.format.toUpperCase()} />
              <MetaPill icon="calendar" text={resume.uploadDate} />
            </View>
          </View>
        </View>

        {resume.status === "parsing" && (
          <View style={styles.parsingCard}>
            <Feather name="loader" size={20} color={Colors.semantic.warning} />
            <View>
              <Text style={styles.parsingTitle}>Parsing your resume...</Text>
              <Text style={styles.parsingText}>We're extracting skills and experience</Text>
            </View>
          </View>
        )}

        {resume.status === "parsed" && resume.skills.length > 0 && (
          <View style={styles.skillsSection}>
            <Text style={styles.sectionTitle}>Parsed Skills</Text>
            <Text style={styles.sectionSub}>{resume.skills.length} skills identified</Text>
            <View style={styles.skillsGrid}>
              {resume.skills.map((skill) => (
                <View key={skill} style={styles.skillChip}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {resume.status === "failed" && (
          <View style={styles.failedCard}>
            <Feather name="alert-triangle" size={24} color={Colors.semantic.error} />
            <Text style={styles.failedTitle}>Parsing failed</Text>
            <Text style={styles.failedText}>
              We couldn't extract skills from this file. Please try uploading again.
            </Text>
          </View>
        )}
      </ScrollView>

      {resume.status === "parsed" && (
        <View style={[styles.cta, { paddingBottom: insets.bottom + 16 }]}>
          <Pressable
            style={({ pressed }) => [styles.startBtn, { opacity: pressed ? 0.9 : 1 }]}
            onPress={handleStartInterview}
          >
            <Feather name="mic" size={20} color={Colors.white} />
            <Text style={styles.startBtnText}>Start Resume Interview</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function MetaPill({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.metaPill}>
      <Feather name={icon as any} size={11} color={Colors.neutral[400]} />
      <Text style={styles.metaPillText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.neutral[50] },
  centered: { alignItems: "center", justifyContent: "center", gap: 12 },
  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingBottom: 14,
    backgroundColor: Colors.white,
    borderBottomWidth: 1, borderBottomColor: Colors.neutral[100],
    gap: 12,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: Colors.neutral[100],
    alignItems: "center", justifyContent: "center",
  },
  headerTitle: { flex: 1, fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.neutral[900] },
  deleteHeaderBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: "#FEE5E5",
    alignItems: "center", justifyContent: "center",
  },
  content: { padding: 16, gap: 16 },
  fileCard: {
    backgroundColor: Colors.white, borderRadius: 16,
    padding: 20, flexDirection: "row", gap: 16,
    alignItems: "center",
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  fileIconBig: {
    width: 64, height: 64, borderRadius: 16,
    backgroundColor: Colors.module.resume + "18",
    alignItems: "center", justifyContent: "center",
  },
  fileInfo: { flex: 1, gap: 8 },
  fileName: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: Colors.neutral[900] },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  metaPill: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: Colors.neutral[100],
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 6,
  },
  metaPillText: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.neutral[500] },
  parsingCard: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: "#FFF7D4", borderRadius: 14, padding: 16,
  },
  parsingTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.neutral[800] },
  parsingText: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.neutral[500], marginTop: 2 },
  skillsSection: {
    backgroundColor: Colors.white, borderRadius: 16,
    padding: 20, gap: 12,
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.neutral[900] },
  sectionSub: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.neutral[500], marginTop: -4 },
  skillsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  skillChip: {
    backgroundColor: Colors.module.resume + "14",
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 8,
  },
  skillText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.module.resume },
  failedCard: {
    backgroundColor: "#FEE5E5", borderRadius: 14,
    padding: 20, alignItems: "center", gap: 10,
  },
  failedTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: Colors.semantic.error },
  failedText: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.neutral[600], textAlign: "center" },
  cta: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    paddingHorizontal: 16, paddingTop: 12,
    backgroundColor: Colors.white,
    borderTopWidth: 1, borderTopColor: Colors.neutral[100],
  },
  startBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10, backgroundColor: Colors.module.resume,
    height: 52, borderRadius: 14,
  },
  startBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: Colors.white },
  notFoundText: { fontSize: 16, fontFamily: "Inter_500Medium", color: Colors.neutral[500] },
  backPill: {
    backgroundColor: Colors.primary[500],
    paddingHorizontal: 20, paddingVertical: 12,
    borderRadius: 10,
  },
  backPillText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.white },
});
