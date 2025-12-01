// Premium color system for THE TONIGHT APP
// Designed to create a visually stunning $1B app experience

export const colors = {
  // Primary - Vibrant sunset gradient for energy and FOMO
  primary: '#FF6B6B',
  primaryDark: '#E55555',
  primaryLight: '#FF8585',
  primaryGradient: ['#FF6B6B', '#FF8E53'] as const,

  // Secondary - Deep purple for contrast and premium feel
  secondary: '#6366F1',
  secondaryDark: '#4F46E5',
  secondaryLight: '#818CF8',
  secondaryGradient: ['#6366F1', '#8B5CF6'] as const,

  // Accent - Teal for highlights
  accent: '#14B8A6',
  accentLight: '#2DD4BF',

  // Backgrounds - Clean and modern
  background: '#FFFFFF',
  surface: '#F8FAFC',
  surfaceSecondary: '#F1F5F9',
  surfaceElevated: '#FFFFFF',

  // Text - High contrast and readability
  text: '#0F172A',
  textSecondary: '#64748B',
  textTertiary: '#94A3B8',
  textInverse: '#FFFFFF',

  // Borders & Dividers
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  borderFocus: '#FF6B6B',
  divider: '#E2E8F0',

  // Timer Colors (THE FOMO DRIVERS - Most important!)
  timerGreen: '#22C55E',
  timerGreenLight: '#DCFCE7',
  timerGreenDark: '#16A34A',
  timerYellow: '#EAB308',
  timerYellowLight: '#FEF9C3',
  timerYellowDark: '#CA8A04',
  timerOrange: '#F97316',
  timerOrangeLight: '#FED7AA',
  timerRed: '#EF4444',
  timerRedLight: '#FEE2E2',
  timerRedDark: '#DC2626',

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
  sunset: ['#FF6B6B', '#FF8E53', '#FFB347'] as const,
  ocean: ['#667EEA', '#764BA2'] as const,
  forest: ['#11998E', '#38EF7D'] as const,
  fire: ['#F12711', '#F5AF19'] as const,
  royal: ['#141E30', '#243B55'] as const,
  premium: ['#0F0C29', '#302B63', '#24243E'] as const,
} as const;

export type ColorKey = keyof typeof colors;
export type ShadowKey = keyof typeof shadows;
export type GradientKey = keyof typeof gradients;
