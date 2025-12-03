// GHOST MODE - Ultramodern Theme System
// Inspired by Snapchat's ephemeral design philosophy
// Dark-first, gesture-driven, camera-centric

export const theme = {
  // PRIMARY - Ghost Yellow (signature color)
  colors: {
    primary: '#FFFC00',           // Snapchat-inspired yellow
    primaryDark: '#E6E300',
    primaryLight: '#FFFD4D',
    primaryGlow: 'rgba(255, 252, 0, 0.3)',

    // BACKGROUNDS - Pure dark
    background: '#000000',         // Pure black
    backgroundSecondary: '#1C1C1E', // iOS dark gray
    backgroundTertiary: '#2C2C2E', // Slightly lighter
    backgroundQuaternary: '#3C3C3E',

    // SURFACES (Glassmorphism)
    glass: 'rgba(255, 255, 255, 0.1)',
    glassStrong: 'rgba(255, 255, 255, 0.15)',
    glassDark: 'rgba(0, 0, 0, 0.3)',
    glassBlack: 'rgba(0, 0, 0, 0.6)',
    glassYellow: 'rgba(255, 252, 0, 0.15)',

    // TEXT
    text: '#FFFFFF',              // White
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    textTertiary: 'rgba(255, 255, 255, 0.4)',
    textQuaternary: 'rgba(255, 255, 255, 0.2)',
    textInverse: '#000000',

    // ACCENTS (iOS-inspired vibrant)
    accent: '#FFFC00',            // Yellow
    accentRed: '#FF3B30',         // iOS red
    accentGreen: '#30D158',       // iOS green
    accentBlue: '#0A84FF',        // iOS blue
    accentPurple: '#BF5AF2',      // iOS purple
    accentOrange: '#FF9F0A',      // iOS orange
    accentPink: '#FF375F',        // iOS pink
    accentTeal: '#64D2FF',        // iOS teal

    // TIMER COLORS (vibrant, urgent)
    timerGreen: '#30D158',
    timerYellow: '#FFD60A',
    timerOrange: '#FF9F0A',
    timerRed: '#FF3B30',
    timerRedGlow: 'rgba(255, 59, 48, 0.4)',

    // SEMANTIC
    success: '#30D158',
    warning: '#FFD60A',
    error: '#FF3B30',
    info: '#0A84FF',

    // SPECIAL
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
    overlay: 'rgba(0, 0, 0, 0.6)',
    overlayLight: 'rgba(0, 0, 0, 0.3)',
    overlayStrong: 'rgba(0, 0, 0, 0.8)',

    // BORDERS (subtle)
    border: 'rgba(255, 255, 255, 0.1)',
    borderStrong: 'rgba(255, 255, 255, 0.2)',
    borderYellow: 'rgba(255, 252, 0, 0.3)',
  },

  // TYPOGRAPHY - System fonts
  typography: {
    fonts: {
      ios: 'SF Pro Text',
      android: 'Roboto',
      display: 'SF Pro Display',
    },
    sizes: {
      hero: 48,      // Onboarding titles
      xxxl: 36,      // Big statements
      xxl: 28,       // Section headers
      xl: 24,        // Screen titles
      lg: 20,        // Prominent text
      md: 16,        // Body text
      sm: 14,        // Secondary text
      xs: 12,        // Labels
      xxs: 10,       // Tiny text
    },
    weights: {
      black: '900' as const,
      bold: '700' as const,
      semibold: '600' as const,
      medium: '500' as const,
      regular: '400' as const,
      light: '300' as const,
    },
    lineHeights: {
      tight: 1.1,
      snug: 1.2,
      normal: 1.5,
      relaxed: 1.6,
      loose: 1.8,
    },
  },

  // SPACING - 4px base scale
  spacing: {
    '3xs': 2,
    '2xs': 4,
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 40,
    '3xl': 48,
    '4xl': 64,
    '5xl': 80,
  },

  // RADIUS - Modern rounded corners
  radius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    '2xl': 32,
    full: 9999,
  },

  // BLUR - For glassmorphism
  blur: {
    subtle: 10,
    light: 20,
    regular: 30,
    strong: 50,
    prominent: 60,
  },

  // SHADOWS - Subtle depth
  shadows: {
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
  },

  // GLASSMORPHISM - Preset glass styles
  glass: {
    light: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      backdropBlur: 20,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    medium: {
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      backdropBlur: 30,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    strong: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      backdropBlur: 40,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.25)',
    },
    dark: {
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      backdropBlur: 30,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    yellow: {
      backgroundColor: 'rgba(255, 252, 0, 0.15)',
      backdropBlur: 20,
      borderWidth: 1,
      borderColor: 'rgba(255, 252, 0, 0.3)',
    },
  },

  // MOTION - Animation configs
  motion: {
    // Spring physics (natural feel)
    spring: {
      damping: 20,
      stiffness: 300,
      mass: 1,
    },
    springSnappy: {
      damping: 25,
      stiffness: 400,
      mass: 0.8,
    },
    springSmooth: {
      damping: 15,
      stiffness: 200,
      mass: 1.2,
    },
    springBouncy: {
      damping: 10,
      stiffness: 200,
      mass: 1,
    },

    // Timing durations (fast and responsive)
    durations: {
      instant: 100,
      fast: 200,
      normal: 300,
      slow: 500,
      verySlow: 800,
    },

    // Easing curves
    easing: {
      out: [0.4, 0, 0.2, 1],      // Decelerate
      in: [0.4, 0, 1, 1],          // Accelerate
      inOut: [0.4, 0, 0.2, 1],     // Standard
      sharp: [0.4, 0, 0.6, 1],     // Sharp curve
    },

    // Press animations
    pressScale: {
      subtle: 0.98,
      moderate: 0.95,
      prominent: 0.92,
    },
  },

  // HAPTICS - Feedback map
  haptics: {
    buttonPress: 'light' as const,
    like: 'medium' as const,
    capture: 'heavy' as const,
    success: 'success' as const,
    error: 'error' as const,
    warning: 'warning' as const,
    swipeTransition: 'selection' as const,
    menuOpen: 'light' as const,
    reactionPick: 'light' as const,
  },

  // SIZING - Common sizes
  sizes: {
    avatar: {
      xs: 24,
      sm: 32,
      md: 40,
      lg: 56,
      xl: 80,
      xxl: 120,
    },
    button: {
      sm: 32,
      md: 44,
      lg: 56,
      xl: 64,
    },
    icon: {
      xs: 12,
      sm: 16,
      md: 20,
      lg: 24,
      xl: 32,
      xxl: 48,
    },
    capture: 80, // Capture button size
  },

  // HIT SLOP - Touch targets
  hitSlop: {
    sm: { top: 8, bottom: 8, left: 8, right: 8 },
    md: { top: 12, bottom: 12, left: 12, right: 12 },
    lg: { top: 16, bottom: 16, left: 16, right: 16 },
  },
} as const;

// Export individual parts for convenience
export const colors = theme.colors;
export const typography = theme.typography;
export const spacing = theme.spacing;
export const radius = theme.radius;
export const blur = theme.blur;
export const shadows = theme.shadows;
export const glass = theme.glass;
export const motion = theme.motion;
export const haptics = theme.haptics;
export const sizes = theme.sizes;
export const hitSlop = theme.hitSlop;

// Type exports
export type Theme = typeof theme;
export type ThemeColors = typeof theme.colors;
export type ThemeSpacing = keyof typeof theme.spacing;
export type ThemeRadius = keyof typeof theme.radius;
export type ThemeShadow = keyof typeof theme.shadows;
export type ThemeGlass = keyof typeof theme.glass;

