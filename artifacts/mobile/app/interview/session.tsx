import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/constants/colors";
import { useInterviews } from "@/context/InterviewContext";

const QUESTIONS = [
  "Tell me about yourself and your background.",
  "Describe a challenging project you worked on and how you handled it.",
  "What are your greatest strengths and how do they apply to this role?",
  "Where do you see yourself in five years?",
  "Tell me about a time you had to work under pressure.",
  "How do you handle conflict with a team member?",
  "What motivates you in your work?",
  "Describe a situation where you showed leadership.",
];

type Phase = "ready" | "recording" | "thinking" | "answer" | "completed";

export default function InterviewSessionScreen() {
  const insets = useSafeAreaInsets();
  const { addSession } = useInterviews();
  const [phase, setPhase] = useState<Phase>("ready");
  const [currentQ, setCurrentQ] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [sessionStart] = useState(Date.now());
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const webTopPadding = Platform.OS === "web" ? 67 : 0;

  const totalQuestions = 5;

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (phase === "recording") {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 700, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        ])
      );
      loop.start();
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
        loop.stop();
        pulseAnim.setValue(1);
      };
    }
  }, [phase]);

  const handleMicPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (phase === "ready" || phase === "answer") {
      setPhase("recording");
    } else if (phase === "recording") {
      setPhase("thinking");
      setTimeout(() => setPhase("answer"), 1500);
    }
  }, [phase]);

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const score = Math.floor(Math.random() * 30) + 65;
    const newScores = [...scores, score];
    setScores(newScores);
    setElapsed(0);

    if (currentQ + 1 >= totalQuestions) {
      const avgScore = Math.round(newScores.reduce((a, b) => a + b, 0) / newScores.length);
      const duration = Math.floor((Date.now() - sessionStart) / 1000);
      addSession({
        module: "hr",
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        duration,
        score: avgScore,
        totalQuestions,
        answeredQuestions: newScores.length,
        topic: "HR Interview Practice",
      });
      setPhase("completed");
    } else {
      setCurrentQ((q) => q + 1);
      setPhase("ready");
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  if (phase === "completed") {
    const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    return (
      <View style={[styles.container, styles.centered]}>
        <View style={[styles.completedIcon, { marginTop: insets.top + webTopPadding }]}>
          <Feather name="check-circle" size={56} color={Colors.semantic.success} />
        </View>
        <Text style={styles.completedTitle}>Session Complete!</Text>
        <Text style={styles.completedSub}>Great work practicing your interview skills</Text>
        <View style={styles.scoreCard}>
          <Text style={styles.scoreCardValue}>{avgScore}%</Text>
          <Text style={styles.scoreCardLabel}>Overall Score</Text>
        </View>
        <View style={styles.scoreGrid}>
          {scores.map((s, i) => (
            <View key={i} style={styles.scoreItem}>
              <Text style={styles.scoreItemLabel}>Q{i + 1}</Text>
              <Text style={[styles.scoreItemVal, { color: s >= 75 ? Colors.semantic.success : Colors.semantic.warning }]}>
                {s}%
              </Text>
            </View>
          ))}
        </View>
        <Pressable
          style={({ pressed }) => [styles.doneBtn, { opacity: pressed ? 0.9 : 1 }]}
          onPress={() => router.back()}
        >
          <Text style={styles.doneBtnText}>Back to Home</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + webTopPadding + 8 }]}>
        <Pressable style={styles.closeBtn} onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.back();
        }}>
          <Feather name="x" size={20} color={Colors.neutral[600]} />
        </Pressable>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${((currentQ) / totalQuestions) * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>{currentQ}/{totalQuestions}</Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 140 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.qModule}>
          <Feather name="users" size={14} color={Colors.module.hr} />
          <Text style={styles.qModuleText}>HR Interview</Text>
        </View>

        <Text style={styles.qNum}>Question {currentQ + 1}</Text>
        <Text style={styles.question}>{QUESTIONS[currentQ % QUESTIONS.length]}</Text>

        {phase === "answer" && (
          <View style={styles.feedbackCard}>
            <View style={styles.feedbackHeader}>
              <Feather name="zap" size={16} color={Colors.tertiary[500]} />
              <Text style={styles.feedbackTitle}>AI Feedback</Text>
            </View>
            <Text style={styles.feedbackText}>
              Good response! You clearly articulated your experience and used specific examples. 
              Consider structuring with the STAR method for even clearer communication. 
              Your confidence level was strong throughout.
            </Text>
          </View>
        )}

        {phase === "thinking" && (
          <View style={styles.thinkingCard}>
            <Feather name="cpu" size={18} color={Colors.primary[500]} />
            <Text style={styles.thinkingText}>Analyzing your response...</Text>
          </View>
        )}
      </ScrollView>

      <View style={[styles.controls, { paddingBottom: insets.bottom + 16 }]}>
        {phase !== "answer" && (
          <View style={styles.timerRow}>
            <Feather name="clock" size={14} color={Colors.neutral[400]} />
            <Text style={styles.timer}>{formatTime(elapsed)}</Text>
          </View>
        )}

        <View style={styles.micRow}>
          {phase === "ready" && (
            <Text style={styles.hint}>Tap the mic to start answering</Text>
          )}
          {phase === "recording" && (
            <Text style={[styles.hint, { color: Colors.semantic.error }]}>Recording... Tap to stop</Text>
          )}

          {phase === "answer" ? (
            <Pressable
              style={({ pressed }) => [styles.nextBtn, { opacity: pressed ? 0.9 : 1 }]}
              onPress={handleNext}
            >
              <Text style={styles.nextBtnText}>
                {currentQ + 1 >= totalQuestions ? "Finish Session" : "Next Question"}
              </Text>
              <Feather name="arrow-right" size={18} color={Colors.white} />
            </Pressable>
          ) : (
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <Pressable
                style={[styles.micBtn, phase === "recording" && styles.micBtnActive]}
                onPress={handleMicPress}
              >
                <Feather
                  name={phase === "recording" ? "square" : "mic"}
                  size={28}
                  color={Colors.white}
                />
              </Pressable>
            </Animated.View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.neutral[50] },
  centered: { alignItems: "center", justifyContent: "center", paddingHorizontal: 24, gap: 16 },
  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingBottom: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1, borderBottomColor: Colors.neutral[100],
    gap: 12,
  },
  closeBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: Colors.neutral[100],
    alignItems: "center", justifyContent: "center",
  },
  progressBar: {
    flex: 1, height: 6, borderRadius: 3,
    backgroundColor: Colors.neutral[200],
    overflow: "hidden",
  },
  progressFill: {
    height: "100%", borderRadius: 3,
    backgroundColor: Colors.primary[500],
  },
  progressText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.neutral[500] },
  content: { padding: 20, gap: 20 },
  qModule: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: Colors.module.hr + "14",
    alignSelf: "flex-start",
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 8,
  },
  qModuleText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: Colors.module.hr },
  qNum: { fontSize: 13, fontFamily: "Inter_500Medium", color: Colors.neutral[400] },
  question: {
    fontSize: 22, fontFamily: "Inter_700Bold",
    color: Colors.neutral[900], lineHeight: 32,
  },
  feedbackCard: {
    backgroundColor: Colors.white, borderRadius: 16,
    padding: 18, gap: 10,
    borderLeftWidth: 3, borderLeftColor: Colors.tertiary[500],
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  feedbackHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  feedbackTitle: { fontSize: 14, fontFamily: "Inter_700Bold", color: Colors.tertiary[500] },
  feedbackText: {
    fontSize: 14, fontFamily: "Inter_400Regular",
    color: Colors.neutral[700], lineHeight: 22,
  },
  thinkingCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: Colors.primary[50], borderRadius: 14, padding: 16,
  },
  thinkingText: { fontSize: 14, fontFamily: "Inter_500Medium", color: Colors.primary[600] },
  controls: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.white,
    borderTopWidth: 1, borderTopColor: Colors.neutral[100],
    paddingHorizontal: 24, paddingTop: 16,
    alignItems: "center", gap: 12,
  },
  timerRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  timer: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.neutral[500] },
  micRow: { alignItems: "center", gap: 8 },
  hint: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.neutral[400] },
  micBtn: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.primary[500],
    alignItems: "center", justifyContent: "center",
    shadowColor: Colors.primary[700],
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  micBtnActive: { backgroundColor: Colors.semantic.error },
  nextBtn: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: Colors.primary[500],
    paddingHorizontal: 28, paddingVertical: 14,
    borderRadius: 14,
  },
  nextBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: Colors.white },
  completedIcon: { marginBottom: 8 },
  completedTitle: { fontSize: 28, fontFamily: "Inter_700Bold", color: Colors.neutral[900] },
  completedSub: { fontSize: 15, fontFamily: "Inter_400Regular", color: Colors.neutral[500], textAlign: "center" },
  scoreCard: {
    backgroundColor: Colors.primary[50], borderRadius: 20,
    paddingVertical: 24, paddingHorizontal: 48,
    alignItems: "center",
    borderWidth: 2, borderColor: Colors.primary[200],
  },
  scoreCardValue: { fontSize: 52, fontFamily: "Inter_700Bold", color: Colors.primary[600] },
  scoreCardLabel: { fontSize: 14, fontFamily: "Inter_500Medium", color: Colors.neutral[500], marginTop: 4 },
  scoreGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "center" },
  scoreItem: {
    width: 64, paddingVertical: 10,
    backgroundColor: Colors.white, borderRadius: 12,
    alignItems: "center", gap: 4,
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  scoreItemLabel: { fontSize: 12, fontFamily: "Inter_500Medium", color: Colors.neutral[400] },
  scoreItemVal: { fontSize: 16, fontFamily: "Inter_700Bold" },
  doneBtn: {
    backgroundColor: Colors.primary[500],
    paddingHorizontal: 36, paddingVertical: 16,
    borderRadius: 14, marginTop: 8,
  },
  doneBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: Colors.white },
});
