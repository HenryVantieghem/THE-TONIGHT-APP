import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Missing Supabase environment variables. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env.local'
  );
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

// Database table names
export const TABLES = {
  PROFILES: 'profiles',
  POSTS: 'posts',
  FRIENDSHIPS: 'friendships',
  REACTIONS: 'reactions',
  BLOCKED_USERS: 'blocked_users',
  USER_STATS: 'user_stats',
} as const;

// Storage bucket names
export const BUCKETS = {
  POST_MEDIA: 'post-media',
  AVATARS: 'avatars',
} as const;

// Realtime channel names
export const CHANNELS = {
  POSTS: 'posts-realtime',
  FRIENDSHIPS: 'friendships-realtime',
} as const;
