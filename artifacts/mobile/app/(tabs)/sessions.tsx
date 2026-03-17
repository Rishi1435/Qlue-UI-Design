import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { InterviewModule, useInterviews } from "@/context/InterviewContext";
import { useTheme } from "@/hooks/useTheme";

const MODULE_CFG: Record<InterviewModule, { label: string; icon: string; color: string; gradients: readonly [string, string] }> = {
  resume: { label: "Resume", icon: "file-text", color: "#2563EB", gradients: ["#1D4ED8", "#2563EB"] },
  hr: { label: "HR", icon: "users", color: "#DB2777", gradients: ["#BE185D", "#DB2777"] },
  website: { label: "Job Post", icon: "globe", color: "#0891B2", gradients: ["#0369A1", "#0891B2"] },
};

function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const theme = useTheme();
  const color = score >= 80 ? "#22C55E" : score >= 65 ? "#F59E0B" : "#EF4444";
  const grade = score >= 80 ? "Excellent" : score >= 65 ? "Good" : "Fair";
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  return (
    <View style={{ alignItems: "center", gap: 4 }}>
      <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
        {/* Background ring (SVG via border trick) */}
        <View style={{
          width: size, height: size, borderRadius: size / 2,
          borderWidth: 8, borderColor: theme.dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)",
          position: "absolute",
        }} />
        {/* Score arc approximation via colored ring */}
        <View style={{
          width: size - 4, height: size - 4, borderRadius: (size - 4) / 2,
          borderWidth: 8,
          borderTopColor: color,
          borderRightColor: score >= 50 ? color : "transparent",
          borderBottomColor: score >= 75 ? color : "transparent",
          borderLeftColor: score >= 100 ? color : "transparent",
          position: "absolute",
          transform: [{ rotate: "-90deg" }],
          opacity: 0.9,
        }} />
        <View style={{ alignItems: "center" }}>
          <Text style={{ fontSize: size * 0.3, fontFamily: "Inter_700Bold", color, letterSpacing: -1 }}>
            {score}
          </Text>
          <Text style={{ fontSize: size * 0.1, fontFamily: "Inter_500Medium", color: theme.dark ? "rgba(255,255,255,0.4)" : theme.textTertiary }}>
            / 100
          </Text>
        </View>
      </View>
      <Text style={{ fontSize: 13, fontFamily: "Inter_600SemiBold", color }}>{grade}</Text>
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
    <View style={[styles.trendCard, { backgroundColor: theme.dark ? "rgba(255,255,255,0.04)" : theme.card, borderColor: theme.dark ? "rgba(255,255,255,0.07)" : theme.border }]}>
      <Text style={[styles.trendTitle, { color: theme.dark ? "rgba(255,255,255,0.5)" : theme.textTertiary }]}>SCORE TREND</Text>
      <View style={styles.trendBars}>
        {last.map((s, i) => {
          const h = 20 + ((s.score - min) / range) * 36;
          const c = s.score >= 80 ? "#22C55E" : s.score >= 65 ? "#F59E0B" : "#EF4444";
          return (
            <View key={i} style={styles.trendBarWrap}>
              <View style={[styles.trendBar, { height: h, backgroundColor: c, opacity: i === last.length - 1 ? 1 : 0.55 }]} />
              <Text style={[styles.trendBarLabel, { color: theme.dark ? "rgba(255,255,255,0.3)" : theme.textTertiary }]}>
                {s.score}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function SessionCard({ s, index }: { s: any; index: number }) {
  const theme = useTheme();
  const cfg = MODULE_CFG[s.module as InterviewModule];
  const scoreColor = s.score >= 80 ? "#22C55E" : s.score >= 65 ? "#F59E0B" : "#EF4444";
  const completion = Math.round((s.answeredQuestions / s.totalQuestions) * 100);

  return (
    <View style={[styles.sessionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
      {/* Rank & icon */}
      <View style={styles.sessionLeft}>
        <Text style={[styles.sessionRank, { color: theme.dark ? "rgba(255,255,255,0.2)" : theme.textTertiary }]}>
          #{index + 1}
        </Text>
        <View style={[styles.sessionIcon, { backgroundColor: cfg.color + "15" }]}>
          <Feather name={cfg.icon as any} size={16} color={cfg.color} />
        </View>
      </View>

      {/* Content */}
      <View style={styles.sessionBody}>
        <Text style={[styles.sessionTopic, { color: theme.text }]} numberOfLines={1}>{s.topic}</Text>
        <View style={styles.sessionMetaRow}>
          <View style={[styles.sessionModuleTag, { backgroundColor: cfg.color + "12" }]}>
            <Text style={[styles.sessionModuleText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
          <Text style={[styles.sessionDot, { color: theme.textTertiary }]}>·</Text>
          <Text style={[styles.sessionMeta, { color: theme.textTertiary }]}>{s.date}</Text>
          <Text style={[styles.sessionDot, { color: theme.textTertiary }]}>·</Text>
          <Text style={[styles.sessionMeta, { color: theme.textTertiary }]}>{Math.floor(s.duration / 60)}m</Text>
        </View>

        {/* Progress bar */}
        <View style={styles.sessionProgressRow}>
          <View style={[styles.progressTrack, { backgroundColor: theme.dark ? "rgba(255,255,255,0.07)" : theme.bgSecondary }]}>
            <View style={[styles.progressFill, { width: `${completion}%` as any, backgroundColor: cfg.color }]} />
          </View>
          <Text style={[styles.progressLabel, { color: theme.textTertiary }]}>
            {s.answeredQuestions}/{s.totalQuestions}
          </Text>
        </View>
      </View>

      {/* Score */}
      <View style={[styles.scorePill, { backgroundColor: scoreColor + "13", borderColor: scoreColor + "30" }]}>
        <Text style={[styles.scoreText, { color: scoreColor }]}>{s.score}%</Text>
      </View>
    </View>
  );
}

export default function SessionsScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { sessions, clearSessions } = useInterviews();
  const webTop = Platform.OS === "web" ? 67 : 0;

  const total = sessions.length;
  const avgScore = total > 0 ? Math.round(sessions.reduce((a, s) => a + s.score, 0) / total) : 0;
  const best = total > 0 ? Math.max(...sessions.map((s) => s.score)) : 0;
  const totalMin = sessions.reduce((a, s) => a + Math.floor(s.duration / 60), 0);

  const byModule: Record<InterviewModule, number> = { resume: 0, hr: 0, website: 0 };
  sessions.forEach((s) => { byModule[s.module as InterviewModule]++; });

  const handleClear = () => {
    Alert.alert("Clear History", "Remove all session records? This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear All", style: "destructive", onPress: clearSessions },
    ]);
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      {total > 0 ? (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <>
              {/* Gradient hero header */}
              <LinearGradient
                colors={theme.dark ? ["#060C1A", "#0D1B38", "#0A1225"] : ["#EBF4FF", "#F0F6FF", "#F4F6FB"]}
                start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }}
                style={[styles.hero, { paddingTop: insets.top + webTop + 20 }]}
              >
                <View style={styles.heroTop}>
                  <View>
                    <Text style={[styles.heroTitle, { color: theme.text }]}>Progress</Text>
                    <Text style={[styles.heroSub, { color: theme.dark ? "rgba(255,255,255,0.4)" : theme.textSecondary }]}>
                      {total} session{total !== 1 ? "s" : ""} completed
                    </Text>
                  </View>
                  <Pressable
                    style={[styles.clearBtn, { backgroundColor: theme.errorMuted, borderColor: theme.error + "25" }]}
                    onPress={handleClear}
                  >
                    <Feather name="trash-2" size={14} color={theme.error} />
                    <Text style={[styles.clearBtnText, { color: theme.error }]}>Clear</Text>
                  </Pressable>
                </View>

                {/* Main stats */}
                <View style={styles.heroStats}>
                  {/* Score ring */}
                  <View style={[styles.ringCard, { backgroundColor: theme.dark ? "rgba(255,255,255,0.05)" : theme.card, borderColor: theme.dark ? "rgba(255,255,255,0.08)" : theme.border }]}>
                    <ScoreRing score={avgScore} size={120} />
                    <Text style={[styles.ringLabel, { color: theme.dark ? "rgba(255,255,255,0.4)" : theme.textTertiary }]}>
                      Avg Score
                    </Text>
                  </View>

                  {/* Right stats */}
                  <View style={styles.statsList}>
                    {[
                      { icon: "award", label: "Best Score", val: `${best}%`, color: "#22C55E" },
                      { icon: "mic", label: "Sessions", val: String(total), color: "#3B82F6" },
                      { icon: "clock", label: "Practice", val: `${totalMin}m`, color: "#8B5CF6" },
                    ].map((stat) => (
                      <View key={stat.label} style={[styles.statRow, { backgroundColor: theme.dark ? "rgba(255,255,255,0.04)" : theme.card, borderColor: theme.dark ? "rgba(255,255,255,0.07)" : theme.border }]}>
                        <View style={[styles.statIcon, { backgroundColor: stat.color + "15" }]}>
                          <Feather name={stat.icon as any} size={13} color={stat.color} />
                        </View>
                        <View style={styles.statText}>
                          <Text style={[styles.statVal, { color: theme.text }]}>{stat.val}</Text>
                          <Text style={[styles.statLabel, { color: theme.dark ? "rgba(255,255,255,0.3)" : theme.textTertiary }]}>{stat.label}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Module breakdown bars */}
                <View style={[styles.moduleBreakdown, { backgroundColor: theme.dark ? "rgba(255,255,255,0.04)" : theme.card, borderColor: theme.dark ? "rgba(255,255,255,0.07)" : theme.border }]}>
                  <Text style={[styles.breakdownTitle, { color: theme.dark ? "rgba(255,255,255,0.4)" : theme.textTertiary }]}>BY MODULE</Text>
                  <View style={styles.breakdownBars}>
                    {(["resume", "hr", "website"] as InterviewModule[]).map((m) => {
                      const cfg = MODULE_CFG[m];
                      const pct = total > 0 ? (byModule[m] / total) * 100 : 0;
                      return (
                        <View key={m} style={styles.breakdownBar}>
                          <View style={styles.breakdownBarHead}>
                            <View style={styles.breakdownBarLabel}>
                              <Feather name={cfg.icon as any} size={11} color={cfg.color} />
                              <Text style={[styles.breakdownBarText, { color: theme.text }]}>{cfg.label}</Text>
                            </View>
                            <Text style={[styles.breakdownBarCount, { color: theme.dark ? "rgba(255,255,255,0.5)" : theme.textSecondary }]}>
                              {byModule[m]}
                            </Text>
                          </View>
                          <View style={[styles.barTrack, { backgroundColor: theme.dark ? "rgba(255,255,255,0.07)" : theme.bgSecondary }]}>
                            <View style={[styles.barFill, { width: `${pct}%` as any, backgroundColor: cfg.color }]} />
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              </LinearGradient>

              {/* Trend chart */}
              <View style={{ paddingHorizontal: 14, marginTop: 14 }}>
                <ScoreTrend sessions={sessions} />
              </View>

              {/* List header */}
              <View style={styles.listHeader}>
                <Text style={[styles.listTitle, { color: theme.text }]}>Sessions</Text>
                <Text style={[styles.listCount, { color: theme.dark ? "rgba(255,255,255,0.3)" : theme.textTertiary }]}>{total} total</Text>
              </View>
            </>
          }
          renderItem={({ item: s, index }) => (
            <View style={{ paddingHorizontal: 14 }}>
              <SessionCard s={s} index={index} />
            </View>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        />
      ) : (
        <>
          {/* Empty state with header */}
          <LinearGradient
            colors={theme.dark ? ["#060C1A", "#0D1B38"] : ["#EBF4FF", "#F4F6FB"]}
            style={[styles.emptyHeader, { paddingTop: insets.top + webTop + 20 }]}
          >
            <Text style={[styles.heroTitle, { color: theme.text }]}>Progress</Text>
            <Text style={[styles.heroSub, { color: theme.dark ? "rgba(255,255,255,0.4)" : theme.textSecondary }]}>
              Track your interview performance
            </Text>
          </LinearGradient>

          <View style={styles.emptyBody}>
            {/* Placeholder chart */}
            <View style={[styles.emptyChart, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.emptyBars}>
                {[40, 60, 45, 75, 55, 80, 65].map((h, i) => (
                  <View key={i} style={[styles.emptyBar, { height: h, backgroundColor: theme.dark ? "rgba(255,255,255,0.07)" : theme.bgSecondary, borderRadius: 4 }]} />
                ))}
              </View>
              <View style={[styles.emptyLock, { backgroundColor: theme.primaryMuted }]}>
                <Feather name="lock" size={18} color={theme.primary} />
              </View>
            </View>

            <Text style={[styles.emptyTitle, { color: theme.text }]}>No data yet</Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Complete your first interview session to unlock performance analytics and score tracking
            </Text>

            <Pressable
              style={({ pressed }) => [styles.emptyBtnOuter, { opacity: pressed ? 0.85 : 1 }]}
              onPress={() => router.push("/interview/session")}
            >
              <LinearGradient colors={["#2563EB", "#1D4ED8"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.emptyBtn}>
                <Feather name="mic" size={16} color="#fff" />
                <Text style={styles.emptyBtnText}>Start a Session</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  // Hero
  hero: { paddingHorizontal: 16, paddingBottom: 20, gap: 16, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  heroTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  heroTitle: { fontSize: 30, fontFamily: "Inter_700Bold", letterSpacing: -0.6 },
  heroSub: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 3 },
  clearBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 12, borderWidth: 1 },
  clearBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },

  // Stats grid
  heroStats: { flexDirection: "row", gap: 12 },
  ringCard: { flex: 1, borderRadius: 20, borderWidth: 1, padding: 16, alignItems: "center", gap: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 2 },
  ringLabel: { fontSize: 11, fontFamily: "Inter_500Medium" },
  statsList: { flex: 1, gap: 8 },
  statRow: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 14, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10 },
  statIcon: { width: 30, height: 30, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  statText: { gap: 1 },
  statVal: { fontSize: 15, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 10, fontFamily: "Inter_400Regular" },

  // Module breakdown
  moduleBreakdown: { borderRadius: 18, borderWidth: 1, padding: 14, gap: 12 },
  breakdownTitle: { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 0.8 },
  breakdownBars: { gap: 10 },
  breakdownBar: { gap: 5 },
  breakdownBarHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  breakdownBarLabel: { flexDirection: "row", alignItems: "center", gap: 5 },
  breakdownBarText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  breakdownBarCount: { fontSize: 12, fontFamily: "Inter_700Bold" },
  barTrack: { height: 5, borderRadius: 3, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 3 },

  // Trend chart
  trendCard: { borderRadius: 18, borderWidth: 1, padding: 14, gap: 10 },
  trendTitle: { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 0.8 },
  trendBars: { flexDirection: "row", alignItems: "flex-end", gap: 8, height: 60 },
  trendBarWrap: { flex: 1, alignItems: "center", gap: 4 },
  trendBar: { width: "100%", borderRadius: 4, minHeight: 4 },
  trendBarLabel: { fontSize: 9, fontFamily: "Inter_500Medium" },

  // List
  listHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, marginTop: 2 },
  listTitle: { fontSize: 18, fontFamily: "Inter_700Bold", letterSpacing: -0.3 },
  listCount: { fontSize: 13, fontFamily: "Inter_400Regular" },

  // Session card
  sessionCard: {
    flexDirection: "row", alignItems: "center", gap: 10,
    borderRadius: 18, padding: 14, borderWidth: 1,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  sessionLeft: { alignItems: "center", gap: 6 },
  sessionRank: { fontSize: 10, fontFamily: "Inter_500Medium" },
  sessionIcon: { width: 38, height: 38, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  sessionBody: { flex: 1, gap: 4 },
  sessionTopic: { fontSize: 14, fontFamily: "Inter_700Bold" },
  sessionMetaRow: { flexDirection: "row", alignItems: "center", gap: 5, flexWrap: "wrap" },
  sessionModuleTag: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  sessionModuleText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  sessionDot: { fontSize: 12 },
  sessionMeta: { fontSize: 11, fontFamily: "Inter_400Regular" },
  sessionProgressRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  progressTrack: { flex: 1, height: 3, borderRadius: 2, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 2 },
  progressLabel: { fontSize: 10, fontFamily: "Inter_400Regular" },
  scorePill: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 10, borderWidth: 1, alignItems: "center", minWidth: 50 },
  scoreText: { fontSize: 13, fontFamily: "Inter_700Bold" },

  // Empty state
  emptyHeader: { paddingHorizontal: 16, paddingBottom: 20 },
  emptyBody: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 36, gap: 14 },
  emptyChart: { width: "100%", height: 120, borderRadius: 20, borderWidth: 1, padding: 16, justifyContent: "flex-end", alignItems: "flex-end", marginBottom: 8, overflow: "hidden" },
  emptyBars: { flexDirection: "row", alignItems: "flex-end", gap: 8, width: "100%" },
  emptyBar: { flex: 1 },
  emptyLock: { position: "absolute", width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 20, fontFamily: "Inter_700Bold", textAlign: "center" },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },
  emptyBtnOuter: { borderRadius: 14, overflow: "hidden", marginTop: 4 },
  emptyBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 28, paddingVertical: 14 },
  emptyBtnText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },
});
