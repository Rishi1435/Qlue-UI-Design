import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { GlassCard } from "@/components/GlassCard";
import { InterviewModule, useInterviews } from "@/context/InterviewContext";
import { useTheme } from "@/hooks/useTheme";

const MODULE_CFG: Record<InterviewModule, { label: string; icon: string; color: string }> = {
  resume: { label: "Resume", icon: "file-text", color: "#3B82F6" },
  hr: { label: "HR", icon: "users", color: "#EC4899" },
  website: { label: "Job Post", icon: "globe", color: "#10B981" },
};

function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const theme = useTheme();
  const color = score >= 80 ? theme.success : score >= 65 ? theme.warning : theme.error;
  const grade = score >= 80 ? "EXCELLENT" : score >= 65 ? "GOOD" : "NEED PRACTICE";

  return (
    <View style={{ alignItems: "center", gap: 12 }}>
      <View style={[styles.ringOuter, { width: size, height: size, borderColor: theme.border }]}>
        <View style={styles.scoreContent}>
          <Text style={[styles.scoreBig, { color }]}>{score}</Text>
          <Text style={[styles.scoreLabel, { color: theme.textSecondary }]}>PCT</Text>
        </View>
      </View>
      <View style={[styles.gradeBadge, { backgroundColor: color + "15" }]}>
        <Text style={[styles.gradeText, { color }]}>{grade}</Text>
      </View>
    </View>
  );
}

function ScoreTrend({ sessions }: { sessions: any[] }) {
  const theme = useTheme();
  if (sessions.length < 2) return null;
  const last = sessions.slice(0, 7).reverse();
  const max = Math.max(...last.map((s) => s.score));
  const min = Math.min(...last.map((s) => s.score));
  const range = max - min || 1;

  return (
    <GlassCard borderRadius={24} padding={20} margin={{ bottom: 20 }}>
      <Text style={[styles.cardTitle, { color: theme.textSecondary }]}>SCORE TREND</Text>
      <View style={styles.trendBars}>
        {last.map((s, i) => {
          const h = 20 + ((s.score - min) / range) * 40;
          const c = s.score >= 80 ? theme.success : s.score >= 65 ? theme.warning : theme.error;
          return (
            <View key={i} style={styles.trendBarWrap}>
              <View style={[styles.trendBar, { height: h, backgroundColor: c, opacity: i === last.length - 1 ? 1 : 0.4 }]} />
              <Text style={[styles.trendBarLabel, { color: theme.textTertiary }]}>{s.score}</Text>
            </View>
          );
        })}
      </View>
    </GlassCard>
  );
}

function SessionCard({ s, index }: { s: any; index: number }) {
  const theme = useTheme();
  const cfg = MODULE_CFG[s.module as InterviewModule] || MODULE_CFG.resume;
  const scoreColor = s.score >= 80 ? theme.success : s.score >= 65 ? theme.warning : theme.error;

  return (
    <GlassCard
      borderRadius={24}
      padding={16}
      margin={{ bottom: 12 }}
      onTap={() => {}}
    >
      <View style={styles.sessionRow}>
        <View style={[styles.sessionIcon, { backgroundColor: cfg.color + "20" }]}>
          <Feather name={cfg.icon as any} size={18} color={cfg.color} />
        </View>
        <View style={styles.sessionMain}>
          <Text style={[styles.sessionTopic, { color: theme.text }]} numberOfLines={1}>{s.topic}</Text>
          <View style={styles.sessionMeta}>
            <Text style={[styles.sessionDate, { color: theme.textTertiary }]}>{s.date}</Text>
            <View style={[styles.dot, { backgroundColor: theme.border }]} />
            <Text style={[styles.sessionTime, { color: theme.textTertiary }]}>{Math.floor(s.duration / 60)}m</Text>
          </View>
        </View>
        <View style={[styles.scorePill, { backgroundColor: scoreColor + "15" }]}>
          <Text style={[styles.scoreText, { color: scoreColor }]}>{s.score}%</Text>
        </View>
      </View>
    </GlassCard>
  );
}

