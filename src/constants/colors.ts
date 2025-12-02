// EXPERIENCES Design System - Color Tokens v2.0
// Clean, minimal, iOS-native feel

export const colors = {
  // PRIMARY - Indigo (NO gradients on buttons per spec)
  accent: '#6366F1',           // Indigo-500
  accentLight: '#818CF8',      // Indigo-400
  accentDark: '#4F46E5',       // Indigo-600
  
  // Legacy aliases for backward compatibility
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  primaryLight: '#818CF8',

  // BACKGROUNDS (Light Mode)
  backgroundPrimary: '#FFFFFF',
  backgroundSecondary: '#F9FAFB',   // Gray-50
  backgroundTertiary: '#F3F4F6',    // Gray-100
  
  // Legacy aliases
  background: '#FFFFFF',
  surface: '#F9FAFB',
  surfaceSecondary: '#F3F4F6',

  // BACKGROUNDS (Dark Mode)
  darkPrimary: '#0F0F0F',
  darkSecondary: '#1A1A1A',
  darkTertiary: '#262626',
  
  // Legacy dark mode
  dark: {
    background: '#0F0F0F',
    backgroundSecondary: '#1A1A1A',
    backgroundTertiary: '#262626',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    textTertiary: '#6B7280',
    border: '#262626',
  },

  // TEXT
  textPrimary: '#111827',      // Gray-900
  textSecondary: '#6B7280',    // Gray-500
  textTertiary: '#9CA3AF',     // Gray-400
  textInverse: '#FFFFFF',
  
  // Legacy aliases
  text: '#111827',
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  // SEMANTIC
  success: '#10B981',          // Emerald-500
  warning: '#F59E0B',          // Amber-500
  error: '#EF4444',            // Red-500
  info: '#3B82F6',             // Blue-500
  
  // Legacy semantic aliases
  successLight: '#D1FAE5',
  warningLight: '#FEF3C7',
  errorLight: '#FEE2E2',
  infoLight: '#DBEAFE',

  // TIMER COLORS (per spec)
  timerFresh: '#10B981',       // >50% Green
  timerMid: '#F59E0B',         // 25-50% Yellow
  timerUrgent: '#EF4444',       // <25% Red (pulsing at <5m)
  
  // Legacy timer aliases
  timerGreen: '#10B981',
  timerGreenDark: '#059669',
  timerYellow: '#F59E0B',
  timerYellowDark: '#D97706',
  timerOrange: '#F97316',
  timerRed: '#EF4444',
  timerRedDark: '#DC2626',

  // BORDERS
  border: '#E5E5EA',
  borderLight: '#F2F2F7',
  borderFocus: '#6366F1',

  // REACTIONS
  reactionBackground: '#F3F4F6',
  reactionActive: '#E0E7FF',

  // SHADOWS
  shadowColor: '#000000',

  // OVERLAYS
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',

  // GRADIENTS (for legacy compatibility)
  primaryGradient: ['#6366F1', '#818CF8'] as const,
} as const;

// Shadow presets (4 levels per spec + accent glow)
export const shadows = {
  level1: {
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  level2: {
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  level3: {
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  level4: {
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 8,
  },
  accentGlow: {
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  // Legacy aliases
  sm: {
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
} as const;

export type ColorKey = keyof typeof colors;
export type ShadowKey = keyof typeof shadows;
