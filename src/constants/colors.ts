// Color system for THE TONIGHT APP
// iOS Design System - SF Pro, iOS Blue, Clean & Modern
// Based on complete UI/UX specification

export const colors = {
  // Primary - iOS Blue (THE SIGNATURE LOOK)
  primary: '#007AFF',
  primaryDark: '#0051D5',
  primaryLight: '#5AC8FA',
  primaryGradient: ['#007AFF', '#5AC8FA'] as const,

  // Secondary - Deep purple for contrast and premium feel
  secondary: '#6366F1',
  secondaryDark: '#4F46E5',
  secondaryLight: '#818CF8',
  secondaryGradient: ['#6366F1', '#8B5CF6'] as const,

  // Accent - Teal for highlights
  accent: '#22C55E',
  accentLight: '#4ADE80',

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

  // Semantic colors
  success: '#22C55E',
  successLight: '#DCFCE7',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  info: '#3B82F6',
  infoLight: '#DBEAFE',

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
  blue: ['#007AFF', '#5AC8FA'] as const,
  purple: ['#5856D6', '#AF52DE'] as const,
  green: ['#34C759', '#30D158'] as const,
  orange: ['#FF9500', '#FF3B30'] as const,
  dark: ['#1C1C1E', '#2C2C2E'] as const,
  premium: ['#000000', '#1C1C1E', '#2C2C2E'] as const,
} as const;

export type ColorKey = keyof typeof colors;
export type ShadowKey = keyof typeof shadows;
export type GradientKey = keyof typeof gradients;
