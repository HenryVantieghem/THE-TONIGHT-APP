/**
 * Scena - Spacing System
 * Generous breathing room - nothing cramped
 * Following Reality Transurfing: spacious, relaxed, flowing
 */

export const spacing = {
  // Base unit: 4px
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,

  // Screen padding
  screenHorizontal: 20,
  screenVertical: 24,

  // Card internal padding
  cardPadding: 20,
  cardMargin: 16,

  // Input fields
  inputPadding: 16,
  inputMargin: 12,

  // Between elements (generous)
  elementGap: 16,
  sectionGap: 32,
};

// Border radius (soft, rounded - liquid glass feel)
export const borderRadius = {
  none: 0,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  full: 9999,

  // Specific use cases
  card: 24,
  button: 16,
  input: 14,
  avatar: 9999,
  pill: 9999,
};

// Shadows (soft, subtle - not harsh)
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },

  // Gentle lift for cards
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },

  // Medium depth
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
  },

  // For floating elements
  float: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 28,
    elevation: 8,
  },

  // Inner glow effect (for glass)
  innerGlow: {
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 0,
  },
};

// Hit slop for touch targets (generous - no fumbling)
export const hitSlop = {
  default: { top: 12, bottom: 12, left: 12, right: 12 },
  large: { top: 20, bottom: 20, left: 20, right: 20 },
};

export default spacing;
