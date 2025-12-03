import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '❌ CRITICAL: Missing Supabase environment variables!\n' +
    'Please create a .env.local file in the project root with:\n' +
    'EXPO_PUBLIC_SUPABASE_URL=https://fgoonvotrhuavidqrtdh.supabase.co\n' +
    'EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here\n\n' +
    'Current values:\n' +
    `  URL: ${supabaseUrl || 'MISSING'}\n` +
    `  Key: ${supabaseAnonKey ? 'SET (length: ' + supabaseAnonKey.length + ')' : 'MISSING'}`
  );
} else {
  console.log('✅ Supabase configuration loaded:', {
    url: supabaseUrl,
    keyLength: supabaseAnonKey.length,
    keyPrefix: supabaseAnonKey.substring(0, 20) + '...'
  });
}

export const supabase = createClient(
  supabaseUrl || 'https://fgoonvotrhuavidqrtdh.supabase.co',
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

// Test connection on initialization
(async () => {
  try {
    const { error, count } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
    if (error) {
      console.error('❌ Supabase connection test failed:', error.message);
    } else {
      console.log('✅ Supabase connected successfully. Profiles count:', count);
    }
  } catch (err: unknown) {
    console.error('❌ Supabase connection error:', err);
  }
})();

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
