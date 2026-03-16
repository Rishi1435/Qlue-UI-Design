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

import { useResumes } from "@/context/ResumeContext";
import { useTheme } from "@/hooks/useTheme";

function Tag({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <View style={[styles.tag, { backgroundColor: bg }]}>
      <Text style={[styles.tagText, { color }]}>{label}</Text>
    </View>
  );
}

function SectionBlock({
  title, icon, iconColor, children,
}: { title: string; icon: string; iconColor: string; children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <View style={[styles.sectionBlock, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.sectionBlockHeader}>
        <View style={[styles.sectionBlockIcon, { backgroundColor: iconColor + "18" }]}>
          <Feather name={icon as any} size={15} color={iconColor} />
        </View>
        <Text style={[styles.sectionBlockTitle, { color: theme.text }]}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

export default function ResumeDetailScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { resumes, deleteResume } = useResumes();
  const webTop = Platform.OS === "web" ? 67 : 0;

  const resume = resumes.find((r) => r.id === id);

  if (!resume) {
    return (
      <View style={[styles.root, { backgroundColor: theme.bg, paddingTop: insets.top + webTop }]}>
        <Pressable style={[styles.backRow, { backgroundColor: theme.bgSecondary }]} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={theme.text} />
        </Pressable>
        <View style={styles.notFound}>
          <Feather name="alert-circle" size={40} color={theme.textTertiary} />
          <Text style={[styles.notFoundText, { color: theme.text }]}>Resume not found</Text>
        </View>
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert("Delete Resume", `Remove "${resume.filename}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => { await deleteResume(resume.id); router.back(); },
      },
    ]);
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      {/* Header bar */}
      <View style={[styles.headerBar, { paddingTop: insets.top + webTop + 12, backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <Pressable style={[styles.headerBtn, { backgroundColor: theme.bgSecondary }]} onPress={() => router.back()}>
          <Feather name="arrow-left" size={19} color={theme.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: theme.text }]} numberOfLines={1}>{resume.filename}</Text>
          <View style={[styles.headerBadge, {
            backgroundColor: resume.status === "parsed" ? theme.successMuted : resume.status === "parsing" ? theme.warningMuted : theme.errorMuted
          }]}>
            <View style={[styles.headerDot, {
              backgroundColor: resume.status === "parsed" ? theme.success : resume.status === "parsing" ? theme.warning : theme.error
            }]} />
            <Text style={[styles.headerBadgeText, {
              color: resume.status === "parsed" ? theme.success : resume.status === "parsing" ? theme.warning : theme.error
            }]}>
              {resume.status === "parsed" ? "Ready" : resume.status === "parsing" ? "Processing" : "Failed"}
            </Text>
          </View>
        </View>
        <Pressable style={[styles.headerBtn, { backgroundColor: theme.errorMuted }]} onPress={handleDelete}>
          <Feather name="trash-2" size={17} color={theme.error} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 110 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* File Info Card */}
        <View style={[styles.fileInfoCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={[styles.fileIconBig, { backgroundColor: theme.moduleResumeLight }]}>
            <Feather name="file-text" size={32} color={theme.moduleResume} />
          </View>
          <View style={{ flex: 1, gap: 8 }}>
            <Text style={[styles.filename, { color: theme.text }]}>{resume.filename}</Text>
            <View style={styles.fileMeta}>
              {[
                { label: resume.format.toUpperCase(), icon: "file" },
                { label: resume.fileSize, icon: "hard-drive" },
                { label: resume.uploadDate, icon: "calendar" },
              ].map((m) => (
                <View key={m.label} style={[styles.metaChip, { backgroundColor: theme.bgSecondary }]}>
                  <Feather name={m.icon as any} size={11} color={theme.textTertiary} />
                  <Text style={[styles.metaText, { color: theme.textSecondary }]}>{m.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Parsing / Failed state */}
        {resume.status === "parsing" && (
          <View style={[styles.stateCard, { backgroundColor: theme.warningMuted, borderColor: theme.warning + "30" }]}>
            <Feather name="loader" size={18} color={theme.warning} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.stateTitle, { color: theme.text }]}>Parsing your resume...</Text>
              <Text style={[styles.stateSub, { color: theme.textSecondary }]}>Extracting skills and experience</Text>
            </View>
          </View>
        )}
        {resume.status === "failed" && (
          <View style={[styles.stateCard, { backgroundColor: theme.errorMuted, borderColor: theme.error + "30" }]}>
            <Feather name="alert-triangle" size={18} color={theme.error} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.stateTitle, { color: theme.error }]}>Parsing failed</Text>
              <Text style={[styles.stateSub, { color: theme.textSecondary }]}>Please try uploading again</Text>
            </View>
          </View>
        )}

        {/* Skills */}
        {resume.skills.length > 0 && (
          <SectionBlock title="Skills & Technologies" icon="tag" iconColor={theme.moduleResume}>
            <View style={styles.tagWrap}>
              {resume.skills.map((s) => (
                <Tag key={s} label={s} color={theme.moduleResume} bg={theme.moduleResumeLight} />
              ))}
            </View>
          </SectionBlock>
        )}

        {/* Experience */}
        {resume.experience && resume.experience.length > 0 && (
          <SectionBlock title="Work Experience" icon="briefcase" iconColor={theme.moduleHR}>
            {resume.experience.map((exp, i) => (
              <View key={i} style={[styles.expItem, i > 0 && { borderTopWidth: 1, borderTopColor: theme.borderSubtle }]}>
                <View style={styles.expRow}>
                  <Text style={[styles.expRole, { color: theme.text }]}>{exp.role}</Text>
                  <View style={[styles.yearChip, { backgroundColor: theme.primaryMuted }]}>
                    <Text style={[styles.yearText, { color: theme.primary }]}>{exp.years}</Text>
                  </View>
                </View>
                <Text style={[styles.expCompany, { color: theme.textSecondary }]}>{exp.company}</Text>
                {exp.description && (
                  <Text style={[styles.expDesc, { color: theme.textTertiary }]}>{exp.description}</Text>
                )}
              </View>
            ))}
          </SectionBlock>
        )}

        {/* Education */}
        {resume.education && resume.education.length > 0 && (
          <SectionBlock title="Education" icon="book-open" iconColor={theme.moduleWeb}>
            {resume.education.map((edu, i) => (
              <View key={i} style={[styles.expItem, i > 0 && { borderTopWidth: 1, borderTopColor: theme.borderSubtle }]}>
                <Text style={[styles.expRole, { color: theme.text }]}>{edu.degree}</Text>
                <Text style={[styles.expCompany, { color: theme.textSecondary }]}>{edu.institution}</Text>
                <Text style={[styles.expDesc, { color: theme.textTertiary }]}>{edu.year}</Text>
              </View>
            ))}
          </SectionBlock>
        )}

        {/* Summary */}
        {resume.summary && (
          <SectionBlock title="Professional Summary" icon="align-left" iconColor={theme.secondary}>
            <Text style={[styles.summaryText, { color: theme.textSecondary }]}>{resume.summary}</Text>
          </SectionBlock>
        )}
      </ScrollView>

      {/* CTA */}
      {resume.status === "parsed" && (
        <View style={[styles.ctaBar, { backgroundColor: theme.card, borderTopColor: theme.border, paddingBottom: insets.bottom + 12 }]}>
          <Pressable
            style={({ pressed }) => [styles.bigStartBtn, { backgroundColor: theme.moduleResume, opacity: pressed ? 0.88 : 1 }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push("/interview/session"); }}
          >
            <Feather name="mic" size={19} color="#fff" />
            <Text style={styles.bigStartBtnText}>Start Interview Session</Text>
            <Feather name="arrow-right" size={16} color="rgba(255,255,255,0.7)" />
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  headerBar: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 16, paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerBtn: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  headerCenter: { flex: 1, gap: 4 },
  headerTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  headerBadge: { flexDirection: "row", alignItems: "center", gap: 5, alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  headerDot: { width: 6, height: 6, borderRadius: 3 },
  headerBadgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  content: { padding: 16, gap: 12 },
  fileInfoCard: {
    flexDirection: "row", gap: 14, padding: 16,
    borderRadius: 18, borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  fileIconBig: { width: 64, height: 64, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  filename: { fontSize: 16, fontFamily: "Inter_700Bold", flexShrink: 1 },
  fileMeta: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  metaChip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  metaText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  stateCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    borderRadius: 14, padding: 14, borderWidth: 1,
  },
  stateTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  stateSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  sectionBlock: {
    borderRadius: 18, borderWidth: 1, overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  sectionBlockHeader: { flexDirection: "row", alignItems: "center", gap: 10, padding: 16, paddingBottom: 12 },
  sectionBlockIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  sectionBlockTitle: { fontSize: 15, fontFamily: "Inter_700Bold" },
  tagWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: 16, paddingBottom: 16 },
  tag: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10 },
  tagText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  expItem: { padding: 16, gap: 4 },
  expRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  expRole: { fontSize: 14, fontFamily: "Inter_600SemiBold", flex: 1 },
  yearChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  yearText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  expCompany: { fontSize: 13, fontFamily: "Inter_500Medium" },
  expDesc: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18, marginTop: 4 },
  summaryText: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22, padding: 16, paddingTop: 0 },
  ctaBar: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1,
  },
  bigStartBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10, height: 52, borderRadius: 15,
  },
  bigStartBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#fff" },
  backRow: { margin: 16, width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  notFoundText: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
});
