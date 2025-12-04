/**
 * Scena - Liquid Glass Design System
 * Colors inspired by Apple's iOS 26 Liquid Glass + Reality Transurfing calm philosophy
 *
 * Core principle: Soft, muted, non-anxious, flowing
 */

export const colors = {
  // Background layers (soft, not stark white)
  background: {
    primary: '#F8F9FA',      // Soft off-white, like morning mist
    secondary: '#F0F2F5',    // Slightly deeper for depth
    tertiary: '#E8EAEF',     // Card shadows, subtle depth
    overlay: 'rgba(0, 0, 0, 0.3)',  // Gentle overlay for modals
  },

  // Glass effects (translucent, ethereal)
  glass: {
    light: 'rgba(255, 255, 255, 0.72)',      // Primary glass surface
    medium: 'rgba(255, 255, 255, 0.58)',     // Secondary glass
    dark: 'rgba(255, 255, 255, 0.42)',       // Tertiary glass
    border: 'rgba(255, 255, 255, 0.35)',     // Glass borders
    shadow: 'rgba(0, 0, 0, 0.08)',           // Soft shadows
    innerGlow: 'rgba(255, 255, 255, 0.25)',  // Inner light reflection
  },

  // Text (soft, not harsh black)
  text: {
    primary: '#2C3E50',      // Soft charcoal - main text
    secondary: '#7F8C9A',    // Muted blue-gray - secondary info
    tertiary: '#A8B5C4',     // Light gray - hints, placeholders
    inverse: '#FFFFFF',      // White text on dark
    accent: '#6B7B8C',       // Subtle accent text
  },

  // Accent colors (muted, calming - no aggressive reds)
  accent: {
    primary: '#8BA4B8',      // Soft steel blue - main actions
    secondary: '#A3B8C8',    // Lighter blue-gray
    success: '#8BC4A9',      // Soft sage green
    warning: '#C9B896',      // Muted gold
    gentle: '#B8A8C8',       // Soft lavender
  },

  // Timer dots (peaceful progression)
  timer: {
    empty: 'rgba(139, 164, 184, 0.25)',   // Unfilled dots
    filled: 'rgba(139, 164, 184, 0.85)',  // Filled dots
    urgent: 'rgba(184, 168, 200, 0.75)',  // Last few minutes (still calm)
  },

  // Reactions (emoji background highlights)
  reaction: {
    highlight: 'rgba(139, 164, 184, 0.15)',
    active: 'rgba(139, 164, 184, 0.25)',
  },

  // Input fields
  input: {
    background: 'rgba(255, 255, 255, 0.6)',
    border: 'rgba(139, 164, 184, 0.25)',
    borderFocus: 'rgba(139, 164, 184, 0.5)',
    placeholder: '#A8B5C4',
  },

  // Utility
  transparent: 'transparent',
  white: '#FFFFFF',
  black: '#000000',
};

// Gradient definitions for liquid glass effects (typed as tuples for expo-linear-gradient)
export const gradients = {
  // Glass card gradient (subtle depth)
  glassCard: ['rgba(255, 255, 255, 0.85)', 'rgba(255, 255, 255, 0.65)'] as const,

  // Background ambient gradient
  ambient: ['#F8F9FA', '#EEF1F5', '#E8EBEF'] as const,

  // Soft glow for buttons
  buttonGlow: ['rgba(139, 164, 184, 0.3)', 'rgba(139, 164, 184, 0.1)'] as const,

  // Timer progression
  timerFade: ['rgba(139, 164, 184, 0.9)', 'rgba(139, 164, 184, 0.4)'] as const,
};

export default colors;
