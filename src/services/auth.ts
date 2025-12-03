import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, TABLES, BUCKETS } from './supabase';
import type { User, ApiResponse } from '../types';

// Sign up with email and password
export async function signUp(
  email: string,
  password: string,
  username?: string
): Promise<ApiResponse<{ userId: string }>> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return {
        data: null,
        error: { message: getAuthErrorMessage(error.message), code: error.code },
      };
    }

    if (!data.user) {
      return {
        data: null,
        error: { message: 'Failed to create account. Please try again.' },
      };
    }

    // Create profile record (use upsert to handle duplicate key errors)
    // Check if profile already exists first to avoid unnecessary upsert
    const { data: existingProfile } = await supabase
      .from(TABLES.PROFILES)
      .select('id')
      .eq('id', data.user.id)
      .maybeSingle();

    if (!existingProfile) {
      const { error: profileError } = await supabase
        .from(TABLES.PROFILES)
        .insert({
          id: data.user.id,
          username: username ? username.toLowerCase() : null,
          avatar_url: null,
        });

      if (profileError && profileError.code !== '23505') {
        // Only log non-duplicate errors
        console.error('Error creating profile:', profileError);
      }
    } else if (username) {
      // Update existing profile with username if provided
      const { error: updateError } = await supabase
        .from(TABLES.PROFILES)
        .update({ username: username.toLowerCase() })
        .eq('id', data.user.id);

      if (updateError && updateError.code !== '23505') {
        console.error('Error updating profile with username:', updateError);
      }
    }

    // Create user stats record
    // Check if stats already exist first
    const { data: existingStats } = await supabase
      .from(TABLES.USER_STATS)
      .select('user_id')
      .eq('user_id', data.user.id)
      .maybeSingle();

    if (!existingStats) {
      const { error: statsError } = await supabase
        .from(TABLES.USER_STATS)
        .insert({
          user_id: data.user.id,
          total_posts: 0,
          total_friends: 0,
          total_views: 0,
        });

      // Silently ignore RLS errors (42501) - record might be created via trigger
      // Silently ignore duplicate errors (23505)
      if (statsError && statsError.code !== '42501' && statsError.code !== '23505') {
        console.error('Error creating user stats:', statsError);
      }
    }

    return { data: { userId: data.user.id }, error: null };
  } catch (err) {
    console.error('Sign up error:', err);
    return {
      data: null,
      error: { message: 'An unexpected error occurred. Please try again.' },
    };
  }
}

// Sign in with email and password
export async function signIn(
  email: string,
  password: string
): Promise<ApiResponse<{ userId: string }>> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        data: null,
        error: { message: getAuthErrorMessage(error.message), code: error.code },
      };
    }

    if (!data.user) {
      return {
        data: null,
        error: { message: 'Failed to sign in. Please try again.' },
      };
    }

    return { data: { userId: data.user.id }, error: null };
  } catch (err) {
    console.error('Sign in error:', err);
    return {
      data: null,
      error: { message: 'An unexpected error occurred. Please try again.' },
    };
  }
}

// Sign out with full cleanup
export async function signOut(): Promise<ApiResponse<null>> {
  try {
    // 1. Remove all Supabase realtime subscriptions
    const channels = supabase.getChannels();
    for (const channel of channels) {
      await supabase.removeChannel(channel);
    }

    // 2. Sign out from Supabase (clears session)
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Supabase signOut error:', error);
    }

    // 3. Clear all AsyncStorage data (except device preferences)
    try {
      const keys = await AsyncStorage.getAllKeys();
      const keysToRemove = keys.filter(
        (key) => !key.startsWith('device_') && !key.startsWith('@preferences')
      );
      if (keysToRemove.length > 0) {
        await AsyncStorage.multiRemove(keysToRemove);
      }
    } catch (storageError) {
      console.error('AsyncStorage clear error:', storageError);
    }

    return { data: null, error: null };
  } catch (err) {
    console.error('Sign out error:', err);
    return {
      data: null,
      error: { message: 'An unexpected error occurred. Please try again.' },
    };
  }
}

// Send password reset email
export async function resetPassword(email: string): Promise<ApiResponse<null>> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      return {
        data: null,
        error: { message: getAuthErrorMessage(error.message), code: error.code },
      };
    }

    return { data: null, error: null };
  } catch (err) {
    console.error('Reset password error:', err);
    return {
      data: null,
      error: { message: 'An unexpected error occurred. Please try again.' },
    };
  }
}

// Get current session
export async function getSession() {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      return { session: null, error };
    }

    return { session: data.session, error: null };
  } catch (err) {
    console.error('Get session error:', err);
    return { session: null, error: err };
  }
}

