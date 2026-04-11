import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { GlassCard } from "@/components/GlassCard";
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

function WaveformBars({ active }: { active: boolean }) {
  const bars = [0.4, 0.7, 1, 0.6, 0.9, 0.5, 0.8, 0.45, 0.75, 1, 0.55, 0.8];
  const anims = useRef(bars.map((h) => new Animated.Value(h))).current;

  useEffect(() => {
    if (!active) {
      bars.forEach((h, i) => Animated.spring(anims[i], { toValue: h * 0.25, useNativeDriver: false, damping: 20 }).start());
      return;
    }
    const loops = anims.map((anim, i) => {
      const randH = () => 0.2 + Math.random() * 0.8;
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: randH(), duration: 180 + i * 30, useNativeDriver: false, easing: Easing.sin }),
          Animated.timing(anim, { toValue: randH(), duration: 180 + i * 20, useNativeDriver: false, easing: Easing.sin }),
        ])
      );
      loop.start();
      return loop;
    });
    return () => loops.forEach((l) => l.stop());
  }, [active]);

  return (
    <View style={waveStyles.container}>
      {anims.map((anim, i) => (
        <Animated.View
          key={i}
          style={[
            waveStyles.bar,
            {
              height: anim.interpolate({ inputRange: [0, 1], outputRange: [4, 30] }),
              opacity: active ? 1 : 0.3,
              backgroundColor: active ? "#EF4444" : "rgba(255,255,255,0.4)",
            },
          ]}
        />
      ))}
    </View>
  );
}

const waveStyles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "center", gap: 5, height: 34 },
  bar: { width: 3.5, borderRadius: 2 },
});

