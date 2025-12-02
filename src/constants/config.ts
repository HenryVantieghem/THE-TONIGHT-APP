import type { ReactionEmoji } from '../types';

export const config = {
  // App info
  APP_NAME: 'Experiences',
  APP_VERSION: '1.0.0',

  // Post settings
  POST_EXPIRY_HOURS: 1,
  MAX_CAPTION_LENGTH: 200,
  MAX_MEDIA_SIZE_MB: 10,
  VIDEO_MAX_DURATION_SECONDS: 30,

  // Timer update interval (ms)
  TIMER_UPDATE_INTERVAL: 30000, // 30 seconds
  TIMER_PULSE_THRESHOLD: 5, // minutes - start pulsing when <5m left

  // Reactions
  REACTIONS: ['😊', '❤️', '🔥', '💯'] as readonly ReactionEmoji[],

  // Username rules
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 20,
    PATTERN: /^[a-zA-Z][a-zA-Z0-9_]{2,19}$/,
    RULES: 'Must be 3-20 characters, lowercase letters, numbers, and underscores. Must start with a letter.',
  },

  // Password rules
  PASSWORD: {
    MIN_LENGTH: 8,
  },

  // Debounce timing
  DEBOUNCE: {
    USERNAME_CHECK: 300,
    SEARCH: 300,
  },

  // API settings
  API: {
    TIMEOUT: 10000,
    RETRY_COUNT: 3,
  },

  // Pagination
  PAGINATION: {
    POSTS_PER_PAGE: 20,
    FRIENDS_PER_PAGE: 50,
  },

  // Storage bucket names
  STORAGE: {
    POST_MEDIA: 'post-media',
    POST_IMAGES: 'post-images',
    AVATARS: 'avatars',
  },

  // Feature flags
  FEATURES: {
    VIDEO_POSTS: true,
    NOTIFICATIONS: true,
    DARK_MODE: false,
  },
} as const;

// Spacing constants (4px base unit per spec)
export const spacing = {
  '2xs': 2,    // 0.5 base - Tight icon spacing
  xs: 4,       // 1 base - Inline elements
  sm: 8,       // 2 base - Related elements
  md: 16,      // 4 base - Standard padding
  lg: 24,      // 6 base - Section spacing
  xl: 32,      // 8 base - Major sections
  xxl: 48,     // 12 base - Screen padding top (legacy alias)
  '2xl': 48,   // 12 base - Screen padding top
  '3xl': 64,   // 16 base - Hero spacing
} as const;

// Border radius (per spec)
export const borderRadius = {
  none: 0,
  sm: 6,       // Small buttons, badges
  md: 12,      // Inputs, small cards
  lg: 16,      // Cards, images
  xl: 24,      // Large cards, modals
  full: 9999,  // Pills, avatars, FAB
  
  // Legacy aliases
  xs: 4,
  round: 9999,
} as const;

// Shadow styles (per spec - using from colors.ts)
export { shadows } from './colors';

// Animation durations (per spec)
export const animations = {
  fast: 100,      // Button press
  normal: 300,    // Card appearance
  slow: 500,      // Timer transitions
  spring: {
    response: 0.3,
    dampingFraction: 0.7,
  },
} as const;

// Hit slop for touch targets (44x44pt minimum per spec)
export const hitSlop = {
  small: { top: 8, bottom: 8, left: 8, right: 8 },
  medium: { top: 12, bottom: 12, left: 12, right: 12 },
  large: { top: 16, bottom: 16, left: 16, right: 16 },
  icon: { top: 10, bottom: 10, left: 10, right: 10 }, // 44pt minimum
} as const;
