// Color system for EXPERIENCES APP
// Modern Minimal Design System - Indigo accent, Clean & Sophisticated
// Production-ready for App Store

export const colors = {
  // Primary - Indigo (Vibrant but sophisticated)
  primary: '#6366F1',      // Indigo-500
  primaryDark: '#4F46E5',  // Indigo-600
  primaryLight: '#818CF8', // Indigo-400
  primaryGradient: ['#6366F1', '#818CF8'] as const,

  // Secondary - iOS Blue for familiarity
  secondary: '#007AFF',
  secondaryDark: '#0051D5',
  secondaryLight: '#5AC8FA',
  secondaryGradient: ['#007AFF', '#5AC8FA'] as const,

  // Accent - Emerald for success/highlights
  accent: '#10B981',       // Emerald-500
  accentLight: '#34D399',  // Emerald-400

  // Backgrounds - iOS Clean Style
  background: '#FFFFFF',
  surface: '#F2F2F7',
  surfaceSecondary: '#FFFFFF',
  surfaceElevated: '#FFFFFF',

  // Text - iOS Text Colors
  text: '#000000',
  textSecondary: '#8E8E93',
  textTertiary: '#C7C7CC',
  textInverse: '#FFFFFF',

  // Borders & Dividers - iOS Style
  border: '#E5E5EA',
  borderLight: '#F2F2F7',
  borderFocus: '#007AFF',
  divider: '#E5E5EA',

  // Timer Colors (THE FOMO DRIVERS - Most important!)
  timerGreen: '#34C759',
  timerGreenLight: '#DCFCE7',
  timerGreenDark: '#30D158',
  timerYellow: '#FFCC00',
  timerYellowLight: '#FEF9C3',
  timerYellowDark: '#FF9500',
  timerOrange: '#FF9500',
  timerOrangeLight: '#FED7AA',
  timerRed: '#FF3B30',
  timerRedLight: '#FEE2E2',
  timerRedDark: '#FF2D55',

  // Semantic colors (consistent with new design)
  success: '#10B981',      // Emerald-500
  successLight: '#D1FAE5', // Emerald-100
  warning: '#F59E0B',      // Amber-500
  warningLight: '#FEF3C7', // Amber-100
  error: '#EF4444',        // Red-500
  errorLight: '#FEE2E2',   // Red-100
  info: '#6366F1',         // Indigo-500 (matches primary)
  infoLight: '#E0E7FF',    // Indigo-100

  // Reactions
  reactionBackground: '#F1F5F9',
  reactionActive: '#DBEAFE',
  reactionBorder: '#3B82F6',

  // Neutral colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  // Shadows
  shadowColor: '#0F172A',

  // Overlays
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  overlayDark: 'rgba(0, 0, 0, 0.7)',
  overlayWhite: 'rgba(255, 255, 255, 0.9)',

  // Glassmorphism & Liquid Glass (iOS 26+)
  glass: 'rgba(255, 255, 255, 0.8)',
  glassDark: 'rgba(0, 0, 0, 0.4)',
  glassSubtle: 'rgba(255, 255, 255, 0.45)',
  glassElevated: 'rgba(255, 255, 255, 0.85)',
  glassBorder: 'rgba(255, 255, 255, 0.25)',
  glassBorderStrong: 'rgba(255, 255, 255, 0.45)',
  glassHighlight: 'rgba(255, 255, 255, 0.4)',

  // Heart animation color
  heartRed: '#FF3B6F',

  // Dark mode colors
  dark: {
    background: '#0F172A',
    surface: '#1E293B',
    surfaceSecondary: '#334155',
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    textTertiary: '#64748B',
    border: '#334155',
    borderLight: '#475569',
  },
} as const;

// Premium shadow system
export const shadows = {
  // Subtle shadow for cards
  sm: {
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  // Medium shadow for elevated elements
  md: {
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  // Large shadow for modals and popovers
  lg: {
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  // Extra large shadow for floating elements
  xl: {
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  // Glow effect for buttons and interactive elements
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  }),
  // Inner glow for depth
  innerGlow: {
    shadowColor: colors.white,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 0,
  },
  // Button press shadow (smaller)
  pressed: {
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
} as const;

// Gradient presets for common use cases
export const gradients = {
  primary: colors.primaryGradient,
  secondary: colors.secondaryGradient,
  indigo: ['#6366F1', '#818CF8'] as const,
  blue: ['#007AFF', '#5AC8FA'] as const,
  purple: ['#8B5CF6', '#A78BFA'] as const,
  green: ['#10B981', '#34D399'] as const,
  orange: ['#F59E0B', '#FBBF24'] as const,
  dark: ['#1C1C1E', '#2C2C2E'] as const,
  premium: ['#000000', '#1C1C1E', '#2C2C2E'] as const,
} as const;

export type ColorKey = keyof typeof colors;
export type ShadowKey = keyof typeof shadows;
export type GradientKey = keyof typeof gradients;
