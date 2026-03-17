import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
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
              height: anim.interpolate({ inputRange: [0, 1], outputRange: [4, 36] }),
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
  container: { flexDirection: "row", alignItems: "center", gap: 5, height: 40 },
  bar: { width: 4, borderRadius: 2 },
});

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
  const ringAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const webTop = Platform.OS === "web" ? 67 : 0;
  const totalQuestions = 5;

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  useEffect(() => {
    if (phase === "recording") {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.12, duration: 700, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        ])
      );
      const ring = Animated.loop(
        Animated.sequence([
          Animated.timing(ringAnim, { toValue: 1.35, duration: 900, useNativeDriver: true }),
          Animated.timing(ringAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
        ])
      );
      pulse.start(); ring.start();
      return () => { if (timerRef.current) clearInterval(timerRef.current); pulse.stop(); ring.stop(); pulseAnim.setValue(1); ringAnim.setValue(1); };
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
      setTimeout(() => setPhase("answer"), 2000);
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
      addSession({ module: "hr", date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), duration, score: avgScore, totalQuestions, answeredQuestions: newScores.length, topic: "HR Interview Practice" });
      setPhase("completed");
    } else {
      setCurrentQ((q) => q + 1);
      setPhase("ready");
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
  const progress = currentQ / totalQuestions;

  // Completed screen
  if (phase === "completed") {
    const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const scoreColor = avgScore >= 80 ? theme.success : avgScore >= 65 ? "#F59E0B" : theme.error;
    const grade = avgScore >= 80 ? "Excellent" : avgScore >= 65 ? "Good" : "Needs Work";
    return (
      <View style={[styles.root, { backgroundColor: theme.bg }]}>
        <LinearGradient
          colors={theme.dark ? ["#060C1A", "#0D1B38"] : ["#F0F4FF", "#FFFFFF"]}
          style={[styles.completedHero, { paddingTop: insets.top + webTop + 16 }]}
        >
          <Pressable style={[styles.closeBtn, { backgroundColor: theme.dark ? "rgba(255,255,255,0.1)" : theme.card }]} onPress={() => router.back()}>
            <Feather name="x" size={18} color={theme.dark ? "#fff" : theme.text} />
          </Pressable>
          <View style={styles.scoreBadge}>
            <View style={[styles.scoreBadgeRing, { borderColor: scoreColor + "40" }]}>
              <View style={[styles.scoreBadgeInner, { backgroundColor: scoreColor + "15" }]}>
                <Text style={[styles.scoreBigVal, { color: scoreColor }]}>{avgScore}</Text>
                <Text style={[styles.scoreBigPct, { color: scoreColor }]}>%</Text>
              </View>
            </View>
            <Text style={[styles.gradeText, { color: theme.dark ? "rgba(255,255,255,0.9)" : theme.text }]}>{grade}</Text>
            <Text style={[styles.completedSub, { color: theme.dark ? "rgba(255,255,255,0.5)" : theme.textSecondary }]}>
              {totalQuestions} questions answered
            </Text>
          </View>
        </LinearGradient>

        <ScrollView contentContainerStyle={[styles.completedList, { paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false}>
          {/* Question breakdown */}
          <View style={[styles.breakdownCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.breakdownTitle, { color: theme.text }]}>Question Scores</Text>
            <View style={styles.barsRow}>
              {scores.map((s, i) => {
                const c = s >= 80 ? theme.success : s >= 65 ? "#F59E0B" : theme.error;
                return (
                  <View key={i} style={styles.barItem}>
                    <Text style={[styles.barVal, { color: c }]}>{s}</Text>
                    <View style={[styles.barTrack, { backgroundColor: theme.bgSecondary }]}>
                      <View style={[styles.barFill, { height: `${s}%` as any, backgroundColor: c }]} />
                    </View>
                    <Text style={[styles.barQ, { color: theme.textTertiary }]}>Q{i + 1}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Tips */}
          <View style={[styles.tipsCard, { backgroundColor: theme.primaryMuted, borderColor: theme.primary + "20" }]}>
            <View style={[styles.tipsIcon, { backgroundColor: theme.primary + "25" }]}>
              <Feather name="trending-up" size={18} color={theme.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.tipsTitle, { color: theme.text }]}>Keep Improving</Text>
              <Text style={[styles.tipsSub, { color: theme.textSecondary }]}>Practice daily for the best results. Each session refines your responses.</Text>
            </View>
          </View>

          {/* Buttons */}
          <Pressable
            style={({ pressed }) => [styles.doneBtn, { opacity: pressed ? 0.88 : 1 }]}
            onPress={() => router.back()}
          >
            <LinearGradient colors={["#2563EB", "#1D4ED8"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.doneBtnGrad}>
              <Text style={styles.doneBtnText}>Back to Home</Text>
            </LinearGradient>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.retryBtn, { borderColor: theme.border, backgroundColor: theme.card, opacity: pressed ? 0.7 : 1 }]}
            onPress={() => { setPhase("ready"); setCurrentQ(0); setScores([]); setElapsed(0); }}
          >
            <Feather name="refresh-cw" size={15} color={theme.textSecondary} />
            <Text style={[styles.retryBtnText, { color: theme.textSecondary }]}>Practice Again</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  const isRecording = phase === "recording";
  const isThinking = phase === "thinking";
  const isAnswer = phase === "answer";

  return (
    <View style={styles.root}>
      {/* Immersive dark header */}
      <LinearGradient
        colors={["#060C1A", "#0A1628"]}
        style={[styles.sessionHeader, { paddingTop: insets.top + webTop + 12 }]}
      >
        <View style={styles.headerRow}>
          <Pressable
            style={styles.closeBtn}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back(); }}
          >
            <Feather name="x" size={18} color="rgba(255,255,255,0.7)" />
          </Pressable>

          {/* Progress bar */}
          <View style={styles.progressSection}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${(progress) * 100}%` }]} />
            </View>
            <Text style={styles.progressText}>{currentQ}/{totalQuestions}</Text>
          </View>

          <View style={[styles.timerBadge, { backgroundColor: isRecording ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.08)" }]}>
            {isRecording && <View style={styles.recDot} />}
            <Text style={[styles.timerText, { color: isRecording ? "#EF4444" : "rgba(255,255,255,0.6)" }]}>
              {formatTime(elapsed)}
            </Text>
          </View>
        </View>

        {/* Module pill */}
        <View style={styles.modulePill}>
          <Feather name="users" size={11} color="rgba(255,255,255,0.5)" />
          <Text style={styles.modulePillText}>HR Interview · Q{currentQ + 1}</Text>
        </View>

        {/* Question */}
        <Text style={styles.questionText}>
          {QUESTIONS[currentQ % QUESTIONS.length]}
        </Text>
      </LinearGradient>

      {/* Content area */}
      <ScrollView
        style={[styles.contentArea, { backgroundColor: theme.bg }]}
        contentContainerStyle={[styles.contentScroll, { paddingBottom: insets.bottom + 180 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Ready state */}
        {phase === "ready" && (
          <View style={styles.cards}>
            <View style={[styles.starCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.starTitle, { color: theme.text }]}>STAR Method</Text>
              <View style={styles.starGrid}>
                {[
                  { letter: "S", label: "Situation", desc: "Set the context", color: "#3B82F6" },
                  { letter: "T", label: "Task", desc: "Your responsibility", color: "#8B5CF6" },
                  { letter: "A", label: "Action", desc: "Steps you took", color: "#10B981" },
                  { letter: "R", label: "Result", desc: "Measurable outcome", color: "#F59E0B" },
                ].map((item) => (
                  <View key={item.letter} style={[styles.starItem, { backgroundColor: item.color + "12" }]}>
                    <View style={[styles.starLetter, { backgroundColor: item.color }]}>
                      <Text style={styles.starLetterText}>{item.letter}</Text>
                    </View>
                    <Text style={[styles.starItemLabel, { color: theme.text }]}>{item.label}</Text>
                    <Text style={[styles.starItemDesc, { color: theme.textTertiary }]}>{item.desc}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Thinking state */}
        {isThinking && (
          <View style={[styles.thinkCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <ThinkingDots />
            <View>
              <Text style={[styles.thinkTitle, { color: theme.text }]}>Analyzing your response</Text>
              <Text style={[styles.thinkSub, { color: theme.textSecondary }]}>AI is evaluating clarity, examples & impact</Text>
            </View>
          </View>
        )}

        {/* Feedback */}
        {isAnswer && (
          <View style={styles.cards}>
            <LinearGradient
              colors={["#064E3B", "#065F46"]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.feedbackGrad}
            >
              <View style={styles.feedbackTop}>
                <View style={styles.feedbackIconWrap}>
                  <Feather name="zap" size={16} color="#34D399" />
                </View>
                <Text style={styles.feedbackTitle}>AI Feedback</Text>
              </View>
              <Text style={styles.feedbackBody}>{currentFeedback}</Text>
              <View style={styles.feedbackTags}>
                {["Clear Communication", "Strong Examples"].map((t) => (
                  <View key={t} style={styles.feedbackTagChip}>
                    <Feather name="check" size={10} color="#34D399" />
                    <Text style={styles.feedbackTagText}>{t}</Text>
                  </View>
                ))}
              </View>
            </LinearGradient>
          </View>
        )}
      </ScrollView>

      {/* Controls — always visible */}
      <View style={[styles.controls, { backgroundColor: theme.dark ? "#0A0E1A" : theme.card, borderTopColor: theme.dark ? "rgba(255,255,255,0.06)" : theme.border, paddingBottom: insets.bottom + 12 }]}>
        {isAnswer ? (
          <Pressable
            style={({ pressed }) => [styles.nextBtnOuter, { opacity: pressed ? 0.88 : 1 }]}
            onPress={handleNext}
          >
            <LinearGradient colors={["#2563EB", "#1D4ED8"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.nextBtn}>
              <Text style={styles.nextBtnText}>{currentQ + 1 >= totalQuestions ? "Finish Session" : "Next Question"}</Text>
              <Feather name="arrow-right" size={18} color="#fff" />
            </LinearGradient>
          </Pressable>
        ) : (
          <View style={styles.micArea}>
            {/* Waveform */}
            <WaveformBars active={isRecording} />

            <Text style={[styles.micHint, { color: isRecording ? "#EF4444" : isThinking ? theme.textTertiary : theme.dark ? "rgba(255,255,255,0.4)" : theme.textTertiary }]}>
              {phase === "ready" && "Tap the microphone to begin"}
              {phase === "recording" && "Recording... tap again to stop"}
              {phase === "thinking" && "Processing your response..."}
            </Text>

            {/* Mic button with ring */}
            <View style={styles.micWrapper}>
              {isRecording && (
                <Animated.View style={[styles.micRing, { transform: [{ scale: ringAnim }] }]} />
              )}
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <Pressable onPress={handleMicPress} disabled={isThinking}>
                  <LinearGradient
                    colors={isRecording ? ["#EF4444", "#DC2626"] : ["#2563EB", "#1D4ED8"]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={styles.micBtn}
                  >
                    <Feather name={isRecording ? "square" : isThinking ? "loader" : "mic"} size={28} color="#fff" />
                  </LinearGradient>
                </Pressable>
              </Animated.View>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

function ThinkingDots() {
  const dots = [useRef(new Animated.Value(0.3)).current, useRef(new Animated.Value(0.3)).current, useRef(new Animated.Value(0.3)).current];
  const theme = useTheme();
  useEffect(() => {
    const loops = dots.map((d, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 200),
          Animated.timing(d, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(d, { toValue: 0.3, duration: 400, useNativeDriver: true }),
        ])
      )
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, []);
  return (
    <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
      {dots.map((d, i) => (
        <Animated.View key={i} style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: theme.primary, opacity: d }} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  sessionHeader: {
    paddingHorizontal: 20, paddingBottom: 28, gap: 12,
    borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
  },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  closeBtn: {
    width: 36, height: 36, borderRadius: 11,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center", justifyContent: "center",
  },
  progressSection: { flex: 1, gap: 5 },
  progressTrack: { height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.12)", overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 2, backgroundColor: "#3B82F6" },
  progressText: { fontSize: 10, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.4)", textAlign: "right" },
  timerBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  recDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#EF4444" },
  timerText: { fontSize: 13, fontFamily: "Inter_700Bold" },
  modulePill: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start" },
  modulePillText: { fontSize: 12, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.4)" },
  questionText: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#fff", lineHeight: 32, letterSpacing: -0.3 },
  contentArea: { flex: 1 },
  contentScroll: { padding: 16, gap: 12 },
  cards: { gap: 12 },
  starCard: { borderRadius: 20, borderWidth: 1, padding: 18, gap: 14, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 2 },
  starTitle: { fontSize: 13, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  starGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  starItem: { width: "47%", borderRadius: 14, padding: 14, gap: 6 },
  starLetter: { width: 30, height: 30, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  starLetterText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },
  starItemLabel: { fontSize: 13, fontFamily: "Inter_700Bold" },
  starItemDesc: { fontSize: 11, fontFamily: "Inter_400Regular" },
  thinkCard: { flexDirection: "row", alignItems: "center", gap: 16, borderRadius: 18, borderWidth: 1, padding: 18, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 2 },
  thinkTitle: { fontSize: 15, fontFamily: "Inter_700Bold" },
  thinkSub: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 3 },
  feedbackGrad: { borderRadius: 20, padding: 20, gap: 12 },
  feedbackTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  feedbackIconWrap: { width: 32, height: 32, borderRadius: 10, backgroundColor: "rgba(52,211,153,0.2)", alignItems: "center", justifyContent: "center" },
  feedbackTitle: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },
  feedbackBody: { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.8)", lineHeight: 22 },
  feedbackTags: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  feedbackTagChip: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, backgroundColor: "rgba(52,211,153,0.15)" },
  feedbackTagText: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: "#34D399" },
  controls: { position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingTop: 16, borderTopWidth: 1 },
  nextBtnOuter: { borderRadius: 16, overflow: "hidden" },
  nextBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, height: 54 },
  nextBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
  micArea: { alignItems: "center", gap: 10 },
  micHint: { fontSize: 13, fontFamily: "Inter_400Regular" },
  micWrapper: { position: "relative", alignItems: "center", justifyContent: "center", width: 90, height: 90 },
  micRing: { position: "absolute", width: 90, height: 90, borderRadius: 45, backgroundColor: "rgba(239,68,68,0.2)" },
  micBtn: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", shadowColor: "#2563EB", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 10 },
  // Completed
  completedHero: { alignItems: "center", paddingHorizontal: 24, paddingBottom: 36, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, gap: 8 },
  scoreBadge: { alignItems: "center", gap: 8 },
  scoreBadgeRing: { width: 160, height: 160, borderRadius: 80, borderWidth: 3, alignItems: "center", justifyContent: "center" },
  scoreBadgeInner: { width: 140, height: 140, borderRadius: 70, alignItems: "center", justifyContent: "center", flexDirection: "row", alignItems: "center" as any },
  scoreBigVal: { fontSize: 56, fontFamily: "Inter_700Bold", letterSpacing: -2 },
  scoreBigPct: { fontSize: 24, fontFamily: "Inter_700Bold", marginTop: 12 },
  gradeText: { fontSize: 26, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  completedSub: { fontSize: 14, fontFamily: "Inter_400Regular" },
  completedList: { padding: 16, gap: 14 },
  breakdownCard: { borderRadius: 20, borderWidth: 1, padding: 18, gap: 14 },
  breakdownTitle: { fontSize: 15, fontFamily: "Inter_700Bold" },
  barsRow: { flexDirection: "row", gap: 8, height: 100, alignItems: "flex-end" },
  barItem: { flex: 1, alignItems: "center", gap: 4 },
  barVal: { fontSize: 11, fontFamily: "Inter_700Bold" },
  barTrack: { flex: 1, width: "100%", borderRadius: 6, overflow: "hidden", justifyContent: "flex-end" },
  barFill: { width: "100%", borderRadius: 6 },
  barQ: { fontSize: 10, fontFamily: "Inter_400Regular" },
  tipsCard: { flexDirection: "row", gap: 14, borderRadius: 18, borderWidth: 1, padding: 16, alignItems: "flex-start" },
  tipsIcon: { width: 40, height: 40, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  tipsTitle: { fontSize: 14, fontFamily: "Inter_700Bold", marginBottom: 3 },
  tipsSub: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20 },
  doneBtn: { borderRadius: 16, overflow: "hidden" },
  doneBtnGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", height: 54 },
  doneBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
  retryBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 1.5, height: 50, borderRadius: 16 },
  retryBtnText: { fontSize: 15, fontFamily: "Inter_500Medium" },
});
