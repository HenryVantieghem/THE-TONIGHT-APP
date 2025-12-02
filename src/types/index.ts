// User Profile
export interface User {
  id: string;
  username: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at?: string;
}

// Post with 1-hour expiry
export interface Post {
  id: string;
  user_id: string;
  media_url: string;
  media_type: 'image' | 'video';
  thumbnail_url: string | null;
  caption: string | null;
  location_name: string | null; // Now optional
  location_lat: number | null;  // Now optional
  location_lng: number | null;  // Now optional
  location_city: string | null;
  location_state: string | null;
  created_at: string;
  expires_at: string;
  view_count: number;
  user?: User;
  reactions?: Reaction[];
  my_reaction?: Reaction;
}

// Friendship relationship
export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: 'pending' | 'accepted' | 'declined' | 'blocked';
  created_at: string;
  updated_at?: string;
  friend?: User;
  user?: User;
}

// Emoji reaction to post
export type ReactionEmoji = '😊' | '❤️' | '🔥' | '💯';

export interface Reaction {
  id: string;
  post_id: string;
  user_id: string;
  emoji: ReactionEmoji;
  created_at: string;
  user?: User;
}

// User statistics
export interface UserStats {
  id: string;
  user_id: string;
  total_posts: number;
  total_friends: number;
  total_views: number;
}

// Blocked user
export interface BlockedUser {
  id: string;
  blocker_id: string;
  blocked_id: string;
  created_at: string;
}

// Location data
export interface LocationData {
  name: string;
  lat: number;
  lng: number;
  city?: string;
  state?: string;
}

// Location precision setting
export type LocationPrecision = 'exact' | 'neighborhood' | 'city';

// Auth state
export interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
  user: {
    id: string;
    email?: string;
  };
}

// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  SignUp: undefined;
  UsernameSetup: undefined;
  Permissions: undefined;
};

export type MainTabParamList = {
  FeedTab: undefined;
  ProfileTab: undefined;
};

export type MainStackParamList = {
  Feed: undefined;
  Camera: undefined;
  PostPreview: {
    mediaUri: string;
    mediaType: 'image' | 'video';
    location: LocationData;
    selectedLocation?: LocationData; // For updates from LocationSearch
  };
  LocationSearch: {
    currentLocation: LocationData | null;
    locationKey?: string;
  };
  Profile: { userId?: string };
  Settings: undefined;
  Friends: undefined;
};

// API Response types
export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
}

export interface ApiError {
  message: string;
  code?: string;
}

// Create post payload
export interface CreatePostPayload {
  userId: string;
  mediaUri: string;
  mediaType: 'image' | 'video';
  caption?: string;
  location?: LocationData; // Location is now OPTIONAL
}

// Permission status
export interface PermissionStatus {
  camera: 'granted' | 'denied' | 'undetermined';
  location: 'granted' | 'denied' | 'undetermined';
}
