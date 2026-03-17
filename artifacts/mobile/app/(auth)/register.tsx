import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/hooks/useTheme";

function InputField({
  icon, label, placeholder, value, onChangeText, secure, keyboard, capitalize, right,
}: {
  icon: string; label: string; placeholder: string; value: string;
  onChangeText: (t: string) => void; secure?: boolean;
  keyboard?: any; capitalize?: any; right?: React.ReactNode;
}) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.fieldWrap}>
      <Text style={[styles.fieldLabel, { color: theme.dark ? "rgba(255,255,255,0.55)" : theme.textSecondary }]}>
        {label}
      </Text>
      <View style={[styles.inputBox, {
        backgroundColor: theme.dark ? "rgba(255,255,255,0.06)" : theme.inputBg,
        borderColor: focused ? theme.primary : theme.dark ? "rgba(255,255,255,0.1)" : theme.border,
      }]}>
        <Feather name={icon as any} size={17}
          color={focused ? theme.primary : theme.dark ? "rgba(255,255,255,0.35)" : theme.iconDefault}
          style={styles.inputIcon} />
        <TextInput
          style={[styles.inputText, { color: theme.text }]}
          placeholder={placeholder}
          placeholderTextColor={theme.dark ? "rgba(255,255,255,0.2)" : theme.placeholder}
          value={value} onChangeText={onChangeText}
          secureTextEntry={secure} keyboardType={keyboard}
          autoCapitalize={capitalize ?? "none"}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        />
        {right}
      </View>
    </View>
  );
}

