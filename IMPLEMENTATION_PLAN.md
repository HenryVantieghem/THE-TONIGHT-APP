# EXPERIENCES - Implementation Plan

## Overview

Transform "THE TONIGHT APP" → **EXPERIENCES** with complete UI/UX redesign following `EXPERIENCES_DESIGN_SPEC.md`.

**Estimated Phases:** 6 | **Priority:** High-to-Low

---

## Phase 1: Foundation Updates

### 1.1 Update App Configuration
**File:** `app.json`
- [ ] Change `name` to "Experiences"
- [ ] Change `slug` to "experiences"
- [ ] Update `scheme` to "experiences"
- [ ] Update app icon (if new asset available)

### 1.2 Update Config Constants
**File:** `src/constants/config.ts`
- [ ] Update `APP_NAME` to 'Experiences'
- [ ] Verify spacing system matches spec (4px base)
- [ ] Verify border radius values

### 1.3 Update Colors
**File:** `src/constants/colors.ts`
- [ ] Ensure primary is `#6366F1` (Indigo-500)
- [ ] Update background colors:
  - `backgroundSecondary: '#F9FAFB'`
  - `backgroundTertiary: '#F3F4F6'`
- [ ] Update text colors:
  - `textPrimary: '#111827'`
  - `textSecondary: '#6B7280'`
  - `textTertiary: '#9CA3AF'`
- [ ] Update timer colors:
  - `timerGreen: '#10B981'`
  - `timerYellow: '#F59E0B'`
  - `timerRed: '#EF4444'`
- [ ] Remove unnecessary gradient definitions

### 1.4 Remove Old Branding Components
**Files to remove/update:**
- [ ] Remove `DiscoBallLogo.tsx` or deprecate
- [ ] Remove any "Tonight" references in code
- [ ] Update any hardcoded app name strings

---

## Phase 2: Core UI Components ✅ COMPLETE

### 2.1 Button Component ✅
**File:** `src/components/ui/Button.tsx`
- [x] Remove gradient backgrounds
- [x] Implement solid color backgrounds only
- [x] Add pill shape (borderRadius: 9999)
- [x] Update variants:
  - `primary`: Solid #6366F1, white text, accent glow shadow
  - `secondary`: 10% opacity accent bg, accent text
  - `ghost`: Transparent, secondary text
  - `destructive`: #EF4444 bg, white text
- [x] Add size variants: large (56px), default (48px), small (40px)
- [x] Implement press states: scale 0.97, opacity 90%
- [x] Add disabled state: opacity 50%
- [x] Add loading state with spinner

