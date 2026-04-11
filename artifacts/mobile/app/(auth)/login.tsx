import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { QlueLogo } from "@/components/QlueLogo";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/hooks/useTheme";
import { GlassCard } from "@/components/GlassCard";

function InputField({
  label, placeholder, value, onChangeText, secure, keyboard, right,
}: {
  icon?: string; label: string; placeholder: string; value: string;
  onChangeText: (t: string) => void; secure?: boolean;
  keyboard?: any; right?: React.ReactNode;
}) {
  const theme = useTheme();
  return (
    <View style={styles.fieldWrap}>
      <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
        {label}
      </Text>
      <GlassCard borderRadius={30} padding={{ left: 20, right: 10 }}>
        <View style={styles.inputBox}>
          <TextInput
            style={[styles.inputText, { color: theme.text }]}
            placeholder={placeholder}
            placeholderTextColor={theme.placeholder}
            value={value} onChangeText={onChangeText}
            secureTextEntry={secure} keyboardType={keyboard}
            autoCapitalize="none"
          />
          {right}
        </View>
      </GlassCard>
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

  const bgColor = theme.dark ? theme.bgSecondary : "#F4F7FC";

  return (
    <View style={[styles.root, { backgroundColor: bgColor }]}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView
            contentContainerStyle={[
              styles.scroll,
              { paddingTop: 20, paddingBottom: insets.bottom + 48 },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header / Brand */}
            <View style={styles.brand}>
              <Text style={[styles.headerTitle, { color: theme.primary }]}>Qlue</Text>
            </View>

            <GlassCard
              borderRadius={40}
              padding={0}
              margin={{ vertical: 10 }}
            >
              <View style={styles.cardContent}>
                <Text style={[styles.title, { color: theme.text }]}>Welcome back</Text>
                <Text style={[styles.headingSub, { color: theme.textSecondary }]}>
                  Sign in to continue practicing
                </Text>

                {!!error && (
                  <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
                )}

                <View style={styles.form}>
                  <InputField
                    label="Email"
                    placeholder="joedoe75@gmail.com"
                    value={email}
                    onChangeText={setEmail}
                    keyboard="email-address"
                  />
                  <InputField
                    label="Password"
                    placeholder="••••••••"
                    value={password}
                    onChangeText={setPassword}
                    secure={!showPw}
                    right={
                      <Pressable onPress={() => setShowPw(!showPw)} style={styles.eyeBtn} hitSlop={8}>
                        <Feather name={showPw ? "eye" : "eye-off"} size={18} color={theme.placeholder} />
                      </Pressable>
                    }
                  />

                  <Pressable style={styles.forgotBtn} hitSlop={6}>
                    <Text style={[styles.forgotText, { color: theme.primary }]}>Forgot password?</Text>
                  </Pressable>

                  <Animated.View style={btnAnimStyle}>
                    <GlassCard
                      onTap={handleLogin}
                      tintColor={theme.primary}
                      fillAlpha={theme.dark ? 0.4 : 0.8}
                      borderRadius={30}
                      padding={0}
                    >
                      <View style={styles.primaryBtn}>
                        {loading
                          ? <ActivityIndicator color="#fff" />
                          : <Text style={styles.primaryBtnText}>Sign In</Text>}
                      </View>
                    </GlassCard>
                  </Animated.View>

                  <Text style={[styles.orText, { color: theme.placeholder }]}>Or Sign in with</Text>

                  <GlassCard
                    borderRadius={30}
                    padding={0}
                    onTap={() => {}}
                  >
                    <View style={styles.googleBtn}>
                      <Feather name="layers" size={20} color={theme.primary} />
                      <Text style={[styles.googleBtnText, { color: theme.text }]}>Sign in with Google</Text>
                    </View>
                  </GlassCard>
                </View>
              </View>
            </GlassCard>

            <Pressable
              style={styles.secondaryBtn}
              onPress={() => router.push("/(auth)/register")}
            >
              <Text style={[styles.secondaryBtnText, { color: theme.textSecondary }]}>
                Don't have an account?{" "}
                <Text style={{ color: theme.primary, fontWeight: '700' }}>Create one</Text>
              </Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 20, flexGrow: 1 },
  brand: { alignItems: "center", marginBottom: 30 },
  headerTitle: { fontSize: 26, fontWeight: '700', letterSpacing: -0.5 },
  cardContent: { padding: 24, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '800', textAlign: 'center', marginBottom: 8, letterSpacing: -0.5 },
  headingSub: { fontSize: 15, textAlign: 'center', marginBottom: 36 },
  errorText: { color: 'red', fontSize: 13, textAlign: 'center', marginBottom: 16 },
  form: { gap: 20 },
  fieldWrap: { gap: 8 },
  fieldLabel: { fontSize: 13, fontWeight: '600' },
  inputBox: { flexDirection: "row", alignItems: "center", height: 56 },
  inputText: { flex: 1, height: "100%", fontSize: 15 },
  eyeBtn: { padding: 10 },
  forgotBtn: { alignSelf: "flex-end", marginTop: -6 },
  forgotText: { fontSize: 13, fontWeight: "600" },
  primaryBtn: { height: 56, alignItems: "center", justifyContent: "center" },
  primaryBtnText: { fontSize: 16, fontWeight: "600", color: "#fff" },
  orText: { textAlign: 'center', fontSize: 13, fontWeight: '500', marginVertical: 10 },
  googleBtn: { height: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  googleBtnText: { fontSize: 15, fontWeight: '600' },
  secondaryBtn: { marginTop: 20, alignItems: "center" },
  secondaryBtnText: { fontSize: 15 },
});

