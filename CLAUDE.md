# EXPERIENCES

Ephemeral location-based photo sharing. Post at your location, friends see it, gone in 1 hour.

## Stack
- React Native Expo (TypeScript)
- Supabase (Auth, DB, Storage, Realtime)
- Zustand (state), React Navigation v6

## Commands
```bash
npx expo start --clear    # Dev server
npx expo start --ios      # iOS simulator
npx expo install <pkg>    # Add package
```

## Database
| Table | Purpose |
|-------|---------|
| profiles | User profiles |
| posts | Photos/videos + location + 1hr expiry |
| friendships | Friend relationships |
| reactions | Emoji reactions |
| blocked_users | Block list |

## Colors
```typescript
primary: '#6366F1'      // Indigo accent
background: '#FFFFFF'   // White
surface: '#F9FAFB'      // Cards
text: '#111827'         // Primary text
textSecondary: '#6B7280'
timerGreen: '#10B981'   // >50% time
timerYellow: '#F59E0B'  // 25-50%
timerRed: '#EF4444'     // <25%
```

## Structure
```
src/
├── components/     # UI, feed, camera components
├── screens/        # auth/, main/ screens
├── services/       # supabase, auth, posts, friends, location
├── hooks/          # useAuth, usePosts, useFriends, useLocation
├── stores/         # Zustand store
├── constants/      # colors, config, typography
├── navigation/     # Root, Auth, Main navigators
└── types/          # TypeScript types
```

## Rules
- Posts expire after 1 hour, never show expired
- Friends only see each other's posts
- Reactions only, no comments
- Location is optional
- Timer bar: green → yellow → red based on time left
