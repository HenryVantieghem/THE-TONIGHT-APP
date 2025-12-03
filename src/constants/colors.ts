// GHOST MODE - Ultramodern Color System v4.0
// Dark-first, gesture-driven, camera-centric aesthetic

export const colors = {
  // PRIMARY - Ghost Yellow (signature color)
  primary: '#FFFC00',           // Snapchat-inspired yellow
  primaryDark: '#E6E300',
  primaryLight: '#FFFD4D',
  primaryGlow: 'rgba(255, 252, 0, 0.3)',

  // Accent aliases
  accent: '#FFFC00',
  accentLight: '#FFFD4D',
  accentDark: '#E6E300',

  // BACKGROUNDS - Pure dark
  background: '#000000',         // Pure black
  backgroundPrimary: '#000000',
  backgroundSecondary: '#1C1C1E', // iOS dark gray
  backgroundTertiary: '#2C2C2E', // Slightly lighter
  backgroundQuaternary: '#3C3C3E',

  // Surfaces
  surface: '#1C1C1E',
  surfaceSecondary: '#2C2C2E',

  // SURFACES (Glassmorphism)
  glass: 'rgba(255, 255, 255, 0.1)',
  glassStrong: 'rgba(255, 255, 255, 0.15)',
  glassDark: 'rgba(0, 0, 0, 0.3)',
  glassBlack: 'rgba(0, 0, 0, 0.6)',
  glassYellow: 'rgba(255, 252, 0, 0.15)',

  // TEXT
  text: '#FFFFFF',              // White
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textTertiary: 'rgba(255, 255, 255, 0.4)',
  textQuaternary: 'rgba(255, 255, 255, 0.2)',
  textInverse: '#000000',

  // ACCENTS (iOS-inspired vibrant)
  accentRed: '#FF3B30',         // iOS red
  accentGreen: '#30D158',       // iOS green
  accentBlue: '#0A84FF',        // iOS blue
  accentPurple: '#BF5AF2',      // iOS purple
  accentOrange: '#FF9F0A',      // iOS orange
  accentPink: '#FF375F',        // iOS pink
  accentTeal: '#64D2FF',        // iOS teal

  // TIMER COLORS (vibrant, urgent)
  timerGreen: '#30D158',
  timerGreenDark: '#28A745',
  timerYellow: '#FFD60A',
  timerYellowDark: '#E6C200',
  timerOrange: '#FF9F0A',
  timerRed: '#FF3B30',
  timerRedDark: '#E63428',
  timerRedGlow: 'rgba(255, 59, 48, 0.4)',

  // Legacy timer aliases
  timerFresh: '#30D158',
  timerMid: '#FFD60A',
  timerUrgent: '#FF3B30',

  // SEMANTIC
  success: '#30D158',
  successLight: 'rgba(48, 209, 88, 0.2)',
  warning: '#FFD60A',
  warningLight: 'rgba(255, 214, 10, 0.2)',
  error: '#FF3B30',
  errorLight: 'rgba(255, 59, 48, 0.2)',
  info: '#0A84FF',
  infoLight: 'rgba(10, 132, 255, 0.2)',

  // SPECIAL
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  // OVERLAYS
  overlay: 'rgba(0, 0, 0, 0.6)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  overlayStrong: 'rgba(0, 0, 0, 0.8)',

  // BORDERS (subtle, glassmorphic)
  border: 'rgba(255, 255, 255, 0.1)',
  borderLight: 'rgba(255, 255, 255, 0.05)',
  borderMedium: 'rgba(255, 255, 255, 0.15)',
  borderStrong: 'rgba(255, 255, 255, 0.2)',
  borderFocus: 'rgba(255, 252, 0, 0.5)',
  borderYellow: 'rgba(255, 252, 0, 0.3)',

  // REACTIONS
  reactionBackground: 'rgba(255, 255, 255, 0.15)',
  reactionActive: '#FFFC00',
  reactionText: '#FFFFFF',
  reactionTextActive: '#000000',

  // POLAROID (legacy compatibility - now dark themed)
  polaroidFrame: '#1C1C1E',
  polaroidShadow: 'rgba(0, 0, 0, 0.5)',

  // GRADIENTS (minimal use)
  primaryGradient: ['#FFFC00', '#FFD60A'] as const,
  darkGradient: ['#000000', '#1C1C1E'] as const,

  // SHADOWS
  shadowColor: '#000000',
} as const;

// Shadow presets - Subtle depth for dark mode
export const shadows = {
  none: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
  },
  level1: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  level2: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  level3: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  level4: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
  },
  glow: {
    shadowColor: '#FFFC00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 8,
  },
  glowRed: {
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 8,
  },
  accentGlow: {
    shadowColor: '#FFFC00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 8,
  },
} as const;

// Glassmorphism border styles
export const borders = {
  none: {
    borderWidth: 0,
    borderColor: 'transparent',
  },
  light: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  medium: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  heavy: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  yellow: {
    borderWidth: 1,
    borderColor: 'rgba(255, 252, 0, 0.3)',
  },
  extraHeavy: {
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
} as const;

export type ColorKey = keyof typeof colors;
export type ShadowKey = keyof typeof shadows;
export type BorderKey = keyof typeof borders;
