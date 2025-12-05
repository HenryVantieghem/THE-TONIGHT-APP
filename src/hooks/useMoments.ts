/**
 * Scena - useMoments Hook
 * Fetch and manage moments with real-time updates
 */

import { useState, useEffect, useCallback } from 'react';
import { momentsService, MomentRow } from '../services/moments.service';
import { getErrorMessage } from '../utils/errors';

export const useMoments = () => {
  const [moments, setMoments] = useState<MomentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMoments = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);

    try {
      const data = await momentsService.getFriendsMoments();
      // Filter out expired moments
      const now = new Date();
      const activeMoments = data.filter(m => new Date(m.expires_at) > now);
      setMoments(activeMoments);
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchMoments(false);
  }, [fetchMoments]);

  // Initial fetch
  useEffect(() => {
    fetchMoments();
  }, [fetchMoments]);

  // Subscribe to new moments
  useEffect(() => {
    const subscription = momentsService.subscribeMoments((newMoment) => {
      setMoments(prev => {
        // Check if moment already exists
        if (prev.some(m => m.id === newMoment.id)) {
          return prev;
        }
        // Add to top of list
        return [newMoment, ...prev];
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Clean up expired moments periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setMoments(prev => prev.filter(m => new Date(m.expires_at) > now));
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  return {
    moments,
    loading,
    refreshing,
    error,
    refresh,
  };
};

