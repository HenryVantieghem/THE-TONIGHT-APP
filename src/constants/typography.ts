import { Platform } from 'react-native';

// Font family - SF Pro on iOS, System on others
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

// EXPERIENCES Typography System - SF Pro (iOS) / System fonts
export const typography = {
  // Font sizes (per spec)
  sizes: {
    // Large Title
    largeTitle: 34,
    // Title 1
    title1: 28,
    // Title 2
    title2: 22,
    // Title 3
    title3: 20,
    // Headline
    headline: 17,
    // Body
    body: 17,
    // Callout
    callout: 16,
    // Subheadline
    subheadline: 15,
    // Footnote
    footnote: 13,
    // Caption 1
    caption1: 12,
    // Caption 2
    caption2: 11,
    // Legacy aliases
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
    largeTitle: 41,
    title1: 34,
    title2: 28,
    title3: 25,
    headline: 22,
    body: 22,
    callout: 21,
    subheadline: 20,
    footnote: 18,
    caption1: 16,
    caption2: 13,
    // Legacy
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

  // Letter spacing (tracking)
  tracking: {
    largeTitle: -0.4,
    title1: -0.4,
    title2: -0.3,
    title3: -0.3,
    headline: 0.0,
    body: 0.0,
    callout: 0.0,
    subheadline: 0.0,
    footnote: 0.0,
    caption1: 0.0,
    caption2: 0.1,
  },

  // Font family
  fontFamily,
} as const;

// Pre-defined text styles (per spec)
export const textStyles = {
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
    fontWeight: typography.weights.semibold,
    letterSpacing: typography.tracking.headline,
    fontFamily: typography.fontFamily.semibold,
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
  
  // Caption 1 - Timestamps
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

  // Legacy aliases for backward compatibility
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
  bodyLarge: {
    fontSize: typography.sizes.lg,
    lineHeight: typography.lineHeights.lg,
    fontWeight: typography.weights.regular,
  },
  bodySmall: {
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    fontWeight: typography.weights.regular,
  },
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
  caption: {
    fontSize: typography.sizes.xs,
    lineHeight: typography.lineHeights.xs,
    fontWeight: typography.weights.regular,
  },
  button: {
    fontSize: typography.sizes.headline,
    lineHeight: typography.lineHeights.headline,
    fontWeight: typography.weights.semibold,
    letterSpacing: typography.tracking.headline,
    fontFamily: typography.fontFamily.semibold,
  },
  buttonSmall: {
    fontSize: typography.sizes.callout,
    lineHeight: typography.lineHeights.callout,
    fontWeight: typography.weights.semibold,
    fontFamily: typography.fontFamily.semibold,
  },
} as const;
