/**
 * Scena - App Context
 * Main application state with Supabase integration
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/auth.service';
import { profileService, Profile } from '../services/profile.service';
import { User as SupabaseUser } from '@supabase/supabase-js';

export interface User {
  id: string;
  username: string;
  avatarUrl?: string;
  bio?: string;
}

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  loading: boolean;
}

interface AppContextType {
  state: AppState;
  setUser: (user: User | null) => void;
  setAuthenticated: (value: boolean) => void;
  setOnboardingComplete: (value: boolean) => void;
  refreshUser: () => Promise<void>;
}

const defaultState: AppState = {
  user: null,
  isAuthenticated: false,
  hasCompletedOnboarding: false,
  loading: true,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(defaultState);

  // Convert Supabase User + Profile to our User type
  const convertToUser = (supabaseUser: SupabaseUser, profile: Profile | null): User | null => {
    if (!supabaseUser || !profile) return null;
    
    return {
      id: supabaseUser.id,
      username: profile.username || 'user',
      avatarUrl: profile.avatar_url || undefined,
      bio: profile.bio || undefined,
    };
  };

  // Refresh user data from database
  const refreshUser = async () => {
    try {
      const supabaseUser = await authService.getCurrentUser();
      
      if (supabaseUser) {
        const profile = await profileService.getProfile(supabaseUser.id);
        const user = convertToUser(supabaseUser, profile);
        
        setState(prev => ({
          ...prev,
          user,
          isAuthenticated: true,
          loading: false,
        }));
      } else {
        setState(prev => ({
          ...prev,
          user: null,
          isAuthenticated: false,
          loading: false,
        }));
      }
    } catch (error) {
      if (__DEV__) {
        console.error('Error refreshing user:', error);
      }
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  // Initialize auth state on mount
  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;

    const initialize = async () => {
      try {
        if (__DEV__) {
          console.log('[AppContext] Initializing...');
        }
        await refreshUser();

        // Listen to auth state changes
        try {
          subscription = authService.onAuthStateChange(async (event, session) => {
            try {
              if (event === 'SIGNED_IN' && session?.user) {
                const profile = await profileService.getProfile(session.user.id);
                const user = convertToUser(session.user, profile);
                
                setState(prev => ({
                  ...prev,
                  user,
                  isAuthenticated: true,
                  hasCompletedOnboarding: true, // Auto-complete onboarding on sign in
                }));
              } else if (event === 'SIGNED_OUT') {
                setState({
                  user: null,
                  isAuthenticated: false,
                  hasCompletedOnboarding: false,
                  loading: false,
                });
              }
            } catch (error) {
              if (__DEV__) {
                console.error('[AppContext] Error in auth state change handler:', error);
              }
            }
          });
        } catch (error) {
          if (__DEV__) {
            console.error('[AppContext] Error setting up auth listener:', error);
          }
        }
      } catch (error) {
        if (__DEV__) {
          console.error('[AppContext] Error initializing:', error);
        }
        setState(prev => ({ ...prev, loading: false }));
      }
    };

    initialize();

    return () => {
      if (subscription) {
        try {
          subscription.unsubscribe();
        } catch (error) {
          if (__DEV__) {
            console.error('[AppContext] Error unsubscribing:', error);
          }
        }
      }
    };
  }, []);

  const setUser = (user: User | null) => {
    setState(prev => ({ ...prev, user }));
  };

  const setAuthenticated = (value: boolean) => {
    setState(prev => ({ ...prev, isAuthenticated: value }));
  };

  const setOnboardingComplete = (value: boolean) => {
    setState(prev => ({ ...prev, hasCompletedOnboarding: value }));
  };

  return (
    <AppContext.Provider
      value={{
        state,
        setUser,
        setAuthenticated,
        setOnboardingComplete,
        refreshUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
