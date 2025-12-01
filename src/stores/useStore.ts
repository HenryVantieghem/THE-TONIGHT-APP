import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User, Post, LocationData, LocationPrecision, PermissionStatus } from '../types';

interface AppState {
  // Auth state
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;

  // Location state
  currentLocation: LocationData | null;
  locationPrecision: LocationPrecision;
  setCurrentLocation: (location: LocationData | null) => void;
  setLocationPrecision: (precision: LocationPrecision) => void;

  // Posts state
  posts: Post[];
  setPosts: (posts: Post[]) => void;
  addPost: (post: Post) => void;
  updatePost: (postId: string, updates: Partial<Post>) => void;
  removePost: (postId: string) => void;
  removeExpiredPosts: () => void;

  // Friends state
  friendIds: string[];
  pendingRequestCount: number;
  setFriendIds: (ids: string[]) => void;
  addFriendId: (id: string) => void;
  removeFriendId: (id: string) => void;
  setPendingRequestCount: (count: number) => void;

  // Permission state
  permissions: PermissionStatus;
  setPermissions: (permissions: Partial<PermissionStatus>) => void;

  // Settings state
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;

  // Loading state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Error state
  error: string | null;
  setError: (error: string | null) => void;

  // Reset all state
  reset: () => void;
}

const initialState = {
  user: null,
  isAuthenticated: false,
  currentLocation: null,
  locationPrecision: 'exact' as LocationPrecision,
  posts: [],
  friendIds: [],
  pendingRequestCount: 0,
  permissions: {
    camera: 'undetermined' as const,
    location: 'undetermined' as const,
    notifications: 'undetermined' as const,
  },
  notificationsEnabled: true,
  isLoading: false,
  error: null,
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Auth actions
      setUser: (user) => set({ user }),
      setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),

      // Location actions
      setCurrentLocation: (currentLocation) => set({ currentLocation }),
      setLocationPrecision: (locationPrecision) => set({ locationPrecision }),

      // Posts actions
      setPosts: (posts) => set({ posts }),
      addPost: (post) =>
        set((state) => ({
          posts: [post, ...state.posts],
        })),
      updatePost: (postId, updates) =>
        set((state) => ({
          posts: state.posts.map((post) =>
            post.id === postId ? { ...post, ...updates } : post
          ),
        })),
      removePost: (postId) =>
        set((state) => ({
          posts: state.posts.filter((post) => post.id !== postId),
        })),
      removeExpiredPosts: () =>
        set((state) => ({
          posts: state.posts.filter(
            (post) => new Date(post.expires_at) > new Date()
          ),
        })),

      // Friends actions
      setFriendIds: (friendIds) => set({ friendIds }),
      addFriendId: (id) =>
        set((state) => ({
          friendIds: state.friendIds.includes(id)
            ? state.friendIds
            : [...state.friendIds, id],
        })),
      removeFriendId: (id) =>
        set((state) => ({
          friendIds: state.friendIds.filter((friendId) => friendId !== id),
        })),
      setPendingRequestCount: (pendingRequestCount) => set({ pendingRequestCount }),

      // Permission actions
      setPermissions: (permissions) =>
        set((state) => ({
          permissions: { ...state.permissions, ...permissions },
        })),

      // Settings actions
      setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),

      // Loading actions
      setIsLoading: (isLoading) => set({ isLoading }),

      // Error actions
      setError: (error) => set({ error }),

      // Reset action
      reset: () => set(initialState),
    }),
    {
      name: 'tonight-app-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Only persist these fields
        locationPrecision: state.locationPrecision,
        permissions: state.permissions,
        notificationsEnabled: state.notificationsEnabled,
      }),
    }
  )
);

// Selectors
export const selectUser = (state: AppState) => state.user;
export const selectIsAuthenticated = (state: AppState) => state.isAuthenticated;
export const selectPosts = (state: AppState) => state.posts;
export const selectActivePosts = (state: AppState) =>
  state.posts.filter((post) => new Date(post.expires_at) > new Date());
export const selectCurrentLocation = (state: AppState) => state.currentLocation;
export const selectLocationPrecision = (state: AppState) => state.locationPrecision;
export const selectFriendIds = (state: AppState) => state.friendIds;
export const selectPendingRequestCount = (state: AppState) => state.pendingRequestCount;
export const selectPermissions = (state: AppState) => state.permissions;
export const selectNotificationsEnabled = (state: AppState) => state.notificationsEnabled;
export const selectIsLoading = (state: AppState) => state.isLoading;
export const selectError = (state: AppState) => state.error;
