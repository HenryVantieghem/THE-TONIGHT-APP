// Animation configurations for Ghost Mode
// Fast, snappy, natural feeling animations

import type { EasingFunction } from 'react-native-reanimated';
import { Easing } from 'react-native-reanimated';

export const animations = {
  // SPRING CONFIGS - Natural physics
  spring: {
    default: {
      damping: 20,
      stiffness: 300,
      mass: 1,
    },
    snappy: {
      damping: 25,
      stiffness: 400,
      mass: 0.8,
    },
    smooth: {
      damping: 15,
      stiffness: 200,
      mass: 1.2,
    },
    bouncy: {
      damping: 10,
      stiffness: 200,
      mass: 1,
    },
    gentle: {
      damping: 30,
      stiffness: 180,
      mass: 1.5,
    },
  },

  // TIMING CONFIGS - Fast transitions
  timing: {
    instant: { duration: 100 },
    fast: { duration: 200 },
    normal: { duration: 300 },
    slow: { duration: 500 },
    verySlow: { duration: 800 },
  },

  // EASING FUNCTIONS
  easing: {
    out: Easing.out(Easing.ease),
    in: Easing.in(Easing.ease),
    inOut: Easing.inOut(Easing.ease),
    sharp: Easing.bezier(0.4, 0, 0.6, 1),
    linear: Easing.linear,
  },

  // PRESS ANIMATIONS
  press: {
    scale: {
      subtle: 0.98,
      moderate: 0.95,
      prominent: 0.92,
    },
    duration: 100,
  },

  // SCREEN TRANSITIONS
  transitions: {
    swipe: {
      duration: 300,
      easing: Easing.out(Easing.ease),
    },
    modal: {
      duration: 400,
      easing: Easing.out(Easing.cubic),
    },
    fade: {
      duration: 200,
      easing: Easing.inOut(Easing.ease),
    },
  },

  // SPECIFIC ANIMATIONS
  heart: {
    scaleIn: {
      duration: 200,
      scale: 1.3,
    },
    scaleOut: {
      duration: 300,
      scale: 1,
    },
    fadeOut: {
      duration: 300,
      delay: 600,
    },
  },

  capture: {
    flash: 100,
    thumbnail: 300,
  },

  timer: {
    pulse: {
      duration: 1000,
      minScale: 0.95,
      maxScale: 1.05,
    },
  },

  confetti: {
    particles: 50,
    duration: 2000,
    spread: 120,
  },

  story: {
    transition: 300,
    parallax: 0.5,
  },
} as const;

// GESTURE CONFIGS
export const gestures = {
  // Swipe thresholds
  swipe: {
    threshold: 50,          // Minimum distance to trigger
    velocityThreshold: 0.5, // Minimum velocity
    maxDuration: 300,       // Max swipe duration
  },

  // Pull to dismiss
  pullDown: {
    threshold: 100,
    velocityThreshold: 0.3,
    rubberBand: 0.7,        // Resistance factor
  },

  // Double tap
  doubleTap: {
    maxDelay: 300,          // Max time between taps
    radius: 50,             // Max distance between taps
  },

  // Long press
  longPress: {
    duration: 500,          // Time to trigger
  },

  // Pan settings
  pan: {
    minDistance: 10,        // Minimum distance to start
    activeOffsetX: [-10, 10],
    activeOffsetY: [-10, 10],
    failOffsetX: [-10, 10],
    failOffsetY: [-10, 10],
  },
} as const;

// ANIMATION PRESETS
export const animationPresets = {
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
    duration: 200,
  },
  fadeOut: {
    from: { opacity: 1 },
    to: { opacity: 0 },
    duration: 200,
  },
  slideUp: {
    from: { translateY: 20, opacity: 0 },
    to: { translateY: 0, opacity: 1 },
    duration: 300,
  },
  slideDown: {
    from: { translateY: -20, opacity: 0 },
    to: { translateY: 0, opacity: 1 },
    duration: 300,
  },
  slideLeft: {
    from: { translateX: 20, opacity: 0 },
    to: { translateX: 0, opacity: 1 },
    duration: 300,
  },
  slideRight: {
    from: { translateX: -20, opacity: 0 },
    to: { translateX: 0, opacity: 1 },
    duration: 300,
  },
  scale: {
    from: { scale: 0.9, opacity: 0 },
    to: { scale: 1, opacity: 1 },
    duration: 300,
  },
  pop: {
    from: { scale: 0.8, opacity: 0 },
    to: { scale: 1, opacity: 1 },
    duration: 200,
  },
} as const;

export type AnimationPreset = keyof typeof animationPresets;
export type SpringConfig = typeof animations.spring.default;
export type TimingConfig = typeof animations.timing.fast;

