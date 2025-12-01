import { useCallback, useState, useEffect, useRef } from 'react';
import { useStore, selectUser, selectFriendIds } from '../stores/useStore';
import * as friendsService from '../services/friends';
import type { User, Friendship } from '../types';

export function useFriends() {
  const user = useStore(selectUser);
  const friendIds = useStore(selectFriendIds);
  const { setFriendIds, addFriendId, removeFriendId, setIsLoading, setError } = useStore();

  const [friends, setFriends] = useState<Friendship[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friendship[]>([]);
  const [sentRequests, setSentRequests] = useState<Friendship[]>([]);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Subscription refs
  const friendRequestsSubRef = useRef<{ unsubscribe: () => void } | null>(null);
  const friendshipChangesSubRef = useRef<{ unsubscribe: () => void } | null>(null);

  // Load friends
  const loadFriends = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await friendsService.getFriends(user.id);

      if (error) {
        setError(error.message);
        return;
      }

      if (data) {
        setFriends(data);
        setFriendIds(data.map((f) => f.friend_id));
      }
    } catch (err) {
      console.error('Load friends error:', err);
      setError('Failed to load friends');
    } finally {
      setIsLoading(false);
    }
  }, [user, setFriendIds, setIsLoading, setError]);

  // Load pending requests
  const loadPendingRequests = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await friendsService.getPendingRequests(user.id);

      if (!error && data) {
        setPendingRequests(data);
      }
    } catch (err) {
      console.error('Load pending requests error:', err);
    }
  }, [user]);

  // Load sent requests
  const loadSentRequests = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await friendsService.getSentRequests(user.id);

      if (!error && data) {
        setSentRequests(data);
      }
    } catch (err) {
      console.error('Load sent requests error:', err);
    }
  }, [user]);

  // Load all friend data
  const loadAllFriendData = useCallback(async () => {
    await Promise.all([loadFriends(), loadPendingRequests(), loadSentRequests()]);
  }, [loadFriends, loadPendingRequests, loadSentRequests]);

  // Send friend request
  const sendFriendRequest = useCallback(
    async (friendId: string) => {
      if (!user) {
        return { data: null, error: { message: 'Not authenticated' } };
      }

      try {
        const result = await friendsService.sendFriendRequest(user.id, friendId);

        if (result.data) {
          setSentRequests((prev) => [...prev, result.data!]);
        }

        return result;
      } catch (err) {
        console.error('Send friend request error:', err);
        return { data: null, error: { message: 'Failed to send friend request' } };
      }
    },
    [user]
  );

  // Accept friend request
  const acceptFriendRequest = useCallback(
    async (friendshipId: string, requesterId: string) => {
      if (!user) {
        return { data: null, error: { message: 'Not authenticated' } };
      }

      try {
        const result = await friendsService.acceptFriendRequest(
          friendshipId,
          user.id,
          requesterId
        );

        if (!result.error) {
          // Remove from pending
          setPendingRequests((prev) =>
            prev.filter((r) => r.id !== friendshipId)
          );
          // Add to friend IDs
          addFriendId(requesterId);
          // Refresh friends list
          loadFriends();
        }

        return result;
      } catch (err) {
        console.error('Accept friend request error:', err);
        return { data: null, error: { message: 'Failed to accept friend request' } };
      }
    },
    [user, addFriendId, loadFriends]
  );

  // Decline friend request
  const declineFriendRequest = useCallback(
    async (friendshipId: string) => {
      try {
        const result = await friendsService.declineFriendRequest(friendshipId);

        if (!result.error) {
          setPendingRequests((prev) =>
            prev.filter((r) => r.id !== friendshipId)
          );
        }

        return result;
      } catch (err) {
        console.error('Decline friend request error:', err);
        return { data: null, error: { message: 'Failed to decline friend request' } };
      }
    },
    []
  );

  // Remove friend
  const removeFriend = useCallback(
    async (friendId: string) => {
      if (!user) {
        return { data: null, error: { message: 'Not authenticated' } };
      }

      try {
        const result = await friendsService.removeFriend(user.id, friendId);

        if (!result.error) {
          setFriends((prev) => prev.filter((f) => f.friend_id !== friendId));
          removeFriendId(friendId);
        }

        return result;
      } catch (err) {
        console.error('Remove friend error:', err);
        return { data: null, error: { message: 'Failed to remove friend' } };
      }
    },
    [user, removeFriendId]
  );

  // Block user
  const blockUser = useCallback(
    async (blockedUserId: string) => {
      if (!user) {
        return { data: null, error: { message: 'Not authenticated' } };
      }

      try {
        const result = await friendsService.blockUser(user.id, blockedUserId);

        if (!result.error) {
          // Remove from friends if was friend
          setFriends((prev) => prev.filter((f) => f.friend_id !== blockedUserId));
          removeFriendId(blockedUserId);
          // Remove from pending if exists
          setPendingRequests((prev) =>
            prev.filter((r) => r.user_id !== blockedUserId)
          );
        }

        return result;
      } catch (err) {
        console.error('Block user error:', err);
        return { data: null, error: { message: 'Failed to block user' } };
      }
    },
    [user, removeFriendId]
  );

  // Search users
  const searchUsers = useCallback(
    async (query: string) => {
      if (!user) {
        return;
      }

      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);

      try {
        const { data, error } = await friendsService.searchUsers(query, user.id);

        if (!error && data) {
          setSearchResults(data);
        }
      } catch (err) {
        console.error('Search users error:', err);
      } finally {
        setIsSearching(false);
      }
    },
    [user]
  );

  // Clear search results
  const clearSearchResults = useCallback(() => {
    setSearchResults([]);
  }, []);

  // Get friendship status with a user
  const getFriendshipStatus = useCallback(
    async (targetUserId: string) => {
      if (!user) return 'none';
      return friendsService.getFriendshipStatus(user.id, targetUserId);
    },
    [user]
  );

  // Check if user is a friend
  const isFriend = useCallback(
    (targetUserId: string) => {
      return friendIds.includes(targetUserId);
    },
    [friendIds]
  );

  // Subscribe to friend requests
  useEffect(() => {
    if (!user) return;

    // Unsubscribe from previous subscription
    if (friendRequestsSubRef.current) {
      friendRequestsSubRef.current.unsubscribe();
    }

    // Subscribe to new friend requests
    friendRequestsSubRef.current = friendsService.subscribeToFriendRequests(
      user.id,
      (newRequest) => {
        setPendingRequests((prev) => {
          // Avoid duplicates
          if (prev.find((r) => r.id === newRequest.id)) {
            return prev;
          }
          return [newRequest, ...prev];
        });
      }
    );

    return () => {
      if (friendRequestsSubRef.current) {
        friendRequestsSubRef.current.unsubscribe();
      }
    };
  }, [user]);

  // Subscribe to friendship changes
  useEffect(() => {
    if (!user) return;

    // Unsubscribe from previous subscription
    if (friendshipChangesSubRef.current) {
      friendshipChangesSubRef.current.unsubscribe();
    }

    // Subscribe to friendship status changes
    friendshipChangesSubRef.current = friendsService.subscribeToFriendshipChanges(
      user.id,
      (friendId) => {
        // Friend request accepted
        addFriendId(friendId);
        // Refresh friends list
        loadFriends();
        // Remove from pending
        setPendingRequests((prev) =>
          prev.filter((r) => r.user_id !== friendId && r.friend_id !== friendId)
        );
      },
      (friendId) => {
        // Friend removed
        removeFriendId(friendId);
        setFriends((prev) => prev.filter((f) => f.friend_id !== friendId));
      }
    );

    return () => {
      if (friendshipChangesSubRef.current) {
        friendshipChangesSubRef.current.unsubscribe();
      }
    };
  }, [user, addFriendId, removeFriendId, loadFriends]);

  return {
    friends,
    friendIds,
    pendingRequests,
    sentRequests,
    searchResults,
    isSearching,
    loadFriends,
    loadPendingRequests,
    loadSentRequests,
    loadAllFriendData,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
    blockUser,
    searchUsers,
    clearSearchResults,
    getFriendshipStatus,
    isFriend,
  };
}
