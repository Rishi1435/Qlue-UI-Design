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

function PasswordStrength({ password }: { password: string }) {
  const getStrength = () => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  if (!password) return null;
  const strength = getStrength();
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", Colors.semantic.error, Colors.semantic.warning, Colors.secondary[500], Colors.semantic.success];

  return (
    <View style={{ gap: 6, marginTop: 4 }}>
      <View style={{ flexDirection: "row", gap: 4 }}>
        {[1, 2, 3, 4].map((i) => (
          <View
            key={i}
            style={{
              flex: 1, height: 3, borderRadius: 2,
              backgroundColor: i <= strength ? colors[strength] : Colors.neutral[200],
            }}
          />
        ))}
      </View>
      {strength > 0 && (
        <Text style={{ fontSize: 11, color: colors[strength], fontFamily: "Inter_500Medium" }}>
          {labels[strength]}
        </Text>
      )}
    </View>
  );
}

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focused, setFocused] = useState("");

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (!agreed) {
      setError("Please agree to the Terms & Conditions");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await register(name, email, password);
      router.replace("/(tabs)");
    } catch {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field: string) => [
    styles.inputRow,
    focused === field && styles.inputFocused,
  ];

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
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={Colors.neutral[700]} />
        </Pressable>

        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Start your interview prep journey</Text>
        </View>

        <View style={styles.card}>
          {!!error && (
            <View style={styles.errorBanner}>
              <Feather name="alert-circle" size={16} color={Colors.semantic.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.form}>
            <View style={styles.fieldWrapper}>
              <Text style={styles.label}>Full Name</Text>
              <View style={inputStyle("name")}>
                <Feather name="user" size={18} color={focused === "name" ? Colors.primary[500] : Colors.neutral[400]} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Jane Smith"
                  placeholderTextColor={Colors.neutral[300]}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  onFocus={() => setFocused("name")}
                  onBlur={() => setFocused("")}
                />
              </View>
            </View>

            <View style={styles.fieldWrapper}>
              <Text style={styles.label}>Email</Text>
              <View style={inputStyle("email")}>
                <Feather name="mail" size={18} color={focused === "email" ? Colors.primary[500] : Colors.neutral[400]} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor={Colors.neutral[300]}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused("")}
                />
              </View>
            </View>

            <View style={styles.fieldWrapper}>
              <Text style={styles.label}>Password</Text>
              <View style={inputStyle("password")}>
                <Feather name="lock" size={18} color={focused === "password" ? Colors.primary[500] : Colors.neutral[400]} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Min. 8 characters"
                  placeholderTextColor={Colors.neutral[300]}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused("")}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  <Feather name={showPassword ? "eye-off" : "eye"} size={18} color={Colors.neutral[400]} />
                </Pressable>
              </View>
              <PasswordStrength password={password} />
            </View>

            <View style={styles.fieldWrapper}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={inputStyle("confirm")}>
                <Feather
                  name={confirmPassword && confirmPassword === password ? "check-circle" : "lock"}
                  size={18}
                  color={confirmPassword && confirmPassword === password ? Colors.semantic.success : focused === "confirm" ? Colors.primary[500] : Colors.neutral[400]}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Re-enter password"
                  placeholderTextColor={Colors.neutral[300]}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                  onFocus={() => setFocused("confirm")}
                  onBlur={() => setFocused("")}
                />
              </View>
            </View>

            <Pressable
              style={styles.checkboxRow}
              onPress={() => setAgreed(!agreed)}
            >
              <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
                {agreed && <Feather name="check" size={12} color={Colors.white} />}
              </View>
              <Text style={styles.checkboxLabel}>
                I agree to the{" "}
                <Text style={styles.checkboxLink}>Terms & Conditions</Text>
                {" "}and{" "}
                <Text style={styles.checkboxLink}>Privacy Policy</Text>
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.registerBtn,
                pressed && styles.registerBtnPressed,
                loading && styles.registerBtnDisabled,
              ]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.registerBtnText}>Create Account</Text>
              )}
            </Pressable>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.footerLink}>Sign In</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primary[50] },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center", marginTop: 8 },
  header: { paddingTop: 16, paddingBottom: 24 },
  title: { fontSize: 28, fontFamily: "Inter_700Bold", color: Colors.neutral[900] },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.neutral[500], marginTop: 4 },
  card: {
    backgroundColor: Colors.white, borderRadius: 20,
    padding: 24,
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  errorBanner: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#FEE5E5", borderRadius: 10,
    padding: 12, marginBottom: 16,
  },
  errorText: { fontSize: 13, color: Colors.semantic.error, fontFamily: "Inter_400Regular", flex: 1 },
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
  checkboxRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  checkbox: {
    width: 20, height: 20, borderRadius: 5,
    borderWidth: 1.5, borderColor: Colors.neutral[300],
    alignItems: "center", justifyContent: "center",
    marginTop: 1,
  },
  checkboxChecked: { backgroundColor: Colors.primary[500], borderColor: Colors.primary[500] },
  checkboxLabel: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.neutral[500], lineHeight: 20 },
  checkboxLink: { color: Colors.primary[500], fontFamily: "Inter_500Medium" },
  registerBtn: {
    height: 52, borderRadius: 12,
    backgroundColor: Colors.primary[500],
    alignItems: "center", justifyContent: "center",
    marginTop: 4,
  },
  registerBtnPressed: { backgroundColor: Colors.primary[600] },
  registerBtnDisabled: { backgroundColor: Colors.neutral[300] },
  registerBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: Colors.white },
  footer: {
    flexDirection: "row", justifyContent: "center",
    alignItems: "center", marginTop: 24,
  },
  footerText: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.neutral[500] },
  footerLink: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.primary[500] },
});
