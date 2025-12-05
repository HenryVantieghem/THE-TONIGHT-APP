/**
 * Scena - Friends Service
 * Handle friend requests and friendships
 */

import { supabase } from './supabase';
import { logError } from '../utils/errors';

export interface FriendRequestRow {
  id: string;
  from_user_id: string;
  to_user_id: string;
  created_at: string;
  from_user?: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  to_user?: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
}

export interface FriendshipRow {
  id: string;
  user_id: string;
  friend_id: string;
  created_at: string;
  friend?: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
}

export interface ProfileRow {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
}

export const friendsService = {
  /**
   * Send a friend request
   */
  sendFriendRequest: async (toUserId: string): Promise<FriendRequestRow | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('not authenticated');

      const { data, error } = await supabase
        .from('friend_requests')
        .insert({
          from_user_id: user.id,
          to_user_id: toUserId,
        })
        .select()
        .single();

      if (error) throw error;
      return data as FriendRequestRow;
    } catch (error) {
      logError(error, 'friendsService.sendFriendRequest');
      return null;
    }
  },

  /**
   * Accept a friend request (creates bidirectional friendship)
   */
  acceptFriendRequest: async (requestId: string): Promise<void> => {
    try {
      // Call the database function that handles the acceptance
      const { error } = await supabase.rpc('accept_friend_request', {
        request_id: requestId,
      });

      if (error) throw error;
    } catch (error) {
      logError(error, 'friendsService.acceptFriendRequest');
      throw error;
    }
  },

  /**
   * Reject/cancel a friend request
   */
  rejectFriendRequest: async (requestId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('friend_requests')
        .delete()
        .eq('id', requestId);

      if (error) throw error;
    } catch (error) {
      logError(error, 'friendsService.rejectFriendRequest');
      throw error;
    }
  },

  /**
   * Remove a friend (unfriend)
   */
  removeFriend: async (friendshipId: string): Promise<void> => {
    try {
      // First, get the friendship to find both user_id and friend_id
      const { data: friendship, error: getError } = await supabase
        .from('friendships')
        .select('user_id, friend_id')
        .eq('id', friendshipId)
        .single();

      if (getError) throw getError;
      if (!friendship) throw new Error('friendship not found');

      // Delete both directions of the friendship
      const { error } = await supabase
        .from('friendships')
        .delete()
        .or(`and(user_id.eq.${friendship.user_id},friend_id.eq.${friendship.friend_id}),and(user_id.eq.${friendship.friend_id},friend_id.eq.${friendship.user_id})`);

      if (error) throw error;
    } catch (error) {
      logError(error, 'friendsService.removeFriend');
      throw error;
    }
  },

  /**
   * Get all friends
   */
  getFriends: async (): Promise<FriendshipRow[]> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('friendships')
        .select(`
          *,
          friend:profiles!friendships_friend_id_fkey (
            id,
            username,
            avatar_url
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as FriendshipRow[] || [];
    } catch (error) {
      logError(error, 'friendsService.getFriends');
      return [];
    }
  },

  /**
   * Get pending friend requests (incoming)
   */
  getPendingRequests: async (): Promise<FriendRequestRow[]> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('friend_requests')
        .select(`
          *,
          from_user:profiles!friend_requests_from_user_id_fkey (
            id,
            username,
            avatar_url
          )
        `)
        .eq('to_user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as FriendRequestRow[] || [];
    } catch (error) {
      logError(error, 'friendsService.getPendingRequests');
      return [];
    }
  },

  /**
   * Get sent friend requests (outgoing)
   */
  getSentRequests: async (): Promise<FriendRequestRow[]> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('friend_requests')
        .select(`
          *,
          to_user:profiles!friend_requests_to_user_id_fkey (
            id,
            username,
            avatar_url
          )
        `)
        .eq('from_user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as FriendRequestRow[] || [];
    } catch (error) {
      logError(error, 'friendsService.getSentRequests');
      return [];
    }
  },

  /**
   * Search users by username
   */
  searchUsers: async (query: string): Promise<ProfileRow[]> => {
    try {
      if (!query || query.trim().length < 2) return [];

      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, bio')
        .ilike('username', `%${query.trim()}%`)
        .limit(20);

      if (error) throw error;
      return data as ProfileRow[] || [];
    } catch (error) {
      logError(error, 'friendsService.searchUsers');
      return [];
    }
  },

  /**
   * Check if users are friends
   */
  areFriends: async (userId1: string, userId2: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('friendships')
        .select('id')
        .eq('user_id', userId1)
        .eq('friend_id', userId2)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      return !!data;
    } catch (error) {
      logError(error, 'friendsService.areFriends');
      return false;
    }
  },

  /**
   * Check if there's a pending request between users
   */
  hasPendingRequest: async (fromUserId: string, toUserId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('friend_requests')
        .select('id')
        .eq('from_user_id', fromUserId)
        .eq('to_user_id', toUserId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    } catch (error) {
      logError(error, 'friendsService.hasPendingRequest');
      return false;
    }
  },

  /**
   * Subscribe to friend requests (realtime)
   */
  subscribeFriendRequests: (callback: (request: FriendRequestRow, event: 'INSERT' | 'DELETE') => void) => {
    const subscription = supabase
      .channel('friend-requests-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friend_requests',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            callback(payload.new as FriendRequestRow, 'INSERT');
          } else if (payload.eventType === 'DELETE') {
            callback(payload.old as FriendRequestRow, 'DELETE');
          }
        }
      )
      .subscribe();

    return subscription;
  },
};

export default friendsService;