### 2.2 Input Component ✅
**File:** `src/components/ui/Input.tsx`
- [x] Background: Tertiary (#F3F4F6)
- [x] Remove border (use background differentiation)
- [x] Border radius: 12px
- [x] Height: 56px
- [x] Padding: 16px
- [x] Leading icon support (SF Symbol style)
- [x] Add focus state: 2px accent border
- [x] Add error state: Error bg 5%, error border
- [x] Trailing action support (eye toggle, clear)

### 2.3 Card Component ✅
**File:** `src/components/ui/Card.tsx`
- [x] Background: Secondary (#F9FAFB)
- [x] Border radius: 16px
- [x] Shadow: Level 2 (black 8%, offset 0,2, radius 8)
- [x] Padding: 16px

### 2.4 Avatar Component ✅
**File:** `src/components/ui/Avatar.tsx`
- [x] Add size variants:
  - `sm`: 32px
  - `md`: 40px (default)
  - `lg`: 56px
  - `xl`: 80px
  - `xxl`: 120px
- [x] Circular clip shape
- [x] 2px white border when on images
- [x] Placeholder: Initials on accent background
- [x] Add edit badge prop (camera icon bottom-right)

### 2.5 TimerBar Component ✅
**File:** `src/components/ui/TimerBar.tsx`
- [x] Height: 4px
- [x] Border radius: full
- [x] Background: Tertiary
- [x] Smooth width transition (0.5s ease)
- [x] Color transitions:
  - >50%: Green (#10B981)
  - 25-50%: Yellow (#F59E0B)
  - <25%: Red (#EF4444)
  - <5min: Pulsing red (opacity 0.7 ↔ 1.0, 1s)
- [x] Right-aligned "Xm left" text

### 2.6 FloatingCameraButton Component ✅
**File:** `src/components/ui/FloatingCameraButton.tsx`
- [x] Size: 64px diameter
- [x] Background: Solid accent (#6366F1)
- [x] Icon: camera.fill, white, 28pt
- [x] Shadow: Level 4
- [x] Position: Center bottom, 24px above safe area
- [x] Press animation: scale 0.9, spring back
- [x] Haptic feedback on press

### 2.7 EmptyState Component ✅
**File:** `src/components/feed/EmptyState.tsx`
- [x] Centered layout
- [x] Large icon: 48pt SF Symbol
- [x] Title: Title 2 style
- [x] Description: Body, secondary color
- [x] CTA button: Secondary variant
- [x] Create variants:
  - No friends: person.2.fill icon
  - No posts: camera.fill icon

### 2.8 Skeleton Component ✅
**File:** `src/components/ui/Skeleton.tsx`
- [x] Shimmer animation
- [x] Rounded corners matching content
- [x] Tertiary background color

---

## Phase 3: Auth Flow Screens

### 3.1 Splash Screen
**File:** `src/screens/auth/SplashScreen.tsx`
- [ ] Remove DiscoBallLogo
- [ ] Add new logo animation:
  - Scale 0.8 → 1.0
  - Opacity 0 → 1
  - Duration: ~800ms
- [ ] "Experiences" wordmark fade in after logo
- [ ] Total duration: 1-1.5 seconds
- [ ] Background: White (#FFFFFF)
- [ ] Transition: Fade to next screen

### 3.2 Onboarding Screen
**File:** `src/screens/auth/OnboardingScreen.tsx`
- [ ] Implement 3-screen carousel:

  **Screen 1: Share**
  - Geometric illustration (camera + pin)
  - Title: "Share What You're Doing Now"
  - Subtitle: "Post a photo with your location"

  **Screen 2: Discover**
  - Geometric illustration (post cards)
  - Title: "See Where Your Friends Are"
  - Subtitle: "Discover what your friends are up to right now"

  **Screen 3: Ephemeral**
  - Geometric illustration (fading post)
  - Title: "Posts Vanish After 1 Hour"
  - Subtitle: "Live in the now. No pressure, just authentic moments."

- [ ] Pagination dots: ● ○ ○ style
- [ ] "Next" button (screens 1-2)
- [ ] "Get Started" button (screen 3)
- [ ] "Skip" link (ghost style)

### 3.3 Sign Up Screen
**File:** `src/screens/auth/SignUpScreen.tsx`
- [ ] Header: "← Back" button
- [ ] Title: "Create Account"
- [ ] Subtitle: "Join Experiences and share moments with friends"
- [ ] Input fields with new styling:
  - Email (envelope icon)
  - Password (lock icon, eye toggle)
  - Confirm Password
- [ ] Primary button: "Create Account"
- [ ] Footer link: "Already have an account? Log In"
- [ ] Real-time validation feedback

### 3.4 Login Screen
**File:** `src/screens/auth/LoginScreen.tsx`
- [ ] Header: "← Back" button
- [ ] Title: "Welcome Back"
- [ ] Subtitle: "Sign in to continue"
- [ ] Input fields:
  - Email
  - Password with "Forgot Password?" link
- [ ] Primary button: "Log In"
- [ ] Footer link: "Don't have an account? Sign Up"

### 3.5 Username Setup Screen
**File:** `src/screens/auth/UsernameSetupScreen.tsx`
- [ ] Title: "Choose Your Username"
- [ ] Subtitle: "This is how friends will find you"
- [ ] Input with @ prefix
- [ ] Real-time validation states:
  - Checking: Spinner + "Checking availability..."
  - Available: Green checkmark + "Available"
  - Taken: Red X + "Username already taken"
  - Invalid: Red X + error message
- [ ] Primary button: "Continue"

### 3.6 Permissions Screen
**File:** `src/screens/auth/PermissionsScreen.tsx`
- [ ] Clean permission request UI
- [ ] Camera permission: Required
- [ ] Location permission: Optional (NOT blocking)
- [ ] SF Symbol icons for each permission
- [ ] Clear explanations
- [ ] "Continue" even if location denied

---

## Phase 4: Main Screens

### 4.1 Feed Screen
**File:** `src/screens/main/FeedScreen.tsx`
- [ ] Header:
  - Left: Menu icon (line.3.horizontal)
  - Center: "Experiences"
  - Right: Profile icon (person.circle.fill)
- [ ] Pull to refresh with spinner
- [ ] Skeleton loading (3 cards)
- [ ] Empty states:
  - No friends: "Find Your Friends"
  - No posts: "No Posts Yet"
- [ ] Floating camera button (center bottom)
- [ ] Post card list with stagger animation

### 4.2 PostCard Component
**File:** `src/components/feed/PostCard.tsx`
- [ ] Header section:
  - Avatar: 40px
  - Username: Headline style
  - Location: Subheadline, secondary color, mappin icon
- [ ] Photo: Full width, 12px radius, 1:1 or 4:3
- [ ] Caption: Body text, 2 lines max
- [ ] Timer bar with "Xm left" text
- [ ] Reaction row: Evenly spaced
- [ ] Tap interactions:
  - Photo → Full screen
  - Avatar/username → Profile
  - Reactions → Toggle

### 4.3 EmojiReactions Component
**File:** `src/components/feed/EmojiReactions.tsx`
- [ ] Horizontal row layout
- [ ] 4 reactions: 😊 ❤️ 🔥 💯
- [ ] Count below each
- [ ] Tap animation: Scale 1.3 → 1.0
- [ ] Active state: Accent ring
- [ ] Haptic feedback

### 4.4 Camera Screen
**File:** `src/screens/main/CameraScreen.tsx`
- [ ] Top bar:
  - Left: Close (xmark)
  - Right: Flash toggle (bolt.fill variants)
- [ ] Full camera viewfinder
- [ ] Location strip (non-blocking):
  - Loading: "Getting location..." + spinner
  - Found: Location name + "Change" button
  - Unavailable: "Add Location" button
- [ ] Bottom controls:
  - Left: Flip camera (arrow.triangle.2.circlepath.camera)
  - Center: Capture button (80px white circle, 4px accent border)
  - Right: Gallery (photo.on.rectangle)
- [ ] Capture animation: Screen flash, haptic

### 4.5 Post Preview Screen
**File:** `src/screens/main/PostPreviewScreen.tsx`
- [ ] Header: "Cancel" | "New Post"
- [ ] Photo preview (full width, rounded)
- [ ] Location row:
  - Has location: Show with "Change" button
  - No location: "Add Location (optional)" with + icon
- [ ] Caption input:
  - Placeholder: "Add a caption..."
  - Character counter: 0/200
- [ ] Share button: Primary, enabled when photo exists
- [ ] Loading state: Spinner + "Sharing..."

### 4.6 Profile Screen
**File:** `src/screens/main/ProfileScreen.tsx`
- [ ] Header: "← Back" | "Settings" (gear icon, own profile only)
- [ ] Avatar: 120px with edit badge (own profile)
- [ ] Username: @username
- [ ] Stats row: Posts | Friends | Views
- [ ] Action buttons:
  - Own: "👥 Friends" | "Log Out"
  - Other: Friend action button
- [ ] Posts grid (4 columns)
- [ ] Tap post → Full view

### 4.7 Friends Screen
**File:** `src/screens/main/FriendsScreen.tsx`
- [ ] Header: "← Back" | "Friends"
- [ ] Search input
- [ ] Tab bar: "Friends (X)" | "Requests (X)"
- [ ] Request cards:
  - Avatar + username
  - Accept (primary) | Decline (ghost) buttons
- [ ] Friend cards:
  - Avatar + username
  - ••• menu (View Profile, Remove, Block)

### 4.8 Settings Screen
**File:** `src/screens/main/SettingsScreen.tsx`
- [ ] Header: "← Back" | "Settings"
- [ ] Grouped sections:

  **Account**
  - Username row → edit
  - User ID row (non-editable)

  **Privacy**
  - Location Precision picker:
    - Exact: Show specific location name
    - Neighborhood: Show city and state
    - City Only: Show only the city

  **About**
  - Terms of Service → link
  - Privacy Policy → link
  - Send Feedback → link

- [ ] Destructive action: "Delete Account" (red text)

---

## Phase 5: Supporting Components

### 5.1 LocationStrip Component
**File:** `src/components/camera/LocationStrip.tsx`
- [ ] Non-blocking design
- [ ] States:
  - Loading: Spinner + "Getting location..."
  - Found: mappin icon + name + "Change" button
  - Error: "Add Location" button
- [ ] Background: Semi-transparent or card style
- [ ] Never prevents photo capture

### 5.2 CaptureButton Component
**File:** `src/components/camera/CaptureButton.tsx`
- [ ] Size: 80px diameter
- [ ] Style: White circle with 4px accent border
- [ ] Press: Scale to 0.9
- [ ] Haptic feedback
- [ ] Support for tap (photo) and hold (video - future)

### 5.3 PostCardSkeleton Component
**File:** `src/components/feed/PostCardSkeleton.tsx`
- [ ] Match PostCard layout
- [ ] Shimmer animation
- [ ] Avatar, username, photo, caption, reactions placeholders

---

## Phase 6: Polish & Animations

### 6.1 Micro-interactions
- [ ] Button press: scale 0.97, 100ms
- [ ] Card appearance: opacity 0→1, translateY 20→0, 300ms
- [ ] Card stagger: 50ms between cards
- [ ] Reaction tap: scale 1.3→1.0, spring
- [ ] Pull to refresh: rotation indicator → spinner

### 6.2 Timer Bar Animations
- [ ] Width transition: 0.5s ease
- [ ] Color crossfade at thresholds
- [ ] Pulse animation at <5min

### 6.3 Navigation Transitions
- [ ] Push: iOS slide from right
- [ ] Modal: Slide from bottom with drag-to-dismiss
- [ ] Screen fade transitions

### 6.4 Haptic Feedback
- [ ] Light impact: Button press, reactions
- [ ] Medium impact: Post created, friend added
- [ ] Success: Action completed

### 6.5 Error Handling UI
- [ ] Toast notifications
- [ ] Network error states
- [ ] Permission denied states
- [ ] Retry actions

---

## Quality Checklist

### Accessibility
- [ ] 44x44pt minimum tap targets
- [ ] WCAG AA color contrast
- [ ] VoiceOver labels
- [ ] Reduce Motion support
- [ ] Dynamic Type support

### Performance
- [ ] FlatList optimization
- [ ] Image caching
- [ ] Skeleton loading
- [ ] Prefetch pagination

### Testing
- [ ] Auth flow E2E
- [ ] Post creation flow
- [ ] Friend management
- [ ] Timer expiration
- [ ] Offline handling

---

## Files Changed Summary

**New Files:**
- `EXPERIENCES_DESIGN_SPEC.md`
- `SUPABASE_SETUP.md`
- `IMPLEMENTATION_PLAN.md`

**Updated Files:**
- `CLAUDE.md`
- `app.json`
- `src/constants/config.ts`
- `src/constants/colors.ts`
- `src/components/ui/Button.tsx`
- `src/components/ui/Input.tsx`
- `src/components/ui/Card.tsx`
- `src/components/ui/Avatar.tsx`
- `src/components/ui/TimerBar.tsx`
- `src/components/ui/FloatingCameraButton.tsx`
- `src/components/feed/EmptyState.tsx`
- `src/components/feed/PostCard.tsx`
- `src/components/feed/EmojiReactions.tsx`
- `src/components/camera/LocationStrip.tsx`
- `src/components/camera/CaptureButton.tsx`
- `src/screens/auth/SplashScreen.tsx`
- `src/screens/auth/OnboardingScreen.tsx`
- `src/screens/auth/SignUpScreen.tsx`
- `src/screens/auth/LoginScreen.tsx`
- `src/screens/auth/UsernameSetupScreen.tsx`
- `src/screens/auth/PermissionsScreen.tsx`
- `src/screens/main/FeedScreen.tsx`
- `src/screens/main/CameraScreen.tsx`
- `src/screens/main/PostPreviewScreen.tsx`
- `src/screens/main/ProfileScreen.tsx`
- `src/screens/main/FriendsScreen.tsx`
- `src/screens/main/SettingsScreen.tsx`

**Potentially Deprecated:**
- `src/components/ui/DiscoBallLogo.tsx`
- Liquid glass components (if not used)

---

## Execution Order

1. **Foundation** → Config, colors, remove old branding
2. **Core Components** → Button, Input, Card, Avatar, TimerBar
3. **Auth Screens** → Splash, Onboarding, SignUp, Login, Username, Permissions
4. **Main Screens** → Feed, Camera, PostPreview, Profile
5. **Secondary** → Friends, Settings
6. **Polish** → Animations, haptics, error handling

---

*Ready to build EXPERIENCES. Clean. Fast. Ephemeral. Stunning.*
