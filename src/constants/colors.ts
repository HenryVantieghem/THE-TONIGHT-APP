// Color system for THE TONIGHT APP
// Following iOS design guidelines with FOMO-driving timer colors

export const colors = {
  // Primary - iOS Blue for trust and familiarity
  primary: '#007AFF',
  primaryDark: '#0056B3',
  primaryLight: '#4DA3FF',
  primaryGradient: ['#007AFF', '#5AC8FA'] as const,

  // Secondary - Deep purple for contrast and premium feel
  secondary: '#5856D6',
  secondaryDark: '#4F46E5',
  secondaryLight: '#818CF8',
  secondaryGradient: ['#5856D6', '#AF52DE'] as const,

  // Accent - Teal for highlights
  accent: '#34C759',
  accentLight: '#30D158',

  // Backgrounds - Clean iOS style
  background: '#FFFFFF',
  surface: '#F2F2F7',
  surfaceSecondary: '#E5E5EA',
  surfaceElevated: '#FFFFFF',

  // Text - iOS standard colors
  text: '#000000',
  textSecondary: '#8E8E93',
  textTertiary: '#AEAEB2',
  textInverse: '#FFFFFF',

  // Borders & Dividers
  border: '#C6C6C8',
  borderLight: '#E5E5EA',
  borderFocus: '#007AFF',
  divider: '#C6C6C8',

  // Timer Colors (THE FOMO DRIVERS - Most important!)
  timerGreen: '#34C759',
  timerGreenLight: '#D1FAE5',
  timerGreenDark: '#22C55E',
  timerYellow: '#FFCC00',
  timerYellowLight: '#FEF9C3',
  timerYellowDark: '#EAB308',
  timerOrange: '#FF9500',
  timerOrangeLight: '#FED7AA',
  timerRed: '#FF3B30',
  timerRedLight: '#FEE2E2',
  timerRedDark: '#DC2626',

  // Semantic colors (iOS standard)
  success: '#34C759',
  successLight: '#D1FAE5',
  warning: '#FF9500',
  warningLight: '#FEF3C7',
  error: '#FF3B30',
  errorLight: '#FEE2E2',
  info: '#007AFF',
  infoLight: '#E3F2FF',

  // Reactions
  reactionBackground: '#F2F2F7',
  reactionActive: '#E3F2FF',
  reactionBorder: '#007AFF',

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

  // Glassmorphism
  glass: 'rgba(255, 255, 255, 0.8)',
  glassDark: 'rgba(0, 0, 0, 0.4)',

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
