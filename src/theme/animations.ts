/**
 * Scena - Animation Configuration
 * Gentle, flowing, non-jarring
 * Following Reality Transurfing: smooth like water, no sudden moves
 */

import { Easing } from 'react-native-reanimated';

// Duration presets (all slightly slower than typical - more peaceful)
export const durations = {
  instant: 100,
  fast: 200,
  normal: 350,
  slow: 500,
  gentle: 650,
  drift: 800,
};

// Easing curves (all gentle, no harsh bounces)
export const easings = {
  // Standard ease out - most common, feels natural
  easeOut: Easing.bezier(0.25, 0.1, 0.25, 1),

  // Gentle ease in-out for transitions
  easeInOut: Easing.bezier(0.42, 0, 0.58, 1),

  // Very soft deceleration
  gentle: Easing.bezier(0.16, 1, 0.3, 1),

  // Smooth settle (for cards, modals)
  settle: Easing.bezier(0.33, 1, 0.68, 1),

  // Float up effect
  floatUp: Easing.bezier(0.22, 1, 0.36, 1),

  // Subtle spring (not bouncy, just soft)
  softSpring: Easing.bezier(0.34, 1.56, 0.64, 1),
};

// Spring configurations for react-native-reanimated
export const springConfigs = {
  // Gentle spring - primary use
  gentle: {
    damping: 20,
    stiffness: 150,
    mass: 1,
  },

  // Soft spring - for subtle movements
  soft: {
    damping: 25,
    stiffness: 120,
    mass: 1.2,
  },

  // Responsive but calm
  responsive: {
    damping: 18,
    stiffness: 200,
    mass: 0.8,
  },

  // Very slow drift
  drift: {
    damping: 30,
    stiffness: 80,
    mass: 1.5,
  },
};

// Animation presets for common scenarios
export const animationPresets = {
  // Fade in content
  fadeIn: {
    duration: durations.normal,
    easing: easings.easeOut,
    fromOpacity: 0,
    toOpacity: 1,
  },

  // Fade out content
  fadeOut: {
    duration: durations.fast,
    easing: easings.easeInOut,
    fromOpacity: 1,
    toOpacity: 0,
  },

  // Slide up (for modals, sheets)
  slideUp: {
    duration: durations.gentle,
    easing: easings.settle,
    fromY: 100,
    toY: 0,
  },

  // Scale in (for buttons, cards)
  scaleIn: {
    duration: durations.normal,
    easing: easings.gentle,
    fromScale: 0.95,
    toScale: 1,
  },

  // Gentle press feedback
  pressIn: {
    duration: durations.fast,
    easing: easings.easeOut,
    toScale: 0.97,
    toOpacity: 0.9,
  },

  // Release from press
  pressOut: {
    duration: durations.normal,
    easing: easings.gentle,
    toScale: 1,
    toOpacity: 1,
  },

  // Card hover/focus
  cardFocus: {
    duration: durations.normal,
    easing: easings.settle,
    toScale: 1.02,
  },

  // Timer dot fill
  timerFill: {
    duration: durations.drift,
    easing: easings.easeInOut,
  },
};

// Haptic feedback intensities (light - no aggressive buzzing)
export const haptics = {
  selection: 'selection' as const,        // Very light
  light: 'impactLight' as const,          // Light tap
  medium: 'impactMedium' as const,        // Medium (use sparingly)
  success: 'notificationSuccess' as const, // Gentle success
};

export default {
  durations,
  easings,
  springConfigs,
  animationPresets,
  haptics,
};
