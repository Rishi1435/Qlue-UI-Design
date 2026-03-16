import { Feather } from "@expo/vector-icons";
import React from "react";
import {
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

const MODULE_CFG: Record<InterviewModule, { label: string; icon: string }> = {
  resume: { label: "Resume", icon: "file-text" },
  hr: { label: "HR Interview", icon: "users" },
  website: { label: "Job Posting", icon: "globe" },
};

function ScoreBadge({ score }: { score: number }) {
  const theme = useTheme();
  const color = score >= 80 ? theme.success : score >= 60 ? theme.warning : theme.error;
  const bg = score >= 80 ? theme.successMuted : score >= 60 ? theme.warningMuted : theme.errorMuted;
  return (
    <View style={[styles.scoreBadge, { backgroundColor: bg, borderColor: color + "30", borderWidth: 1 }]}>
      <Text style={[styles.scoreVal, { color }]}>{score}%</Text>
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
  sessions.forEach((s) => { byModule[s.module]++; });

  const moduleColors: Record<InterviewModule, string> = {
    resume: theme.moduleResume,
    hr: theme.moduleHR,
    website: theme.moduleWeb,
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { paddingTop: insets.top + webTop + 16, backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Progress</Text>
        <Text style={[styles.headerSub, { color: theme.textSecondary }]}>Your performance overview</Text>
      </View>

      {total > 0 ? (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <>
              {/* Summary Card */}
              <View style={[styles.summaryCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={styles.summaryTop}>
                  <View style={styles.summaryMain}>
                    <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Average Score</Text>
                    <Text style={[styles.summaryBig, { color: theme.primary }]}>{avgScore}%</Text>
                  </View>
                  <View style={[styles.summaryDivider, { backgroundColor: theme.border }]} />
                  <View style={styles.summaryGrid}>
                    {[
                      { val: String(total), label: "Sessions" },
                      { val: `${best}%`, label: "Best Score" },
                      { val: `${totalMin}m`, label: "Practice Time" },
                    ].map((s) => (
                      <View key={s.label} style={styles.summaryItem}>
                        <Text style={[styles.summaryItemVal, { color: theme.text }]}>{s.val}</Text>
                        <Text style={[styles.summaryItemLabel, { color: theme.textTertiary }]}>{s.label}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Module breakdown */}
                <View style={[styles.breakdownRow, { borderTopColor: theme.border }]}>
                  {(["resume", "hr", "website"] as InterviewModule[]).map((m) => (
                    <View key={m} style={styles.breakdownItem}>
                      <View style={[styles.breakdownDot, { backgroundColor: moduleColors[m] }]} />
                      <Text style={[styles.breakdownVal, { color: theme.text }]}>{byModule[m]}</Text>
                      <Text style={[styles.breakdownLabel, { color: theme.textTertiary }]}>{MODULE_CFG[m].label}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* List header */}
              <View style={styles.listHeader}>
                <Text style={[styles.listTitle, { color: theme.text }]}>All Sessions</Text>
                <Pressable onPress={clearSessions}>
                  <Text style={[styles.clearText, { color: theme.error }]}>Clear all</Text>
                </Pressable>
              </View>
            </>
          }
          renderItem={({ item: s, index }) => {
            const cfg = MODULE_CFG[s.module];
            const color = moduleColors[s.module];
            return (
              <View style={[styles.sessionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={[styles.sessionIconWrap, { backgroundColor: color + "18" }]}>
                  <Feather name={cfg.icon as any} size={17} color={color} />
                </View>
                <View style={styles.sessionContent}>
                  <Text style={[styles.sessionTopic, { color: theme.text }]} numberOfLines={1}>{s.topic}</Text>
                  <Text style={[styles.sessionMeta, { color: theme.textTertiary }]}>
                    {cfg.label} · {s.date} · {Math.floor(s.duration / 60)}m
                  </Text>
                  <View style={styles.sessionProgress}>
                    <View style={[styles.progressTrack, { backgroundColor: theme.bgSecondary }]}>
                      <View style={[styles.progressFill, { width: `${(s.answeredQuestions / s.totalQuestions) * 100}%`, backgroundColor: color }]} />
                    </View>
                    <Text style={[styles.progressLabel, { color: theme.textTertiary }]}>
                      {s.answeredQuestions}/{s.totalQuestions} Qs
                    </Text>
                  </View>
                </View>
                <ScoreBadge score={s.score} />
              </View>
            );
          }}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIconWrap, { backgroundColor: theme.primaryMuted }]}>
            <Feather name="bar-chart-2" size={36} color={theme.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>No sessions yet</Text>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            Complete an interview session to see your performance analytics here
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1 },
  headerTitle: { fontSize: 26, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  headerSub: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  list: { padding: 14, gap: 10 },
  summaryCard: {
    borderRadius: 20, borderWidth: 1, marginBottom: 16, overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 10, elevation: 2,
  },
  summaryTop: { flexDirection: "row", padding: 20, gap: 16 },
  summaryMain: { justifyContent: "center", gap: 4, paddingRight: 4 },
  summaryLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  summaryBig: { fontSize: 48, fontFamily: "Inter_700Bold", letterSpacing: -1 },
  summaryDivider: { width: 1, marginVertical: 4 },
  summaryGrid: { flex: 1, justifyContent: "space-around" },
  summaryItem: { gap: 2 },
  summaryItemVal: { fontSize: 18, fontFamily: "Inter_700Bold" },
  summaryItemLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  breakdownRow: {
    flexDirection: "row",
    borderTopWidth: 1, paddingVertical: 14, paddingHorizontal: 20,
  },
  breakdownItem: { flex: 1, alignItems: "center", gap: 4 },
  breakdownDot: { width: 8, height: 8, borderRadius: 4 },
  breakdownVal: { fontSize: 16, fontFamily: "Inter_700Bold" },
  breakdownLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  listHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 8,
  },
  listTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  clearText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  sessionCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    borderRadius: 16, padding: 14, borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  sessionIconWrap: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  sessionContent: { flex: 1, gap: 4 },
  sessionTopic: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  sessionMeta: { fontSize: 12, fontFamily: "Inter_400Regular" },
  sessionProgress: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 },
  progressTrack: { flex: 1, height: 3, borderRadius: 2, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 2 },
  progressLabel: { fontSize: 10, fontFamily: "Inter_400Regular" },
  scoreBadge: {
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10,
    alignItems: "center", minWidth: 52,
  },
  scoreVal: { fontSize: 14, fontFamily: "Inter_700Bold" },
  emptyContainer: {
    flex: 1, alignItems: "center", justifyContent: "center",
    paddingHorizontal: 40, gap: 12,
  },
  emptyIconWrap: { width: 88, height: 88, borderRadius: 26, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },
});
