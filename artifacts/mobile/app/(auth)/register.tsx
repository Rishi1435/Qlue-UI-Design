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
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/hooks/useTheme";

function FieldInput({
  icon, placeholder, value, onChangeText, secure, keyboard, capitalize, right,
}: {
  icon: string; placeholder: string; value: string;
  onChangeText: (t: string) => void; secure?: boolean;
  keyboard?: any; capitalize?: any; right?: React.ReactNode;
}) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <View style={[styles.inputWrap, {
      borderColor: focused ? theme.primary : theme.border,
      backgroundColor: focused ? theme.inputFocusBg : theme.inputBg,
    }]}>
      <Feather name={icon as any} size={17} color={focused ? theme.primary : theme.iconDefault} style={styles.inputIcon} />
      <TextInput
        style={[styles.inputField, { color: theme.text }]}
        placeholder={placeholder}
        placeholderTextColor={theme.placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secure}
        keyboardType={keyboard}
        autoCapitalize={capitalize ?? "none"}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {right}
    </View>
  );
}

function StrengthBar({ password }: { password: string }) {
  const theme = useTheme();
  const score = (() => {
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();
  if (!password) return null;
  const colors = [theme.error, theme.warning, theme.secondary, theme.success];
  const labels = ["Weak", "Fair", "Good", "Strong"];
  return (
    <View style={{ marginTop: 8, gap: 6 }}>
      <View style={{ flexDirection: "row", gap: 4 }}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={{ flex: 1, height: 3, borderRadius: 2, backgroundColor: i < score ? colors[score - 1] : theme.border }} />
        ))}
      </View>
      <Text style={{ fontSize: 11, fontFamily: "Inter_500Medium", color: colors[score - 1] ?? theme.textTertiary }}>
        {labels[score - 1] ?? ""}
      </Text>
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
  const [showPass, setShowPass] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const webTop = Platform.OS === "web" ? 67 : 0;

  const btnScale = useSharedValue(1);
  const btnStyle = useAnimatedStyle(() => ({ transform: [{ scale: btnScale.value }] }));

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password || !confirm) {
      setError("Please fill in all fields"); return;
    }
    if (password !== confirm) { setError("Passwords do not match"); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    if (!agreed) { setError("Please accept the Terms & Conditions"); return; }
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

  const matchOk = confirm.length > 0 && confirm === password;

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: insets.top + webTop + 16, paddingBottom: insets.bottom + 40 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back */}
          <Pressable style={[styles.backBtn, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => router.back()}>
            <Feather name="arrow-left" size={18} color={theme.text} />
          </Pressable>

          <View style={styles.headerSection}>
            <Text style={[styles.title, { color: theme.text }]}>Create account</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Start your AI-powered interview journey
            </Text>
          </View>

          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {!!error && (
              <View style={[styles.errorBox, { backgroundColor: theme.errorMuted, borderColor: theme.error + "30" }]}>
                <Feather name="alert-circle" size={15} color={theme.error} />
                <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
              </View>
            )}

            <View style={styles.fields}>
              <View>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Full Name</Text>
                <FieldInput icon="user" placeholder="Jane Smith" value={name} onChangeText={setName} capitalize="words" />
              </View>
              <View>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Email address</Text>
                <FieldInput icon="mail" placeholder="you@example.com" value={email} onChangeText={setEmail} keyboard="email-address" />
              </View>
              <View>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Password</Text>
                <FieldInput
                  icon="lock" placeholder="Min. 8 characters"
                  value={password} onChangeText={setPassword} secure={!showPass}
                  right={
                    <Pressable onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                      <Feather name={showPass ? "eye-off" : "eye"} size={17} color={theme.iconDefault} />
                    </Pressable>
                  }
                />
                <StrengthBar password={password} />
              </View>
              <View>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Confirm Password</Text>
                <FieldInput
                  icon={matchOk ? "check-circle" : "lock"}
                  placeholder="Re-enter password"
                  value={confirm} onChangeText={setConfirm} secure={!showPass}
                />
              </View>
            </View>

            <Pressable style={styles.checkRow} onPress={() => setAgreed(!agreed)}>
              <View style={[styles.checkbox, { borderColor: agreed ? theme.primary : theme.border, backgroundColor: agreed ? theme.primary : "transparent" }]}>
                {agreed && <Feather name="check" size={11} color="#fff" />}
              </View>
              <Text style={[styles.checkText, { color: theme.textSecondary }]}>
                I agree to the{" "}
                <Text style={{ color: theme.primary, fontFamily: "Inter_500Medium" }}>Terms & Conditions</Text>
                {" "}and{" "}
                <Text style={{ color: theme.primary, fontFamily: "Inter_500Medium" }}>Privacy Policy</Text>
              </Text>
            </Pressable>

            <Animated.View style={btnStyle}>
              <Pressable
                style={({ pressed }) => [styles.primaryBtn, { backgroundColor: theme.primary, opacity: pressed ? 0.9 : 1 }]}
                onPressIn={() => { btnScale.value = withSpring(0.97, { damping: 20 }); }}
                onPressOut={() => { btnScale.value = withSpring(1, { damping: 20 }); }}
                onPress={handleRegister}
                disabled={loading}
              >
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.primaryBtnText}>Create Account</Text>}
              </Pressable>
            </Animated.View>
          </View>

          <Pressable style={styles.signinRow} onPress={() => router.back()}>
            <Text style={[styles.signinText, { color: theme.textSecondary }]}>Already have an account? </Text>
            <Text style={[styles.signinLink, { color: theme.primary }]}>Sign In</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 20, flexGrow: 1 },
  backBtn: {
    width: 38, height: 38, borderRadius: 10, borderWidth: 1,
    alignItems: "center", justifyContent: "center", marginBottom: 20,
  },
  headerSection: { marginBottom: 24 },
  title: { fontSize: 26, fontFamily: "Inter_700Bold", letterSpacing: -0.4 },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", marginTop: 4 },
  card: {
    borderRadius: 24, padding: 20, borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07, shadowRadius: 20, elevation: 4,
    gap: 16,
  },
  errorBox: {
    flexDirection: "row", alignItems: "center", gap: 8,
    borderRadius: 10, padding: 12, borderWidth: 1,
  },
  errorText: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1 },
  fields: { gap: 14 },
  label: { fontSize: 13, fontFamily: "Inter_500Medium", marginBottom: 6 },
  inputWrap: {
    flexDirection: "row", alignItems: "center",
    borderRadius: 12, borderWidth: 1.5, height: 50,
  },
  inputIcon: { paddingLeft: 14, paddingRight: 10 },
  inputField: {
    flex: 1, height: "100%",
    fontSize: 15, fontFamily: "Inter_400Regular", paddingRight: 14,
  },
  eyeBtn: { padding: 12 },
  checkRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  checkbox: {
    width: 20, height: 20, borderRadius: 5, borderWidth: 1.5,
    alignItems: "center", justifyContent: "center", marginTop: 1,
  },
  checkText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20 },
  primaryBtn: {
    height: 50, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
  },
  primaryBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#fff" },
  signinRow: {
    flexDirection: "row", justifyContent: "center",
    alignItems: "center", marginTop: 20,
  },
  signinText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  signinLink: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
