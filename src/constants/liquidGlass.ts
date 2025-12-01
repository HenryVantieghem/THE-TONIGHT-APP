// Liquid Glass Design System for iOS 26+
// Apple's new design language featuring translucent materials, dynamic transformations,
// and content-first hierarchy with adaptive controls

import { Platform, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============================================================================
// CORE LIQUID GLASS MATERIAL PROPERTIES
// ============================================================================

export const liquidGlass = {
  // Primary glass material - standard translucent surface
  material: {
    primary: {
      backgroundColor: 'rgba(255, 255, 255, 0.72)',
      backdropBlur: 40,
      saturation: 180,
    },
    // Elevated glass - more prominent, less transparent
    elevated: {
      backgroundColor: 'rgba(255, 255, 255, 0.85)',
      backdropBlur: 60,
      saturation: 200,
    },
    // Subtle glass - more transparent, for overlays
    subtle: {
      backgroundColor: 'rgba(255, 255, 255, 0.45)',
      backdropBlur: 25,
      saturation: 150,
    },
    // Dark glass - for dark mode or dark content areas
    dark: {
      backgroundColor: 'rgba(0, 0, 0, 0.55)',
      backdropBlur: 50,
      saturation: 180,
    },
    // Tinted glass - derives color from underlying content
    tinted: {
      backgroundColor: 'rgba(255, 255, 255, 0.35)',
      backdropBlur: 40,
      saturation: 220,
    },
  },

  // Blur intensities for different contexts
  blur: {
    none: 0,
    subtle: 15,
    light: 25,
    regular: 40,
    prominent: 60,
    ultra: 80,
  },

  // Border properties for glass elements
  border: {
    width: 0.5,
    color: 'rgba(255, 255, 255, 0.25)',
    colorDark: 'rgba(255, 255, 255, 0.12)',
    colorStrong: 'rgba(255, 255, 255, 0.45)',
  },
} as const;

// ============================================================================
// MULTI-LAYERED SHADOW SYSTEM
// ============================================================================

export const glassShadows = {
  // Ambient shadow - soft, large spread
  ambient: {
    shadowColor: 'rgba(0, 0, 0, 0.08)',
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    shadowOpacity: 1,
    elevation: 8,
  },
  
  // Key shadow - sharper, defines shape
  key: {
    shadowColor: 'rgba(0, 0, 0, 0.12)',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    shadowOpacity: 1,
    elevation: 6,
  },

  // Glow shadow - colored, emissive feel
  glow: (color: string, opacity: number = 0.35) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 20,
    shadowOpacity: opacity,
    elevation: 10,
  }),

  // Floating shadow - for elevated pill buttons
  floating: {
    shadowColor: 'rgba(0, 0, 0, 0.18)',
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 32,
    shadowOpacity: 1,
    elevation: 12,
  },

  // Inner highlight - top edge glow
  innerHighlight: {
    top: 'rgba(255, 255, 255, 0.35)',
    bottom: 'rgba(0, 0, 0, 0.05)',
  },

  // Refraction shadow - simulates light bending
  refraction: {
    shadowColor: 'rgba(100, 150, 255, 0.15)',
    shadowOffset: { width: -2, height: 4 },
    shadowRadius: 16,
    shadowOpacity: 1,
    elevation: 4,
  },
} as const;

// ============================================================================
// PILL-SHAPED CONTROL CONFIGURATIONS
// ============================================================================

export const glassPill = {
  // Standard pill for tab bars and action buttons
  standard: {
    height: 52,
    minWidth: 120,
    borderRadius: 26,
    paddingHorizontal: 20,
  },
  // Compact pill for inline actions
  compact: {
    height: 40,
    minWidth: 80,
    borderRadius: 20,
    paddingHorizontal: 16,
  },
  // Large pill for primary actions
  large: {
    height: 58,
    minWidth: 160,
    borderRadius: 29,
    paddingHorizontal: 28,
  },
  // Icon-only circular pill
  icon: {
    size: 48,
    borderRadius: 24,
  },
  // Floating action button style
  fab: {
    size: 64,
    borderRadius: 32,
  },
} as const;

// ============================================================================
// TAB BAR CONFIGURATIONS (Shrink/Expand on Scroll)
// ============================================================================

