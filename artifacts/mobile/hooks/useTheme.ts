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
  bg: "#FFFFFF",
  bgSecondary: "#F4F7FC",
  bgTertiary: "#F8FAFC",
  card: "#FFFFFF",
  cardElevated: "#FFFFFF",
  border: "#E5E5E5",
  borderSubtle: "#F4F4F5",
  text: "#000000",
  textSecondary: "#525252",
  textTertiary: "#A1A1AA",
  textInverse: "#FFFFFF",
  primary: "#007AFF",
  primaryLight: "#E5F0FF",
  primaryMuted: "rgba(0,122,255,0.1)",
  primaryDark: "#0056B3",
  secondary: "#34C759",
  secondaryMuted: "rgba(52,199,89,0.1)",
  success: "#34C759",
  successMuted: "rgba(52,199,89,0.1)",
  error: "#FF3B30",
  errorMuted: "rgba(255,59,48,0.1)",
  warning: "#FF9500",
  warningMuted: "rgba(255,149,0,0.1)",
  moduleResume: "#007AFF",
  moduleResumeLight: "rgba(0,122,255,0.1)",
  moduleHR: "#FF2D55",
  moduleHRLight: "rgba(255,45,85,0.1)",
  moduleWeb: "#5856D6",
  moduleWebLight: "rgba(88,86,214,0.1)",
  shadow: "#000000",
  overlay: "rgba(0,0,0,0.45)",
  tabBar: "#FFFFFF",
  tabBarBorder: "#E5E5E5",
  inputBg: "#FAFAFA",
  inputFocusBg: "#F4F4F5",
  placeholder: "#A1A1AA",
  iconDefault: "#000000",
};

const dark: Theme = {
  dark: true,
  bg: "#000000",
  bgSecondary: "#101010",
  bgTertiary: "#1A1A1A",
  card: "#000000",
  cardElevated: "#121212",
  border: "#262626",
  borderSubtle: "#1A1A1A",
  text: "#FFFFFF",
  textSecondary: "#A3A3A3",
  textTertiary: "#525252",
  textInverse: "#000000",
  primary: "#0A84FF",
  primaryLight: "rgba(10,132,255,0.12)",
  primaryMuted: "rgba(10,132,255,0.15)",
  primaryDark: "#0066CC",
  secondary: "#30D158",
  secondaryMuted: "rgba(48,209,88,0.12)",
  success: "#30D158",
  successMuted: "rgba(48,209,88,0.12)",
  error: "#FF453A",
  errorMuted: "rgba(255,69,58,0.12)",
  warning: "#FF9F0A",
  warningMuted: "rgba(255,159,10,0.12)",
  moduleResume: "#0A84FF",
  moduleResumeLight: "rgba(10,132,255,0.12)",
  moduleHR: "#FF375F",
  moduleHRLight: "rgba(255,55,95,0.12)",
  moduleWeb: "#5E5CE6",
  moduleWebLight: "rgba(94,92,230,0.12)",
  shadow: "#000000",
  overlay: "rgba(0,0,0,0.65)",
  tabBar: "#000000",
  tabBarBorder: "#262626",
  inputBg: "#121212",
  inputFocusBg: "rgba(10,132,255,0.1)",
  placeholder: "#525252",
  iconDefault: "#FFFFFF",
};

export function useTheme(): Theme {
  const scheme = useColorScheme();
  return scheme === "dark" ? dark : light;
}
