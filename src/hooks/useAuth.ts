import { useEffect, useCallback, useState } from 'react';
import { useStore } from '../stores/useStore';
import * as authService from '../services/auth';
import { getFriendIds } from '../services/friends';
import type { User } from '../types';

export function useAuth() {
  const {
    user,
    isAuthenticated,
    setUser,
    setIsAuthenticated,
    setFriendIds,
    setIsLoading,
    reset,
  } = useStore();

  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const { session } = await authService.getSession();

        if (session && mounted) {
          const { data: profile } = await authService.getUserProfile(session.user.id);

          if (profile) {
            setUser(profile);
            setIsAuthenticated(true);

            // Load friend IDs for post filtering
            const friendIds = await getFriendIds(session.user.id);
            setFriendIds(friendIds);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        if (mounted) {
          setIsInitializing(false);
        }
      }
    };

    initAuth();

    // Subscribe to auth state changes
    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          reset();
        } else if (event === 'SIGNED_IN' && session) {
          const typedSession = session as { user: { id: string } };
          const { data: profile } = await authService.getUserProfile(
            typedSession.user.id
          );
          if (profile) {
            setUser(profile);
            setIsAuthenticated(true);
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [setUser, setIsAuthenticated, setFriendIds, reset]);

  // Sign up
  const signUp = useCallback(
    async (email: string, password: string, username?: string) => {
      setIsLoading(true);
      try {
        const result = await authService.signUp(email, password, username);
        return result;
      } finally {
        setIsLoading(false);
      }
    },
    [setIsLoading]
  );

  // Sign in
  const signIn = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      try {
        const result = await authService.signIn(email, password);

        if (result.data) {
          const { data: profile } = await authService.getUserProfile(result.data.userId);
          if (profile) {
            setUser(profile);
            setIsAuthenticated(true);

            // Load friend IDs
            const friendIds = await getFriendIds(result.data.userId);
            setFriendIds(friendIds);
          }
        }

        return result;
      } finally {
        setIsLoading(false);
      }
    },
    [setIsLoading, setUser, setIsAuthenticated, setFriendIds]
  );

  // Sign out
  const signOut = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await authService.signOut();
      if (!result.error) {
        reset();
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, reset]);

  // Update username
  const updateUsername = useCallback(
    async (username: string) => {
      if (!user) return { data: null, error: { message: 'Not authenticated' } };

      setIsLoading(true);
      try {
        const result = await authService.updateUsername(user.id, username);
        if (result.data) {
          setUser(result.data);
        }
        return result;
      } finally {
        setIsLoading(false);
      }
    },
    [user, setIsLoading, setUser]
  );

  // Check username availability
  const checkUsernameAvailable = useCallback(
    async (username: string) => {
      return authService.checkUsernameAvailable(username);
    },
    []
  );

  // Reset password
  const resetPassword = useCallback(
    async (email: string) => {
      setIsLoading(true);
      try {
        return await authService.resetPassword(email);
      } finally {
        setIsLoading(false);
      }
    },
    [setIsLoading]
  );

  // Update avatar
  const updateAvatar = useCallback(
    async (avatarUrl: string) => {
      if (!user) return { data: null, error: { message: 'Not authenticated' } };

      setIsLoading(true);
      try {
        const result = await authService.updateAvatar(user.id, avatarUrl);
        if (result.data) {
          setUser(result.data);
        }
        return result;
      } finally {
        setIsLoading(false);
      }
    },
    [user, setIsLoading, setUser]
  );

  // Delete account
  const deleteAccount = useCallback(async () => {
    if (!user) return { data: null, error: { message: 'Not authenticated' } };

    setIsLoading(true);
    try {
      const result = await authService.deleteAccount(user.id);
      if (!result.error) {
        reset();
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  }, [user, setIsLoading, reset]);

  // Check if user needs to set username
  const needsUsername = isAuthenticated && user && !user.username;

  return {
    user,
    isAuthenticated,
    isInitializing,
    needsUsername,
    signUp,
    signIn,
    signOut,
    updateUsername,
    checkUsernameAvailable,
    resetPassword,
    updateAvatar,
    deleteAccount,
  };
}
