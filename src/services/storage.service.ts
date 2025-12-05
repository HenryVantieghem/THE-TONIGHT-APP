/**
 * Scena - Storage Service
 * Handle file uploads to Supabase Storage
 */

import { supabase } from './supabase';
import { StorageError, logError } from '../utils/errors';
import { compressImage, generateThumbnail } from '../utils/imageCompression';

export const storageService = {
  /**
   * Upload avatar image
   */
  uploadAvatar: async (userId: string, imageUri: string): Promise<string> => {
    try {
      // Generate thumbnail for avatar
      const thumbnailUri = await generateThumbnail(imageUri);
      
      // Convert to blob
      const response = await fetch(thumbnailUri);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      
      // Create unique filename
      const fileExt = 'jpg';
      const fileName = `${userId}/avatar-${Date.now()}.${fileExt}`;
      
      // Upload to storage
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, arrayBuffer, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (error) throw error;
      if (!data) throw new StorageError('upload failed');

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      logError(error, 'storageService.uploadAvatar');
      throw new StorageError('avatar upload failed');
    }
  },

  /**
   * Upload moment image
   */
  uploadMoment: async (userId: string, imageUri: string): Promise<string> => {
    try {
      // Compress image
      const compressedUri = await compressImage(imageUri, {
        maxWidth: 2048,
        maxHeight: 2048,
        quality: 0.8,
      });
      
      // Convert to blob
      const response = await fetch(compressedUri);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      
      // Create unique filename
      const fileExt = 'jpg';
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      
      // Upload to storage
      const { data, error } = await supabase.storage
        .from('moments')
        .upload(fileName, arrayBuffer, {
          contentType: 'image/jpeg',
        });

      if (error) throw error;
      if (!data) throw new StorageError('upload failed');

      // Get URL (for private bucket, we'll use a different method)
      return data.path;
    } catch (error) {
      logError(error, 'storageService.uploadMoment');
      throw new StorageError('moment upload failed');
    }
  },

  /**
   * Get signed URL for private moment image
   */
  getMomentUrl: async (path: string): Promise<string> => {
    try {
      const { data, error } = await supabase.storage
        .from('moments')
        .createSignedUrl(path, 3600); // 1 hour expiry

      if (error) throw error;
      if (!data) throw new StorageError('failed to get url');

      return data.signedUrl;
    } catch (error) {
      logError(error, 'storageService.getMomentUrl');
      throw new StorageError('failed to load image');
    }
  },

  /**
   * Delete image from storage
   */
  deleteImage: async (bucket: 'avatars' | 'moments', path: string): Promise<void> => {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) throw error;
    } catch (error) {
      logError(error, 'storageService.deleteImage');
      // Don't throw - deletion errors are not critical
    }
  },

  /**
   * Get public URL (for avatars)
   */
  getPublicUrl: (bucket: 'avatars' | 'moments', path: string): string => {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return data.publicUrl;
  },
};

export default storageService;

