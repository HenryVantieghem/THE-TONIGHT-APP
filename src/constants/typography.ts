import { Platform } from 'react-native';

// Font family based on platform
const fontFamily = Platform.select({
  ios: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },
  android: {
    regular: 'Roboto',
    medium: 'Roboto-Medium',
    semibold: 'Roboto-Medium',
    bold: 'Roboto-Bold',
  },
  default: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },
});

export const typography = {
  // Font sizes
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 28,
    display: 34,
  },

  // Line heights
  lineHeights: {
    xs: 14,
    sm: 18,
    md: 20,
    lg: 22,
    xl: 26,
    xxl: 30,
    xxxl: 34,
    display: 41,
  },

  // Font weights
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  // Font family
  fontFamily,
} as const;

// Pre-defined text styles
export const textStyles = {
  // Headers
  displayLarge: {
    fontSize: typography.sizes.display,
    lineHeight: typography.lineHeights.display,
    fontWeight: typography.weights.bold,
  },
  h1: {
    fontSize: typography.sizes.xxxl,
    lineHeight: typography.lineHeights.xxxl,
    fontWeight: typography.weights.bold,
  },
  h2: {
    fontSize: typography.sizes.xxl,
    lineHeight: typography.lineHeights.xxl,
    fontWeight: typography.weights.semibold,
  },
  h3: {
    fontSize: typography.sizes.xl,
    lineHeight: typography.lineHeights.xl,
    fontWeight: typography.weights.semibold,
  },

  // Body text
  bodyLarge: {
    fontSize: typography.sizes.lg,
    lineHeight: typography.lineHeights.lg,
    fontWeight: typography.weights.regular,
  },
  body: {
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
    fontWeight: typography.weights.regular,
  },
  bodySmall: {
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    fontWeight: typography.weights.regular,
  },

  // Labels
  label: {
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
    fontWeight: typography.weights.medium,
  },
  labelSmall: {
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    fontWeight: typography.weights.medium,
  },

  // Captions
  caption: {
    fontSize: typography.sizes.xs,
    lineHeight: typography.lineHeights.xs,
    fontWeight: typography.weights.regular,
  },

  // Button text
  button: {
    fontSize: typography.sizes.lg,
    lineHeight: typography.lineHeights.lg,
    fontWeight: typography.weights.semibold,
  },
  buttonSmall: {
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
    fontWeight: typography.weights.semibold,
  },
} as const;
