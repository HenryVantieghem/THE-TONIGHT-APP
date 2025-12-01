# Genius Prompt for Fixing Post Creation Flow

## The Ultimate Prompt That Will Actually Work

```
I need you to fix the post creation flow in my React Native Expo app. Here's what's happening:

**Current Problem:**
- Post creation fails with "Property 'blob' doesn't exist" error
- Location tagging/search doesn't properly update the post preview screen
- Navigation warnings about non-serializable values (function callbacks in params)

**Technical Context:**
- React Native Expo app (SDK 54)
- Using Supabase for backend (storage + database)
- File uploads need to work with local file URIs from expo-camera/expo-image-picker
- Location search uses expo-location for geocoding
- React Navigation for screen navigation

**What I Need:**
1. Fix file upload to work reliably in React Native - use expo-file-system to read files as base64, convert to Uint8Array, upload to Supabase storage
2. Fix location search flow - when user selects location in LocationSearchScreen, it should update PostPreviewScreen's selectedLocation state properly WITHOUT passing functions in navigation params
3. Ensure the entire flow works: Camera → PostPreview → LocationSearch → PostPreview (with updated location) → Create Post → Success

**Critical Requirements:**
- NO function callbacks in navigation params (causes serialization warnings)
- File upload MUST work with local file:// URIs from camera/image picker
- Location updates MUST persist when returning from LocationSearchScreen
- All error handling must be comprehensive with user-friendly messages
- Code must be production-ready and handle edge cases

**Files to Focus On:**
- src/services/posts.ts - File upload logic
- src/screens/main/PostPreviewScreen.tsx - Post preview and location handling
- src/screens/main/LocationSearchScreen.tsx - Location search and selection
- src/types/index.ts - Navigation types

**Testing Checklist:**
- [ ] Capture photo/video → should navigate to PostPreview
- [ ] Tap location in PostPreview → should open LocationSearch
- [ ] Search for location → should show results
- [ ] Select location → should return to PostPreview with updated location
- [ ] Tap "Share with Friends" → should upload file and create post successfully
- [ ] Post should appear in feed immediately after creation

Please fix ALL of these issues comprehensively and ensure the entire flow works end-to-end.
```

## Why This Prompt Works

1. **Clear Problem Statement**: Explicitly states what's broken
2. **Technical Context**: Provides framework versions and tech stack
3. **Specific Requirements**: Lists exactly what needs to be fixed
4. **Critical Constraints**: Highlights what NOT to do (function callbacks)
5. **File Focus**: Points to specific files that need changes
6. **Testing Checklist**: Provides verification steps

## Key Insights from Previous Failures

1. **React Native fetch.blob() doesn't work reliably** - Need expo-file-system
2. **Navigation callbacks cause serialization issues** - Use route params instead
3. **Location updates need proper state management** - Use navigation params with useEffect listeners
4. **Error handling must be comprehensive** - Catch all edge cases

## The Solution

The fix involves:
1. Using `expo-file-system.readAsStringAsync` with 'base64' encoding
2. Converting base64 to Uint8Array for Supabase upload
3. Using navigation params (selectedLocation) instead of callbacks
4. Listening to route param changes in PostPreviewScreen to update state
5. Proper error handling at every step

