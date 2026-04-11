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

import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/hooks/useTheme";
import { GlassCard } from "@/components/GlassCard";

function InputField({
  label, placeholder, value, onChangeText, secure, keyboard, capitalize, right,
}: {
  icon?: string; label: string; placeholder: string; value: string;
  onChangeText: (t: string) => void; secure?: boolean;
  keyboard?: any; capitalize?: any; right?: React.ReactNode;
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
            autoCapitalize={capitalize ?? "none"}
          />
          {right}
        </View>
      </GlassCard>
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
  const [showPw, setShowPw] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const btnScale = useSharedValue(1);
  const btnStyle = useAnimatedStyle(() => ({ transform: [{ scale: btnScale.value }] }));

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) { setError("Please fill in all fields"); return; }
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

  const bgColor = theme.dark ? theme.bgSecondary : "#F4F7FC";

  return (
    <View style={[styles.root, { backgroundColor: bgColor }]}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={[styles.header, { paddingTop: 10 }]}>
            <GlassCard
              borderRadius={20}
              padding={0}
              onTap={() => router.back()}
              style={{ width: 40, height: 40, justifyContent: 'center', alignItems: 'center' }}
            >
              <Feather name="chevron-left" size={20} color={theme.textSecondary} />
            </GlassCard>
            <Text style={[styles.headerTitle, { color: theme.primary }]}>Qlue</Text>
            <View style={{ width: 40 }} />
          </View>

          <GlassCard
            borderRadius={40}
            padding={0}
            margin={{ left: 20, right: 20, top: 10, bottom: 10 }}
            style={{ flex: 1 }}
          >
            <ScrollView
              contentContainerStyle={styles.scroll}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text style={[styles.title, { color: theme.text }]}>Create an Account</Text>
              
              {!!error && (
                <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
              )}

              <View style={styles.form}>
                <InputField label="Name" placeholder="Full Name" value={name} onChangeText={setName} capitalize="words" />
                <InputField label="Email" placeholder="joedoe75@gmail.com" value={email} onChangeText={setEmail} keyboard="email-address" />
                
                <InputField
                  label="Password" placeholder="••••••••"
                  value={password} onChangeText={setPassword} secure={!showPw}
                  right={<Pressable onPress={() => setShowPw(!showPw)} style={styles.eyeBtn} hitSlop={8}>
                    <Feather name={showPw ? "eye" : "eye-off"} size={18} color={theme.placeholder} />
                  </Pressable>}
                />

                <Pressable style={styles.agreeRow} onPress={() => setAgreed(!agreed)}>
                  <View style={[styles.checkbox, { borderColor: agreed ? theme.primary : theme.border, backgroundColor: agreed ? theme.primary : "transparent" }]}>
                    {agreed && <Feather name="check" size={10} color="#fff" />}
                  </View>
                  <Text style={[styles.agreeText, { color: theme.textSecondary }]}>
                    I agree to the Terms of Service and Privacy Policy
                  </Text>
                </Pressable>

                <Animated.View style={btnStyle}>
                  <GlassCard
                    onTap={handleRegister}
                    tintColor={theme.primary}
                    fillAlpha={theme.dark ? 0.4 : 0.8}
                    borderRadius={30}
                    padding={0}
                  >
                    <View style={styles.primaryBtn}>
                      {loading
                        ? <ActivityIndicator color="#fff" />
                        : <Text style={styles.primaryBtnText}>Create account</Text>}
                    </View>
                  </GlassCard>
                </Animated.View>

                <Text style={[styles.orText, { color: theme.placeholder }]}>Or Sign up with</Text>

                <GlassCard
                  borderRadius={30}
                  padding={0}
                  onTap={() => {}}
                >
                  <View style={styles.googleBtn}>
                    <Feather name="layers" size={20} color={theme.primary} />
                    <Text style={[styles.googleBtnText, { color: theme.text }]}>Sign up with Google</Text>
                  </View>
                </GlassCard>
              </View>
            </ScrollView>
          </GlassCard>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: { fontSize: 26, fontWeight: '700', letterSpacing: -0.5 },
  scroll: { padding: 24, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '800', textAlign: 'center', marginBottom: 36, letterSpacing: -0.5 },
  errorText: { color: 'red', fontSize: 13, textAlign: 'center', marginBottom: 16 },
  form: { gap: 20 },
  fieldWrap: { gap: 8 },
  fieldLabel: { fontSize: 13, fontWeight: '600' },
  inputBox: { flexDirection: "row", alignItems: "center", height: 56 },
  inputIcon: { marginRight: 10 },
  inputText: { flex: 1, height: "100%", fontSize: 15 },
  eyeBtn: { padding: 10 },
  agreeRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 10, marginBottom: 10 },
  checkbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  agreeText: { fontSize: 13 },
  primaryBtn: { height: 56, alignItems: "center", justifyContent: "center" },
  primaryBtnText: { fontSize: 16, fontWeight: "600", color: "#fff" },
  orText: { textAlign: 'center', fontSize: 13, fontWeight: '500', marginVertical: 10 },
  googleBtn: { height: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  googleBtnText: { fontSize: 15, fontWeight: '600' },
});

