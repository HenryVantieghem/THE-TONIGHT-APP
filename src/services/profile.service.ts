/**
 * Scena - Profile Service
 * Handle user profile operations
 */

import { supabase } from './supabase';
import { storageService } from './storage.service';
import { logError } from '../utils/errors';
import { validators } from '../utils/validators';

export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileData {
  username?: string;
  bio?: string;
  avatarUri?: string;
}

export const profileService = {
  /**
   * Get profile by user ID
   */
  getProfile: async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data as Profile;
    } catch (error) {
      logError(error, 'profileService.getProfile');
      return null;
    }
  },

  /**
   * Get current user's profile
   */
  getCurrentProfile: async (): Promise<Profile | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      return await profileService.getProfile(user.id);
    } catch (error) {
      logError(error, 'profileService.getCurrentProfile');
      return null;
    }
  },

  /**
   * Update profile
   */
  updateProfile: async (updates: UpdateProfileData): Promise<Profile | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('not authenticated');

      const updateData: any = {};

      // Update username if provided
      if (updates.username !== undefined) {
        const usernameCheck = validators.username(updates.username);
        if (!usernameCheck.valid) {
          throw new Error(usernameCheck.message);
        }
        updateData.username = validators.sanitizeText(updates.username);
      }

      // Update bio if provided
      if (updates.bio !== undefined) {
        updateData.bio = validators.sanitizeText(updates.bio);
      }

      // Upload new avatar if provided
      if (updates.avatarUri) {
        const avatarUrl = await storageService.uploadAvatar(user.id, updates.avatarUri);
        updateData.avatar_url = avatarUrl;
      }

      // Update profile in database
      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data as Profile;
    } catch (error) {
      logError(error, 'profileService.updateProfile');
      throw error;
    }
  },

  /**
   * Check if username is available
   */
  checkUsernameAvailable: async (username: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username.trim())
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows

      // If we found a profile with this username
      if (data) {
        // It's available if it's the current user's username
        return user ? data.id === user.id : false;
      }

      // No profile found with this username, so it's available
      return true;
    } catch (error) {
      logError(error, 'profileService.checkUsernameAvailable');
      return false;
    }
  },

  /**
   * Get profile with stats (moment count, friend count)
   */
  getProfileWithStats: async (userId: string) => {
    try {
      // Get profile
      const profile = await profileService.getProfile(userId);
      if (!profile) return null;

      // Get moment count (today)
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { count: momentCount } = await supabase
        .from('moments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', today.toISOString());

      // Get friend count
      const { count: friendCount } = await supabase
        .from('friendships')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      return {
        ...profile,
        momentCount: momentCount || 0,
        friendCount: friendCount || 0,
      };
    } catch (error) {
      logError(error, 'profileService.getProfileWithStats');
      return null;
    }
  },
};

export default profileService;