export const glassTabBar = {
  // Expanded state (default)
  expanded: {
    height: 88,
    labelVisible: true,
    iconSize: 24,
    marginBottom: 34, // Safe area consideration
  },
  // Collapsed state (on scroll)
  collapsed: {
    height: 56,
    labelVisible: false,
    iconSize: 22,
    marginBottom: 20,
  },
  // Animation configuration
  animation: {
    scrollThreshold: 100, // Pixels to scroll before collapsing
    duration: 280,
    damping: 0.8,
    stiffness: 300,
  },
} as const;

// ============================================================================
// MOTION & ANIMATION CONSTANTS
// ============================================================================

export const glassMotion = {
  // Spring configurations for natural feel
  spring: {
    // Snappy - quick, responsive interactions
    snappy: {
      damping: 18,
      stiffness: 400,
      mass: 0.8,
    },
    // Smooth - fluid, elegant transitions
    smooth: {
      damping: 22,
      stiffness: 280,
      mass: 1,
    },
    // Bouncy - playful, energetic
    bouncy: {
      damping: 12,
      stiffness: 180,
      mass: 1.2,
    },
  },

  // Duration presets
  duration: {
    instant: 100,
    quick: 180,
    normal: 280,
    smooth: 400,
    elegant: 550,
  },

  // Parallax effect intensities
  parallax: {
    subtle: 0.05,
    moderate: 0.15,
    prominent: 0.25,
  },

  // Scale values for press states
  pressScale: {
    subtle: 0.98,
    moderate: 0.95,
    prominent: 0.92,
  },
} as const;

// ============================================================================
// GRADIENT TINTS (Derived from content)
// ============================================================================

export const glassGradients = {
  // Ambient gradient overlay for glass
  ambient: {
    light: ['rgba(255, 255, 255, 0.4)', 'rgba(255, 255, 255, 0.1)'] as const,
    dark: ['rgba(0, 0, 0, 0.2)', 'rgba(0, 0, 0, 0.05)'] as const,
  },

  // Tint gradients based on common colors
  tints: {
    coral: ['rgba(255, 107, 107, 0.2)', 'rgba(255, 142, 83, 0.1)'] as const,
    sky: ['rgba(135, 206, 250, 0.2)', 'rgba(176, 224, 230, 0.1)'] as const,
    mint: ['rgba(152, 251, 152, 0.2)', 'rgba(144, 238, 144, 0.1)'] as const,
    lavender: ['rgba(230, 230, 250, 0.25)', 'rgba(216, 191, 216, 0.1)'] as const,
    gold: ['rgba(255, 215, 0, 0.15)', 'rgba(255, 193, 37, 0.05)'] as const,
  },

  // Rainbow shimmer effect
  shimmer: [
    'rgba(255, 255, 255, 0)',
    'rgba(255, 255, 255, 0.4)',
    'rgba(255, 255, 255, 0)',
  ] as const,
} as const;

// ============================================================================
// SPACING & LAYOUT FOR LIQUID GLASS
// ============================================================================

export const glassLayout = {
  // Floating control positioning (not edge-anchored)
  floatingOffset: {
    fromEdge: 20,
    fromBottom: 32,
    fromTop: 16,
  },

  // Glass container padding
  containerPadding: {
    compact: 12,
    standard: 16,
    spacious: 24,
  },

  // Content insets within glass
  contentInset: {
    horizontal: 20,
    vertical: 16,
  },

  // Gap between glass elements
  gap: {
    xs: 6,
    sm: 10,
    md: 16,
    lg: 24,
    xl: 32,
  },
} as const;

// ============================================================================
// COLOR SYSTEM FOR LIQUID GLASS
// ============================================================================

