# Tonight App - Testing Guide

## Quick Start

1. **Reload the app:**
   ```bash
   # In Expo Go, shake device and press "Reload"
   # Or in terminal where expo is running, press 'r'
   ```

2. **Check console logs:**
   - Look for `[Camera]`, `[CameraScreen]`, and `[PostPreview]` log messages
   - These will show you the flow of mediaUri through the app

## Core Features Testing Checklist

### 1. User Authentication & Onboarding ✓
- [ ] Sign up with email/password
- [ ] Create username
- [ ] Grant camera permission
- [ ] Grant location permission (optional)
- [ ] See main feed after onboarding

### 2. Camera & Photo Capture 🔴 NEEDS TESTING
- [ ] Open camera from floating button
- [ ] Take a photo - check console for `[Camera] Photo result`
- [ ] See photo preview with location
- [ ] Add caption (max 200 characters)
- [ ] Post successfully
- [ ] See success animation
- [ ] Return to feed with new post

**Debug Steps if Photo Fails:**
1. Check console for: `[Camera] Camera ref not available`
2. Check console for: `[Camera] No photo URI returned`
3. Check expo-camera permissions in device settings

### 3. Location Features 🔴 NEEDS TESTING
- [ ] Auto-detect location when taking photo
- [ ] See location name under photo preview
- [ ] Tap "Change" to search for different location
- [ ] Search for location by name
- [ ] Select location from search results
- [ ] Post without location (should work - location is optional)

**Expected Location Display:**
- Auburn, CA or similar city/state combination
- Not "Location Unknown" or "Current Location"

### 4. Feed & Posts ✓
- [ ] See posts from friends in feed
- [ ] Each post shows:
  - Username (@username)
  - Location (📍 location name)
  - Photo/video
  - Caption
  - Countdown timer (60 minutes)
  - Emoji reactions

### 5. Countdown Timers ✓
- [ ] Timer shows "59m left" for new posts
- [ ] Timer updates in real-time
- [ ] Timer turns yellow < 30 minutes
- [ ] Timer turns red < 5 minutes  
- [ ] Timer pulses when < 5 minutes
- [ ] Post disappears after 60 minutes

### 6. Emoji Reactions ✓
- [ ] Tap emoji to react: 😊 ❤️ 🔥 💯
- [ ] See reaction count
- [ ] Tap again to un-react
- [ ] Switch between different emojis
- [ ] See reactions update in real-time

### 7. Friends System ✓
- [ ] Search for friends by username
- [ ] Send friend request
- [ ] Accept friend request
- [ ] See only friends' posts in feed
- [ ] Remove friend

### 8. Profile & Settings ✓
- [ ] View own profile
- [ ] See post count, friend count
- [ ] Update avatar
- [ ] Update username
- [ ] Adjust settings (location precision, notifications)

## Known Issues & Fixes

### Issue: "No media to post" Error

**Symptoms:**
- Camera takes photo but PostPreview shows error
- Alert says "No media to post. Please go back and capture a photo or video"

**Debug Steps:**
1. **Check Console Logs** - Look for:
   ```
   [Camera] Photo result: { hasUri: true, uri: 'file://...' }
   [CameraScreen] handleCapture called: { uri: 'file://...', type: 'image' }
   [CameraScreen] Navigating to PostPreview with: { mediaUri: 'file://...' }
   [PostPreview] Received params: { mediaUri: 'file://...' }
   ```

2. **If no URI in logs:**
   - Camera permission might be denied
   - Camera hardware might not be available
   - expo-camera package issue

3. **If URI exists but error still shows:**
   - Navigation params not passing correctly
   - Check React Navigation version
   - Check MainStackParamList types

**Potential Fixes:**
- Clear app cache: Shake device → "Reload"
- Reinstall expo-camera: `npm install expo-camera@latest`
- Check file system permissions
- Try on different device/simulator

### Issue: Location not detected

**Symptoms:**
- Location shows "Location Unknown" or blank
- "Change" button doesn't work

**Debug Steps:**
1. **Check Console Logs** - Look for:
   ```
   [CameraScreen] hasCurrentLocation: true/false
   Location service: { lat: X, lng: Y, name: 'City' }
   ```

2. **Common Causes:**
   - Location permission denied
   - GPS not available (simulator)
   - Geocoding service timeout

**Fixes:**
- Grant location permission in Settings
- Use "Change" button to manually search location
- **Location is optional** - can post without it!

## Environment Variables

Make sure `.env` file exists with:
```bash
EXPO_PUBLIC_SUPABASE_URL=https://fgoonvotrhuavidqrtdh.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Database Schema

Posts expire after 60 minutes:
- `created_at`: Post creation time
- `expires_at`: created_at + 1 hour
- Query filters: `WHERE expires_at > NOW()`

## Performance Notes

- Images compressed to max 10MB before upload
- Videos max 50MB, max 30 seconds
- Feed loads 20 posts at a time
- Real-time updates via Supabase subscriptions
- Posts auto-removed from feed when expired

## Support

If you encounter issues:
1. Check console logs first
2. Clear expo cache: `npm run start:clear`
3. Check Supabase dashboard for errors
4. Verify all permissions granted
5. Test on physical device (camera/location work better than simulator)

