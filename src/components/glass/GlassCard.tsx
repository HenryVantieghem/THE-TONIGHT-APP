import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, shadows, spacing, radius } from '../../constants/theme';

interface GlassCardProps {
  children: React.ReactNode;
  variant?: 'light' | 'medium' | 'strong' | 'dark' | 'red';
  padding?: keyof typeof spacing;
  style?: ViewStyle;
}

export function GlassCard({
  children,
  variant = 'light',
  padding = 'md',
  style,
}: GlassCardProps) {
  const glassConfig = {
    light: {
      backgroundColor: colors.glass,
      borderColor: colors.border,
    },
    medium: {
      backgroundColor: colors.glassStrong,
      borderColor: colors.border,
    },
    strong: {
      backgroundColor: colors.glassStrong,
      borderColor: colors.borderStrong,
    },
    dark: {
      backgroundColor: colors.glassDark,
      borderColor: colors.border,
    },
    red: {
      backgroundColor: colors.glassRed,
      borderColor: colors.borderRed,
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

