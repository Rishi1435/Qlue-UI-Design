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

import { Colors } from "@/constants/colors";
import { InterviewModule, useInterviews } from "@/context/InterviewContext";

const MODULE_CONFIG: Record<InterviewModule, { label: string; color: string; icon: string }> = {
  resume: { label: "Resume", color: Colors.module.resume, icon: "file-text" },
  hr: { label: "HR Interview", color: Colors.module.hr, icon: "users" },
  website: { label: "Job Posting", color: Colors.module.website, icon: "globe" },
};

function ScoreRing({ score }: { score: number }) {
  const color = score >= 80 ? Colors.semantic.success : score >= 60 ? Colors.semantic.warning : Colors.semantic.error;
  return (
    <View style={[styles.scoreRing, { borderColor: color }]}>
      <Text style={[styles.scoreText, { color }]}>{score}</Text>
    </View>
  );
}

export default function SessionsScreen() {
  const insets = useSafeAreaInsets();
  const { sessions, clearSessions } = useInterviews();
  const webTopPadding = Platform.OS === "web" ? 67 : 0;

  const totalSessions = sessions.length;
  const avgScore = totalSessions > 0
    ? Math.round(sessions.reduce((a, s) => a + s.score, 0) / totalSessions)
    : 0;
  const bestScore = totalSessions > 0
    ? Math.max(...sessions.map((s) => s.score))
    : 0;
  const totalTime = sessions.reduce((a, s) => a + s.duration, 0);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + webTopPadding + 16 }]}>
        <Text style={styles.headerTitle}>Progress</Text>
        <Text style={styles.headerSub}>Your performance overview</Text>
      </View>

      {totalSessions > 0 ? (
        <>
          <View style={styles.statsContainer}>
            <View style={[styles.statRow]}>
              <View style={styles.bigStat}>
                <Text style={styles.bigStatValue}>{avgScore}%</Text>
                <Text style={styles.bigStatLabel}>Average Score</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.miniStats}>
                <View style={styles.miniStat}>
                  <Text style={styles.miniStatVal}>{totalSessions}</Text>
                  <Text style={styles.miniStatLabel}>Sessions</Text>
                </View>
                <View style={styles.miniStat}>
                  <Text style={styles.miniStatVal}>{bestScore}%</Text>
                  <Text style={styles.miniStatLabel}>Best</Text>
                </View>
                <View style={styles.miniStat}>
                  <Text style={styles.miniStatVal}>{Math.floor(totalTime / 60)}m</Text>
                  <Text style={styles.miniStatLabel}>Time</Text>
                </View>
              </View>
            </View>
          </View>

          <FlatList
            data={sessions}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <View style={styles.listHeader}>
                <Text style={styles.listTitle}>All Sessions</Text>
                <Pressable onPress={clearSessions}>
                  <Text style={styles.clearBtn}>Clear all</Text>
                </Pressable>
              </View>
            }
            renderItem={({ item: session }) => {
              const cfg = MODULE_CONFIG[session.module];
              return (
                <View style={styles.sessionCard}>
                  <View style={[styles.sessionIcon, { backgroundColor: cfg.color + "18" }]}>
                    <Feather name={cfg.icon as any} size={18} color={cfg.color} />
                  </View>
                  <View style={styles.sessionInfo}>
                    <Text style={styles.sessionTopic} numberOfLines={1}>{session.topic}</Text>
                    <Text style={styles.sessionMeta}>
                      {cfg.label} · {session.date}
                    </Text>
                    <Text style={styles.sessionDuration}>
                      {Math.floor(session.duration / 60)}m {session.duration % 60}s · {session.answeredQuestions}/{session.totalQuestions} questions
                    </Text>
                  </View>
                  <ScoreRing score={session.score} />
                </View>
              );
            }}
          />
        </>
      ) : (
        <View style={styles.empty}>
          <View style={styles.emptyIconWrap}>
            <Feather name="bar-chart-2" size={40} color={Colors.primary[300]} />
          </View>
          <Text style={styles.emptyTitle}>No sessions yet</Text>
          <Text style={styles.emptyText}>
            Complete an interview session to see your progress and performance analytics here
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.neutral[50] },
  header: {
    paddingHorizontal: 20, paddingBottom: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1, borderBottomColor: Colors.neutral[100],
  },
  headerTitle: { fontSize: 24, fontFamily: "Inter_700Bold", color: Colors.neutral[900] },
  headerSub: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.neutral[500], marginTop: 2 },
  statsContainer: {
    margin: 16,
    backgroundColor: Colors.white, borderRadius: 16,
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  statRow: { flexDirection: "row", padding: 20, alignItems: "center" },
  bigStat: { alignItems: "center", flex: 1 },
  bigStatValue: { fontSize: 48, fontFamily: "Inter_700Bold", color: Colors.primary[600] },
  bigStatLabel: { fontSize: 12, fontFamily: "Inter_500Medium", color: Colors.neutral[500], marginTop: 4 },
  statDivider: { width: 1, height: 60, backgroundColor: Colors.neutral[100], marginHorizontal: 16 },
  miniStats: { flex: 1, gap: 12 },
  miniStat: { alignItems: "center" },
  miniStatVal: { fontSize: 20, fontFamily: "Inter_700Bold", color: Colors.neutral[800] },
  miniStatLabel: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.neutral[400], marginTop: 2 },
  list: { paddingHorizontal: 16, gap: 10 },
  listHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", paddingBottom: 10,
  },
  listTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.neutral[900] },
  clearBtn: { fontSize: 13, fontFamily: "Inter_500Medium", color: Colors.semantic.error },
  sessionCard: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.white, borderRadius: 14,
    padding: 14, gap: 12,
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  sessionIcon: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
  },
  sessionInfo: { flex: 1 },
  sessionTopic: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.neutral[900] },
  sessionMeta: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.neutral[500], marginTop: 2 },
  sessionDuration: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.neutral[400], marginTop: 2 },
  scoreRing: {
    width: 44, height: 44, borderRadius: 22,
    borderWidth: 2.5,
    alignItems: "center", justifyContent: "center",
  },
  scoreText: { fontSize: 13, fontFamily: "Inter_700Bold" },
  empty: {
    flex: 1, alignItems: "center",
    paddingTop: 100, paddingHorizontal: 40, gap: 12,
  },
  emptyIconWrap: {
    width: 88, height: 88, borderRadius: 28,
    backgroundColor: Colors.primary[50],
    alignItems: "center", justifyContent: "center",
    marginBottom: 8,
  },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold", color: Colors.neutral[700] },
  emptyText: {
    fontSize: 14, fontFamily: "Inter_400Regular",
    color: Colors.neutral[400], textAlign: "center", lineHeight: 22,
  },
});
