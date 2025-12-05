/**
 * Scena - Friends Context
 * Friend list and requests state management
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useFriends as useFriendsHook } from '../hooks/useFriends';
import { FriendshipRow, FriendRequestRow, ProfileRow } from '../services/friends.service';

interface FriendsContextType {
  friends: FriendshipRow[];
  pendingRequests: FriendRequestRow[];
  sentRequests: FriendRequestRow[];
  loading: boolean;
  error: string | null;
  sendFriendRequest: (userId: string) => Promise<boolean>;
  acceptFriendRequest: (requestId: string) => Promise<boolean>;
  rejectFriendRequest: (requestId: string) => Promise<boolean>;
  removeFriend: (friendshipId: string) => Promise<boolean>;
  searchUsers: (query: string) => Promise<ProfileRow[]>;
  refresh: () => Promise<void>;
}

const FriendsContext = createContext<FriendsContextType | undefined>(undefined);

export const FriendsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  let friendsData: FriendsContextType;

  try {
    if (__DEV__) {
      console.log('[FriendsContext] Initializing...');
    }
    friendsData = useFriendsHook();
  } catch (error) {
    if (__DEV__) {
      console.error('[FriendsContext] Error initializing:', error);
    }
    // Fallback to default values if hook fails
    friendsData = {
      friends: [],
      pendingRequests: [],
      sentRequests: [],
      loading: false,
      error: error instanceof Error ? error.message : 'Failed to initialize friends',
      sendFriendRequest: async () => false,
      acceptFriendRequest: async () => false,
      rejectFriendRequest: async () => false,
      removeFriend: async () => false,
      searchUsers: async () => [],
      refresh: async () => {},
    };
  }

  return (
    <FriendsContext.Provider value={friendsData}>
      {children}
    </FriendsContext.Provider>
  );
};

export const useFriendsContext = () => {
  const context = useContext(FriendsContext);
  if (!context) {
    throw new Error('useFriendsContext must be used within a FriendsProvider');
  }
  return context;
};

