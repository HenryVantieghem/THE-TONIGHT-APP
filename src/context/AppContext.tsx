/**
 * Scena - App Context
 * Mock data and state management (UI only, no backend)
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, Moment, AppState } from '../types';

// Mock users
const mockUsers: User[] = [
  { id: '1', username: 'emma' },
  { id: '2', username: 'jack' },
  { id: '3', username: 'sophia' },
  { id: '4', username: 'noah' },
  { id: '5', username: 'olivia' },
];

// Calculate expiry time (1 hour from creation)
const getExpiryTime = (createdAt: Date): Date => {
  const expiry = new Date(createdAt);
  expiry.setHours(expiry.getHours() + 1);
  return expiry;
};

// Mock moments with realistic timing
const createMockMoments = (): Moment[] => {
  const now = new Date();

  return [
    {
      id: '1',
      user: mockUsers[0],
      imageUri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      frontCameraUri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
      location: 'the park',
      caption: 'just walking',
      createdAt: new Date(now.getTime() - 20 * 60000), // 20 mins ago
      expiresAt: getExpiryTime(new Date(now.getTime() - 20 * 60000)),
      reactions: [
        { id: 'r1', userId: '2', emoji: '❤️', createdAt: now },
        { id: 'r2', userId: '3', emoji: '✨', createdAt: now },
      ],
    },
    {
      id: '2',
      user: mockUsers[1],
      imageUri: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800',
      location: 'coffee shop',
      caption: 'monday',
      createdAt: new Date(now.getTime() - 35 * 60000), // 35 mins ago
      expiresAt: getExpiryTime(new Date(now.getTime() - 35 * 60000)),
      reactions: [
        { id: 'r3', userId: '1', emoji: '👋', createdAt: now },
        { id: 'r4', userId: '4', emoji: '☕', createdAt: now },
      ],
    },
    {
      id: '3',
      user: mockUsers[2],
      imageUri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
      frontCameraUri: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
      location: 'downtown',
      caption: 'evening light',
      createdAt: new Date(now.getTime() - 45 * 60000), // 45 mins ago
      expiresAt: getExpiryTime(new Date(now.getTime() - 45 * 60000)),
      reactions: [
        { id: 'r5', userId: '1', emoji: '🌟', createdAt: now },
      ],
    },
    {
      id: '4',
      user: mockUsers[3],
      imageUri: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800',
      location: 'mountains',
      caption: 'breathe',
      createdAt: new Date(now.getTime() - 50 * 60000), // 50 mins ago
      expiresAt: getExpiryTime(new Date(now.getTime() - 50 * 60000)),
      reactions: [],
    },
    {
      id: '5',
      user: mockUsers[4],
      imageUri: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800',
      location: 'beach',
      caption: 'waves',
      createdAt: new Date(now.getTime() - 55 * 60000), // 55 mins ago
      expiresAt: getExpiryTime(new Date(now.getTime() - 55 * 60000)),
      reactions: [
        { id: 'r6', userId: '2', emoji: '🌊', createdAt: now },
        { id: 'r7', userId: '3', emoji: '💙', createdAt: now },
      ],
    },
  ];
};

interface AppContextType {
  state: AppState;
  setUser: (user: User | null) => void;
  setAuthenticated: (value: boolean) => void;
  setOnboardingComplete: (value: boolean) => void;
  addMoment: (moment: Moment) => void;
  addReaction: (momentId: string, emoji: string) => void;
  getMomentById: (id: string) => Moment | undefined;
}

const defaultState: AppState = {
  user: null,
  isAuthenticated: false,
  hasCompletedOnboarding: false,
  moments: createMockMoments(),
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(defaultState);

  const setUser = (user: User | null) => {
    setState(prev => ({ ...prev, user }));
  };

  const setAuthenticated = (value: boolean) => {
    setState(prev => ({ ...prev, isAuthenticated: value }));
  };

  const setOnboardingComplete = (value: boolean) => {
    setState(prev => ({ ...prev, hasCompletedOnboarding: value }));
  };

  const addMoment = (moment: Moment) => {
    setState(prev => ({
      ...prev,
      moments: [moment, ...prev.moments],
    }));
  };

  const addReaction = (momentId: string, emoji: string) => {
    setState(prev => ({
      ...prev,
      moments: prev.moments.map(m =>
        m.id === momentId
          ? {
              ...m,
              reactions: [
                ...m.reactions,
                {
                  id: `r${Date.now()}`,
                  userId: state.user?.id || 'guest',
                  emoji,
                  createdAt: new Date(),
                },
              ],
            }
          : m
      ),
    }));
  };

  const getMomentById = (id: string) => {
    return state.moments.find(m => m.id === id);
  };

  return (
    <AppContext.Provider
      value={{
        state,
        setUser,
        setAuthenticated,
        setOnboardingComplete,
        addMoment,
        addReaction,
        getMomentById,
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
