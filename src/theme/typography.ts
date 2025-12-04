/**
 * Scena - Typography System
 * Gentle, humble, lowercase-preferred
 * Following Reality Transurfing: nothing too important or loud
 */

import { Platform } from 'react-native';

// System fonts that feel clean and modern
const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

export const typography = {
  // Font families
  fonts: {
    regular: fontFamily,
    medium: fontFamily,
    light: fontFamily,
  },

  // Font sizes (kept modest - nothing screams "LOOK AT ME!")
  sizes: {
    xs: 11,      // Tiny hints
    sm: 13,      // Secondary text, timestamps
    base: 15,    // Body text, captions
    md: 17,      // Primary text, usernames
    lg: 20,      // Section headers
    xl: 24,      // Screen titles (still humble)
    xxl: 28,     // Welcome screen only
  },

  // Font weights
  weights: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
  },

  // Line heights (generous breathing room)
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.7,
  },

  // Letter spacing
  letterSpacing: {
    tight: -0.3,
    normal: 0,
    wide: 0.5,
    veryWide: 1.2,
  },
};

// Pre-composed text styles for consistency
export const textStyles = {
  // App name (lowercase, humble)
  appName: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.light,
    letterSpacing: typography.letterSpacing.wide,
    textTransform: 'lowercase' as const,
  },

  // Screen titles
  screenTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.regular,
    letterSpacing: typography.letterSpacing.normal,
  },

  // Username display
  username: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    letterSpacing: typography.letterSpacing.normal,
  },

  // Body text / captions
  body: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.regular,
    lineHeight: typography.sizes.base * typography.lineHeights.normal,
  },

  // Secondary / location text
  secondary: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.regular,
    letterSpacing: typography.letterSpacing.normal,
  },

  // Hint text
  hint: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.light,
    letterSpacing: typography.letterSpacing.wide,
    textTransform: 'lowercase' as const,
  },

  // Button text
  button: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    letterSpacing: typography.letterSpacing.wide,
    textTransform: 'lowercase' as const,
  },

  // Input placeholder
  placeholder: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.light,
    letterSpacing: typography.letterSpacing.normal,
  },
};

export default typography;
