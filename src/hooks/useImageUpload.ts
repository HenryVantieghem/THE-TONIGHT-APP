/**
 * Scena - useImageUpload Hook
 * Handle image upload with progress and error handling
 */

import { useState } from 'react';
import { momentsService, CreateMomentData } from '../services/moments.service';
import { getErrorMessage } from '../utils/errors';
import { toast } from '../utils/toast';

export const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadMoment = async (data: CreateMomentData) => {
    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Simulate progress for user feedback
      setProgress(10);
      
      // Upload and create moment
      const moment = await momentsService.createMoment(data);
      
      setProgress(100);
      toast.success('moment shared');
      
      return moment;
    } catch (err: any) {
      const message = getErrorMessage(err);
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setUploading(false);
      // Reset progress after a short delay
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const reset = () => {
    setUploading(false);
    setProgress(0);
    setError(null);
  };

  return {
    uploading,
    progress,
    error,
    uploadMoment,
    reset,
  };
};

