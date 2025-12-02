// Simplified glass constants - compatible interface, clean implementation
import { colors, shadows as baseShadows } from './colors';

export const liquidGlass = {
  blur: {
    subtle: 10,
    light: 20,
    regular: 30,
    strong: 50,
    prominent: 60,
  },
  material: {
    primary: { backgroundColor: colors.backgroundSecondary, backdropBlur: 20 },
    subtle: { backgroundColor: colors.backgroundTertiary, backdropBlur: 10 },
    elevated: { backgroundColor: colors.white, backdropBlur: 30 },
    dark: { backgroundColor: 'rgba(0,0,0,0.6)', backdropBlur: 30 },
  },
  border: {
    width: 1,
    color: colors.border,
    colorStrong: colors.border,
    colorDark: 'rgba(255,255,255,0.2)',
  },
} as const;

export const glassShadows = {
  ...baseShadows,
  key: baseShadows.level2,
  ambient: baseShadows.level1,
  floating: baseShadows.level4,
  glow: (color: string, _opacity?: number) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  }),
} as const;

export const glassMotion = {
  spring: {
    damping: 15,
    stiffness: 150,
    snappy: { damping: 20, stiffness: 300 },
    smooth: { damping: 15, stiffness: 120 },
  },
  timing: { duration: 200 },
  duration: { short: 150, medium: 250, long: 400, smooth: 300 },
  pressScale: {
    subtle: 0.98,
    moderate: 0.97,
    prominent: 0.95,
  },
} as const;

export const glassColors = {
  primary: colors.primary,
  primaryLight: colors.primaryLight,
  background: colors.background,
  surface: colors.surface,
  text: {
    primary: colors.text,
    secondary: colors.textSecondary,
    tertiary: colors.textTertiary,
    inverse: colors.textInverse,
    inverseSecondary: 'rgba(255,255,255,0.7)',
  },
  textSecondary: colors.textSecondary,
} as const;

export const glassGradients = {
  primary: colors.primaryGradient,
  tints: {
    indigo: ['rgba(99,102,241,0.1)', 'rgba(99,102,241,0.05)'],
  },
} as const;

export const glassPill = {
  height: 44,
  padding: 16,
  borderRadius: 22,
} as const;

export const glassLayout = {
  padding: 16,
  gap: 12,
  floatingOffset: { fromBottom: 24 },
} as const;

export const glassTabBar = {
  height: 80,
  padding: 8,
} as const;

export type GlassMaterialVariant = 'primary' | 'subtle' | 'elevated' | 'dark';

export const glassStyles = liquidGlass;
