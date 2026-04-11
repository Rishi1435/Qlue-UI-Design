import React from 'react';
import { StyleSheet, View, ViewStyle, Pressable, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/hooks/useTheme';

interface GlassCardProps {
  children: React.ReactNode;
  borderRadius?: number;
  padding?: number | { top?: number; bottom?: number; left?: number; right?: number };
  margin?: number | { top?: number; bottom?: number; left?: number; right?: number };
  blurIntensity?: number;
  fillAlpha?: number;
  borderAlpha?: number;
  tintColor?: string;
  onTap?: () => void;
  style?: ViewStyle;
}

export function GlassCard({
  children,
  borderRadius = 20,
  padding = 16,
  margin = 0,
  blurIntensity = 25,
  fillAlpha,
  borderAlpha,
  tintColor,
  onTap,
  style,
}: GlassCardProps) {
  const theme = useTheme();

  // Logic adapted from Flutter GlassCard
  const defaultTint = theme.dark ? '#FFFFFF' : '#000000';
  const effectiveTint = tintColor || defaultTint;

  const activeFillAlpha = fillAlpha ?? (tintColor ? 0.15 : (theme.dark ? 0.05 : 0.02));
  const activeBorderAlpha = borderAlpha ?? (tintColor ? 0.3 : (theme.dark ? 0.12 : 0.06));

  const getPadding = () => {
    if (typeof padding === 'number') return { padding };
    return {
      paddingTop: padding.top,
      paddingBottom: padding.bottom,
      paddingLeft: padding.left,
      paddingRight: padding.right,
    };
  };

  const getMargin = () => {
    if (typeof margin === 'number') return { margin };
    return {
      marginTop: margin.top,
      marginBottom: margin.bottom,
      marginLeft: margin.left,
      marginRight: margin.right,
    };
  };

  const content = (
    <View
      style={[
        styles.container,
        getMargin(),
        {
          borderRadius,
          overflow: 'hidden',
          borderColor: `${effectiveTint}${Math.floor(activeBorderAlpha * 255).toString(16).padStart(2, '0')}`,
          borderWidth: 1,
        },
        style,
      ]}
    >
      <BlurView
        intensity={blurIntensity}
        tint={theme.dark ? 'dark' : 'light'}
        style={[
          styles.blur,
          {
            backgroundColor: `${effectiveTint}${Math.floor(activeFillAlpha * 255).toString(16).padStart(2, '0')}`,
          },
          getPadding(),
        ]}
      >
        {children}
      </BlurView>
    </View>
  );

  if (onTap) {
    return (
      <Pressable onPress={onTap} style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}>
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  blur: {
    flex: 0,
  },
});
