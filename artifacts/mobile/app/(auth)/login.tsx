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
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { QlueLogo } from "@/components/QlueLogo";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/hooks/useTheme";

function InputField({
  icon,
  label,
  placeholder,
  value,
  onChangeText,
  secure,
  keyboard,
  right,
}: {
  icon: string;
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  secure?: boolean;
  keyboard?: any;
  right?: React.ReactNode;
}) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.fieldWrap}>
      <Text style={[styles.fieldLabel, { color: theme.dark ? "rgba(255,255,255,0.55)" : theme.textSecondary }]}>
        {label}
      </Text>
      <View
        style={[
          styles.inputBox,
          {
            backgroundColor: theme.dark ? "rgba(255,255,255,0.06)" : theme.inputBg,
            borderColor: focused
              ? theme.primary
              : theme.dark ? "rgba(255,255,255,0.1)" : theme.border,
          },
        ]}
      >
        <Feather
          name={icon as any}
          size={17}
          color={focused ? theme.primary : theme.dark ? "rgba(255,255,255,0.35)" : theme.iconDefault}
          style={styles.inputIcon}
        />
        <TextInput
          style={[styles.inputText, { color: theme.text }]}
          placeholder={placeholder}
          placeholderTextColor={theme.dark ? "rgba(255,255,255,0.2)" : theme.placeholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secure}
          keyboardType={keyboard}
          autoCapitalize="none"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {right}
      </View>
    </View>
  );
}

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const webTop = Platform.OS === "web" ? 67 : 0;

  const btnScale = useSharedValue(1);
  const btnAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }));

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError("Please fill in all fields");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await login(email.trim(), password);
      router.replace("/(tabs)");
    } catch {
      setError("Incorrect email or password. Try again.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
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
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: insets.top + webTop + 32, paddingBottom: insets.bottom + 48 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Brand */}
          <View style={styles.brand}>
            <QlueLogo size={80} />
            <View style={styles.brandText}>
              <Text style={[styles.brandName, { color: theme.text }]}>Qlue</Text>
              <View style={[styles.brandBadge, { backgroundColor: theme.primary + "22" }]}>
                <View style={[styles.brandDot, { backgroundColor: theme.primary }]} />
                <Text style={[styles.brandBadgeText, { color: theme.primary }]}>AI Interview Coach</Text>
              </View>
            </View>
          </View>

          {/* Heading */}
          <View style={styles.heading}>
            <Text style={[styles.headingTitle, { color: theme.text }]}>Welcome back</Text>
            <Text style={[styles.headingSub, { color: theme.dark ? "rgba(255,255,255,0.45)" : theme.textSecondary }]}>
              Sign in to continue practicing
            </Text>
          </View>

          {/* Card */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.dark ? "rgba(255,255,255,0.05)" : theme.card,
                borderColor: theme.dark ? "rgba(255,255,255,0.08)" : theme.border,
              },
            ]}
          >
            {!!error && (
              <View style={[styles.errorRow, { backgroundColor: theme.errorMuted }]}>
                <Feather name="alert-circle" size={14} color={theme.error} />
                <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
              </View>
            )}

            <InputField
              icon="mail"
              label="Email address"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboard="email-address"
            />
            <InputField
              icon="lock"
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secure={!showPw}
              right={
                <Pressable onPress={() => setShowPw(!showPw)} style={styles.eyeBtn} hitSlop={8}>
                  <Feather name={showPw ? "eye-off" : "eye"} size={17} color={theme.dark ? "rgba(255,255,255,0.3)" : theme.iconDefault} />
                </Pressable>
              }
            />

            <Pressable style={styles.forgotBtn} hitSlop={6}>
              <Text style={[styles.forgotText, { color: theme.primary }]}>Forgot password?</Text>
            </Pressable>

            <Animated.View style={btnAnimStyle}>
              <Pressable
                onPressIn={() => { btnScale.value = withSpring(0.97, { damping: 20 }); }}
                onPressOut={() => { btnScale.value = withSpring(1, { damping: 20 }); }}
                onPress={handleLogin}
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
                    : <>
                      <Text style={styles.primaryBtnText}>Sign In</Text>
                      <Feather name="arrow-right" size={17} color="#fff" />
                    </>}
                </LinearGradient>
              </Pressable>
            </Animated.View>
          </View>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: theme.dark ? "rgba(255,255,255,0.08)" : theme.border }]} />
            <Text style={[styles.dividerText, { color: theme.dark ? "rgba(255,255,255,0.25)" : theme.textTertiary }]}>or</Text>
            <View style={[styles.dividerLine, { backgroundColor: theme.dark ? "rgba(255,255,255,0.08)" : theme.border }]} />
          </View>

          <Pressable
            style={[styles.secondaryBtn, { borderColor: theme.dark ? "rgba(255,255,255,0.12)" : theme.border, backgroundColor: theme.dark ? "rgba(255,255,255,0.04)" : theme.card }]}
            onPress={() => router.push("/(auth)/register")}
          >
            <Text style={[styles.secondaryBtnText, { color: theme.dark ? "rgba(255,255,255,0.7)" : theme.textSecondary }]}>
              Don't have an account?{" "}
            </Text>
            <Text style={[styles.secondaryBtnLink, { color: theme.primary }]}>Create one</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 24, flexGrow: 1 },
  brand: { flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 40 },
  brandText: { gap: 8 },
  brandName: { fontSize: 32, fontFamily: "Inter_700Bold", letterSpacing: -0.8 },
  brandBadge: {
    flexDirection: "row", alignItems: "center", gap: 6,
    alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
  },
  brandDot: { width: 6, height: 6, borderRadius: 3 },
  brandBadgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  heading: { marginBottom: 28 },
  headingTitle: { fontSize: 30, fontFamily: "Inter_700Bold", letterSpacing: -0.6 },
  headingSub: { fontSize: 15, fontFamily: "Inter_400Regular", marginTop: 6 },
  card: {
    borderRadius: 24, borderWidth: 1, padding: 20, gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15, shadowRadius: 24, elevation: 8,
    marginBottom: 16,
  },
  errorRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
    borderRadius: 10, padding: 12,
  },
  errorText: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1 },
  fieldWrap: { gap: 8 },
  fieldLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", letterSpacing: 0.3 },
  inputBox: {
    flexDirection: "row", alignItems: "center",
    borderRadius: 14, borderWidth: 1.5, height: 52,
  },
  inputIcon: { paddingLeft: 14, paddingRight: 10 },
  inputText: { flex: 1, height: "100%", fontSize: 15, fontFamily: "Inter_400Regular", paddingRight: 14 },
  eyeBtn: { padding: 14 },
  forgotBtn: { alignSelf: "flex-end", marginTop: -6 },
  forgotText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  primaryBtnOuter: { borderRadius: 14, overflow: "hidden" },
  primaryBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, height: 52, borderRadius: 14,
  },
  primaryBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
  dividerRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  secondaryBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    height: 52, borderRadius: 14, borderWidth: 1.5,
  },
  secondaryBtnText: { fontSize: 15, fontFamily: "Inter_400Regular" },
  secondaryBtnLink: { fontSize: 15, fontFamily: "Inter_700Bold" },
});
