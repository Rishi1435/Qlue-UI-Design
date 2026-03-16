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

function PressCard({ onPress, children, style }: { onPress: () => void; children: React.ReactNode; style?: any }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPressIn={() => { scale.value = withSpring(0.96, { damping: 20 }); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 20 }); }}
        onPress={onPress}
        style={style}
      >
        {children}
      </Pressable>
    </Animated.View>
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
    ? Math.round(sessions.reduce((a, s) => a + s.score, 0) / sessions.length)
    : 0;

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  const modules = [
    { title: "Resume Based", sub: "Practice from your CV skills", icon: "file-text", color: theme.moduleResume, light: theme.moduleResumeLight, onPress: () => router.push("/(tabs)/resume") },
    { title: "HR Interview", sub: "Behavioral & STAR questions", icon: "users", color: theme.moduleHR, light: theme.moduleHRLight, onPress: () => router.push("/interview/session") },
    { title: "Job Posting", sub: "Practice from job URLs", icon: "globe", color: theme.moduleWeb, light: theme.moduleWebLight, onPress: () => router.push("/interview/session") },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.bg }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + webTop + 16, paddingBottom: insets.bottom + 100 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: theme.textSecondary }]}>{getGreeting()}</Text>
          <Text style={[styles.name, { color: theme.text }]}>{user?.name?.split(" ")[0] || "there"}</Text>
        </View>
        <Pressable
          style={[styles.notifBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <Feather name="bell" size={19} color={theme.textSecondary} />
        </Pressable>
      </View>

      {/* Hero Stats Card */}
      <LinearGradient
        colors={theme.dark ? ["#1D3461", "#1A2E5A"] : ["#1A73C7", "#0D5AA8"]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={styles.heroCard}
      >
        <View style={styles.heroContent}>
          <View>
            <Text style={styles.heroLabel}>Sessions completed</Text>
            <Text style={styles.heroValue}>{sessions.length}</Text>
          </View>
          <View style={styles.heroRight}>
            <View style={styles.heroBadge}>
              <Feather name="trending-up" size={14} color="#60A5FA" />
              <Text style={styles.heroBadgeText}>
                {avgScore > 0 ? `${avgScore}% avg` : "Start now"}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.heroStats}>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatVal}>{resumes.length}</Text>
            <Text style={styles.heroStatLabel}>Resumes</Text>
          </View>
          <View style={styles.heroStatDivider} />
          <View style={styles.heroStat}>
            <Text style={styles.heroStatVal}>{avgScore > 0 ? `${avgScore}%` : "--"}</Text>
            <Text style={styles.heroStatLabel}>Avg Score</Text>
          </View>
          <View style={styles.heroStatDivider} />
          <View style={styles.heroStat}>
            <Text style={styles.heroStatVal}>
              {sessions.reduce((a, s) => a + Math.floor(s.duration / 60), 0)}m
            </Text>
            <Text style={styles.heroStatLabel}>Practice</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Quick Start */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Practice Modules</Text>
        <Text style={[styles.sectionSub, { color: theme.textSecondary }]}>Choose your interview type</Text>
      </View>

      <View style={styles.moduleList}>
        {modules.map((m) => (
          <PressCard key={m.title} onPress={m.onPress}>
            <View style={[styles.moduleCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={[styles.moduleIcon, { backgroundColor: m.light }]}>
                <Feather name={m.icon as any} size={20} color={m.color} />
              </View>
              <View style={styles.moduleText}>
                <Text style={[styles.moduleTitle, { color: theme.text }]}>{m.title}</Text>
                <Text style={[styles.moduleSub, { color: theme.textSecondary }]}>{m.sub}</Text>
              </View>
              <View style={[styles.moduleArrow, { backgroundColor: m.light }]}>
                <Feather name="chevron-right" size={15} color={m.color} />
              </View>
            </View>
          </PressCard>
        ))}
      </View>

      {/* Recent */}
      {sessions.length > 0 && (
        <>
          <View style={[styles.section, { marginTop: 4 }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Sessions</Text>
          </View>
          <View style={[styles.recentCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {sessions.slice(0, 4).map((s, i) => {
              const cfg = {
                resume: { color: theme.moduleResume, icon: "file-text" },
                hr: { color: theme.moduleHR, icon: "users" },
                website: { color: theme.moduleWeb, icon: "globe" },
              }[s.module];
              return (
                <View key={s.id}>
                  {i > 0 && <View style={[styles.separator, { backgroundColor: theme.borderSubtle }]} />}
                  <View style={styles.recentRow}>
                    <View style={[styles.recentDot, { backgroundColor: cfg.color + "20" }]}>
                      <Feather name={cfg.icon as any} size={14} color={cfg.color} />
                    </View>
                    <View style={styles.recentInfo}>
                      <Text style={[styles.recentTitle, { color: theme.text }]} numberOfLines={1}>{s.topic}</Text>
                      <Text style={[styles.recentDate, { color: theme.textTertiary }]}>{s.date}</Text>
                    </View>
                    <View style={[styles.scoreChip, {
                      backgroundColor: s.score >= 75 ? theme.successMuted : s.score >= 60 ? theme.warningMuted : theme.errorMuted
                    }]}>
                      <Text style={[styles.scoreText, {
                        color: s.score >= 75 ? theme.success : s.score >= 60 ? theme.warning : theme.error
                      }]}>{s.score}%</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </>
      )}

      {sessions.length === 0 && (
        <View style={[styles.emptyCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={[styles.emptyIconWrap, { backgroundColor: theme.primaryMuted }]}>
            <Feather name="mic" size={28} color={theme.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>Ready to practice?</Text>
          <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
            Select a module above to begin your first mock interview session
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 16 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  greeting: { fontSize: 13, fontFamily: "Inter_400Regular" },
  name: { fontSize: 26, fontFamily: "Inter_700Bold", letterSpacing: -0.5, marginTop: 2 },
  notifBtn: {
    width: 42, height: 42, borderRadius: 12, borderWidth: 1,
    alignItems: "center", justifyContent: "center",
  },
  heroCard: { borderRadius: 20, padding: 20, marginBottom: 24, gap: 20 },
  heroContent: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  heroLabel: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.65)", marginBottom: 4 },
  heroValue: { fontSize: 44, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: -1 },
  heroRight: { alignItems: "flex-end" },
  heroBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  heroBadgeText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#A8D4FF" },
  heroStats: { flexDirection: "row", gap: 0 },
  heroStat: { flex: 1, alignItems: "center" },
  heroStatVal: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#fff" },
  heroStatLabel: { fontSize: 11, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.6)", marginTop: 2 },
  heroStatDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.15)", marginVertical: 2 },
  section: { marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", letterSpacing: -0.3 },
  sectionSub: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 3 },
  moduleList: { gap: 10, marginBottom: 24 },
  moduleCard: {
    flexDirection: "row", alignItems: "center", gap: 14,
    borderRadius: 16, padding: 16, borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  moduleIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  moduleText: { flex: 1 },
  moduleTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  moduleSub: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  moduleArrow: { width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  recentCard: {
    borderRadius: 16, borderWidth: 1, overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  separator: { height: 1 },
  recentRow: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  recentDot: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  recentInfo: { flex: 1 },
  recentTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  recentDate: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  scoreChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  scoreText: { fontSize: 13, fontFamily: "Inter_700Bold" },
  emptyCard: {
    borderRadius: 20, padding: 28, borderWidth: 1,
    alignItems: "center", gap: 10, marginBottom: 20,
  },
  emptyIconWrap: { width: 60, height: 60, borderRadius: 18, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  emptyTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  emptySub: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
});
