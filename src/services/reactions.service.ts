/**
 * Scena - Reactions Service
 * Handle emoji reactions on moments
 */

import { supabase } from './supabase';
import { logError } from '../utils/errors';

export interface ReactionRow {
  id: string;
  moment_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

export interface ReactionWithUser extends ReactionRow {
  profiles: {
    id: string;
    username: string;
    avatar_url?: string;
  } | null;
}

export const reactionsService = {
  /**
   * Add a reaction to a moment
   */
  addReaction: async (momentId: string, emoji: string): Promise<ReactionRow | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('not authenticated');

      const { data, error } = await supabase
        .from('reactions')
        .insert({
          moment_id: momentId,
          user_id: user.id,
          emoji,
        })
        .select()
        .single();

      if (error) throw error;
      return data as ReactionRow;
    } catch (error) {
      logError(error, 'reactionsService.addReaction');
      return null;
    }
  },

  /**
   * Remove a reaction
   */
  removeReaction: async (reactionId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('reactions')
        .delete()
        .eq('id', reactionId);

      if (error) throw error;
    } catch (error) {
      logError(error, 'reactionsService.removeReaction');
      throw error;
    }
  },

  /**
   * Get all reactions for a moment
   */
  getMomentReactions: async (momentId: string): Promise<ReactionRow[]> => {
    try {
      const { data, error } = await supabase
        .from('reactions')
        .select('*')
        .eq('moment_id', momentId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as ReactionRow[] || [];
    } catch (error) {
      logError(error, 'reactionsService.getMomentReactions');
      return [];
    }
  },

  /**
   * Get all reactions for a moment with user profile information
   */
  getMomentReactionsWithUsers: async (momentId: string): Promise<ReactionWithUser[]> => {
    try {
      const { data, error } = await supabase
        .from('reactions')
        .select(`
          *,
          profiles!reactions_user_id_fkey (
            id,
            username,
            avatar_url
          )
        `)
        .eq('moment_id', momentId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data as ReactionWithUser[]) || [];
    } catch (error) {
      logError(error, 'reactionsService.getMomentReactionsWithUsers');
      return [];
    }
  },

  /**
   * Subscribe to reactions on a moment (realtime)
   */
  subscribeReactions: (momentId: string, callback: (reaction: ReactionRow, event: 'INSERT' | 'DELETE') => void) => {
    const subscription = supabase
      .channel(`reactions-${momentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reactions',
          filter: `moment_id=eq.${momentId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            callback(payload.new as ReactionRow, 'INSERT');
          } else if (payload.eventType === 'DELETE') {
            callback(payload.old as ReactionRow, 'DELETE');
          }
        }
      )
      .subscribe();

    return subscription;
  },
};

export default reactionsService;

