/**
 * Scena - Moments Service
 * Handle moment creation, fetching, and management
 */

import { supabase } from './supabase';
import { storageService } from './storage.service';
import { logError } from '../utils/errors';

export interface CreateMomentData {
  imageUri: string;
  frontCameraUri?: string;
  location?: string;
  caption?: string;
}

export interface MomentRow {
  id: string;
  user_id: string;
  image_url: string;
  front_camera_url: string | null;
  location: string | null;
  caption: string | null;
  created_at: string;
  expires_at: string;
  profiles: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  reactions: Array<{
    id: string;
    user_id: string;
    emoji: string;
    created_at: string;
  }>;
}

export const momentsService = {
  /**
   * Create a new moment
   */
  createMoment: async (data: CreateMomentData) => {
    const { imageUri, frontCameraUri, location, caption } = data;

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('not authenticated');

      // Upload main image
      const imagePath = await storageService.uploadMoment(user.id, imageUri);

      // Upload front camera image if provided
      let frontCameraPath: string | undefined;
      if (frontCameraUri) {
        frontCameraPath = await storageService.uploadMoment(user.id, frontCameraUri);
      }

      // Calculate expiry (1 hour from now)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      // Create moment record
      const { data: moment, error } = await supabase
        .from('moments')
        .insert({
          user_id: user.id,
          image_url: imagePath,
          front_camera_url: frontCameraPath || null,
          location: location || null,
          caption: caption || null,
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      if (!moment) throw new Error('moment creation failed');

      return moment;
    } catch (error) {
      logError(error, 'momentsService.createMoment');
      throw error;
    }
  },

  /**
   * Get moments from friends (active only)
   */
  getFriendsMoments: async (): Promise<MomentRow[]> => {
    try {
      const { data, error } = await supabase
        .from('moments')
        .select(`
          *,
          profiles!moments_user_id_fkey (
            id,
            username,
            avatar_url
          ),
          reactions (
            id,
            user_id,
            emoji,
            created_at
          )
        `)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as MomentRow[] || [];
    } catch (error) {
      logError(error, 'momentsService.getFriendsMoments');
      return [];
    }
  },

  /**
   * Get moments from specific user
   */
  getUserMoments: async (userId: string): Promise<MomentRow[]> => {
    try {
      const { data, error } = await supabase
        .from('moments')
        .select(`
          *,
          profiles!moments_user_id_fkey (
            id,
            username,
            avatar_url
          ),
          reactions (
            id,
            user_id,
            emoji,
            created_at
          )
        `)
        .eq('user_id', userId)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as MomentRow[] || [];
    } catch (error) {
      logError(error, 'momentsService.getUserMoments');
      return [];
    }
  },

  /**
   * Get a single moment by ID
   */
  getMoment: async (momentId: string): Promise<MomentRow | null> => {
    try {
      const { data, error } = await supabase
        .from('moments')
        .select(`
          *,
          profiles!moments_user_id_fkey (
            id,
            username,
            avatar_url
          ),
          reactions (
            id,
            user_id,
            emoji,
            created_at
          )
        `)
        .eq('id', momentId)
        .single();

      if (error) throw error;
      return data as MomentRow;
    } catch (error) {
      logError(error, 'momentsService.getMoment');
      return null;
    }
  },

  /**
   * Delete a moment (before expiry)
   */
  deleteMoment: async (momentId: string): Promise<void> => {
    try {
      // Get moment to check ownership and get image paths
      const { data: moment } = await supabase
        .from('moments')
        .select('user_id, image_url, front_camera_url')
        .eq('id', momentId)
        .single();

      if (!moment) throw new Error('moment not found');

      // Delete from database (RLS will check ownership)
      const { error: deleteError } = await supabase
        .from('moments')
        .delete()
        .eq('id', momentId);

      if (deleteError) throw deleteError;

      // Delete images from storage
      await storageService.deleteImage('moments', moment.image_url);
      if (moment.front_camera_url) {
        await storageService.deleteImage('moments', moment.front_camera_url);
      }
    } catch (error) {
      logError(error, 'momentsService.deleteMoment');
      throw error;
    }
  },

  /**
   * Subscribe to new moments (realtime)
   */
  subscribeMoments: (callback: (moment: MomentRow) => void) => {
    const subscription = supabase
      .channel('moments-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'moments',
        },
        async (payload) => {
          // Fetch full moment data with relations
          const moment = await momentsService.getMoment(payload.new.id);
          if (moment) {
            callback(moment);
          }
        }
      )
      .subscribe();

    return subscription;
  },
};

export default momentsService;

