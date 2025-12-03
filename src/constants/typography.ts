import { Platform } from 'react-native';

// EXPERIENCES Typography System v3.0
// Brutalist Slab Serif - Roboto Slab + Courier Prime

// Font family - Roboto Slab for main, Courier Prime for mono
// These will be loaded via expo-font in App.tsx
const fontFamily = {
  // Slab serif - main typeface
  regular: 'RobotoSlab-Regular',
  medium: 'RobotoSlab-Medium',
  semibold: 'RobotoSlab-SemiBold',
  bold: 'RobotoSlab-Bold',
  // Monospace - for timestamps and technical text
  mono: 'CourierPrime-Regular',
  monoBold: 'CourierPrime-Bold',
};

// Fallback fonts when custom fonts aren't loaded yet
export const fallbackFontFamily = Platform.select({
  ios: {
    regular: 'Georgia',
    medium: 'Georgia',
    semibold: 'Georgia-Bold',
    bold: 'Georgia-Bold',
    mono: 'Courier',
    monoBold: 'Courier-Bold',
  },
  android: {
    regular: 'serif',
    medium: 'serif',
    semibold: 'serif',
    bold: 'serif',
    mono: 'monospace',
    monoBold: 'monospace',
  },
  default: {
    regular: 'serif',
    medium: 'serif',
    semibold: 'serif',
    bold: 'serif',
    mono: 'monospace',
    monoBold: 'monospace',
  },
});

export const typography = {
  // Font sizes - slightly bolder scale for brutalist feel
  sizes: {
    // Display - Big bold headers
    display: 36,
    // Large Title
    largeTitle: 32,
    // Title 1
    title1: 26,
    // Title 2
    title2: 22,
    // Title 3
    title3: 20,
    // Headline
    headline: 18,
    // Body
    body: 16,
    // Callout
    callout: 15,
    // Subheadline
    subheadline: 14,
    // Footnote
    footnote: 13,
    // Caption 1
    caption1: 12,
    // Caption 2
    caption2: 11,
    // Mono sizes
    monoLarge: 14,
    mono: 12,
    monoSmall: 10,
    // Legacy aliases
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 28,
  },

  // Line heights - slightly tighter for brutalist density
  lineHeights: {
    display: 40,
    largeTitle: 38,
    title1: 32,
    title2: 28,
    title3: 26,
    headline: 24,
    body: 24,
    callout: 22,
    subheadline: 20,
    footnote: 18,
    caption1: 16,
    caption2: 14,
    mono: 18,
    // Legacy
    xs: 14,
    sm: 18,
    md: 20,
    lg: 22,
    xl: 26,
    xxl: 30,
    xxxl: 34,
  },

  // Font weights
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  // Letter spacing - tighter for brutalist feel
  tracking: {
    display: -0.5,
    largeTitle: -0.5,
    title1: -0.3,
    title2: -0.2,
    title3: -0.2,
    headline: 0.0,
    body: 0.0,
    callout: 0.0,
    subheadline: 0.0,
    footnote: 0.0,
    caption1: 0.0,
    caption2: 0.1,
    mono: 0.5,      // Wider for monospace
    spaced: 3.0,    // For "E X P E R I E N C E S" style headers
  },

  // Font family
  fontFamily,
  fallbackFontFamily,
} as const;

