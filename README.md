# Tonight - Ephemeral Social Photo App

Ultra-modern social app where posts disappear in 60 minutes. Share photos with friends, add locations, react with emojis, and enjoy a beautiful black/white/dark red liquid glass aesthetic.

## 🎨 Design

- **Color Scheme**: Black backgrounds, white text, dark red (#DC143C) accents
- **Style**: Liquid glass morphism with subtle blur effects
- **Dark Mode**: Optimized for OLED displays
- **Modern**: iOS-inspired animations and interactions

## ✨ Features

### Core Social Features
- 📸 **Photo Sharing** - Capture and share moments with friends
- ⏱️ **60-Minute Expiration** - Posts automatically disappear after 1 hour
- 📍 **Location Tagging** - Share where you are (optional)
- 😊 **Emoji Reactions** - React with 😊 ❤️ 🔥 💯
- 👥 **Friends Only** - See posts only from your friends
- ⚡ **Real-time Updates** - Instant notifications and feed updates

### User Experience
- 🎭 **Countdown Timers** - Visual timer showing time remaining
- 🎨 **Liquid Glass UI** - Modern glassmorphism throughout
- 🌙 **Dark Theme** - Beautiful dark mode design
- 📱 **Native Feel** - Smooth animations and haptic feedback

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator or Android Emulator (or physical device with Expo Go)
- Supabase account

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/HenryVantieghem/THE-TONIGHT-APP.git
   cd THE-TONIGHT-APP
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   # Create .env file (see .env.example)
   cp .env.example .env
   
   # Add your Supabase credentials:
   EXPO_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

4. **Start the development server:**
   ```bash
   npm start
   # or clear cache first:
   npm run start:clear
   ```

5. **Run on device:**
   - Scan QR code with Expo Go (iOS/Android)
   - Or press `i` for iOS Simulator
   - Or press `a` for Android Emulator

## 📱 App Flow

1. **Onboarding** → Create account → Set username
2. **Permissions** → Grant camera & location access
3. **Feed** → See friends' posts with countdown timers
4. **Camera** → Tap floating button → Capture photo
5. **Post** → Add location & caption → Share with friends
6. **React** → Tap emoji to react to posts
7. **Expire** → Posts disappear after 60 minutes

## 🗄️ Tech Stack

### Frontend
- **React Native** - Cross-platform mobile app
- **Expo** - Development and build tools
- **TypeScript** - Type safety
- **React Navigation** - Screen navigation
- **Reanimated** - Smooth animations
- **Expo Camera** - Photo capture
- **Expo Location** - Location services

### Backend
- **Supabase** - Backend as a service
  - PostgreSQL database
  - Real-time subscriptions
  - Storage for images
  - Row Level Security (RLS)
  - Authentication

### Design
- **Liquid Glass** - Custom glassmorphism system
- **Dark Theme** - Black/white/dark red palette
- **Haptic Feedback** - Native touch feedback
- **Linear Gradients** - Smooth color transitions

## 🏗️ Project Structure

```
THE-TONIGHT-APP/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── glass/       # Glass morphism components
│   │   ├── ui/          # Basic UI components
│   │   ├── feed/        # Feed-specific components
│   │   └── camera/      # Camera components
│   ├── screens/         # App screens
│   │   ├── auth/        # Authentication screens
│   │   └── main/        # Main app screens
│   ├── navigation/      # Navigation configuration
│   ├── hooks/           # Custom React hooks
│   ├── services/        # API & service layer
│   │   ├── supabase.ts # Supabase client
│   │   ├── auth.ts     # Authentication
│   │   ├── posts.ts    # Post CRUD
│   │   ├── friends.ts  # Friend management
│   │   └── location.ts # Location services
│   ├── stores/          # State management (Zustand)
│   ├── constants/       # Design tokens & config
│   ├── types/           # TypeScript types
│   └── utils/           # Utility functions
├── assets/              # Images, icons, fonts
├── .env                 # Environment variables (not in git)
├── .env.example         # Example env file
├── app.json             # Expo configuration
├── package.json         # Dependencies
└── tsconfig.json        # TypeScript config
```

## 🔐 Environment Variables

Required variables in `.env`:

```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Note: EXPO_PUBLIC_ prefix makes variables available in Expo
```

## 🗄️ Database Schema

### Tables
- **profiles** - User profiles and settings
- **posts** - Photo posts (expires after 60 min)
- **friendships** - Friend relationships
- **reactions** - Emoji reactions on posts
- **user_stats** - User statistics

### Storage Buckets
- **post-media** - Photo/video storage (10MB limit)
- **avatars** - User avatar images

### Key Features
- Row Level Security (RLS) enabled on all tables
- Real-time subscriptions for live updates
- Automatic post expiration after 60 minutes
- Friends-only post visibility

## 🧪 Testing

See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for comprehensive testing instructions.

### Quick Test
1. Clear cache: `npm run start:clear`
2. Reload app in Expo Go
3. Take a photo
4. Watch console logs
5. Post successfully!

### Debug Logs
Look for these console messages:
- `[Camera]` - Camera capture flow
- `[CameraScreen]` - Navigation to preview
- `[PostPreview]` - Post creation
- `[Location]` - Location services

## 🐛 Troubleshooting

### "No media to post" error
1. Check console logs for mediaUri
2. Verify camera permissions
3. Try on physical device (works better than simulator)
4. Clear cache: `npm run start:clear`
5. See [POST_CREATION_FIX.md](./POST_CREATION_FIX.md)

### Location not working
1. Grant location permission
2. Wait a few seconds for GPS
3. Use "Change" to manually search
4. **Location is optional** - can post without it!

### Supabase errors
1. Check `.env` file exists with correct credentials
2. Verify Supabase project is active
3. Check storage bucket "post-media" exists
4. Verify RLS policies are set up

### Expo Go issues
1. Update Expo Go app to latest version
2. Clear Metro bundler cache: `npm run start:clear`
3. Delete app from device and reinstall

## 📚 Documentation

- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Complete testing checklist
- [POST_CREATION_FIX.md](./POST_CREATION_FIX.md) - Debugging post creation
- [CLAUDE.md](./CLAUDE.md) - Development notes

## 🎯 Scripts

```bash
# Development
npm start              # Start Expo dev server
npm run start:clear    # Start with cache cleared
npm run ios            # Run on iOS simulator
npm run android        # Run on Android emulator

# Code Quality
npm run lint           # Run ESLint
npm run lint:fix       # Fix ESLint errors
npm run type-check     # TypeScript type checking

# Build
npm run prebuild       # Generate native projects
npm run prebuild:clean # Clean and regenerate
```

## 🚢 Deployment

### EAS Build (Expo Application Services)

1. **Install EAS CLI:**
   ```bash
   npm install -g eas-cli
   ```

2. **Configure build:**
   ```bash
   eas build:configure
   ```

3. **Build for iOS:**
   ```bash
   eas build --platform ios
   ```

4. **Build for Android:**
   ```bash
   eas build --platform android
   ```

5. **Submit to stores:**
   ```bash
   eas submit --platform ios
   eas submit --platform android
   ```

## 🔒 Security

- Environment variables never committed to git
- Row Level Security (RLS) on all database tables
- Friends-only post visibility
- Automatic post expiration
- Secure media storage with access controls

## 📄 License

Private project - All rights reserved

## 🤝 Contributing

This is a private project. For questions or issues, contact the repository owner.

## 📧 Support

For issues or questions:
1. Check [TESTING_GUIDE.md](./TESTING_GUIDE.md)
2. Check [POST_CREATION_FIX.md](./POST_CREATION_FIX.md)
3. Review console logs
4. Contact repository owner

## 🎨 Design System

### Colors
- **Primary**: #DC143C (Crimson Red)
- **Background**: #000000 (Pure Black)
- **Surface**: #0A0A0A, #1A1A1A (Dark Grays)
- **Text**: #FFFFFF (White) with opacity variants
- **Accent Green**: #00FF41 (Matrix Green)
- **Warning**: #FFD600 (Bright Yellow)

### Typography
- **iOS**: SF Pro Text / SF Pro Display
- **Android**: Roboto
- Sizes: 10px - 48px scale

### Spacing
- Base: 4px scale (4, 8, 12, 16, 24, 32, 40, 48, 64, 80)

### Border Radius
- sm: 8px, md: 12px, lg: 16px, xl: 24px, full: 9999px

### Glass Effect
- Blur: 24-64px
- Background: rgba(255, 255, 255, 0.08-0.16)
- Border: rgba(255, 255, 255, 0.08-0.16)

## 🔥 Key Features Detail

### Post Expiration
- Posts created with `expires_at = created_at + 60 minutes`
- Database query filters expired posts: `WHERE expires_at > NOW()`
- Client-side timer removes posts when expired
- Real-time countdown display

### Friends System
- Send/accept friend requests
- Friends-only feed filtering
- Mutual friendship required to see posts
- Real-time friend status updates

### Location Services
- Auto-detect current location via GPS
- Reverse geocoding to friendly names
- Manual location search
- Optional - can post without location
- Privacy settings (exact/neighborhood/city)

### Emoji Reactions
- 4 reactions: 😊 ❤️ 🔥 💯
- One reaction per user per post
- Toggle reaction on/off
- Real-time reaction count updates

---

**Built with ❤️ using React Native, Expo, and Supabase**

