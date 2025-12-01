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
1. Fix file upload to work reliably in React Native - use fetch() to read local file:// URIs as Blob, upload Blob directly to Supabase storage (expo-file-system is DEPRECATED in SDK 54+)
2. Fix location search flow - when user selects location in LocationSearchScreen, it should update PostPreviewScreen's selectedLocation state properly WITHOUT passing functions in navigation params
3. Ensure the entire flow works: Camera → PostPreview → LocationSearch → PostPreview (with updated location) → Create Post → Success
4. Ensure Supabase storage policies exist for authenticated users to upload to their own folder

**Critical Requirements:**
- NO function callbacks in navigation params (causes serialization warnings)
- File upload MUST use fetch() + blob() - NOT expo-file-system (deprecated in SDK 54)
- Location updates MUST persist when returning from LocationSearchScreen
- All error handling must be comprehensive with user-friendly messages
- Code must be production-ready and handle edge cases
- Supabase storage policies MUST allow authenticated users to upload to buckets

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

1. **expo-file-system is DEPRECATED in SDK 54** - Use fetch() + blob() instead
2. **fetch().blob() DOES work in React Native** - Handles local file:// URIs correctly
3. **Navigation callbacks cause serialization issues** - Use route params instead
4. **Location updates need proper state management** - Use navigation params with useEffect listeners
5. **Error handling must be comprehensive** - Catch all edge cases
6. **Supabase storage needs RLS policies** - Without policies, uploads silently fail

## The Solution

The fix involves:
1. Using `fetch(mediaUri)` to read local files, then `.blob()` to get Blob
2. Uploading Blob directly to Supabase storage (accepts Blob in React Native)
3. Using navigation params (selectedLocation) instead of callbacks
4. Listening to route param changes in PostPreviewScreen to update state
5. Proper error handling at every step
6. Creating proper RLS policies on storage.objects for authenticated uploads

