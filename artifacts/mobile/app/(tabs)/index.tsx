import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import { useInterviews } from "@/context/InterviewContext";
import { useResumes } from "@/context/ResumeContext";

type ModuleCardProps = {
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  onPress: () => void;
};

function ModuleCard({ title, subtitle, icon, color, onPress }: ModuleCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.moduleCard, { opacity: pressed ? 0.88 : 1 }]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
    >
      <View style={[styles.moduleIconWrap, { backgroundColor: color + "18" }]}>
        <Feather name={icon as any} size={22} color={color} />
      </View>
      <Text style={styles.moduleTitle}>{title}</Text>
      <Text style={styles.moduleSub}>{subtitle}</Text>
      <View style={[styles.moduleArrow, { backgroundColor: color + "18" }]}>
        <Feather name="arrow-right" size={14} color={color} />
      </View>
    </Pressable>
  );
}

type StatCardProps = {
  label: string;
  value: string | number;
  icon: string;
  color: string;
};

function StatCard({ label, value, icon, color }: StatCardProps) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color + "18" }]}>
        <Feather name={icon as any} size={18} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { resumes } = useResumes();
  const { sessions } = useInterviews();

  const webTopPadding = Platform.OS === "web" ? 67 : 0;

  const avgScore =
    sessions.length > 0
      ? Math.round(sessions.reduce((a, s) => a + s.score, 0) / sessions.length)
      : 0;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + webTopPadding + 8,
          paddingBottom: insets.bottom + 100,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topRow}>
        <View>
          <Text style={styles.greeting}>{greeting()},</Text>
          <Text style={styles.userName}>{user?.name || "Friend"}</Text>
        </View>
        <Pressable
          style={styles.notifBtn}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <Feather name="bell" size={20} color={Colors.neutral[600]} />
        </Pressable>
      </View>

      <View style={styles.statsRow}>
        <StatCard label="Sessions" value={sessions.length} icon="mic" color={Colors.primary[500]} />
        <StatCard label="Resumes" value={resumes.length} icon="file-text" color={Colors.module.resume} />
        <StatCard label="Avg Score" value={avgScore > 0 ? `${avgScore}%` : "--"} icon="trending-up" color={Colors.secondary[500]} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Practice Modules</Text>
        <Text style={styles.sectionSub}>Choose your interview type</Text>
      </View>

      <View style={styles.modulesGrid}>
        <ModuleCard
          title="Resume Based"
          subtitle="Skills from your CV"
          icon="file-text"
          color={Colors.module.resume}
          onPress={() => router.push("/(tabs)/resume")}
        />
        <ModuleCard
          title="HR Interview"
          subtitle="Behavioral questions"
          icon="users"
          color={Colors.module.hr}
          onPress={() => router.push("/interview/session")}
        />
        <ModuleCard
          title="Job Posting"
          subtitle="From company websites"
          icon="globe"
          color={Colors.module.website}
          onPress={() => router.push("/interview/session")}
        />
      </View>

      {sessions.length > 0 && (
        <>
          <View style={[styles.section, { marginTop: 8 }]}>
            <Text style={styles.sectionTitle}>Recent Sessions</Text>
          </View>
          <View style={styles.recentList}>
            {sessions.slice(0, 3).map((s) => (
              <View key={s.id} style={styles.recentCard}>
                <View style={[styles.recentIcon, {
                  backgroundColor:
                    s.module === "resume" ? Colors.module.resume + "18"
                      : s.module === "hr" ? Colors.module.hr + "18"
                        : Colors.module.website + "18"
                }]}>
                  <Feather
                    name={s.module === "resume" ? "file-text" : s.module === "hr" ? "users" : "globe"}
                    size={16}
                    color={
                      s.module === "resume" ? Colors.module.resume
                        : s.module === "hr" ? Colors.module.hr
                          : Colors.module.website
                    }
                  />
                </View>
                <View style={styles.recentInfo}>
                  <Text style={styles.recentTitle}>{s.topic}</Text>
                  <Text style={styles.recentDate}>{s.date}</Text>
                </View>
                <View style={styles.recentScore}>
                  <Text style={[styles.recentScoreText, { color: s.score >= 70 ? Colors.semantic.success : Colors.semantic.warning }]}>
                    {s.score}%
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </>
      )}

      {sessions.length === 0 && (
        <View style={styles.emptyCard}>
          <Feather name="mic" size={36} color={Colors.primary[300]} />
          <Text style={styles.emptyTitle}>Start your first session</Text>
          <Text style={styles.emptyText}>
            Choose a module above to begin practicing
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.neutral[50] },
  content: { paddingHorizontal: 20 },
  topRow: {
    flexDirection: "row", alignItems: "flex-start",
    justifyContent: "space-between", marginBottom: 20,
  },
  greeting: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.neutral[500] },
  userName: { fontSize: 24, fontFamily: "Inter_700Bold", color: Colors.neutral[900], marginTop: 2 },
  notifBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.white,
    alignItems: "center", justifyContent: "center",
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 28 },
  statCard: {
    flex: 1, backgroundColor: Colors.white, borderRadius: 14,
    padding: 14, alignItems: "flex-start",
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
    marginBottom: 8,
  },
  statValue: { fontSize: 22, fontFamily: "Inter_700Bold", color: Colors.neutral[900] },
  statLabel: { fontSize: 11, fontFamily: "Inter_500Medium", color: Colors.neutral[500], marginTop: 2 },
  section: { marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.neutral[900] },
  sectionSub: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.neutral[500], marginTop: 2 },
  modulesGrid: { gap: 12, marginBottom: 24 },
  moduleCard: {
    backgroundColor: Colors.white, borderRadius: 16,
    padding: 20,
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  moduleIconWrap: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
    marginBottom: 12,
  },
  moduleTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: Colors.neutral[900] },
  moduleSub: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.neutral[500], marginTop: 3 },
  moduleArrow: {
    width: 28, height: 28, borderRadius: 8,
    alignItems: "center", justifyContent: "center",
    position: "absolute", right: 16, bottom: 16,
  },
  recentList: { gap: 10, marginBottom: 20 },
  recentCard: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.white, borderRadius: 12,
    padding: 14, gap: 12,
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  recentIcon: {
    width: 38, height: 38, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },
  recentInfo: { flex: 1 },
  recentTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.neutral[900] },
  recentDate: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.neutral[400], marginTop: 2 },
  recentScore: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 8, backgroundColor: Colors.neutral[50],
  },
  recentScoreText: { fontSize: 14, fontFamily: "Inter_700Bold" },
  emptyCard: {
    backgroundColor: Colors.white, borderRadius: 16,
    padding: 32, alignItems: "center", gap: 10,
    marginTop: 8,
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  emptyTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: Colors.neutral[700] },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.neutral[400], textAlign: "center" },
});
