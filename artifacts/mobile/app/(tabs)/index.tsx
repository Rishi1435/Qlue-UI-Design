import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
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
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { useInterviews } from "@/context/InterviewContext";
import { useResumes } from "@/context/ResumeContext";
import { useTheme } from "@/hooks/useTheme";

function ModuleCard({
  title, subtitle, icon, colors, onPress, tag,
}: {
  title: string; subtitle: string; icon: string;
  colors: readonly [string, string]; onPress: () => void; tag: string;
}) {
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={anim}>
      <Pressable
        onPressIn={() => { scale.value = withSpring(0.97, { damping: 20 }); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 20 }); }}
        onPress={onPress}
      >
        <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.moduleCard}>
          <View style={styles.moduleCardTop}>
            <View style={styles.moduleIconWrap}>
              <Feather name={icon as any} size={22} color="#fff" />
            </View>
            <View style={[styles.moduleTag]}>
              <Text style={styles.moduleTagText}>{tag}</Text>
            </View>
          </View>
          <View style={styles.moduleCardBottom}>
            <Text style={styles.moduleTitle}>{title}</Text>
            <Text style={styles.moduleSub}>{subtitle}</Text>
          </View>
          <View style={styles.moduleArrow}>
            <Feather name="arrow-right" size={18} color="rgba(255,255,255,0.7)" />
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

