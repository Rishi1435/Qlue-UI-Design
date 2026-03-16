import { useColorScheme } from "react-native";

export type Theme = {
  dark: boolean;
  bg: string;
  bgSecondary: string;
  bgTertiary: string;
  card: string;
  cardElevated: string;
  border: string;
  borderSubtle: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  primary: string;
  primaryLight: string;
  primaryMuted: string;
  primaryDark: string;
  secondary: string;
  secondaryMuted: string;
  success: string;
  successMuted: string;
  error: string;
  errorMuted: string;
  warning: string;
  warningMuted: string;
  moduleResume: string;
  moduleResumeLight: string;
  moduleHR: string;
  moduleHRLight: string;
  moduleWeb: string;
  moduleWebLight: string;
  shadow: string;
  overlay: string;
  tabBar: string;
  tabBarBorder: string;
  inputBg: string;
  inputFocusBg: string;
  placeholder: string;
  iconDefault: string;
};

const light: Theme = {
  dark: false,
  bg: "#F4F6FB",
  bgSecondary: "#EEF1F8",
  bgTertiary: "#E6EAF4",
  card: "#FFFFFF",
  cardElevated: "#FFFFFF",
  border: "#E2E8F0",
  borderSubtle: "#EEF1F8",
  text: "#0F172A",
  textSecondary: "#475569",
  textTertiary: "#94A3B8",
  textInverse: "#FFFFFF",
  primary: "#1A73C7",
  primaryLight: "#EBF4FF",
  primaryMuted: "rgba(26,115,199,0.12)",
  primaryDark: "#0D5AA8",
  secondary: "#1A9D66",
  secondaryMuted: "rgba(26,157,102,0.12)",
  success: "#10B981",
  successMuted: "rgba(16,185,129,0.12)",
  error: "#EF4444",
  errorMuted: "rgba(239,68,68,0.1)",
  warning: "#F59E0B",
  warningMuted: "rgba(245,158,11,0.12)",
  moduleResume: "#2563EB",
  moduleResumeLight: "rgba(37,99,235,0.1)",
  moduleHR: "#DB2777",
  moduleHRLight: "rgba(219,39,119,0.1)",
  moduleWeb: "#0891B2",
  moduleWebLight: "rgba(8,145,178,0.1)",
  shadow: "#000000",
  overlay: "rgba(0,0,0,0.45)",
  tabBar: "#FFFFFF",
  tabBarBorder: "#E2E8F0",
  inputBg: "#F8FAFC",
  inputFocusBg: "#EBF4FF",
  placeholder: "#CBD5E1",
  iconDefault: "#64748B",
};

const dark: Theme = {
  dark: true,
  bg: "#0B0F1A",
  bgSecondary: "#111827",
  bgTertiary: "#1C2333",
  card: "#161D2F",
  cardElevated: "#1E2740",
  border: "#1E293B",
  borderSubtle: "#162032",
  text: "#F1F5F9",
  textSecondary: "#94A3B8",
  textTertiary: "#475569",
  textInverse: "#0F172A",
  primary: "#3B82F6",
  primaryLight: "rgba(59,130,246,0.12)",
  primaryMuted: "rgba(59,130,246,0.15)",
  primaryDark: "#2563EB",
  secondary: "#34D399",
  secondaryMuted: "rgba(52,211,153,0.12)",
  success: "#34D399",
  successMuted: "rgba(52,211,153,0.12)",
  error: "#F87171",
  errorMuted: "rgba(248,113,113,0.12)",
  warning: "#FBBF24",
  warningMuted: "rgba(251,191,36,0.12)",
  moduleResume: "#60A5FA",
  moduleResumeLight: "rgba(96,165,250,0.12)",
  moduleHR: "#F472B6",
  moduleHRLight: "rgba(244,114,182,0.12)",
  moduleWeb: "#22D3EE",
  moduleWebLight: "rgba(34,211,238,0.12)",
  shadow: "#000000",
  overlay: "rgba(0,0,0,0.65)",
  tabBar: "#111827",
  tabBarBorder: "#1E293B",
  inputBg: "#1C2333",
  inputFocusBg: "rgba(59,130,246,0.08)",
  placeholder: "#334155",
  iconDefault: "#64748B",
};

export function useTheme(): Theme {
  const scheme = useColorScheme();
  return scheme === "dark" ? dark : light;
}