function PasswordStrength({ pw }: { pw: string }) {
  const theme = useTheme();
  if (!pw) return null;
  const s = [pw.length >= 8, /[A-Z]/.test(pw), /[0-9]/.test(pw), /[^A-Za-z0-9]/.test(pw)].filter(Boolean).length;
  const colors = [theme.error, theme.warning, "#F59E0B", theme.success];
  const labels = ["Too short", "Weak", "Good", "Strong"];
  const c = colors[s - 1] ?? theme.border;
  return (
    <View style={{ gap: 6, marginTop: 4 }}>
      <View style={{ flexDirection: "row", gap: 4 }}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={{ flex: 1, height: 3, borderRadius: 2, backgroundColor: i < s ? c : (theme.dark ? "rgba(255,255,255,0.1)" : theme.border) }} />
        ))}
      </View>
      <Text style={{ fontSize: 11, fontFamily: "Inter_500Medium", color: c }}>{labels[s - 1] ?? ""}</Text>
    </View>
  );
}

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const webTop = Platform.OS === "web" ? 67 : 0;

  const btnScale = useSharedValue(1);
  const btnStyle = useAnimatedStyle(() => ({ transform: [{ scale: btnScale.value }] }));

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password || !confirm) { setError("Please fill in all fields"); return; }
    if (password !== confirm) { setError("Passwords do not match"); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    if (!agreed) { setError("Please accept the Terms & Privacy Policy"); return; }
    setError("");
    setLoading(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await register(name.trim(), email.trim(), password);
      router.replace("/(tabs)");
    } catch {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const bg = theme.dark
    ? ["#060C1A", "#0D1B38", "#091427"] as const
    : ["#EBF4FF", "#F4F6FB", "#EEF1F8"] as const;

  return (
    <LinearGradient colors={bg} style={styles.root} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: insets.top + webTop + 20, paddingBottom: insets.bottom + 48 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Pressable style={[styles.backBtn, { backgroundColor: theme.dark ? "rgba(255,255,255,0.07)" : theme.card, borderColor: theme.dark ? "rgba(255,255,255,0.1)" : theme.border }]} onPress={() => router.back()}>
            <Feather name="arrow-left" size={18} color={theme.text} />
          </Pressable>

          <View style={styles.heading}>
            <Text style={[styles.headingTitle, { color: theme.text }]}>Create account</Text>
            <Text style={[styles.headingSub, { color: theme.dark ? "rgba(255,255,255,0.45)" : theme.textSecondary }]}>
              Join thousands mastering their interviews
            </Text>
          </View>

          <View style={[styles.card, {
            backgroundColor: theme.dark ? "rgba(255,255,255,0.05)" : theme.card,
            borderColor: theme.dark ? "rgba(255,255,255,0.08)" : theme.border,
          }]}>
            {!!error && (
              <View style={[styles.errorRow, { backgroundColor: theme.errorMuted }]}>
                <Feather name="alert-circle" size={14} color={theme.error} />
                <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
              </View>
            )}

            <InputField icon="user" label="Full Name" placeholder="Jane Smith" value={name} onChangeText={setName} capitalize="words" />
            <InputField icon="mail" label="Email address" placeholder="you@example.com" value={email} onChangeText={setEmail} keyboard="email-address" />
            <View>
              <InputField
                icon="lock" label="Password" placeholder="Min. 8 characters"
                value={password} onChangeText={setPassword} secure={!showPw}
                right={<Pressable onPress={() => setShowPw(!showPw)} style={styles.eyeBtn} hitSlop={8}>
                  <Feather name={showPw ? "eye-off" : "eye"} size={17} color={theme.dark ? "rgba(255,255,255,0.3)" : theme.iconDefault} />
                </Pressable>}
              />
              <PasswordStrength pw={password} />
            </View>
            <InputField
              icon={confirm && confirm === password ? "check-circle" : "lock"}
              label="Confirm Password" placeholder="Re-enter password"
              value={confirm} onChangeText={setConfirm} secure={!showPw}
            />

            <Pressable style={styles.agreeRow} onPress={() => setAgreed(!agreed)}>
              <View style={[styles.checkbox, { borderColor: agreed ? theme.primary : (theme.dark ? "rgba(255,255,255,0.2)" : theme.border), backgroundColor: agreed ? theme.primary : "transparent" }]}>
                {agreed && <Feather name="check" size={10} color="#fff" />}
              </View>
              <Text style={[styles.agreeText, { color: theme.dark ? "rgba(255,255,255,0.5)" : theme.textSecondary }]}>
                I agree to the{" "}
                <Text style={{ color: theme.primary, fontFamily: "Inter_600SemiBold" }}>Terms of Service</Text>
                {" "}and{" "}
                <Text style={{ color: theme.primary, fontFamily: "Inter_600SemiBold" }}>Privacy Policy</Text>
              </Text>
            </Pressable>

            <Animated.View style={btnStyle}>
              <Pressable
                onPressIn={() => { btnScale.value = withSpring(0.97, { damping: 20 }); }}
                onPressOut={() => { btnScale.value = withSpring(1, { damping: 20 }); }}
                onPress={handleRegister}
                disabled={loading}
                style={styles.primaryBtnOuter}
              >
                <LinearGradient
                  colors={["#2563EB", "#1D4ED8"]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={styles.primaryBtn}
                >
                  {loading
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.primaryBtnText}>Create Account</Text>}
                </LinearGradient>
              </Pressable>
            </Animated.View>
          </View>

          <Pressable style={styles.signinRow} onPress={() => router.back()}>
            <Text style={[styles.signinText, { color: theme.dark ? "rgba(255,255,255,0.45)" : theme.textSecondary }]}>Already have an account? </Text>
            <Text style={[styles.signinLink, { color: theme.primary }]}>Sign In</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 24, flexGrow: 1 },
  backBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center", marginBottom: 24 },
  heading: { marginBottom: 24 },
  headingTitle: { fontSize: 30, fontFamily: "Inter_700Bold", letterSpacing: -0.6 },
  headingSub: { fontSize: 15, fontFamily: "Inter_400Regular", marginTop: 6 },
  card: {
    borderRadius: 24, borderWidth: 1, padding: 20, gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15, shadowRadius: 24, elevation: 8,
    marginBottom: 20,
  },
  errorRow: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 10, padding: 12 },
  errorText: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1 },
  fieldWrap: { gap: 7 },
  fieldLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", letterSpacing: 0.3 },
  inputBox: { flexDirection: "row", alignItems: "center", borderRadius: 14, borderWidth: 1.5, height: 52 },
  inputIcon: { paddingLeft: 14, paddingRight: 10 },
  inputText: { flex: 1, height: "100%", fontSize: 15, fontFamily: "Inter_400Regular", paddingRight: 14 },
  eyeBtn: { padding: 14 },
  agreeRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  checkbox: { width: 20, height: 20, borderRadius: 5, borderWidth: 1.5, alignItems: "center", justifyContent: "center", marginTop: 1 },
  agreeText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20 },
  primaryBtnOuter: { borderRadius: 14, overflow: "hidden" },
  primaryBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 52 },
  primaryBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
  signinRow: { flexDirection: "row", justifyContent: "center", alignItems: "center" },
  signinText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  signinLink: { fontSize: 14, fontFamily: "Inter_700Bold" },
});
