/**
 * Scena - useFriends Hook
 * Manage friends and friend requests
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  friendsService, 
  FriendshipRow, 
  FriendRequestRow,
  ProfileRow 
} from '../services/friends.service';
import { getErrorMessage } from '../utils/errors';
import { toast } from '../utils/toast';

export const useFriends = () => {
  const [friends, setFriends] = useState<FriendshipRow[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequestRow[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFriends = useCallback(async () => {
    try {
      const data = await friendsService.getFriends();
      setFriends(data);
    } catch (err: any) {
      setError(getErrorMessage(err));
    }
  }, []);

  const fetchPendingRequests = useCallback(async () => {
    try {
      const data = await friendsService.getPendingRequests();
      setPendingRequests(data);
    } catch (err: any) {
      setError(getErrorMessage(err));
    }
  }, []);

  const fetchSentRequests = useCallback(async () => {
    try {
      const data = await friendsService.getSentRequests();
      setSentRequests(data);
    } catch (err: any) {
      setError(getErrorMessage(err));
    }
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    await Promise.all([
      fetchFriends(),
      fetchPendingRequests(),
      fetchSentRequests(),
    ]);

    setLoading(false);
  }, [fetchFriends, fetchPendingRequests, fetchSentRequests]);

  const sendFriendRequest = async (userId: string) => {
    try {
      await friendsService.sendFriendRequest(userId);
      toast.success('request sent');
      await fetchSentRequests();
      return true;
    } catch (err: any) {
      toast.error(getErrorMessage(err));
      return false;
    }
  };

  const acceptFriendRequest = async (requestId: string) => {
    try {
      await friendsService.acceptFriendRequest(requestId);
      toast.success('friend added');
      await fetchAll();
      return true;
    } catch (err: any) {
      toast.error(getErrorMessage(err));
      return false;
    }
  };

  const rejectFriendRequest = async (requestId: string) => {
    try {
      await friendsService.rejectFriendRequest(requestId);
      await fetchPendingRequests();
      return true;
    } catch (err: any) {
      toast.error(getErrorMessage(err));
      return false;
    }
  };

  const removeFriend = async (friendshipId: string) => {
    try {
      await friendsService.removeFriend(friendshipId);
      toast.info('friend removed');
      await fetchFriends();
      return true;
    } catch (err: any) {
      toast.error(getErrorMessage(err));
      return false;
    }
  };

  const searchUsers = async (query: string): Promise<ProfileRow[]> => {
    try {
      return await friendsService.searchUsers(query);
    } catch (err: any) {
      toast.error(getErrorMessage(err));
      return [];
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Subscribe to friend request updates
  useEffect(() => {
    const subscription = friendsService.subscribeFriendRequests((request, event) => {
      if (event === 'INSERT') {
        // Check if it's an incoming request
        setPendingRequests(prev => {
          if (prev.some(r => r.id === request.id)) return prev;
          return [request, ...prev];
        });
      } else if (event === 'DELETE') {
        setPendingRequests(prev => prev.filter(r => r.id !== request.id));
        setSentRequests(prev => prev.filter(r => r.id !== request.id));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    friends,
    pendingRequests,
    sentRequests,
    loading,
    error,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    searchUsers,
    refresh: fetchAll,
  };
};

