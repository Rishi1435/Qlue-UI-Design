import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
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

function AnimatedInput({
  icon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  rightElement,
}: {
  icon: string;
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: any;
  autoCapitalize?: any;
  rightElement?: React.ReactNode;
}) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    borderColor: focused ? theme.primary : theme.border,
    backgroundColor: focused ? theme.inputFocusBg : theme.inputBg,
  }));

  return (
    <Animated.View style={[styles.inputWrap, animStyle, { borderColor: focused ? theme.primary : theme.border, backgroundColor: focused ? theme.inputFocusBg : theme.inputBg }]}>
      <Feather name={icon as any} size={18} color={focused ? theme.primary : theme.iconDefault} style={styles.inputIcon} />
      <TextInput
        style={[styles.inputField, { color: theme.text }]}
        placeholder={placeholder}
        placeholderTextColor={theme.placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize ?? "none"}
        onFocus={() => {
          setFocused(true);
          scale.value = withSpring(1.01, { damping: 20 });
        }}
        onBlur={() => {
          setFocused(false);
          scale.value = withSpring(1, { damping: 20 });
        }}
      />
      {rightElement}
    </Animated.View>
  );
}

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const webTop = Platform.OS === "web" ? 67 : 0;

  const btnScale = useSharedValue(1);
  const btnStyle = useAnimatedStyle(() => ({ transform: [{ scale: btnScale.value }] }));

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError("Please enter your email and password");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await login(email.trim(), password);
      router.replace("/(tabs)");
    } catch {
      setError("Invalid credentials. Please try again.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: insets.top + webTop + 24, paddingBottom: insets.bottom + 40 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.logoSection}>
            <LinearGradient
              colors={theme.dark ? ["#1E3A8A", "#1D4ED8"] : ["#1A73C7", "#0D5AA8"]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.logoBox}
            >
              <Feather name="mic" size={30} color="#fff" />
            </LinearGradient>
            <Text style={[styles.brandName, { color: theme.text }]}>Qlue</Text>
            <Text style={[styles.brandSub, { color: theme.textSecondary }]}>AI Interview Practice</Text>
          </View>

          {/* Card */}
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.title, { color: theme.text }]}>Welcome back</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Sign in to continue your practice
            </Text>

            {!!error && (
              <View style={[styles.errorBox, { backgroundColor: theme.errorMuted, borderColor: theme.error + "30" }]}>
                <Feather name="alert-circle" size={15} color={theme.error} />
                <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
              </View>
            )}

            <View style={styles.fields}>
              <View>
                <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Email</Text>
                <AnimatedInput
                  icon="mail"
                  placeholder="you@example.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                />
              </View>
              <View>
                <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Password</Text>
                <AnimatedInput
                  icon="lock"
                  placeholder="••••••••"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  rightElement={
                    <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                      <Feather name={showPassword ? "eye-off" : "eye"} size={17} color={theme.iconDefault} />
                    </Pressable>
                  }
                />
              </View>
              <Pressable style={styles.forgotRow}>
                <Text style={[styles.forgotText, { color: theme.primary }]}>Forgot password?</Text>
              </Pressable>
            </View>

            <Animated.View style={btnStyle}>
              <Pressable
                style={({ pressed }) => [styles.primaryBtn, { backgroundColor: theme.primary, opacity: pressed ? 0.9 : 1 }]}
                onPressIn={() => { btnScale.value = withSpring(0.97, { damping: 20 }); }}
                onPressOut={() => { btnScale.value = withSpring(1, { damping: 20 }); }}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.primaryBtnText}>Sign In</Text>}
              </Pressable>
            </Animated.View>

            <View style={[styles.dividerRow]}>
              <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
              <Text style={[styles.dividerText, { color: theme.textTertiary }]}>or</Text>
              <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
            </View>

            <Pressable
              style={[styles.outlineBtn, { borderColor: theme.border, backgroundColor: theme.bgSecondary }]}
              onPress={() => router.push("/(auth)/register")}
            >
              <Feather name="user-plus" size={16} color={theme.text} />
              <Text style={[styles.outlineBtnText, { color: theme.text }]}>Create an account</Text>
            </Pressable>
          </View>

          <Text style={[styles.legal, { color: theme.textTertiary }]}>
            By signing in, you agree to our Terms of Service and Privacy Policy
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 20, flexGrow: 1 },
  logoSection: { alignItems: "center", marginBottom: 32 },
  logoBox: {
    width: 72, height: 72, borderRadius: 20,
    alignItems: "center", justifyContent: "center",
    marginBottom: 14,
    shadowColor: "#1A73C7",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35, shadowRadius: 20, elevation: 10,
  },
  brandName: { fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  brandSub: { fontSize: 14, fontFamily: "Inter_400Regular", marginTop: 3 },
  card: {
    borderRadius: 24, padding: 24,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07, shadowRadius: 20, elevation: 4,
    gap: 20,
  },
  title: { fontSize: 22, fontFamily: "Inter_700Bold", letterSpacing: -0.3 },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", marginTop: -12 },
  errorBox: {
    flexDirection: "row", alignItems: "center", gap: 8,
    borderRadius: 10, padding: 12, borderWidth: 1,
  },
  errorText: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1 },
  fields: { gap: 14 },
  fieldLabel: { fontSize: 13, fontFamily: "Inter_500Medium", marginBottom: 6 },
  inputWrap: {
    flexDirection: "row", alignItems: "center",
    borderRadius: 12, borderWidth: 1.5, height: 50,
  },
  inputIcon: { paddingLeft: 14, paddingRight: 10 },
  inputField: {
    flex: 1, height: "100%",
    fontSize: 15, fontFamily: "Inter_400Regular",
    paddingRight: 14,
  },
  eyeBtn: { padding: 12 },
  forgotRow: { alignItems: "flex-end", marginTop: -4 },
  forgotText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  primaryBtn: {
    height: 50, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
  },
  primaryBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#fff" },
  dividerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  outlineBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, height: 50, borderRadius: 12, borderWidth: 1.5,
  },
  outlineBtnText: { fontSize: 15, fontFamily: "Inter_500Medium" },
  legal: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "center", marginTop: 20, lineHeight: 18 },
});
