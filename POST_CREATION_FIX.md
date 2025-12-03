# Post Creation Flow - Debugging & Fix Summary

## Issue Identified

The error message "No media to post" appears when:
1. Camera captures photo but URI is not passed correctly
2. Navigation params get lost or corrupted
3. Video player initialization fails without valid URI

## Changes Made

### 1. Enhanced Debugging Throughout Flow

**CameraView.tsx** - Added logging to camera capture:
```typescript
console.log('[Camera] Taking picture...');
console.log('[Camera] Photo result:', { hasUri: !!photo?.uri, uri: ... });
console.log('[Camera] Calling onCapture with URI:', photo.uri);
```

**CameraScreen.tsx** - Added validation and logging:
```typescript
console.log('[CameraScreen] handleCapture called:', { uri, type });
if (!uri) {
  console.error('[CameraScreen] No URI provided to handleCapture');
  Alert.alert('Error', 'Failed to capture media. Please try again.');
  return;
}
```

**PostPreviewScreen.tsx** - Added param logging and safer initialization:
```typescript
useEffect(() => {
  console.log('[PostPreview] Received params:', {
    mediaUri: mediaUri ? `${mediaUri.substring(0, 50)}...` : 'UNDEFINED',
    mediaType,
    hasLocation: !!initialLocation,
  });
}, []);

// Safe video player initialization
const videoPlayer = useVideoPlayer(mediaType === 'video' && mediaUri ? mediaUri : '');
```

### 2. Better Error Handling

- Alert user immediately if camera capture fails
- Validate URI at each step before passing
- Safer null checks for location data
- Video player only initializes with valid URI

### 3. Location Handling Improvements

- Location is truly optional (can post without it)
- Better validation of location coordinates
- Clearer logging of location state
- Handles "Change" location flow properly

## How to Debug the Issue

### Step 1: Reload the App
```bash
# In Expo Go
Shake device → Press "Reload"

# OR in terminal
Press 'r' in the expo terminal
```

### Step 2: Take a Photo and Watch Console

You should see this sequence:
```
1. [Camera] Taking picture...
2. [Camera] Photo result: { hasUri: true, uri: 'file://...', width: X, height: Y }
3. [Camera] Calling onCapture with URI: file://...
4. [CameraScreen] handleCapture called: { uri: 'file://...', type: 'image' }
5. [CameraScreen] Navigating to PostPreview with: { mediaUri: 'file://...', ... }
6. [PostPreview] Received params: { mediaUri: 'file://...', mediaType: 'image' }
```

### Step 3: Identify Where It Breaks

**If you see:**
- `[Camera] No photo URI returned` → Camera hardware/permission issue
- `[CameraScreen] No URI provided` → Camera capture failed
- `[PostPreview] mediaUri: 'UNDEFINED'` → Navigation params not passed

### Step 4: Check Specific Issues

**Camera Permission:**
```bash
# iOS
Settings → Tonight → Allow Camera

# Android
Settings → Apps → Tonight → Permissions → Camera
```

**Location Permission (optional):**
```bash
# Same as above, but for Location
# Note: App should work WITHOUT location permission
```

**File System Access:**
- The captured photo is stored in device cache
- URI format: `file:///path/to/cache/ImagePicker-XXX.jpg`
- Make sure app has file system access

## Testing the Full Flow

### Test 1: Photo with Location
1. Open app → Tap camera button
2. Allow camera permission
3. Allow location permission
4. Take photo
5. Should see: Location name (e.g., "Auburn, CA")
6. Add caption (optional)
7. Tap checkmark → Should see success animation
8. Return to feed → See new post

### Test 2: Photo without Location
1. Deny location permission OR
2. Take photo before location loads
3. Should see "Add a location" placeholder
4. Can post anyway - location is optional!

### Test 3: Change Location
1. Take photo with auto-detected location
2. Tap "Change" button
3. Search for different location
4. Select from results
5. Should update location in preview
6. Post successfully

### Test 4: Video (if supported)
1. Open camera
2. Long press capture button
3. Record video (max 30 seconds)
4. Should navigate to preview
5. Video should play in loop
6. Can post with/without location

## Expected Behavior

### ✅ What Should Work
- Camera captures photo and passes URI correctly
- Location auto-detects (if permission granted)
- Can post without location
- Can change location via search
- Caption is optional
- Success animation after posting
- Post appears in feed immediately
- Timer counts down from 60 minutes
- Emoji reactions work
- Friends-only feed filtering

### ❌ Common Issues & Solutions

**"No media to post" error:**
- Check console logs for where URI is lost
- Try clearing app cache
- Reinstall expo-camera if needed
- Test on physical device (better than simulator)

**Location shows "Location Unknown":**
- Check location permission
- Wait a few seconds for GPS
- Use "Change" to manually select
- **OR** just post without location!

**Photo not uploading:**
- Check network connection
- Verify Supabase credentials in .env
- Check file size (max 10MB)
- Check Supabase storage bucket exists

**Video not playing:**
- Check video URI in logs
- Verify expo-video is installed
- Try with shorter video
- Check file size (max 50MB)

## Supabase Configuration

### Required:
- ✅ Storage bucket "post-media" exists
- ✅ Public access enabled
- ✅ MIME types: image/jpeg, image/png, video/mp4
- ✅ Max file size: 10MB
- ✅ RLS policies for authenticated users

### Database Tables:
- ✅ `posts` - with location fields (nullable)
- ✅ `profiles` - user data
- ✅ `friendships` - friend relationships
- ✅ `reactions` - emoji reactions
- ✅ All with proper RLS policies

## Next Steps

1. **Test the flow** - Take a photo and watch console logs
2. **Report findings** - Share console output if error persists
3. **Try workarounds**:
   - Use photo from gallery if camera fails
   - Post without location if detection fails
   - Try different photo if upload fails

4. **If still broken**, provide:
   - Full console logs from taking photo → error
   - Device info (iPhone X, iOS 17, etc.)
   - Screenshot of error
   - Whether you're on simulator or real device

## Technical Details

### Navigation Flow
```
FeedScreen (tap camera)
  → CameraScreen (capture photo)
    → onCapture(uri, type)
      → navigation.replace('PostPreview', { mediaUri, mediaType, location })
        → PostPreviewScreen receives params
          → handlePost()
            → createPost({ mediaUri, mediaType, caption, location })
              → Upload to Supabase storage
              → Insert post record
              → Success! → Back to Feed
```

### Critical Checkpoints
1. ✅ Camera captures photo → `photo.uri` exists
2. ✅ CameraView calls `onCapture(uri, 'image')`
3. ✅ CameraScreen receives uri, validates it
4. ✅ Navigation passes params to PostPreview
5. ✅ PostPreview receives `mediaUri` from params
6. ✅ File exists at URI path
7. ✅ Upload to Supabase succeeds
8. ✅ Post record created in database

### File Paths
- **iOS simulator**: `file:///Users/.../Library/Developer/CoreSimulator/.../ImagePicker-XXX.jpg`
- **iOS device**: `file:///var/mobile/.../ImagePicker-XXX.jpg`
- **Android**: `file:///data/user/0/host.exp.exponent/cache/...`

All paths should be accessible via `expo-file-system` for reading and uploading.