function StatPill({ value, label, icon }: { value: string | number; label: string; icon: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.statPill, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Feather name={icon as any} size={14} color={theme.primary} />
      <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.textTertiary }]}>{label}</Text>
    </View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { user } = useAuth();
  const { resumes } = useResumes();
  const { sessions } = useInterviews();
  const webTop = Platform.OS === "web" ? 67 : 0;

  const avgScore = sessions.length > 0
    ? Math.round(sessions.reduce((a, s) => a + s.score, 0) / sessions.length) : 0;
  const totalMin = sessions.reduce((a, s) => a + Math.floor(s.duration / 60), 0);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const firstName = user?.name?.split(" ")[0] || "there";

  const modules = [
    {
      title: "Resume Interview",
      subtitle: "Questions based on your resume & skills",
      icon: "file-text",
      colors: ["#1D4ED8", "#2563EB"] as const,
      tag: "Personalized",
      onPress: () => router.push("/(tabs)/resume"),
    },
    {
      title: "HR & Behavioral",
      subtitle: "STAR method, culture-fit questions",
      icon: "users",
      colors: ["#BE185D", "#DB2777"] as const,
      tag: "Popular",
      onPress: () => router.push("/interview/session"),
    },
    {
      title: "Job Posting Practice",
      subtitle: "Role-specific questions from job URLs",
      icon: "globe",
      colors: ["#0369A1", "#0891B2"] as const,
      tag: "New",
      onPress: () => router.push("/interview/session"),
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.bg }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <LinearGradient
        colors={theme.dark ? ["#0A1628", "#0D1B38"] : ["#EBF4FF", "#F4F6FB"]}
        style={[styles.header, { paddingTop: insets.top + webTop + 20 }]}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.greeting, { color: theme.dark ? "rgba(255,255,255,0.45)" : theme.textSecondary }]}>{greeting}</Text>
            <Text style={[styles.userName, { color: theme.text }]}>{firstName}</Text>
          </View>
          <Pressable
            style={[styles.notifBtn, { backgroundColor: theme.dark ? "rgba(255,255,255,0.07)" : theme.card, borderColor: theme.dark ? "rgba(255,255,255,0.1)" : theme.border }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <Feather name="bell" size={18} color={theme.textSecondary} />
          </Pressable>
        </View>

        {/* Stats row */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsRow}>
          <StatPill value={sessions.length} label="Sessions" icon="mic" />
          <StatPill value={avgScore > 0 ? `${avgScore}%` : "—"} label="Avg Score" icon="trending-up" />
          <StatPill value={resumes.length} label="Resumes" icon="file-text" />
          <StatPill value={`${totalMin}m`} label="Practice" icon="clock" />
        </ScrollView>
      </LinearGradient>

      {/* Modules */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Practice</Text>
          <Text style={[styles.sectionSub, { color: theme.textTertiary }]}>Choose your session type</Text>
        </View>
        <View style={styles.moduleGrid}>
          {modules.map((m) => (
            <ModuleCard key={m.title} {...m} />
          ))}
        </View>
      </View>

      {/* Recent Sessions */}
      {sessions.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent</Text>
            <Pressable onPress={() => router.push("/(tabs)/sessions")}>
              <Text style={[styles.seeAll, { color: theme.primary }]}>See all</Text>
            </Pressable>
          </View>
          <View style={[styles.recentCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {sessions.slice(0, 3).map((s, i) => {
              const moduleColors = { resume: "#2563EB", hr: "#DB2777", website: "#0891B2" };
              const moduleIcons = { resume: "file-text", hr: "users", website: "globe" };
              const c = moduleColors[s.module];
              const icon = moduleIcons[s.module];
              const scoreColor = s.score >= 80 ? theme.success : s.score >= 65 ? theme.warning : theme.error;
              return (
                <View key={s.id}>
                  {i > 0 && <View style={[styles.separator, { backgroundColor: theme.borderSubtle }]} />}
                  <View style={styles.recentRow}>
                    <View style={[styles.recentIcon, { backgroundColor: c + "18" }]}>
                      <Feather name={icon as any} size={15} color={c} />
                    </View>
                    <View style={styles.recentInfo}>
                      <Text style={[styles.recentTopic, { color: theme.text }]} numberOfLines={1}>{s.topic}</Text>
                      <Text style={[styles.recentMeta, { color: theme.textTertiary }]}>{s.date} · {Math.floor(s.duration / 60)}m</Text>
                    </View>
                    <View style={[styles.scoreChip, { backgroundColor: scoreColor + "15" }]}>
                      <Text style={[styles.scoreText, { color: scoreColor }]}>{s.score}%</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Empty CTA */}
      {sessions.length === 0 && (
        <View style={styles.section}>
          <View style={[styles.ctaCard, { backgroundColor: theme.primaryMuted, borderColor: theme.primary + "20" }]}>
            <View style={[styles.ctaIcon, { backgroundColor: theme.primary + "20" }]}>
              <Feather name="zap" size={24} color={theme.primary} />
            </View>
            <Text style={[styles.ctaTitle, { color: theme.text }]}>Start your first session</Text>
            <Text style={[styles.ctaSub, { color: theme.textSecondary }]}>
              Pick a module above to begin practicing and get AI-powered feedback
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  greeting: { fontSize: 13, fontFamily: "Inter_400Regular" },
  userName: { fontSize: 30, fontFamily: "Inter_700Bold", letterSpacing: -0.6, marginTop: 2 },
  notifBtn: { width: 42, height: 42, borderRadius: 13, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  statsRow: { flexDirection: "row", gap: 10, paddingRight: 20 },
  statPill: {
    flexDirection: "column", alignItems: "center", gap: 4,
    paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, borderWidth: 1,
    minWidth: 80,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  statValue: { fontSize: 18, fontFamily: "Inter_700Bold", letterSpacing: -0.3 },
  statLabel: { fontSize: 10, fontFamily: "Inter_500Medium" },
  section: { paddingHorizontal: 16, marginTop: 24 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 },
  sectionTitle: { fontSize: 20, fontFamily: "Inter_700Bold", letterSpacing: -0.4 },
  sectionSub: { fontSize: 12, fontFamily: "Inter_400Regular" },
  seeAll: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  moduleGrid: { gap: 12 },
  moduleCard: {
    borderRadius: 20, padding: 20, gap: 16, minHeight: 140,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2, shadowRadius: 16, elevation: 6,
    overflow: "hidden",
  },
  moduleCardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  moduleIconWrap: {
    width: 44, height: 44, borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center", justifyContent: "center",
  },
  moduleTag: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
  },
  moduleTagText: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: "rgba(255,255,255,0.9)" },
  moduleCardBottom: { gap: 4 },
  moduleTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: -0.3 },
  moduleSub: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.7)", lineHeight: 18 },
  moduleArrow: {
    position: "absolute", right: 20, bottom: 20,
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center", justifyContent: "center",
  },
  recentCard: {
    borderRadius: 20, borderWidth: 1, overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 10, elevation: 2,
  },
  separator: { height: 1 },
  recentRow: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  recentIcon: { width: 38, height: 38, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  recentInfo: { flex: 1 },
  recentTopic: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  recentMeta: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  scoreChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  scoreText: { fontSize: 13, fontFamily: "Inter_700Bold" },
  ctaCard: {
    borderRadius: 20, borderWidth: 1, padding: 24,
    alignItems: "center", gap: 10,
  },
  ctaIcon: { width: 56, height: 56, borderRadius: 18, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  ctaTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  ctaSub: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
});
