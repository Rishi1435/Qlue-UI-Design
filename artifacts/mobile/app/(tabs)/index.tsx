import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { useAuth } from "@/context/AuthContext";
import { useInterviews } from "@/context/InterviewContext";
import { useResumes } from "@/context/ResumeContext";
import { useTheme } from "@/hooks/useTheme";
import { GlassCard } from "@/components/GlassCard";

function ModuleCard({
  title, subtitle, icon, tintColor, onPress, tag,
}: {
  title: string; subtitle: string; icon: string;
  tintColor: string; onPress: () => void; tag: string;
}) {
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={[anim, { marginBottom: 20 }]}>
      <GlassCard
        borderRadius={30}
        padding={24}
        tintColor={tintColor}
        onTap={onPress}
      >
        <View style={styles.moduleCardContent}>
          <View style={styles.moduleHeader}>
            <View style={styles.moduleIconBox}>
              <Feather name={icon as any} size={24} color="#fff" />
            </View>
            <View style={[styles.moduleTag, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Text style={styles.moduleTagText}>{tag}</Text>
            </View>
          </View>
          <View style={{ gap: 4, marginTop: 16 }}>
            <Text style={styles.moduleTitle}>{title}</Text>
            <Text style={[styles.moduleSub, { color: 'rgba(255,255,255,0.8)' }]}>{subtitle}</Text>
          </View>
        </View>
      </GlassCard>
    </Animated.View>
  );
}

function StatPill({ value, label, icon }: { value: string | number; label: string; icon: string }) {
  const theme = useTheme();
  return (
    <GlassCard borderRadius={20} padding={12} margin={{ right: 10 }} style={styles.statPill}>
      <Feather name={icon as any} size={14} color={theme.primary} />
      <View style={{ gap: 2 }}>
        <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{label}</Text>
      </View>
    </GlassCard>
  );
}

export default function HomeScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const { resumes } = useResumes();
  const { sessions } = useInterviews();

  const avgScore = sessions.length > 0
    ? Math.round(sessions.reduce((a, s) => a + s.score, 0) / sessions.length) : 0;
  const totalMin = sessions.reduce((a, s) => a + Math.floor(s.duration / 60), 0);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const firstName = user?.name?.split(" ")[0] || "there";

  const modules = [
    {
      title: "Resume Interview",
      subtitle: "Personalized questions from your background",
      icon: "file-text",
      tintColor: "#3B82F6",
      tag: "Smart",
      onPress: () => router.push("/(tabs)/resume"),
    },
    {
      title: "HR & Behavioral",
      subtitle: "Star method and situational practice",
      icon: "users",
      tintColor: "#EC4899",
      tag: "Popular",
      onPress: () => router.push("/interview/session"),
    },
    {
      title: "Self Introduction",
      subtitle: "Perfect your professional pitch",
      icon: "mic",
      tintColor: "#10B981",
      tag: "Skills",
      onPress: () => router.push("/interview/session"),
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.greeting, { color: theme.textSecondary }]}>{greeting}</Text>
              <Text style={[styles.userName, { color: theme.text }]}>{firstName}</Text>
            </View>
            <Pressable
              style={[styles.notifBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <Feather name="bell" size={20} color={theme.textSecondary} />
            </Pressable>
          </View>

          {/* Stats row */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsRow}>
            <StatPill value={sessions.length} label="Sessions" icon="activity" />
            <StatPill value={avgScore > 0 ? `${avgScore}%` : "—"} label="Avg Score" icon="award" />
            <StatPill value={resumes.length} label="Resumes" icon="file-plus" />
            <StatPill value={`${totalMin}m`} label="Practice" icon="clock" />
          </ScrollView>

          {/* Modules */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Practice Rooms</Text>
            </View>
            {modules.map((m) => (
              <ModuleCard key={m.title} {...m} />
            ))}
          </View>

          {/* Recent */}
          {sessions.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent History</Text>
                <Pressable onPress={() => router.push("/(tabs)/sessions")}>
                  <Text style={[styles.seeAll, { color: theme.primary }]}>View All</Text>
                </Pressable>
              </View>
              <GlassCard borderRadius={30} padding={0}>
                {sessions.slice(0, 3).map((s, i) => {
                  const scoreColor = s.score >= 80 ? theme.success : s.score >= 65 ? theme.warning : theme.error;
                  return (
                    <View key={s.id}>
                      {i > 0 && <View style={[styles.separator, { backgroundColor: theme.border, opacity: 0.3 }]} />}
                      <View style={styles.recentRow}>
                        <View style={styles.recentInfo}>
                          <Text style={[styles.recentTopic, { color: theme.text }]} numberOfLines={1}>{s.topic}</Text>
                          <Text style={[styles.recentMeta, { color: theme.textSecondary }]}>{s.date} · {Math.floor(s.duration / 60)}m</Text>
                        </View>
                        <View style={[styles.scoreChip, { backgroundColor: scoreColor + "15" }]}>
                          <Text style={[styles.scoreText, { color: scoreColor }]}>{s.score}%</Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </GlassCard>
            </View>
          )}

          {/* Empty CTA */}
          {sessions.length === 0 && (
            <View style={styles.section}>
              <GlassCard borderRadius={30} padding={24} tintColor={theme.primary + "20"}>
                <View style={styles.ctaContent}>
                  <Feather name="zap" size={28} color={theme.primary} />
                  <Text style={[styles.ctaTitle, { color: theme.text }]}>Start Your Journey</Text>
                  <Text style={[styles.ctaSub, { color: theme.textSecondary }]}>
                    Choose an interview module above to begin your AI-powered practice.
                  </Text>
                </View>
              </GlassCard>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 20, marginBottom: 24 },
  greeting: { fontSize: 13, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  userName: { fontSize: 32, fontWeight: "800", letterSpacing: -0.8 },
  notifBtn: { width: 44, height: 44, borderRadius: 15, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  statsRow: { flexDirection: "row", marginBottom: 30 },
  statPill: { flexDirection: "row", alignItems: "center", gap: 10, minWidth: 120 },
  statValue: { fontSize: 17, fontWeight: "800" },
  statLabel: { fontSize: 10, fontWeight: "600", textTransform: "uppercase" },
  section: { marginBottom: 32 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: "800", letterSpacing: -0.5 },
  seeAll: { fontSize: 14, fontWeight: "700" },
  moduleCardContent: { gap: 12 },
  moduleHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  moduleIconBox: { width: 48, height: 48, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.25)", alignItems: "center", justifyContent: "center" },
  moduleTag: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  moduleTagText: { fontSize: 11, fontWeight: "800", color: "#fff", textTransform: "uppercase" },
  moduleTitle: { fontSize: 24, fontWeight: "800", color: "#fff", letterSpacing: -0.5 },
  moduleSub: { fontSize: 14, fontWeight: "500", lineHeight: 20 },
  recentRow: { flexDirection: "row", alignItems: "center", padding: 18, gap: 12 },
  recentInfo: { flex: 1, gap: 4 },
  recentTopic: { fontSize: 15, fontWeight: "700" },
  recentMeta: { fontSize: 12, fontWeight: "500" },
  scoreChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  scoreText: { fontSize: 14, fontWeight: "800" },
  separator: { height: 1, marginHorizontal: 18 },
  ctaContent: { alignItems: "center", gap: 12, textAlign: 'center' },
  ctaTitle: { fontSize: 18, fontWeight: "800" },
  ctaSub: { fontSize: 14, fontWeight: "500", textAlign: "center", lineHeight: 20, opacity: 0.8 },
});

