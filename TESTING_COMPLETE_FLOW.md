# Complete App Testing Guide

## Overview
This guide walks you through testing all main features of The Tonight App to ensure everything works correctly after the post creation and location detection fixes.

## Prerequisites

### 1. Environment Setup ✓
- `.env.local` file should exist with:
  ```
  EXPO_PUBLIC_SUPABASE_URL=https://fgoonvotrhuavidqrtdh.supabase.co
  EXPO_PUBLIC_SUPABASE_ANON_KEY=<your_anon_key>
  ```
- If the file doesn't exist (it's gitignored), create it with the values above
- Restart your Expo dev server after creating/updating the file

### 2. Check Console for Supabase Connection
When you start the app, you should see:
```
✅ Supabase configuration loaded: { url: '...', keyLength: ..., keyPrefix: '...' }
✅ Supabase connected successfully. Profiles count: ...
```

If you see errors, check that:
- The `.env.local` file exists in the project root
- Environment variables are properly formatted (no extra spaces/quotes)
- You've restarted the Expo dev server

## Feature Testing Checklist

### 1. Authentication Flow ✓
- [ ] User can sign up with email/password
- [ ] User can set username
- [ ] User is prompted for camera and location permissions
- [ ] User can log in
- [ ] Session persists between app restarts

### 2. Post Creation Flow (PRIMARY FIX)

#### Step 1: Open Camera
- [ ] Tap floating camera button (center bottom of Feed)
- [ ] Camera permission prompt appears (if first time)
- [ ] Camera preview loads successfully
- [ ] Location strip shows at top with current location or "Getting location..."

**Expected Console Logs:**
```
📍 [getCurrentLocation] Starting, accuracy: ...
📍 [getCurrentLocation] Permission check: true
📍 [getCurrentLocation] Fetching location with 10000ms timeout...
✅ [getCurrentLocation] Location received: { lat: ..., lng: ... }
📍 [reverseGeocode] Starting reverse geocode: { lat: ..., lng: ... }
✅ [reverseGeocode] Location data created: { name: '...' }
```

#### Step 2: Capture Photo/Video
- [ ] Tap capture button to take photo
- [ ] OR hold capture button to record video
- [ ] Capture succeeds (no blank screen)
- [ ] Navigation to PostPreview screen happens automatically

**If capture fails:** Check camera permissions in device settings

#### Step 3: Post Preview Screen
- [ ] Media preview displays correctly (photo or video plays)
- [ ] Location section shows:
  - Current location (if detected), OR
  - "Add a location" placeholder (if not detected/no permission)
- [ ] Can tap location to search for different location
- [ ] Caption input works
- [ ] Character counter shows (max 200 characters)

**Test with location:**
- [ ] Location name displays correctly
- [ ] Tap "Change" to open location search
- [ ] Search for location works
- [ ] Can select different location
- [ ] Selected location displays on preview screen

**Test without location:**
- [ ] Can post without adding location
- [ ] App doesn't crash or show errors
- [ ] Post still succeeds

#### Step 4: Submit Post
- [ ] Tap "Share with Friends" button
- [ ] Loading indicator shows
- [ ] Success animation plays (green checkmark)
- [ ] Navigates back to Feed

**Expected Console Logs (Full Flow):**
```
🚀 [createPost] Starting post creation: { userId: ..., mediaType: 'image', hasLocation: true }
🔐 [createPost] Getting session...
✅ [createPost] Session valid, user: ...
📁 [createPost] Processing media file...
🔄 [createPost] Preparing media for upload...
✅ [createPost] Media prepared: { size: ... }
📖 [createPost] Reading file as base64...
🔄 [createPost] Converting base64 to ArrayBuffer...
✅ [createPost] File prepared successfully: ...KB
☁️ [createPost] Uploading to Supabase storage...
✅ [createPost] Upload successful!
🔗 [createPost] Getting public URL...
✅ [createPost] Public URL: ...
⏰ [createPost] Post will expire at: ...
📍 [createPost] Processing location data...
✅ [createPost] Location validated and parsed
💾 [createPost] Inserting post record into database...
✅ [createPost] Post record created successfully!
📊 [createPost] Updating user stats...
✅ [createPost] User stats updated
🎉 [createPost] POST CREATED SUCCESSFULLY!
```

**If post fails, check console for specific error:**
- ❌ Session error → Re-login required
- ❌ File errors → Try capturing again, check storage space
- ❌ Upload error → Check network connection, Supabase storage policies
- ❌ Database error → Check RLS policies, verify session is valid

### 3. Feed Display ✓
After posting, check the Feed:
- [ ] New post appears at top of feed
- [ ] Post displays:
  - ✓ Username with @ symbol
  - ✓ Profile picture (or default avatar)
  - ✓ Location name with 📍 pin icon (if location was added)
  - ✓ Photo/video displays correctly
  - ✓ Caption displays (if added)
  - ✓ Countdown timer shows (e.g., "59m remaining")
  - ✓ Reaction buttons (😊 ❤️ 🔥 💯)

**Timer Test:**
- [ ] Timer updates as time passes
- [ ] Timer color changes as expiry approaches:
  - Green (>30min remaining)
  - Orange (15-30min remaining)  
  - Red (<15min remaining)

