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
primary: '#DC143C'      // Dark red (crimson)
background: '#000000'   // Pure black
surface: '#0A0A0A'      // Near black
text: '#FFFFFF'         // White
textSecondary: 'rgba(255,255,255,0.7)'
timerGreen: '#00FF41'   // Matrix green
timerYellow: '#FFD600'  // Bright yellow
timerRed: '#DC143C'     // Crimson red
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
