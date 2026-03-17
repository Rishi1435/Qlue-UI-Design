import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
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

function SkillTag({ label }: { label: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.skillTag, { backgroundColor: theme.primaryMuted }]}>
      <Text style={[styles.skillTagText, { color: theme.primary }]}>{label}</Text>
    </View>
  );
}

function Section({
  title, icon, iconColor, children,
}: { title: string; icon: string; iconColor: string; children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.sectionHead}>
        <View style={[styles.sectionIcon, { backgroundColor: iconColor + "18" }]}>
          <Feather name={icon as any} size={15} color={iconColor} />
        </View>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>
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
      <View style={[styles.root, { backgroundColor: theme.bg }]}>
        <View style={[styles.simpleHeader, { paddingTop: insets.top + webTop + 16, backgroundColor: theme.card, borderBottomColor: theme.border }]}>
          <Pressable style={[styles.iconBtn, { backgroundColor: theme.bgSecondary }]} onPress={() => router.back()}>
            <Feather name="arrow-left" size={18} color={theme.text} />
          </Pressable>
        </View>
        <View style={styles.notFound}>
          <Feather name="alert-circle" size={44} color={theme.textTertiary} />
          <Text style={[styles.notFoundText, { color: theme.text }]}>Resume not found</Text>
        </View>
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert("Delete Resume", `Remove "${resume.filename}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => { await deleteResume(resume.id); router.back(); } },
    ]);
  };

  const headerColor = resume.format === "pdf" ? ["#C72B2B", "#EF4444"] as const : ["#1D4ED8", "#2563EB"] as const;
  const statusMap = {
    parsed: { label: "Ready to use", color: "#22C55E", bg: "rgba(34,197,94,0.15)" },
    parsing: { label: "Parsing...", color: "#F59E0B", bg: "rgba(245,158,11,0.15)" },
    failed: { label: "Failed", color: "#EF4444", bg: "rgba(239,68,68,0.15)" },
  };
  const status = statusMap[resume.status];

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      {/* Gradient hero header */}
      <LinearGradient colors={headerColor} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={[styles.hero, { paddingTop: insets.top + webTop + 16 }]}>
        <View style={styles.heroNav}>
          <Pressable style={styles.navBtn} onPress={() => router.back()}>
            <Feather name="arrow-left" size={18} color="rgba(255,255,255,0.9)" />
          </Pressable>
          <Pressable style={[styles.navBtn, { backgroundColor: "rgba(255,255,255,0.15)" }]} onPress={handleDelete}>
            <Feather name="trash-2" size={16} color="#fff" />
          </Pressable>
        </View>

        <View style={styles.heroContent}>
          <View style={styles.heroFileIcon}>
            <Feather name="file-text" size={28} color="rgba(255,255,255,0.9)" />
          </View>
          <View style={styles.heroText}>
            <Text style={styles.heroFilename} numberOfLines={1}>{resume.filename}</Text>
            <View style={styles.heroMeta}>
              {[
                { icon: "layers", label: resume.format.toUpperCase() },
                { icon: "hard-drive", label: resume.fileSize },
                { icon: "calendar", label: resume.uploadDate },
              ].map((m) => (
                <View key={m.label} style={styles.heroPill}>
                  <Feather name={m.icon as any} size={10} color="rgba(255,255,255,0.6)" />
                  <Text style={styles.heroPillText}>{m.label}</Text>
                </View>
              ))}
            </View>
            <View style={[styles.heroStatus, { backgroundColor: status.bg }]}>
              <View style={[styles.statusDot, { backgroundColor: status.color }]} />
              <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 110 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Parsing state */}
        {resume.status === "parsing" && (
          <View style={[styles.stateCard, { backgroundColor: theme.warningMuted, borderColor: theme.warning + "25" }]}>
            <Feather name="loader" size={17} color={theme.warning} />
            <View>
              <Text style={[styles.stateTitle, { color: theme.text }]}>Parsing resume...</Text>
              <Text style={[styles.stateSub, { color: theme.textSecondary }]}>Extracting skills, experience & education</Text>
            </View>
          </View>
        )}
        {resume.status === "failed" && (
          <View style={[styles.stateCard, { backgroundColor: theme.errorMuted, borderColor: theme.error + "25" }]}>
            <Feather name="alert-triangle" size={17} color={theme.error} />
            <View>
              <Text style={[styles.stateTitle, { color: theme.error }]}>Parsing failed</Text>
              <Text style={[styles.stateSub, { color: theme.textSecondary }]}>Please try uploading again</Text>
            </View>
          </View>
        )}

        {/* Summary */}
        {resume.summary && (
          <Section title="Summary" icon="align-left" iconColor="#8B5CF6">
            <Text style={[styles.summaryText, { color: theme.textSecondary }]}>{resume.summary}</Text>
          </Section>
        )}

        {/* Skills */}
        {resume.skills.length > 0 && (
          <Section title="Skills & Technologies" icon="tag" iconColor="#3B82F6">
            <View style={styles.skillsWrap}>
              {resume.skills.map((s) => <SkillTag key={s} label={s} />)}
            </View>
          </Section>
        )}

        {/* Experience */}
        {resume.experience && resume.experience.length > 0 && (
          <Section title="Work Experience" icon="briefcase" iconColor="#DB2777">
            {resume.experience.map((exp, i) => (
              <View key={i} style={[styles.expItem, i > 0 && { borderTopWidth: 1, borderTopColor: theme.borderSubtle }]}>
                <View style={styles.expHeader}>
                  <View style={styles.expLeft}>
                    <View style={[styles.expDot, { backgroundColor: "#DB2777" }]} />
                    <View>
                      <Text style={[styles.expRole, { color: theme.text }]}>{exp.role}</Text>
                      <Text style={[styles.expCompany, { color: theme.textSecondary }]}>{exp.company}</Text>
                    </View>
                  </View>
                  <View style={[styles.expYearChip, { backgroundColor: "#DB277715" }]}>
                    <Text style={[styles.expYearText, { color: "#DB2777" }]}>{exp.years}</Text>
                  </View>
                </View>
                {exp.description && (
                  <Text style={[styles.expDesc, { color: theme.textTertiary }]}>{exp.description}</Text>
                )}
              </View>
            ))}
          </Section>
        )}

        {/* Education */}
        {resume.education && resume.education.length > 0 && (
          <Section title="Education" icon="book-open" iconColor="#0891B2">
            {resume.education.map((edu, i) => (
              <View key={i} style={[styles.expItem, i > 0 && { borderTopWidth: 1, borderTopColor: theme.borderSubtle }]}>
                <View style={styles.expHeader}>
                  <View style={styles.expLeft}>
                    <View style={[styles.expDot, { backgroundColor: "#0891B2" }]} />
                    <View>
                      <Text style={[styles.expRole, { color: theme.text }]}>{edu.degree}</Text>
                      <Text style={[styles.expCompany, { color: theme.textSecondary }]}>{edu.institution}</Text>
                    </View>
                  </View>
                  <View style={[styles.expYearChip, { backgroundColor: "#0891B215" }]}>
                    <Text style={[styles.expYearText, { color: "#0891B2" }]}>{edu.year}</Text>
                  </View>
                </View>
              </View>
            ))}
          </Section>
        )}
      </ScrollView>

      {/* CTA */}
      {resume.status === "parsed" && (
        <View style={[styles.ctaBar, { backgroundColor: theme.card, borderTopColor: theme.border, paddingBottom: insets.bottom + 12 }]}>
          <Pressable
            style={({ pressed }) => [styles.ctaBtnOuter, { opacity: pressed ? 0.88 : 1 }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push("/interview/session"); }}
          >
            <LinearGradient colors={["#2563EB", "#1D4ED8"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ctaBtn}>
              <Feather name="mic" size={18} color="#fff" />
              <Text style={styles.ctaBtnText}>Start Interview Session</Text>
              <Feather name="arrow-right" size={16} color="rgba(255,255,255,0.7)" />
            </LinearGradient>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  simpleHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  iconBtn: { width: 38, height: 38, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  notFoundText: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  hero: { paddingHorizontal: 20, paddingBottom: 24, gap: 16 },
  heroNav: { flexDirection: "row", justifyContent: "space-between" },
  navBtn: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center", justifyContent: "center",
  },
  heroContent: { flexDirection: "row", alignItems: "flex-start", gap: 14 },
  heroFileIcon: {
    width: 60, height: 60, borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center", justifyContent: "center",
  },
  heroText: { flex: 1, gap: 8 },
  heroFilename: { fontSize: 17, fontFamily: "Inter_700Bold", color: "#fff" },
  heroMeta: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  heroPill: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
  },
  heroPillText: { fontSize: 10, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.7)" },
  heroStatus: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  content: { padding: 14, gap: 12 },
  stateCard: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, borderWidth: 1, padding: 14 },
  stateTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  stateSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  section: {
    borderRadius: 18, borderWidth: 1, overflow: "hidden",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  sectionHead: { flexDirection: "row", alignItems: "center", gap: 10, padding: 16, paddingBottom: 12 },
  sectionIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  sectionTitle: { fontSize: 15, fontFamily: "Inter_700Bold" },
  summaryText: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22, paddingHorizontal: 16, paddingBottom: 16 },
  skillsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: 16, paddingBottom: 16 },
  skillTag: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10 },
  skillTagText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  expItem: { padding: 16, gap: 8 },
  expHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 8 },
  expLeft: { flexDirection: "row", alignItems: "flex-start", gap: 10, flex: 1 },
  expDot: { width: 8, height: 8, borderRadius: 4, marginTop: 5 },
  expRole: { fontSize: 14, fontFamily: "Inter_700Bold" },
  expCompany: { fontSize: 13, fontFamily: "Inter_500Medium", marginTop: 2 },
  expYearChip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  expYearText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  expDesc: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18, paddingLeft: 18 },
  ctaBar: { position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1 },
  ctaBtnOuter: { borderRadius: 16, overflow: "hidden" },
  ctaBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, height: 52 },
  ctaBtnText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },
});