### 4. Reactions ✓
- [ ] Tap a reaction emoji
- [ ] Reaction highlights/fills
- [ ] Reaction count increments
- [ ] Tap same reaction again to remove it
- [ ] Can change reaction by tapping different emoji
- [ ] Other users' reactions display with count

**Test realtime updates:**
- [ ] If another user adds reaction, you see it update in real-time
- [ ] Reactions persist after closing/reopening app

### 5. Location Features ✓

#### Location Search Screen
- [ ] Search bar accepts input
- [ ] Shows "Current Location" at top (if permission granted)
- [ ] Tap "Use" button to select current location
- [ ] Search results appear as you type (2+ characters)
- [ ] Tap result to select location
- [ ] Selected location appears on preview screen

#### Location Display on Posts
- [ ] Posts with location show location name with 📍 icon
- [ ] Location appears below username
- [ ] Location is clickable (future feature: show map)

#### Location Privacy
- [ ] Posts without location still work correctly
- [ ] Location is always optional, never required

### 6. Post Expiry ✓

**Test 60-minute expiry:**
- [ ] Posts show timer counting down
- [ ] Posts disappear from feed after 1 hour
- [ ] Expired posts don't show in feed even after refresh

**Quick test (for development):**
To test expiry without waiting 60 minutes, you can manually update a post's expiry:

```sql
-- Run in Supabase SQL Editor to make a post expire in 1 minute
UPDATE posts 
SET expires_at = now() + interval '1 minute'
WHERE id = 'your-post-id';
```

Then:
- [ ] Wait 1 minute
- [ ] Pull to refresh feed
- [ ] Post should disappear

### 7. Friends-Only Visibility ✓
- [ ] Posts only visible to friends
- [ ] Own posts are always visible
- [ ] Non-friend posts don't appear in feed

**Test:**
1. Create test user #1
2. Create test user #2  
3. User #1 posts → User #2 doesn't see it
4. User #1 sends friend request to User #2
5. User #2 accepts
6. User #1 posts → User #2 now sees it

### 8. Profile & Settings ✓
- [ ] Profile screen shows user stats:
  - Post count
  - Friend count
  - Total views
- [ ] Can view own posts
- [ ] Can view friend's profile
- [ ] Settings accessible from menu

### 9. Error Handling ✓

Test error scenarios:

**No Internet:**
- [ ] App shows appropriate error message
- [ ] Doesn't crash
- [ ] Retries when connection restored

**No Camera Permission:**
- [ ] Shows permission prompt
- [ ] Provides "Open Settings" option
- [ ] Explains why permission is needed

**No Location Permission:**
- [ ] Posts still work without location
- [ ] Option to enable location shows
- [ ] Can manually search for location

**File Too Large:**
- [ ] Shows clear error message with file size
- [ ] Suggests trying again or using smaller file

## Common Issues & Solutions

### Issue: Posts not appearing in feed
**Solutions:**
1. Pull to refresh
2. Check if users are friends
3. Check console for errors
4. Verify RLS policies allow reading posts

### Issue: Upload fails with "unauthorized"
**Solutions:**
1. Check user is logged in (re-login if needed)
2. Verify storage bucket policies allow authenticated uploads
3. Check session is valid in console logs

### Issue: Location shows "Unknown Location"
**Solutions:**
1. Grant location permission in device settings
2. Ensure GPS/location services enabled on device
3. Try "Use Current Location" button on preview screen
4. Search for location manually

### Issue: Timer not updating
**Solutions:**
1. Check `config.TIMER_UPDATE_INTERVAL` (should be 60000ms = 1 min)
2. Verify `removeExpiredPosts` is called in usePosts hook
3. Check console for timer-related errors

### Issue: .env.local not loading
**Solutions:**
1. Verify file exists in project root (same level as package.json)
2. Restart Expo dev server completely
3. Clear Metro bundler cache: `npx expo start -c`
4. Check file has correct format (no spaces around =)

## Success Criteria

All features working correctly:
- ✅ User can capture photos/videos
- ✅ Location detection works (or gracefully handles no permission)
- ✅ Posts upload successfully to Supabase
- ✅ Posts appear in feed with all metadata
- ✅ Reactions work and sync in realtime
- ✅ Posts expire after 60 minutes
- ✅ Friends-only visibility enforced
- ✅ Detailed console logging helps debug issues

## Detailed Console Logging

The app now includes comprehensive logging. Look for these emoji indicators:

- 🚀 Starting operations
- 🔐 Authentication checks
- 📁 File operations
- 🔄 Processing/conversions
- ☁️ Cloud/network operations
- 📍 Location operations
- 💾 Database operations
- ✅ Success messages
- ❌ Error messages
- ⚠️ Warnings
- ℹ️ Info messages
- 📊 Stats updates
- ⏰ Timing information
- 🎉 Major milestones

Use these to track exactly where in the flow issues occur.

## Support

If issues persist after following this guide:
1. Check Supabase dashboard for errors
2. Review console logs for specific error codes
3. Verify database migrations have run
4. Check storage bucket and RLS policies
5. Ensure user has proper authentication session

