import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await login(email, password);
      router.replace("/(tabs)");
    } catch {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={[styles.container, { paddingTop: insets.top }]}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.logoWrap}>
            <View style={styles.logoInner}>
              <Feather name="mic" size={32} color={Colors.white} />
            </View>
          </View>
          <Text style={styles.appName}>Qlue</Text>
          <Text style={styles.tagline}>AI-Powered Interview Practice</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to continue your practice</Text>

          {!!error && (
            <View style={styles.errorBanner}>
              <Feather name="alert-circle" size={16} color={Colors.semantic.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.form}>
            <View style={styles.fieldWrapper}>
              <Text style={styles.label}>Email</Text>
              <View style={[styles.inputRow, emailFocused && styles.inputFocused]}>
                <Feather name="mail" size={18} color={emailFocused ? Colors.primary[500] : Colors.neutral[400]} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor={Colors.neutral[300]}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                />
              </View>
            </View>

            <View style={styles.fieldWrapper}>
              <Text style={styles.label}>Password</Text>
              <View style={[styles.inputRow, passwordFocused && styles.inputFocused]}>
                <Feather name="lock" size={18} color={passwordFocused ? Colors.primary[500] : Colors.neutral[400]} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="••••••••"
                  placeholderTextColor={Colors.neutral[300]}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  <Feather name={showPassword ? "eye-off" : "eye"} size={18} color={Colors.neutral[400]} />
                </Pressable>
              </View>
            </View>

            <Pressable style={styles.forgotWrap}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.loginBtn, pressed && styles.loginBtnPressed, loading && styles.loginBtnDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.loginBtnText}>Sign In</Text>
              )}
            </Pressable>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Pressable onPress={() => router.push("/(auth)/register")}>
            <Text style={styles.footerLink}>Create one</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primary[50] },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },
  header: { alignItems: "center", paddingTop: 48, paddingBottom: 32 },
  logoWrap: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: Colors.primary[500],
    alignItems: "center", justifyContent: "center",
    marginBottom: 12,
    shadowColor: Colors.primary[700],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoInner: { alignItems: "center", justifyContent: "center" },
  appName: {
    fontSize: 30, fontFamily: "Inter_700Bold",
    color: Colors.primary[700], letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 14, fontFamily: "Inter_400Regular",
    color: Colors.neutral[500], marginTop: 4,
  },
  card: {
    backgroundColor: Colors.white, borderRadius: 20,
    padding: 24,
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  title: { fontSize: 24, fontFamily: "Inter_700Bold", color: Colors.neutral[900] },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.neutral[500], marginTop: 4, marginBottom: 20 },
  errorBanner: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#FEE5E5", borderRadius: 10,
    padding: 12, marginBottom: 16,
  },
  errorText: { fontSize: 13, color: Colors.semantic.error, fontFamily: "Inter_400Regular" },
  form: { gap: 16 },
  fieldWrapper: { gap: 6 },
  label: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.neutral[700] },
  inputRow: {
    flexDirection: "row", alignItems: "center",
    borderWidth: 1.5, borderColor: Colors.neutral[200],
    borderRadius: 10, backgroundColor: Colors.neutral[50],
    height: 52,
  },
  inputFocused: { borderColor: Colors.primary[500], backgroundColor: Colors.primary[50] },
  inputIcon: { paddingLeft: 14, paddingRight: 8 },
  input: {
    flex: 1, height: "100%", paddingRight: 14,
    fontSize: 15, fontFamily: "Inter_400Regular",
    color: Colors.neutral[900],
  },
  eyeBtn: { padding: 14 },
  forgotWrap: { alignItems: "flex-end", marginTop: -4 },
  forgotText: { fontSize: 13, fontFamily: "Inter_500Medium", color: Colors.primary[500] },
  loginBtn: {
    height: 52, borderRadius: 12,
    backgroundColor: Colors.primary[500],
    alignItems: "center", justifyContent: "center",
    marginTop: 4,
  },
  loginBtnPressed: { backgroundColor: Colors.primary[600] },
  loginBtnDisabled: { backgroundColor: Colors.neutral[300] },
  loginBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: Colors.white },
  footer: {
    flexDirection: "row", justifyContent: "center",
    alignItems: "center", marginTop: 24,
  },
  footerText: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.neutral[500] },
  footerLink: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.primary[500] },
});
