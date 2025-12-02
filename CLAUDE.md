# CLAUDE.MD - EXPERIENCES APP

## What This Is

**EXPERIENCES** - an ephemeral location-based photo sharing app. Post photos/videos at your location, friends see them, they disappear after 1 hour.

**Tagline:** "What are you experiencing?"

**One sentence:** Share the moment. Gone in an hour.

## Core Loop

1. Open app → see friends' posts with countdown timers
2. Tap camera → capture photo/video
3. Auto-detect location (optional) → add caption
4. Post → friends see it with "47m left" timer
5. After 1 hour → gone forever

## Design System

**See:** `EXPERIENCES_DESIGN_SPEC.md` for complete UI/UX specification.

### Brand Identity
- **Name:** EXPERIENCES
- **Logo:** Abstract pulse/aperture (NO emoji, NO disco balls)
- **Primary Color:** Indigo #6366F1
- **Style:** Clean, minimal, iOS-native feel

### Key Design Principles
- Solid colors, NO gradients on buttons
- Pill-shaped primary buttons
- 4px base spacing unit
- SF Pro typography
- Level-based shadow system
- Timer bar with color transitions (green → yellow → red)

## Stack

- **Frontend:** React Native Expo (TypeScript)
- **Backend:** Supabase (Auth, DB, Storage, Realtime)
- **State:** Zustand
- **Nav:** React Navigation v6

## Commands

```bash
npx expo start --clear      # Start dev
npx expo start --ios        # iOS simulator
npx expo install <pkg>      # Add package
```

## Database Tables

| Table | Purpose |
|-------|---------|
| profiles | User profiles (extends auth.users) |
| posts | Photos/videos with location + 1hr expiry |
| friendships | Friend relationships |
| reactions | Emoji reactions (😊❤️🔥💯) |
| blocked_users | Block list |
| user_stats | Aggregate stats |

## Key Queries

```typescript
// Get friends' posts (non-expired)
supabase.from('posts')
  .select('*, user:profiles(*)')
  .gt('expires_at', new Date().toISOString())
  .order('created_at', { ascending: false });

// Upload media
supabase.storage.from('post-media')
  .upload(`${userId}/${Date.now()}.jpg`, file);

// Realtime subscription
supabase.channel('posts')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, handler)
  .subscribe();
```

## Colors (Production)

```typescript
// Primary - Indigo
primary: '#6366F1'        // Accent
primaryLight: '#818CF8'   // Hover/light variant
primaryDark: '#4F46E5'    // Dark variant

// Backgrounds
background: '#FFFFFF'     // Primary
surface: '#F9FAFB'        // Secondary (cards)
surfaceTertiary: '#F3F4F6' // Tertiary (inputs)

// Text
text: '#111827'           // Primary
textSecondary: '#6B7280'  // Secondary
textTertiary: '#9CA3AF'   // Tertiary

// Timer Colors (FOMO drivers)
timerGreen: '#10B981'     // >50% time left
timerYellow: '#F59E0B'    // 25-50%
timerRed: '#EF4444'       // <25% (pulsing at <5m)

// Semantic
success: '#10B981'
warning: '#F59E0B'
error: '#EF4444'
info: '#3B82F6'
```

## Critical Features

1. **Timer Bar** - Visual countdown, color changes, drives FOMO
2. **Floating Camera** - 64px FAB, always visible, center bottom
3. **1hr Expiry** - Posts auto-expire, never show expired
4. **Friends Only** - Only accepted friends see posts
5. **Emoji Reactions** - No comments, just 😊❤️🔥💯
6. **Realtime** - New posts appear instantly
7. **Optional Location** - Location is NOT required to post

## File Structure

```
src/
├── types/index.ts
├── constants/
│   ├── colors.ts              # Design tokens
│   ├── config.ts              # App config + spacing
│   └── typography.ts          # Font system
├── services/
│   ├── supabase.ts            # Supabase client
│   ├── auth.ts                # Auth service
│   ├── posts.ts               # Posts CRUD
│   ├── friends.ts             # Friendships
│   └── location.ts            # Geolocation
├── hooks/
│   ├── useAuth.ts
│   ├── usePosts.ts
│   ├── useFriends.ts
│   └── useLocation.ts
├── stores/useStore.ts         # Zustand store
├── utils/
│   ├── time.ts                # Timer calculations
│   └── validation.ts          # Input validation
├── components/
│   ├── ui/
│   │   ├── Button.tsx         # Pill buttons
│   │   ├── Input.tsx          # Text inputs
│   │   ├── Card.tsx           # Card container
│   │   ├── Avatar.tsx         # User avatars
│   │   ├── TimerBar.tsx       # Countdown bar
│   │   ├── FloatingCameraButton.tsx
│   │   ├── Skeleton.tsx       # Loading skeletons
│   │   └── index.ts
│   ├── feed/
│   │   ├── PostCard.tsx       # Post display
│   │   ├── EmojiReactions.tsx # Reaction buttons
│   │   ├── EmptyState.tsx     # Empty feed states
│   │   ├── PostCardSkeleton.tsx
│   │   └── index.ts
│   └── camera/
│       ├── CameraView.tsx
│       ├── CaptureButton.tsx
│       ├── LocationStrip.tsx
│       └── index.ts
├── screens/
│   ├── auth/
│   │   ├── SplashScreen.tsx
│   │   ├── OnboardingScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── SignUpScreen.tsx
│   │   ├── UsernameSetupScreen.tsx
│   │   ├── PermissionsScreen.tsx
│   │   └── index.ts
│   └── main/
│       ├── FeedScreen.tsx
│       ├── CameraScreen.tsx
│       ├── PostPreviewScreen.tsx
│       ├── LocationSearchScreen.tsx
│       ├── ProfileScreen.tsx
│       ├── SettingsScreen.tsx
│       ├── FriendsScreen.tsx
│       └── index.ts
└── navigation/
    ├── RootNavigator.tsx
    ├── AuthNavigator.tsx
    ├── MainNavigator.tsx
    └── index.ts
```

## Screen Flow

```
Splash → Onboarding (3 screens) → SignUp/Login → UsernameSetup → Permissions → Feed
                                                                                 ↓
Feed ←→ Camera → PostPreview → Feed
  ↓
Profile ←→ Settings
  ↓
Friends
```

## Component Quick Reference

| Component | Key Props | Notes |
|-----------|-----------|-------|
| Button | variant: 'primary' \| 'secondary' \| 'ghost' \| 'destructive' | Pill shape, solid colors |
| Input | label, icon, error | 56px height, 12px radius |
| Avatar | size: 'sm' \| 'md' \| 'lg' \| 'xl' | 32-120px |
| TimerBar | expiresAt: string | Auto-animates |
| PostCard | post: Post | Full post display |
| EmptyState | icon, title, description, action | Centered layout |

## Don't Do

- Don't show expired posts
- Don't show posts from non-friends
- Don't allow editing posts
- Don't add comments (reactions only)
- Don't skip username setup
- Don't persist sensitive data
- Don't use gradients on buttons
- Don't use emoji in logo/branding
- Don't block posting on location failure

## Related Files

- `EXPERIENCES_DESIGN_SPEC.md` - Complete UI/UX specification
- `SUPABASE_SETUP.md` - Database schema and setup
- `IMPLEMENTATION_PLAN.md` - Development roadmap