export default function SessionsScreen() {
  const theme = useTheme();
  const { sessions, clearSessions } = useInterviews();

  const total = sessions.length;
  const avgScore = total > 0 ? Math.round(sessions.reduce((a, s) => a + s.score, 0) / total) : 0;
  const bestScore = total > 0 ? Math.max(...sessions.map((s) => s.score)) : 0;

  const handleClear = () => {
    Alert.alert("Clear History", "Permanently delete all session data?", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear All", style: "destructive", onPress: clearSessions },
    ]);
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.headerSub, { color: theme.textSecondary }]}>PERFORMANCE</Text>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Progress</Text>
          </View>
          {total > 0 && (
            <Pressable onPress={handleClear} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
              <Feather name="trash-2" size={20} color={theme.error} />
            </Pressable>
          )}
        </View>

        {total > 0 ? (
          <FlatList
            data={sessions}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <View style={styles.analytics}>
                {/* Hero Stats */}
                <GlassCard borderRadius={30} padding={24} margin={{ bottom: 20 }}>
                  <View style={styles.heroStatsRow}>
                    <ScoreRing score={avgScore} />
                    <View style={styles.bestStats}>
                      <View style={styles.bestStatItem}>
                        <Text style={[styles.bestVal, { color: theme.text }]}>{bestScore}%</Text>
                        <Text style={[styles.bestLabel, { color: theme.textSecondary }]}>BEST SCORE</Text>
                      </View>
                      <View style={[styles.hLine, { backgroundColor: theme.border, opacity: 0.3 }]} />
                      <View style={styles.bestStatItem}>
                        <Text style={[styles.bestVal, { color: theme.text }]}>{total}</Text>
                        <Text style={[styles.bestLabel, { color: theme.textSecondary }]}>SESSIONS</Text>
                      </View>
                    </View>
                  </View>
                </GlassCard>

                <ScoreTrend sessions={sessions} />

                <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Activity</Text>
              </View>
            }
            renderItem={({ item, index }) => <SessionCard s={item} index={index} />}
          />
        ) : (
          <View style={styles.empty}>
            <GlassCard borderRadius={30} padding={40} style={styles.emptyCard}>
              <Feather name="activity" size={48} color={theme.primary} style={{ opacity: 0.3 }} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No Sessions Yet</Text>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                Complete your first interview to see your progress and score trends here.
              </Text>
              <Pressable
                style={[styles.ctaBtn, { backgroundColor: theme.primary }]}
                onPress={() => router.push("/")}
              >
                <Text style={styles.ctaText}>Start Your First Session</Text>
              </Pressable>
            </GlassCard>
          </View>
        )}
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
  list: { paddingHorizontal: 20, paddingBottom: 100 },
  analytics: { paddingTop: 10 },
  heroStatsRow: { flexDirection: "row", alignItems: "center", gap: 32 },
  ringOuter: {
    aspectRatio: 1,
    borderRadius: 60,
    borderWidth: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreContent: { alignItems: "center" },
  scoreBig: { fontSize: 36, fontWeight: "800", letterSpacing: -1 },
  scoreLabel: { fontSize: 10, fontWeight: "700" },
  gradeBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  gradeText: { fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
  bestStats: { flex: 1, gap: 16 },
  bestStatItem: { gap: 2 },
  bestVal: { fontSize: 24, fontWeight: "800" },
  bestLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 0.5 },
  hLine: { height: 1, width: "100%" },
  cardTitle: { fontSize: 11, fontWeight: "800", letterSpacing: 1, marginBottom: 16 },
  trendBars: { flexDirection: "row", alignItems: "flex-end", gap: 10, height: 80, paddingBottom: 10 },
  trendBarWrap: { flex: 1, alignItems: "center", gap: 8 },
  trendBar: { width: "100%", borderRadius: 6 },
  trendBarLabel: { fontSize: 9, fontWeight: "700" },
  sectionTitle: { fontSize: 20, fontWeight: "800", letterSpacing: -0.5, marginBottom: 16 },
  sessionRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  sessionIcon: { width: 44, height: 44, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  sessionMain: { flex: 1, gap: 4 },
  sessionTopic: { fontSize: 16, fontWeight: "700" },
  sessionMeta: { flexDirection: "row", alignItems: "center", gap: 6 },
  sessionDate: { fontSize: 12, fontWeight: "500" },
  dot: { width: 4, height: 4, borderRadius: 2 },
  sessionTime: { fontSize: 12, fontWeight: "500" },
  scorePill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  scoreText: { fontSize: 14, fontWeight: "800" },
  empty: { flex: 1, padding: 24, justifyContent: "center" },
  emptyCard: { alignItems: "center", gap: 16 },
  emptyTitle: { fontSize: 20, fontWeight: "800" },
  emptyText: { fontSize: 14, textAlign: "center", lineHeight: 22, opacity: 0.8 },
  ctaBtn: { paddingHorizontal: 32, paddingVertical: 14, borderRadius: 20, marginTop: 10 },
  ctaText: { color: "#fff", fontSize: 15, fontWeight: "800" },
});