// Pre-defined text styles
export const textStyles = {
  // Display - App name, major headers
  display: {
    fontSize: typography.sizes.display,
    lineHeight: typography.lineHeights.display,
    fontWeight: typography.weights.bold,
    letterSpacing: typography.tracking.display,
    fontFamily: typography.fontFamily.bold,
  },

  // Large Title - Screen titles
  largeTitle: {
    fontSize: typography.sizes.largeTitle,
    lineHeight: typography.lineHeights.largeTitle,
    fontWeight: typography.weights.bold,
    letterSpacing: typography.tracking.largeTitle,
    fontFamily: typography.fontFamily.bold,
  },

  // Title 1 - Major headers
  title1: {
    fontSize: typography.sizes.title1,
    lineHeight: typography.lineHeights.title1,
    fontWeight: typography.weights.bold,
    letterSpacing: typography.tracking.title1,
    fontFamily: typography.fontFamily.bold,
  },

  // Title 2 - Section headers
  title2: {
    fontSize: typography.sizes.title2,
    lineHeight: typography.lineHeights.title2,
    fontWeight: typography.weights.semibold,
    letterSpacing: typography.tracking.title2,
    fontFamily: typography.fontFamily.semibold,
  },

  // Title 3 - Sub-sections
  title3: {
    fontSize: typography.sizes.title3,
    lineHeight: typography.lineHeights.title3,
    fontWeight: typography.weights.semibold,
    letterSpacing: typography.tracking.title3,
    fontFamily: typography.fontFamily.semibold,
  },

  // Headline - Usernames, buttons
  headline: {
    fontSize: typography.sizes.headline,
    lineHeight: typography.lineHeights.headline,
    fontWeight: typography.weights.bold,
    letterSpacing: typography.tracking.headline,
    fontFamily: typography.fontFamily.bold,
  },

  // Body - Main content
  body: {
    fontSize: typography.sizes.body,
    lineHeight: typography.lineHeights.body,
    fontWeight: typography.weights.regular,
    letterSpacing: typography.tracking.body,
    fontFamily: typography.fontFamily.regular,
  },

  // Callout - Secondary content
  callout: {
    fontSize: typography.sizes.callout,
    lineHeight: typography.lineHeights.callout,
    fontWeight: typography.weights.regular,
    letterSpacing: typography.tracking.callout,
    fontFamily: typography.fontFamily.regular,
  },

  // Subheadline - Location text
  subheadline: {
    fontSize: typography.sizes.subheadline,
    lineHeight: typography.lineHeights.subheadline,
    fontWeight: typography.weights.regular,
    letterSpacing: typography.tracking.subheadline,
    fontFamily: typography.fontFamily.regular,
  },

  // Footnote - Input labels
  footnote: {
    fontSize: typography.sizes.footnote,
    lineHeight: typography.lineHeights.footnote,
    fontWeight: typography.weights.regular,
    letterSpacing: typography.tracking.footnote,
    fontFamily: typography.fontFamily.regular,
  },

  // Caption 1 - Small labels
  caption1: {
    fontSize: typography.sizes.caption1,
    lineHeight: typography.lineHeights.caption1,
    fontWeight: typography.weights.regular,
    letterSpacing: typography.tracking.caption1,
    fontFamily: typography.fontFamily.regular,
  },

  // Caption 2 - Smallest text
  caption2: {
    fontSize: typography.sizes.caption2,
    lineHeight: typography.lineHeights.caption2,
    fontWeight: typography.weights.regular,
    letterSpacing: typography.tracking.caption2,
    fontFamily: typography.fontFamily.regular,
  },

  // Mono - Timestamps, technical text
  mono: {
    fontSize: typography.sizes.mono,
    lineHeight: typography.lineHeights.mono,
    fontWeight: typography.weights.regular,
    letterSpacing: typography.tracking.mono,
    fontFamily: typography.fontFamily.mono,
  },

  // Mono Large - Timer displays
  monoLarge: {
    fontSize: typography.sizes.monoLarge,
    lineHeight: typography.lineHeights.mono,
    fontWeight: typography.weights.regular,
    letterSpacing: typography.tracking.mono,
    fontFamily: typography.fontFamily.mono,
  },

  // Spaced - For "E X P E R I E N C E S" style headers
  spaced: {
    fontSize: typography.sizes.caption1,
    lineHeight: typography.lineHeights.caption1,
    fontWeight: typography.weights.bold,
    letterSpacing: typography.tracking.spaced,
    fontFamily: typography.fontFamily.bold,
    textTransform: 'uppercase' as const,
  },

  // Legacy aliases for backward compatibility
  displayLarge: {
    fontSize: typography.sizes.display,
    lineHeight: typography.lineHeights.display,
    fontWeight: typography.weights.bold,
    fontFamily: typography.fontFamily.bold,
  },
  h1: {
    fontSize: typography.sizes.xxxl,
    lineHeight: typography.lineHeights.xxxl,
    fontWeight: typography.weights.bold,
    fontFamily: typography.fontFamily.bold,
  },
  h2: {
    fontSize: typography.sizes.xxl,
    lineHeight: typography.lineHeights.xxl,
    fontWeight: typography.weights.semibold,
    fontFamily: typography.fontFamily.semibold,
  },
  h3: {
    fontSize: typography.sizes.xl,
    lineHeight: typography.lineHeights.xl,
    fontWeight: typography.weights.semibold,
    fontFamily: typography.fontFamily.semibold,
  },
  bodyLarge: {
    fontSize: typography.sizes.lg,
    lineHeight: typography.lineHeights.lg,
    fontWeight: typography.weights.regular,
    fontFamily: typography.fontFamily.regular,
  },
  bodySmall: {
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    fontWeight: typography.weights.regular,
    fontFamily: typography.fontFamily.regular,
  },
  label: {
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
    fontWeight: typography.weights.medium,
    fontFamily: typography.fontFamily.medium,
  },
  labelSmall: {
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    fontWeight: typography.weights.medium,
    fontFamily: typography.fontFamily.medium,
  },
  caption: {
    fontSize: typography.sizes.xs,
    lineHeight: typography.lineHeights.xs,
    fontWeight: typography.weights.regular,
    fontFamily: typography.fontFamily.regular,
  },
  button: {
    fontSize: typography.sizes.headline,
    lineHeight: typography.lineHeights.headline,
    fontWeight: typography.weights.bold,
    letterSpacing: typography.tracking.headline,
    fontFamily: typography.fontFamily.bold,
    textTransform: 'uppercase' as const,
  },
  buttonSmall: {
    fontSize: typography.sizes.callout,
    lineHeight: typography.lineHeights.callout,
    fontWeight: typography.weights.bold,
    fontFamily: typography.fontFamily.bold,
    textTransform: 'uppercase' as const,
  },
} as const;