export const glassColors = {
  // Text colors optimized for glass backgrounds
  text: {
    primary: 'rgba(0, 0, 0, 0.88)',
    secondary: 'rgba(0, 0, 0, 0.55)',
    tertiary: 'rgba(0, 0, 0, 0.35)',
    inverse: 'rgba(255, 255, 255, 0.95)',
    inverseSecondary: 'rgba(255, 255, 255, 0.7)',
  },

  // Accent colors with glass-appropriate opacity
  accent: {
    primary: '#FF6B6B',
    primaryMuted: 'rgba(255, 107, 107, 0.8)',
    secondary: '#6366F1',
    secondaryMuted: 'rgba(99, 102, 241, 0.8)',
  },

  // Semantic colors
  semantic: {
    success: 'rgba(34, 197, 94, 0.9)',
    warning: 'rgba(245, 158, 11, 0.9)',
    error: 'rgba(239, 68, 68, 0.9)',
    info: 'rgba(59, 130, 246, 0.9)',
  },

  // Overlay colors
  overlay: {
    light: 'rgba(255, 255, 255, 0.6)',
    dark: 'rgba(0, 0, 0, 0.4)',
    scrim: 'rgba(0, 0, 0, 0.25)',
  },
} as const;

// ============================================================================
// REFRACTION EFFECT UTILITIES
// ============================================================================

export const glassRefraction = {
  // Offset for refracted elements
  offset: {
    x: 2,
    y: 4,
  },

  // Chromatic aberration simulation
  chromatic: {
    red: { x: -1, y: 0 },
    green: { x: 0, y: 0 },
    blue: { x: 1, y: 0 },
  },

  // Distortion intensity
  intensity: {
    subtle: 0.5,
    moderate: 1.0,
    strong: 2.0,
  },
} as const;

// ============================================================================
// STYLE HELPERS FOR REACT NATIVE
// ============================================================================

// Generate glass container style
export const createGlassStyle = (
  variant: keyof typeof liquidGlass.material = 'primary',
  withBorder: boolean = true
) => {
  const material = liquidGlass.material[variant];
  
  return {
    backgroundColor: material.backgroundColor,
    borderWidth: withBorder ? liquidGlass.border.width : 0,
    borderColor: liquidGlass.border.color,
    overflow: 'hidden' as const,
  };
};

// Generate pill button style
export const createPillStyle = (
  size: keyof typeof glassPill = 'standard'
) => {
  const pill = glassPill[size];
  
  if ('size' in pill) {
    return {
      width: pill.size,
      height: pill.size,
      borderRadius: pill.borderRadius,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    };
  }
  
  return {
    height: pill.height,
    minWidth: pill.minWidth,
    borderRadius: pill.borderRadius,
    paddingHorizontal: pill.paddingHorizontal,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  };
};

// Combine multiple shadow layers for realistic depth
export const combineShadows = (...shadowKeys: (keyof typeof glassShadows)[]) => {
  // In React Native, we can only apply one shadow, so we'll use the most prominent one
  // For web/CSS, you would combine these with filter: drop-shadow()
  return glassShadows.floating; // Use floating as default for prominent elements
};

// Get blur view props for expo-blur
export const getBlurProps = (intensity: keyof typeof liquidGlass.blur = 'regular') => ({
  intensity: liquidGlass.blur[intensity],
  tint: 'light' as const,
  experimentalBlurMethod: Platform.OS === 'android' ? 'dimezisBlurView' as const : undefined,
});

// Calculate responsive values based on screen size
export const responsive = {
  width: (percentage: number) => SCREEN_WIDTH * (percentage / 100),
  height: (percentage: number) => SCREEN_HEIGHT * (percentage / 100),
  scale: (base: number, factor: number = 0.1) => {
    const scaleFactor = Math.min(SCREEN_WIDTH / 390, 1.2); // 390 is iPhone 14 Pro width
    return base * (1 + (scaleFactor - 1) * factor);
  },
};

// ============================================================================
// EXPORTED TYPE DEFINITIONS
// ============================================================================

export type GlassMaterialVariant = keyof typeof liquidGlass.material;
export type GlassBlurIntensity = keyof typeof liquidGlass.blur;
export type GlassPillSize = keyof typeof glassPill;
export type GlassMotionPreset = keyof typeof glassMotion.spring;

export default {
  liquidGlass,
  glassShadows,
  glassPill,
  glassTabBar,
  glassMotion,
  glassGradients,
  glassLayout,
  glassColors,
  glassRefraction,
  createGlassStyle,
  createPillStyle,
  combineShadows,
  getBlurProps,
  responsive,
};

