import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, shadows, spacing, radius } from '../../constants/theme';

interface GlassCardProps {
  children: React.ReactNode;
  variant?: 'light' | 'medium' | 'strong' | 'dark' | 'yellow';
  padding?: keyof typeof spacing;
  style?: ViewStyle;
  intensity?: number;
}

export function GlassCard({
  children,
  variant = 'light',
  padding = 'md',
  style,
  intensity,
}: GlassCardProps) {
  const glassConfig = {
    light: {
      backgroundColor: colors.glass,
      blurIntensity: intensity || 20,
      borderColor: colors.border,
    },
    medium: {
      backgroundColor: colors.glassStrong,
      blurIntensity: intensity || 30,
      borderColor: colors.borderMedium,
    },
    strong: {
      backgroundColor: colors.glassStrong,
      blurIntensity: intensity || 40,
      borderColor: colors.borderStrong,
    },
    dark: {
      backgroundColor: colors.glassDark,
      blurIntensity: intensity || 30,
      borderColor: colors.border,
    },
    yellow: {
      backgroundColor: colors.glassYellow,
      blurIntensity: intensity || 20,
      borderColor: colors.borderYellow,
    },
  };

  const config = glassConfig[variant];

  return (
    <View
      style={[
        styles.container,
        {
          padding: spacing[padding],
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: config.borderColor,
          backgroundColor: config.backgroundColor,
          overflow: 'hidden',
        },
        shadows.md,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
});

