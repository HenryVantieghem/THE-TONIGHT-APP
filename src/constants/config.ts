import type { ReactionEmoji } from '../types';

export const config = {
  // App info
  APP_NAME: 'Tonight',
  APP_VERSION: '1.0.0',

  // Post settings
  POST_EXPIRY_HOURS: 1,
  MAX_CAPTION_LENGTH: 200,
  MAX_MEDIA_SIZE_MB: 10,
  VIDEO_MAX_DURATION_SECONDS: 30,

  // Timer update interval (ms)
  TIMER_UPDATE_INTERVAL: 30000, // 30 seconds

  // Reactions
  REACTIONS: ['😊', '❤️', '🔥', '💯'] as readonly ReactionEmoji[],

  // Username rules
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 20,
    PATTERN: /^[a-z][a-z0-9_]*$/,
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
    AVATARS: 'avatars',
  },

  // Feature flags
  FEATURES: {
    VIDEO_POSTS: true,
    NOTIFICATIONS: true,
    DARK_MODE: false,
  },
} as const;

// Spacing constants
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// Border radius
export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 9999,
} as const;

// Shadow styles (iOS)
export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
} as const;

// Animation durations
export const animations = {
  fast: 150,
  normal: 250,
  slow: 400,
} as const;

// Hit slop for touch targets
export const hitSlop = {
  small: { top: 8, bottom: 8, left: 8, right: 8 },
  medium: { top: 12, bottom: 12, left: 12, right: 12 },
  large: { top: 16, bottom: 16, left: 16, right: 16 },
} as const;
