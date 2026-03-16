import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
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

import { useInterviews } from "@/context/InterviewContext";
import { useTheme } from "@/hooks/useTheme";

const QUESTIONS = [
  "Tell me about yourself and your professional background.",
  "Describe a challenging project you worked on and how you handled it.",
  "What are your greatest strengths and how do they apply to this role?",
  "Where do you see yourself in five years?",
  "Tell me about a time you had to work under pressure.",
  "How do you handle conflict with a team member?",
  "What motivates you in your work?",
  "Describe a situation where you demonstrated leadership.",
];

const FEEDBACK_TIPS = [
  "Strong response! You clearly articulated your experience using specific examples. Consider adding a quantifiable outcome next time to make it even stronger.",
  "Good use of the STAR method. Your answer was concise and relevant. Try to mention the impact of your actions more explicitly.",
  "Excellent communication. You demonstrated self-awareness and growth mindset. Consider adding specific metrics to your example.",
  "Well-structured answer. Good use of concrete details. Next time, connect it more directly to the role you're applying for.",
];

type Phase = "ready" | "recording" | "thinking" | "answer" | "completed";

export default function InterviewSessionScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { addSession } = useInterviews();
  const [phase, setPhase] = useState<Phase>("ready");
  const [currentQ, setCurrentQ] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [sessionStart] = useState(Date.now());
  const [currentFeedback, setCurrentFeedback] = useState("");
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const webTop = Platform.OS === "web" ? 67 : 0;
  const totalQuestions = 5;

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  useEffect(() => {
    if (phase === "recording") {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
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
      if (timerRef.current) clearInterval(timerRef.current);
      setPhase("thinking");
      setCurrentFeedback(FEEDBACK_TIPS[Math.floor(Math.random() * FEEDBACK_TIPS.length)]);
      setTimeout(() => setPhase("answer"), 1800);
    }
  }, [phase]);

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const score = Math.floor(Math.random() * 28) + 68;
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

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const progress = (currentQ / totalQuestions) * 100;

  // Completed screen
  if (phase === "completed") {
    const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const scoreColor = avgScore >= 80 ? theme.success : avgScore >= 65 ? theme.warning : theme.error;
    return (
      <View style={[styles.root, { backgroundColor: theme.bg }]}>
        <View style={[styles.completedHeader, { paddingTop: insets.top + webTop + 14 }]}>
          <Pressable
            style={[styles.iconBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => router.back()}
          >
            <Feather name="x" size={18} color={theme.text} />
          </Pressable>
        </View>
        <ScrollView
          contentContainerStyle={[styles.completedContent, { paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.completedBadge, { backgroundColor: theme.successMuted }]}>
            <Feather name="check-circle" size={40} color={theme.success} />
          </View>
          <Text style={[styles.completedTitle, { color: theme.text }]}>Session Complete</Text>
          <Text style={[styles.completedSub, { color: theme.textSecondary }]}>
            Great work on your interview practice
          </Text>

          {/* Score Display */}
          <View style={[styles.scoreCircle, { borderColor: scoreColor + "40", backgroundColor: scoreColor + "10" }]}>
            <Text style={[styles.scoreCircleVal, { color: scoreColor }]}>{avgScore}%</Text>
            <Text style={[styles.scoreCircleLabel, { color: theme.textTertiary }]}>Overall Score</Text>
          </View>

          {/* Per-question scores */}
          <View style={[styles.scoreGrid, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.scoreGridTitle, { color: theme.text }]}>Question Breakdown</Text>
            <View style={styles.scoreGridRow}>
              {scores.map((s, i) => {
                const c = s >= 80 ? theme.success : s >= 65 ? theme.warning : theme.error;
                return (
                  <View key={i} style={styles.scoreGridItem}>
                    <View style={{ flex: 1, justifyContent: "flex-end", paddingBottom: 4 }}>
                      <View style={[styles.scoreBar, { height: `${s}%` as any, backgroundColor: c + "35" }]}>
                        <View style={[styles.scoreBarFill, { height: "60%", backgroundColor: c }]} />
                      </View>
                    </View>
                    <Text style={[styles.scoreGridQ, { color: theme.textTertiary }]}>Q{i + 1}</Text>
                    <Text style={[styles.scoreGridVal, { color: c }]}>{s}%</Text>
                  </View>
                );
              })}
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [styles.doneBtn, { backgroundColor: theme.primary, opacity: pressed ? 0.88 : 1 }]}
            onPress={() => router.back()}
          >
            <Text style={styles.doneBtnText}>Back to Home</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.retryBtn, { borderColor: theme.border, opacity: pressed ? 0.7 : 1 }]}
            onPress={() => {
              setPhase("ready");
              setCurrentQ(0);
              setScores([]);
              setElapsed(0);
            }}
          >
            <Feather name="refresh-cw" size={15} color={theme.textSecondary} />
            <Text style={[styles.retryBtnText, { color: theme.textSecondary }]}>Practice Again</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + webTop + 12, backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <Pressable
          style={[styles.iconBtn, { backgroundColor: theme.bgSecondary }]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back(); }}
        >
          <Feather name="x" size={18} color={theme.text} />
        </Pressable>

        <View style={styles.progressWrap}>
          <View style={[styles.progressTrack, { backgroundColor: theme.bgSecondary }]}>
            <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: theme.primary }]} />
          </View>
          <Text style={[styles.progressText, { color: theme.textTertiary }]}>{currentQ}/{totalQuestions}</Text>
        </View>

        <View style={[styles.timerBadge, { backgroundColor: phase === "recording" ? theme.errorMuted : theme.bgSecondary }]}>
          <Feather name="clock" size={12} color={phase === "recording" ? theme.error : theme.textTertiary} />
          <Text style={[styles.timerText, { color: phase === "recording" ? theme.error : theme.textTertiary }]}>
            {formatTime(elapsed)}
          </Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 160 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Module tag */}
        <View style={[styles.moduleTag, { backgroundColor: theme.moduleHRLight }]}>
          <Feather name="users" size={13} color={theme.moduleHR} />
          <Text style={[styles.moduleTagText, { color: theme.moduleHR }]}>HR Interview</Text>
        </View>

        {/* Question */}
        <View style={styles.questionSection}>
          <Text style={[styles.qNum, { color: theme.textTertiary }]}>Question {currentQ + 1}</Text>
          <Text style={[styles.question, { color: theme.text }]}>
            {QUESTIONS[currentQ % QUESTIONS.length]}
          </Text>
        </View>

        {/* Tips */}
        {phase === "ready" && (
          <View style={[styles.tipCard, { backgroundColor: theme.primaryLight, borderColor: theme.primary + "20" }]}>
            <Feather name="info" size={15} color={theme.primary} />
            <Text style={[styles.tipText, { color: theme.primary }]}>
              Use the STAR method: Situation, Task, Action, Result
            </Text>
          </View>
        )}

        {/* Thinking */}
        {phase === "thinking" && (
          <View style={[styles.thinkingCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.thinkingDot, { backgroundColor: theme.primaryMuted }]}>
              <Feather name="cpu" size={16} color={theme.primary} />
            </View>
            <View>
              <Text style={[styles.thinkingTitle, { color: theme.text }]}>Analyzing response...</Text>
              <Text style={[styles.thinkingSub, { color: theme.textSecondary }]}>AI is reviewing your answer</Text>
            </View>
          </View>
        )}

        {/* AI Feedback */}
        {phase === "answer" && (
          <View style={[styles.feedbackCard, { backgroundColor: theme.card, borderColor: theme.border, borderLeftColor: theme.success }]}>
            <View style={styles.feedbackHeader}>
              <View style={[styles.feedbackIcon, { backgroundColor: theme.successMuted }]}>
                <Feather name="zap" size={14} color={theme.success} />
              </View>
              <Text style={[styles.feedbackTitle, { color: theme.text }]}>AI Feedback</Text>
            </View>
            <Text style={[styles.feedbackText, { color: theme.textSecondary }]}>{currentFeedback}</Text>
            <View style={styles.feedbackTags}>
              {["Clear Communication", "Strong Examples"].map((t) => (
                <View key={t} style={[styles.feedbackTag, { backgroundColor: theme.successMuted }]}>
                  <Feather name="check" size={10} color={theme.success} />
                  <Text style={[styles.feedbackTagText, { color: theme.success }]}>{t}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Controls */}
      <View style={[styles.controls, { backgroundColor: theme.card, borderTopColor: theme.border, paddingBottom: insets.bottom + 12 }]}>
        {phase === "answer" ? (
          <Pressable
            style={({ pressed }) => [styles.nextBtn, { backgroundColor: theme.primary, opacity: pressed ? 0.88 : 1 }]}
            onPress={handleNext}
          >
            <Text style={styles.nextBtnText}>
              {currentQ + 1 >= totalQuestions ? "Finish Session" : "Next Question"}
            </Text>
            <Feather name="arrow-right" size={18} color="#fff" />
          </Pressable>
        ) : (
          <View style={styles.micSection}>
            <Text style={[styles.micHint, { color: phase === "recording" ? theme.error : theme.textTertiary }]}>
              {phase === "ready" && "Tap the microphone to begin"}
              {phase === "recording" && "Recording — tap again to stop"}
              {phase === "thinking" && "Processing your response..."}
            </Text>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <LinearGradient
                colors={phase === "recording"
                  ? [theme.error, "#C72B2B"]
                  : [theme.primary, theme.primaryDark]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={styles.micBtn}
              >
                <Pressable style={styles.micBtnInner} onPress={handleMicPress} disabled={phase === "thinking"}>
                  <Feather
                    name={phase === "recording" ? "square" : "mic"}
                    size={28} color="#fff"
                  />
                </Pressable>
              </LinearGradient>
            </Animated.View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 16, paddingBottom: 14,
    borderBottomWidth: 1,
  },
  iconBtn: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  progressWrap: { flex: 1, gap: 4 },
  progressTrack: { height: 5, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3 },
  progressText: { fontSize: 11, fontFamily: "Inter_500Medium", textAlign: "right" },
  timerBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10,
  },
  timerText: { fontSize: 13, fontFamily: "Inter_700Bold" },
  content: { padding: 20, gap: 20 },
  moduleTag: {
    flexDirection: "row", alignItems: "center", gap: 6,
    alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10,
  },
  moduleTagText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  questionSection: { gap: 8 },
  qNum: { fontSize: 13, fontFamily: "Inter_500Medium" },
  question: { fontSize: 22, fontFamily: "Inter_700Bold", lineHeight: 32, letterSpacing: -0.3 },
  tipCard: {
    flexDirection: "row", alignItems: "flex-start", gap: 10,
    borderRadius: 14, padding: 14, borderWidth: 1,
  },
  tipText: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium", lineHeight: 20 },
  thinkingCard: {
    flexDirection: "row", alignItems: "center", gap: 14,
    borderRadius: 14, padding: 16, borderWidth: 1,
  },
  thinkingDot: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  thinkingTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  thinkingSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  feedbackCard: {
    borderRadius: 16, borderWidth: 1, borderLeftWidth: 3, padding: 16, gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  feedbackHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  feedbackIcon: { width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  feedbackTitle: { fontSize: 15, fontFamily: "Inter_700Bold" },
  feedbackText: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22 },
  feedbackTags: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  feedbackTag: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  feedbackTagText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  controls: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    paddingHorizontal: 20, paddingTop: 16,
    borderTopWidth: 1, alignItems: "center",
  },
  micSection: { alignItems: "center", gap: 12 },
  micHint: { fontSize: 13, fontFamily: "Inter_400Regular" },
  micBtn: { width: 76, height: 76, borderRadius: 38, overflow: "hidden" },
  micBtnInner: { flex: 1, alignItems: "center", justifyContent: "center" },
  nextBtn: {
    flexDirection: "row", alignItems: "center", gap: 10,
    height: 52, paddingHorizontal: 28, borderRadius: 15, width: "100%",
    justifyContent: "center",
  },
  nextBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#fff" },
  // Completed
  completedHeader: { paddingHorizontal: 16, paddingBottom: 12 },
  completedContent: { padding: 24, alignItems: "center", gap: 16 },
  completedBadge: { width: 80, height: 80, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  completedTitle: { fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  completedSub: { fontSize: 15, fontFamily: "Inter_400Regular", textAlign: "center" },
  scoreCircle: {
    width: 160, height: 160, borderRadius: 80,
    borderWidth: 3, alignItems: "center", justifyContent: "center", gap: 4,
  },
  scoreCircleVal: { fontSize: 44, fontFamily: "Inter_700Bold", letterSpacing: -1 },
  scoreCircleLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  scoreGrid: {
    borderRadius: 20, borderWidth: 1, padding: 16, gap: 12, width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  scoreGridTitle: { fontSize: 14, fontFamily: "Inter_700Bold" },
  scoreGridRow: { flexDirection: "row", gap: 6, height: 80, justifyContent: "center" },
  scoreGridItem: { flex: 1, alignItems: "center", gap: 3 },
  scoreBar: { width: "100%", borderRadius: 4, justifyContent: "flex-end", overflow: "hidden" },
  scoreBarFill: { width: "100%", borderRadius: 2 },
  scoreGridQ: { fontSize: 10, fontFamily: "Inter_400Regular" },
  scoreGridVal: { fontSize: 12, fontFamily: "Inter_700Bold" },
  doneBtn: { height: 52, borderRadius: 15, paddingHorizontal: 40, alignItems: "center", justifyContent: "center", width: "100%" },
  doneBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#fff" },
  retryBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    borderWidth: 1.5, height: 48, borderRadius: 15, paddingHorizontal: 28, width: "100%", justifyContent: "center",
  },
  retryBtnText: { fontSize: 15, fontFamily: "Inter_500Medium" },
});