export default function InterviewSessionScreen() {
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
  const totalQuestions = 5;

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  useEffect(() => {
    if (phase === "recording") {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.05, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => { if (timerRef.current) clearInterval(timerRef.current); pulse.stop(); pulseAnim.setValue(1); };
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
    const score = Math.floor(Math.random() * 25) + 70;
    const newScores = [...scores, score];
    setScores(newScores);
    setElapsed(0);
    if (currentQ + 1 >= totalQuestions) {
      const avgScore = Math.round(newScores.reduce((a, b) => a + b, 0) / newScores.length);
      const duration = Math.floor((Date.now() - sessionStart) / 1000);
      addSession({ module: "hr", date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), duration, score: avgScore, totalQuestions, answeredQuestions: newScores.length, topic: "AI Interview Session" });
      setPhase("completed");
    } else {
      setCurrentQ((q) => q + 1);
      setPhase("ready");
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  if (phase === "completed") {
    const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const scoreColor = avgScore >= 80 ? theme.success : avgScore >= 65 ? theme.warning : theme.error;
    return (
      <View style={[styles.root, { backgroundColor: theme.bg }]}>
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.completedContent}>
            <View style={styles.completedHeader}>
              <Text style={[styles.completedSub, { color: theme.textSecondary }]}>SESSION COMPLETE</Text>
              <Text style={[styles.completedTitle, { color: theme.text }]}>Results</Text>
            </View>

            <GlassCard borderRadius={40} padding={40} style={styles.scoreGlass}>
              <View style={[styles.scoreRing, { borderColor: scoreColor + "20" }]}>
                <Text style={[styles.scoreResult, { color: scoreColor }]}>{avgScore}%</Text>
                <Text style={[styles.scoreResultLabel, { color: theme.textSecondary }]}>AV SCORE</Text>
              </View>
              <Text style={[styles.feedbackSummary, { color: theme.text }]}>
                You demonstrated consistent performance across all questions. Great work on articulation!
              </Text>
            </GlassCard>

            <View style={styles.actions}>
              <Pressable
                style={[styles.primaryBtn, { backgroundColor: theme.primary }]}
                onPress={() => router.back()}
              >
                <Text style={styles.primaryBtnText}>Finish Session</Text>
              </Pressable>
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <GlassCard borderRadius={15} padding={10}>
              <Feather name="chevron-left" size={20} color={theme.text} />
            </GlassCard>
          </Pressable>
          <View style={styles.headerStatus}>
            <View style={styles.statusPill}>
              <View style={[styles.statusDot, { backgroundColor: phase === "recording" ? "#EF4444" : theme.primary }]} />
              <Text style={[styles.statusText, { color: theme.textSecondary }]}>
                {phase.toUpperCase()}
              </Text>
            </View>
            <Text style={[styles.timer, { color: theme.text }]}>{formatTime(elapsed)}</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Question chamber */}
          <GlassCard borderRadius={32} padding={28} tintColor={theme.primary + "10"}>
            <Text style={[styles.qMeta, { color: theme.textTertiary }]}>QUESTION {currentQ + 1} OF {totalQuestions}</Text>
            <Text style={[styles.question, { color: theme.text }]}>
              {QUESTIONS[currentQ % QUESTIONS.length]}
            </Text>
          </GlassCard>

          {/* Active Area */}
          <View style={styles.activeArea}>
            {phase === "ready" && (
              <GlassCard borderRadius={24} padding={20}>
                <Text style={[styles.hintTitle, { color: theme.text }]}>STAR Strategy</Text>
                <Text style={[styles.hintBody, { color: theme.textSecondary }]}>
                   Focus on the Situation, Task, Action, and Result in your response for a better score.
                </Text>
              </GlassCard>
            )}

            {phase === "thinking" && (
              <GlassCard borderRadius={24} padding={32} style={styles.thinkingCard}>
                <ActivityIndicator color={theme.primary} />
                <Text style={[styles.thinkingText, { color: theme.textSecondary }]}>AI is analyzing your response...</Text>
              </GlassCard>
            )}

            {phase === "answer" && (
              <GlassCard borderRadius={24} padding={20} tintColor={theme.success + "15"}>
                <View style={styles.feedbackHeader}>
                  <View style={[styles.feedbackIcon, { backgroundColor: theme.success + "20" }]}>
                    <Feather name="zap" size={16} color={theme.success} />
                  </View>
                  <Text style={[styles.feedbackTitle, { color: theme.success }]}>AI Insights</Text>
                </View>
                <Text style={[styles.feedbackBody, { color: theme.textSecondary }]}>{currentFeedback}</Text>
                <Pressable
                  style={[styles.nextBtn, { backgroundColor: theme.primary }]}
                  onPress={handleNext}
                >
                  <Text style={styles.nextBtnText}>Continue Session</Text>
                  <Feather name="arrow-right" size={16} color="#fff" />
                </Pressable>
              </GlassCard>
            )}
          </View>
        </ScrollView>

        {/* Mic Controls */}
        <View style={styles.controls}>
          <View style={styles.waveWrap}>
            <WaveformBars active={phase === "recording"} />
          </View>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Pressable
              style={({ pressed }) => [
                styles.micBtn,
                { backgroundColor: phase === "recording" ? "#EF4444" : theme.primary, opacity: pressed ? 0.9 : 1 }
              ]}
              onPress={handleMicPress}
              disabled={phase === "thinking" || phase === "answer"}
            >
              <Feather name={phase === "recording" ? "square" : "mic"} size={28} color="#fff" />
            </Pressable>
          </Animated.View>
          <Text style={[styles.micHint, { color: theme.textTertiary }]}>
            {phase === "ready" ? "Tap to record" : phase === "recording" ? "Tap to end recording" : ""}
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 24 },
  backBtn: {},
  headerStatus: { alignItems: "flex-end", gap: 2 },
  statusPill: { flexDirection: "row", alignItems: "center", gap: 6, opacity: 0.8 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  timer: { fontSize: 20, fontWeight: "800" },
  content: { padding: 24, paddingBottom: 150 },
  qMeta: { fontSize: 11, fontWeight: "800", letterSpacing: 1, marginBottom: 12 },
  question: { fontSize: 26, fontWeight: "800", lineHeight: 36, letterSpacing: -0.5 },
  activeArea: { marginTop: 24 },
  hintTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  hintBody: { fontSize: 14, lineHeight: 22, opacity: 0.8 },
  thinkingCard: { alignItems: "center", gap: 16 },
  thinkingText: { fontSize: 14, fontWeight: "600" },
  feedbackHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  feedbackIcon: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  feedbackTitle: { fontSize: 16, fontWeight: "800" },
  feedbackBody: { fontSize: 15, lineHeight: 24, opacity: 0.8 },
  nextBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 14, borderRadius: 20, marginTop: 20 },
  nextBtnText: { color: "#fff", fontSize: 15, fontWeight: "800" },
  controls: { position: "absolute", bottom: 40, left: 0, right: 0, alignItems: "center", gap: 16 },
  waveWrap: { marginBottom: 10 },
  micBtn: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 15 },
  micHint: { fontSize: 12, fontWeight: "600" },
  // Completed
  completedContent: { padding: 32, alignItems: "stretch" },
  completedHeader: { marginBottom: 32 },
  completedSub: { fontSize: 12, fontWeight: "800", letterSpacing: 1 },
  completedTitle: { fontSize: 40, fontWeight: "800", letterSpacing: -1 },
  scoreGlass: { alignItems: "center", gap: 24 },
  scoreRing: { width: 180, height: 180, borderRadius: 90, borderWidth: 10, alignItems: "center", justifyContent: "center" },
  scoreResult: { fontSize: 50, fontWeight: "800", letterSpacing: -2 },
  scoreResultLabel: { fontSize: 10, fontWeight: "700" },
  feedbackSummary: { fontSize: 15, textAlign: "center", lineHeight: 24, opacity: 0.8 },
  actions: { marginTop: 40 },
  primaryBtn: { paddingVertical: 16, borderRadius: 24, alignItems: "center" },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
});
