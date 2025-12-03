// LIQUID GLASS MODE - Ultra-Modern Color System v5.0
// Black/White/Dark Red aesthetic with liquid glass effects

export const colors = {
  // PRIMARY - Dark Red (signature color)
  primary: '#DC143C',           // Crimson red
  primaryDark: '#8B0000',       // Dark red
  primaryLight: '#FF1744',      // Bright red
  primaryGlow: 'rgba(220, 20, 60, 0.4)',

  // Accent aliases
  accent: '#DC143C',
  accentLight: '#FF1744',
  accentDark: '#8B0000',

  // BACKGROUNDS - Deep blacks
  background: '#000000',         // Pure black
  backgroundPrimary: '#000000',
  backgroundSecondary: '#0A0A0A', // Near black
  backgroundTertiary: '#1A1A1A', // Dark charcoal
  backgroundQuaternary: '#2A2A2A', // Lighter charcoal

  // Surfaces
  surface: '#0A0A0A',
  surfaceSecondary: '#1A1A1A',

  // SURFACES (Glassmorphism)
  glass: 'rgba(255, 255, 255, 0.08)',
  glassStrong: 'rgba(255, 255, 255, 0.12)',
  glassDark: 'rgba(0, 0, 0, 0.4)',
  glassBlack: 'rgba(0, 0, 0, 0.7)',
  glassRed: 'rgba(220, 20, 60, 0.15)',

  // TEXT
  text: '#FFFFFF',              // White
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textTertiary: 'rgba(255, 255, 255, 0.4)',
  textQuaternary: 'rgba(255, 255, 255, 0.2)',
  textInverse: '#000000',

  // ACCENTS (Minimal vibrant)
  accentRed: '#DC143C',         // Crimson (matches primary)
  accentGreen: '#00FF41',       // Matrix green
  accentBlue: '#00D4FF',        // Cyan
  accentPurple: '#C724B1',      // Magenta
  accentOrange: '#FF6B00',      // Bright orange
  accentPink: '#FF0080',        // Hot pink
  accentTeal: '#00FFC8',        // Bright teal

  // TIMER COLORS (vibrant, urgent)
  timerGreen: '#00FF41',
  timerGreenDark: '#00CC33',
  timerYellow: '#FFD600',
  timerYellowDark: '#E6C200',
  timerOrange: '#FF6B00',
  timerRed: '#DC143C',
  timerRedDark: '#8B0000',
  timerRedGlow: 'rgba(220, 20, 60, 0.5)',

  // Legacy timer aliases
  timerFresh: '#00FF41',
  timerMid: '#FFD600',
  timerUrgent: '#DC143C',

  // SEMANTIC
  success: '#00FF41',
  successLight: 'rgba(0, 255, 65, 0.2)',
  warning: '#FFD600',
  warningLight: 'rgba(255, 214, 0, 0.2)',
  error: '#DC143C',
  errorLight: 'rgba(220, 20, 60, 0.2)',
  info: '#00D4FF',
  infoLight: 'rgba(0, 212, 255, 0.2)',

  // SPECIAL
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  // OVERLAYS
  overlay: 'rgba(0, 0, 0, 0.6)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  overlayStrong: 'rgba(0, 0, 0, 0.8)',

  // BORDERS (subtle, glassmorphic)
  border: 'rgba(255, 255, 255, 0.08)',
  borderLight: 'rgba(255, 255, 255, 0.04)',
  borderMedium: 'rgba(255, 255, 255, 0.12)',
  borderStrong: 'rgba(255, 255, 255, 0.16)',
  borderFocus: 'rgba(220, 20, 60, 0.6)',
  borderRed: 'rgba(220, 20, 60, 0.4)',

  // REACTIONS
  reactionBackground: 'rgba(255, 255, 255, 0.12)',
  reactionActive: '#DC143C',
  reactionText: '#FFFFFF',
  reactionTextActive: '#FFFFFF',

  // POLAROID (legacy compatibility - now dark themed)
  polaroidFrame: '#0A0A0A',
  polaroidShadow: 'rgba(0, 0, 0, 0.7)',

  // GRADIENTS (minimal use)
  primaryGradient: ['#DC143C', '#8B0000'] as const,
  darkGradient: ['#000000', '#0A0A0A'] as const,

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
    shadowColor: '#DC143C',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 24,
    elevation: 10,
  },
  glowRed: {
    shadowColor: '#DC143C',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 24,
    elevation: 10,
  },
  accentGlow: {
    shadowColor: '#DC143C',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 24,
    elevation: 10,
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
  red: {
    borderWidth: 1,
    borderColor: 'rgba(220, 20, 60, 0.4)',
  },
  extraHeavy: {
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
} as const;

export type ColorKey = keyof typeof colors;
export type ShadowKey = keyof typeof shadows;
export type BorderKey = keyof typeof borders;
