# CLAUDE.MD - THE TONIGHT APP

## What This Is

THE TONIGHT APP - an ephemeral location-based photo sharing app. Post photos/videos at your location, friends see them, they disappear after 1 hour.

**One sentence:** "What are your friends doing RIGHT NOW?"

## Core Loop

1. Open app → see friends' posts with countdown timers
2. Tap camera → capture photo/video
3. Auto-detect location → add caption
4. Post → friends see it with "47m left" timer
5. After 1 hour → gone forever

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

## Colors

```typescript
primary: '#007AFF'      // iOS blue
background: '#FFFFFF'
text: '#000000'
textSecondary: '#8E8E93'
timerGreen: '#34C759'   // >50% time left
timerYellow: '#FFCC00'  // 25-50%
timerRed: '#FF3B30'     // <25%
```

## Critical Features

1. **Timer Bar** - Visual countdown, color changes, drives FOMO
2. **Floating Camera** - Always visible, bottom center
3. **1hr Expiry** - Posts auto-expire, never show expired
4. **Friends Only** - Only accepted friends see posts
5. **Emoji Reactions** - No comments, just 😊❤️🔥💯
6. **Realtime** - New posts appear instantly

## File Structure

```
src/
├── types/index.ts
├── constants/{colors,config}.ts
├── services/{supabase,auth,posts,friends,location}.ts
├── hooks/{useAuth,usePosts,useFriends,useLocation}.ts
├── stores/useStore.ts
├── utils/{time,validation}.ts
├── components/
│   ├── ui/{Button,Input,Card,TimerBar}
│   ├── feed/{PostCard,EmojiReactions,EmptyState}
│   └── camera/{CameraView,CaptureButton,LocationStrip}
├── screens/
│   ├── auth/{Splash,Onboarding,Login,SignUp,UsernameSetup,Permissions}
│   └── main/{Feed,Camera,PostPreview,Profile,Settings,Friends}
└── navigation/{Root,Auth,Main}Navigator.tsx
```

## Don't Do

- Don't show expired posts
- Don't show posts from non-friends
- Don't allow editing posts
- Don't add comments (reactions only)
- Don't skip username setup
- Don't persist sensitive data