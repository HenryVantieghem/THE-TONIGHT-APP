# Expo Go Setup Guide

## Quick Start for Expo Go

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Up Environment Variables**
   Create a `.env.local` file in the root directory with:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Start Expo**
   ```bash
   npm start
   # or
   npm run start:clear  # if you need to clear cache
   ```

4. **Open in Expo Go**
   - Scan the QR code with Expo Go app on your device
   - Or press `i` for iOS simulator
   - Or press `a` for Android emulator

## ✅ SDK 54 Compatibility Checklist

- ✅ Removed deprecated `expo-file-system` - using `fetch()` instead
- ✅ Removed `expo-av` - migrated to `expo-video`
- ✅ Removed `base64-arraybuffer` - using native Blob support
- ✅ Fixed CameraView children issue - using absolute positioning
- ✅ All dependencies compatible with Expo SDK 54
- ✅ All plugins configured in `app.json`

## 📋 Required Environment Variables

The app requires these environment variables to be set:
- `EXPO_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key

These should be in a `.env.local` file (which is gitignored for security).

## 🔧 Troubleshooting

### App won't start
```bash
npm run start:clear  # Clear Metro bundler cache
rm -rf node_modules && npm install  # Reinstall dependencies
```

### Environment variables not loading
- Make sure `.env.local` is in the root directory
- Restart Expo after creating/modifying `.env.local`
- Variable names must start with `EXPO_PUBLIC_` to be available in the app

### Post creation fails
- Check that Supabase environment variables are set correctly
- Verify you're logged in (check auth state)
- Check network connection
- Review console logs for specific error messages

## 📱 Expo Go Limitations

**Note:** Some features may have limitations in Expo Go:
- Custom native modules require a development build
- Some permissions may need special handling
- For production, use EAS Build instead of Expo Go

## 🚀 Next Steps

1. Ensure `.env.local` is configured with your Supabase credentials
2. Run `npm start` and scan QR code in Expo Go
3. Test all features: auth, camera, location, posts, friends
4. For production builds, use `eas build` (see `APP_STORE_SUBMISSION.md`)

