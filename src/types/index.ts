/**
 * Scena - Type Definitions
 */

// User profile
export interface User {
  id: string;
  username: string;
  avatarUrl?: string;
}

// A moment (what we call posts)
export interface Moment {
  id: string;
  user: User;
  imageUri: string;
  frontCameraUri?: string; // For dual camera
  location?: string;
  caption?: string;
  createdAt: Date;
  expiresAt: Date;
  reactions: Reaction[];
}

// Emoji reaction
export interface Reaction {
  id: string;
  userId: string;
  emoji: string;
  createdAt: Date;
}

// Navigation types
export type RootStackParamList = {
  Welcome: undefined;
  SignUp: undefined;
  SignIn: undefined;
  ForgotPassword: undefined;
  Permissions: undefined;
  MainTabs: undefined;
  Camera: undefined;
  PostEditor: { imageUri: string; frontCameraUri?: string; location?: string };
  LocationSearch: { currentLocation?: string; imageUri?: string; frontCameraUri?: string };
  FullscreenMoment: { momentId: string };
  ReactionsDetail: { momentId: string };
  Profile: { userId?: string };
  EditProfile: undefined;
  Settings: undefined;
  Help: undefined;
  SharedSuccess: undefined;
  Friends: undefined;
  UserSearch: undefined;
  FriendRequests: undefined;
};

export type MainTabParamList = {
  Feed: undefined;
  Camera: undefined;
  ProfileTab: undefined;
};

// App state
export interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  moments: Moment[];
}

// Permission states
export interface Permissions {
  camera: 'granted' | 'denied' | 'undetermined';
  location: 'granted' | 'denied' | 'undetermined';
  photos: 'granted' | 'denied' | 'undetermined';
}