// Subscribe to auth state changes
export function onAuthStateChange(
  callback: (event: string, session: unknown) => void
) {
  return supabase.auth.onAuthStateChange(callback);
}

// Get user profile
export async function getUserProfile(userId: string): Promise<ApiResponse<User>> {
  try {
    const { data, error } = await supabase
      .from(TABLES.PROFILES)
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      return {
        data: null,
        error: { message: 'Failed to get profile.' },
      };
    }

    return { data: data as User, error: null };
  } catch (err) {
    console.error('Get profile error:', err);
    return {
      data: null,
      error: { message: 'An unexpected error occurred.' },
    };
  }
}

// Update username
export async function updateUsername(
  userId: string,
  username: string
): Promise<ApiResponse<User>> {
  try {
    const { data, error } = await supabase
      .from(TABLES.PROFILES)
      .update({ username: username.toLowerCase() })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return {
          data: null,
          error: { message: 'This username is already taken.' },
        };
      }
      return {
        data: null,
        error: { message: 'Failed to update username.' },
      };
    }

    return { data: data as User, error: null };
  } catch (err) {
    console.error('Update username error:', err);
    return {
      data: null,
      error: { message: 'An unexpected error occurred.' },
    };
  }
}

// Check if username is available
export async function checkUsernameAvailable(
  username: string
): Promise<ApiResponse<boolean>> {
  try {
    const { data, error } = await supabase
      .from(TABLES.PROFILES)
      .select('id')
      .eq('username', username.toLowerCase())
      .maybeSingle();

    if (error) {
      return {
        data: null,
        error: { message: 'Failed to check username availability.' },
      };
    }

    // Username is available if no record was found
    return { data: data === null, error: null };
  } catch (err) {
    console.error('Check username error:', err);
    return {
      data: null,
      error: { message: 'An unexpected error occurred.' },
    };
  }
}

// Update avatar from local URI (uploads to storage first)
export async function updateAvatarFromUri(
  userId: string,
  localUri: string
): Promise<ApiResponse<User>> {
  try {
    // Upload to storage
    const filename = `${userId}/avatar-${Date.now()}.jpg`;
    const response = await fetch(localUri);
    const blob = await response.blob();

    const { error: uploadError } = await supabase.storage
      .from(BUCKETS.AVATARS)
      .upload(filename, blob, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (uploadError) {
      console.error('Avatar upload error:', uploadError);
      return {
        data: null,
        error: { message: 'Failed to upload avatar image.' },
      };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKETS.AVATARS)
      .getPublicUrl(filename);

    const avatarUrl = urlData.publicUrl;

    // Update profile with new URL
    const { data, error } = await supabase
      .from(TABLES.PROFILES)
      .update({ avatar_url: avatarUrl })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return {
        data: null,
        error: { message: 'Failed to update profile with avatar.' },
      };
    }

    return { data: data as User, error: null };
  } catch (err) {
    console.error('Update avatar error:', err);
    return {
      data: null,
      error: { message: 'Failed to update avatar. Please try again.' },
    };
  }
}

// Update avatar URL directly (for external URLs)
export async function updateAvatar(
  userId: string,
  avatarUrl: string
): Promise<ApiResponse<User>> {
  try {
    const { data, error } = await supabase
      .from(TABLES.PROFILES)
      .update({ avatar_url: avatarUrl })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return {
        data: null,
        error: { message: 'Failed to update avatar.' },
      };
    }

    return { data: data as User, error: null };
  } catch (err) {
    console.error('Update avatar error:', err);
    return {
      data: null,
      error: { message: 'An unexpected error occurred.' },
    };
  }
}

// Delete account
export async function deleteAccount(userId: string): Promise<ApiResponse<null>> {
  try {
    // Delete profile (will cascade to other tables if RLS is set up)
    const { error: profileError } = await supabase
      .from(TABLES.PROFILES)
      .delete()
      .eq('id', userId);

    if (profileError) {
      return {
        data: null,
        error: { message: 'Failed to delete account data.' },
      };
    }

    // Sign out
    await supabase.auth.signOut();

    return { data: null, error: null };
  } catch (err) {
    console.error('Delete account error:', err);
    return {
      data: null,
      error: { message: 'An unexpected error occurred.' },
    };
  }
}

// Helper function to get user-friendly error messages
function getAuthErrorMessage(message: string): string {
  const errorMessages: Record<string, string> = {
    'Invalid login credentials': 'Incorrect email or password.',
    'Email not confirmed': 'Please check your email to confirm your account.',
    'User already registered': 'An account with this email already exists.',
    'Password should be at least 6 characters': 'Password must be at least 8 characters.',
    'Invalid email': 'Please enter a valid email address.',
  };

  return errorMessages[message] || message;
}
