import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  Alert,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { GlassCard } from "@/components/GlassCard";
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
    <GlassCard borderRadius={30} padding={24} margin={{ bottom: 16 }}>
      <View style={styles.sectionHead}>
        <View style={[styles.sectionIcon, { backgroundColor: iconColor + "15" }]}>
          <Feather name={icon as any} size={18} color={iconColor} />
        </View>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>{title.toUpperCase()}</Text>
      </View>
      <View style={styles.sectionBody}>
        {children}
      </View>
    </GlassCard>
  );
}

export default function ResumeDetailScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { resumes, deleteResume } = useResumes();
  const resume = resumes.find((r) => r.id === id);

  if (!resume) {
    return (
      <View style={[styles.root, { backgroundColor: theme.bg }]}>
        <SafeAreaView style={styles.notFound}>
          <Feather name="alert-circle" size={44} color={theme.error} />
          <Text style={[styles.notFoundText, { color: theme.text }]}>Resume not found</Text>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={{ color: theme.primary, fontWeight: "700" }}>Go Back</Text>
          </Pressable>
        </SafeAreaView>
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert("Delete Resume", `Permanently remove "${resume.filename}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => { await deleteResume(resume.id); router.back(); } },
    ]);
  };

  const statusColor = resume.status === "parsed" ? theme.success : resume.status === "failed" ? theme.error : theme.warning;

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
            <GlassCard borderRadius={15} padding={10}>
              <Feather name="chevron-left" size={20} color={theme.text} />
            </GlassCard>
          </Pressable>
          <Pressable onPress={handleDelete} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
            <GlassCard borderRadius={15} padding={10}>
              <Feather name="trash-2" size={18} color={theme.error} />
            </GlassCard>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Hero Section */}
          <GlassCard borderRadius={40} padding={32} margin={{ bottom: 24 }} tintColor={theme.primary + "10"}>
            <View style={styles.heroTop}>
              <View style={[styles.fileIcon, { backgroundColor: theme.primary + "20" }]}>
                <Feather name="file-text" size={32} color={theme.primary} />
              </View>
              <View style={styles.heroMain}>
                <Text style={[styles.filename, { color: theme.text }]} numberOfLines={1}>{resume.filename}</Text>
                <Text style={[styles.fileMeta, { color: theme.textSecondary }]}>
                  {resume.format.toUpperCase()} · {resume.fileSize} · {resume.uploadDate}
                </Text>
              </View>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + "15" }]}>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={[styles.statusText, { color: statusColor }]}>
                {resume.status === "parsed" ? "ANALYSIS READY" : resume.status.toUpperCase()}
              </Text>
            </View>
          </GlassCard>

          {/* Summary Section */}
          {resume.summary && (
            <Section title="Summary" icon="align-left" iconColor="#8B5CF6">
              <Text style={[styles.summaryText, { color: theme.textSecondary }]}>{resume.summary}</Text>
            </Section>
          )}

          {/* Skills Section */}
          {resume.skills.length > 0 && (
            <Section title="Expertise" icon="zap" iconColor="#3B82F6">
              <div style={styles.skillsWrap}>
                {resume.skills.map((s) => <SkillTag key={s} label={s} />)}
              </div>
            </Section>
          )}

          {/* Experience Section */}
          {resume.experience && resume.experience.length > 0 && (
            <Section title="Experience" icon="briefcase" iconColor="#EC4899">
              {resume.experience.map((exp, i) => (
                <View key={i} style={[styles.expItem, i > 0 && styles.itemBorder]}>
                  <View style={styles.expHeader}>
                    <Text style={[styles.expRole, { color: theme.text }]}>{exp.role}</Text>
                    <View style={[styles.yearBadge, { backgroundColor: theme.primaryMuted }]}>
                      <Text style={[styles.yearText, { color: theme.primary }]}>{exp.years}</Text>
                    </View>
                  </View>
                  <Text style={[styles.expCompany, { color: theme.textSecondary }]}>{exp.company}</Text>
                  {exp.description && (
                    <Text style={[styles.expDesc, { color: theme.textTertiary }]}>{exp.description}</Text>
                  )}
                </View>
              ))}
            </Section>
          )}

          {/* Education Section */}
          {resume.education && resume.education.length > 0 && (
            <Section title="Education" icon="book-open" iconColor="#10B981">
              {resume.education.map((edu, i) => (
                <View key={i} style={[styles.expItem, i > 0 && styles.itemBorder]}>
                  <View style={styles.expHeader}>
                    <Text style={[styles.expRole, { color: theme.text }]}>{edu.degree}</Text>
                    <Text style={[styles.yearText, { color: theme.textTertiary }]}>{edu.year}</Text>
                  </View>
                  <Text style={[styles.expCompany, { color: theme.textSecondary }]}>{edu.institution}</Text>
                </View>
              ))}
            </Section>
          )}
        </ScrollView>

        {/* Start Interview Session */}
        {resume.status === "parsed" && (
          <View style={styles.ctaArea}>
            <Pressable
              style={({ pressed }) => [styles.ctaBtn, { backgroundColor: theme.primary, opacity: pressed ? 0.9 : 1 }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push("/interview/session"); }}
            >
              <Text style={styles.ctaText}>Start Practice Session</Text>
              <Feather name="arrow-right" size={20} color="#fff" />
            </Pressable>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", padding: 24, paddingBottom: 12 },
  content: { padding: 24, paddingBottom: 150 },
  heroTop: { flexDirection: "row", alignItems: "center", gap: 20, marginBottom: 20 },
  fileIcon: { width: 72, height: 72, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  heroMain: { flex: 1, gap: 4 },
  filename: { fontSize: 20, fontWeight: "800", letterSpacing: -0.5 },
  fileMeta: { fontSize: 11, fontWeight: "600" },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 9, fontWeight: "800", letterSpacing: 0.5 },
  sectionHead: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
  sectionIcon: { width: 40, height: 40, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  sectionTitle: { fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  sectionBody: { gap: 12 },
  summaryText: { fontSize: 15, lineHeight: 24, opacity: 0.8 },
  skillsWrap: { display: "flex", flexDirection: "row", flexWrap: "wrap", gap: 8 },
  skillTag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  skillTagText: { fontSize: 12, fontWeight: "700" },
  expItem: { gap: 4, paddingVertical: 4 },
  itemBorder: { borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.05)", paddingTop: 16, marginTop: 8 },
  expHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  expRole: { fontSize: 16, fontWeight: "700" },
  expCompany: { fontSize: 14, fontWeight: "600" },
  expDesc: { fontSize: 13, lineHeight: 20, opacity: 0.6, marginTop: 4 },
  yearBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  yearText: { fontSize: 11, fontWeight: "800" },
  ctaArea: { position: "absolute", bottom: 40, left: 24, right: 24 },
  ctaBtn: { height: 64, borderRadius: 32, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 15 },
  ctaText: { color: "#fff", fontSize: 17, fontWeight: "800" },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 },
  notFoundText: { fontSize: 18, fontWeight: "700" },
  backBtn: { marginTop: 10 },
});
