import { Feather } from "@expo/vector-icons";
import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View, SafeAreaView } from "react-native";

import { GlassCard } from "@/components/GlassCard";
import { useTheme } from "@/hooks/useTheme";

export default function NotFoundScreen() {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <Stack.Screen options={{ title: "Oops!" }} />
      <SafeAreaView>
        <GlassCard borderRadius={30} padding={40} style={styles.card}>
          <Feather name="alert-circle" size={48} color={theme.error} style={{ opacity: 0.5 }} />
          <Text style={[styles.title, { color: theme.text }]}>Screen Not Found</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            It seems like the page you are looking for has taken a break or doesn't exist.
          </Text>
          <Link href="/" style={styles.link}>
            <View style={[styles.btn, { backgroundColor: theme.primary }]}>
              <Text style={styles.btnText}>Back to Safety</Text>
            </View>
          </Link>
        </GlassCard>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    alignItems: "center",
    gap: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    opacity: 0.8,
  },
  link: {
    marginTop: 10,
  },
  btn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
  },
  btnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});
