# EXPERIENCES - Complete UI/UX Design Specification v2.0
## Ephemeral Location-Based Photo Sharing

---

## BRAND IDENTITY

### Name: **EXPERIENCES**
*Share what you're experiencing. Gone in an hour.*

### Taglines:
- "What are you experiencing?"
- "Share the moment. Gone in an hour."
- "Right now, right here."
- "Live moments, shared."

### Logo Concept:
- Abstract pulse/heartbeat line forming a camera aperture
- Clean wordmark in custom geometric sans-serif
- NO emoji, NO disco balls

---

## DESIGN TOKENS

### Color Palette

```typescript
// PRIMARY
accent: '#6366F1',           // Indigo-500
accentLight: '#818CF8',      // Indigo-400
accentDark: '#4F46E5',       // Indigo-600

// BACKGROUNDS (Light Mode)
backgroundPrimary: '#FFFFFF',
backgroundSecondary: '#F9FAFB',   // Gray-50
backgroundTertiary: '#F3F4F6',    // Gray-100

// BACKGROUNDS (Dark Mode)
darkPrimary: '#0F0F0F',
darkSecondary: '#1A1A1A',
darkTertiary: '#262626',

// TEXT
textPrimary: '#111827',      // Gray-900
textSecondary: '#6B7280',    // Gray-500
textTertiary: '#9CA3AF',     // Gray-400
textInverse: '#FFFFFF',

// SEMANTIC
success: '#10B981',          // Emerald-500
warning: '#F59E0B',          // Amber-500
error: '#EF4444',            // Red-500
info: '#3B82F6',             // Blue-500

// TIMER COLORS
timerFresh: '#10B981',       // >50% Green
timerMid: '#F59E0B',         // 25-50% Yellow
timerUrgent: '#EF4444',      // <25% Red (pulsing at <5m)
```

### Typography (SF Pro)

| Style | Weight | Size | Tracking | Usage |
|-------|--------|------|----------|-------|
| Large Title | Bold | 34pt | -0.4 | Screen titles |
| Title 1 | Bold | 28pt | -0.4 | Major headers |
| Title 2 | Semibold | 22pt | -0.3 | Section headers |
| Title 3 | Semibold | 20pt | -0.3 | Sub-sections |
| Headline | Semibold | 17pt | 0.0 | Usernames, buttons |
| Body | Regular | 17pt | 0.0 | Main content |
| Callout | Regular | 16pt | 0.0 | Secondary content |
| Subheadline | Regular | 15pt | 0.0 | Location text |
| Footnote | Regular | 13pt | 0.0 | Input labels |
| Caption 1 | Regular | 12pt | 0.0 | Timestamps |
| Caption 2 | Regular | 11pt | 0.1 | Smallest text |

### Spacing (4px Base Unit)

```typescript
spacing: {
  '2xs': 2,    // 0.5 base - Tight icon spacing
  'xs': 4,     // 1 base - Inline elements
  'sm': 8,     // 2 base - Related elements
  'md': 16,    // 4 base - Standard padding
  'lg': 24,    // 6 base - Section spacing
  'xl': 32,    // 8 base - Major sections
  '2xl': 48,   // 12 base - Screen padding top
  '3xl': 64,   // 16 base - Hero spacing
}
```

### Border Radius

```typescript
borderRadius: {
  none: 0,
  sm: 6,       // Small buttons, badges
  md: 12,      // Inputs, small cards
  lg: 16,      // Cards, images
  xl: 24,      // Large cards, modals
  full: 9999,  // Pills, avatars, FAB
}
```

### Shadows

```typescript
shadows: {
  level1: { // Subtle - inputs, inactive cards
    color: 'black 5%',
    offset: [0, 1],
    radius: 3,
  },
  level2: { // Default - cards, raised elements
    color: 'black 8%',
    offset: [0, 2],
    radius: 8,
  },
  level3: { // Elevated - modals, popovers
    color: 'black 12%',
    offset: [0, 4],
    radius: 16,
  },
  level4: { // Floating - FAB, floating elements
    color: 'black 16%',
    offset: [0, 8],
    radius: 24,
  },
  accentGlow: { // Primary buttons
    color: 'accent 30%',
    offset: [0, 4],
    radius: 12,
  },
}
```

---

## COMPONENT SPECIFICATIONS

### Buttons

#### Primary Button
- Background: Solid accent (#6366F1) - NO gradients
- Text: White, Headline weight
- Padding: 16px vertical, 32px horizontal
- Radius: full (pill shape)
- Shadow: Accent glow
- Height: 56px (large), 48px (default), 40px (small)
- States:
  - Default: opacity 100%
  - Pressed: scale 0.97, opacity 90%
  - Disabled: opacity 50%
  - Loading: spinner replaces text

#### Secondary Button
- Background: Accent 10% opacity
- Text: Accent color
- Border: none
- Same sizing as primary

#### Ghost Button
- Background: transparent
- Text: Secondary color
- No border, no shadow

#### Destructive Button
- Background: Error color
- Text: White

#### Icon Button
- 44x44pt minimum tap target
- Background: transparent or subtle
- Icon: SF Symbol, 20-24pt
- Circular hit area

### Input Fields

#### Text Input
- Background: Tertiary (#F3F4F6)
- Border: none (background differentiation)
- Radius: md (12px)
- Padding: 16px
- Height: 56px
- Icon: SF Symbol, leading, secondary color
- States:
  - Default: Background tertiary
  - Focused: Background tertiary + accent border 2px
  - Error: Error 5% background + error border
  - Disabled: Opacity 50%

#### Search Input
- Same as text input
- Leading magnifying glass icon
- Clear button when text entered

#### Password Input
- Trailing eye icon for visibility toggle
- SF Symbols: eye.fill / eye.slash.fill

### Cards

#### Post Card Structure
```
┌─────────────────────────────────────────┐
│ [Avatar 40px] @username                 │
│              📍 Location Name           │
├─────────────────────────────────────────┤
│                                         │
│            [PHOTO - 12px radius]        │
│                                         │
├─────────────────────────────────────────┤
│ Caption text (2 lines max)              │
│ ▓▓▓▓▓▓░░░░░░░░░░░░░░ 23m left          │
│ 😊 2  ❤️ 5  🔥 1  💯                    │
└─────────────────────────────────────────┘
```
- Background: Secondary (#F9FAFB)
- Radius: lg (16px)
- Shadow: Level 2
- Padding: md (16px)

#### Empty State Card
- Centered content
- Large SF Symbol icon (48pt)
- Title: Title 2
- Description: Body, secondary color
- CTA button: Secondary style

### Avatars

| Size | Diameter | Usage |
|------|----------|-------|
| Small | 32px | Friend list compact |
| Default | 40px | Post cards |
| Medium | 56px | Friend cards |
| Large | 80px | Profile header |
| XLarge | 120px | Own profile |

- Shape: Circular
- Border: 2px white (when on image)
- Placeholder: Initials on accent background
- Edit indicator: Small camera badge bottom-right

### Timer Bar
- Height: 4px
- Radius: full
- Background: Tertiary
- Fill: Timer color based on time
- Animation: Smooth 0.5s width transition
- Color transitions:
  - 50%: Green → Yellow (crossfade)
  - 25%: Yellow → Red (crossfade)
  - 5min: Red pulsing (opacity 0.7 ↔ 1.0, 1s)

### Floating Action Button (Camera)
- Size: 64px diameter
- Background: Solid accent
- Icon: camera.fill, white, 28pt
- Shadow: Level 4
- Position: Center bottom, 24px above safe area
- Press animation: scale 0.9, spring back

---

## SCREEN SPECIFICATIONS

### 1. Splash Screen
- Logo: Animated pulse (scale 0.8 → 1.0, opacity 0 → 1)
- Wordmark: "Experiences" fade in after logo
- Duration: 1-1.5 seconds
- Background: Primary (#FFFFFF)
- Auth check during display

### 2. Onboarding (3 Screens)

**Screen 1: Share**
- Illustration: Camera + Pin (geometric)
- Title: "Share What You're Doing Now"
- Subtitle: "Post a photo with your location"
- Dots: ● ○ ○

**Screen 2: Discover**
- Illustration: Multiple post cards
- Title: "See Where Your Friends Are"
- Subtitle: "Discover what your friends are up to right now"
- Dots: ○ ● ○

**Screen 3: Ephemeral**
- Illustration: Post fading
- Title: "Posts Vanish After 1 Hour"
- Subtitle: "Live in the now. No pressure, just authentic moments."
- Dots: ○ ○ ●
- Button: "Get Started"

### 3. Sign Up Screen
- Header: "← Back"
- Title: "Create Account"
- Subtitle: "Join Experiences and share moments with friends"
- Fields: Email, Password, Confirm Password
- Button: "Create Account"
- Footer: "Already have an account? Log In"

### 4. Login Screen
- Same layout as Sign Up
- Title: "Welcome Back"
- Fewer fields
- "Forgot Password?" link

### 5. Username Setup
- Title: "Choose Your Username"
- Subtitle: "This is how friends will find you"
- Input: @ prefix
- Validation states:
  - Checking: Spinner + "Checking availability..."
  - Available: Green ✓ + "Available"
  - Taken: Red ✕ + "Username already taken"
  - Invalid: Red ✕ + "Must start with a letter"
- Button: "Continue"

### 6. Main Feed
- Header: ☰ | "Experiences" | 👤
- Content: Scrollable post cards
- FAB: Camera button center bottom
- Pull to refresh
- Loading: Skeleton cards
- Empty states:
  - No friends: "Find Your Friends" + "Add Friends" button
  - No posts: "No Posts Yet" + "Take a Photo" button

### 7. Camera Screen
- Top: ✕ (close) | [space] | ⚡ (flash)
- Center: Camera viewfinder
- Location strip: Non-blocking, shows status
- Bottom: 🔄 Flip | (○) Capture | 🖼 Gallery
- Capture: 80px white circle, 4px accent border

### 8. Post Preview
- Header: "✕ Cancel" | "New Post"
- Photo preview (full width)
- Location row: Shows location or "Add Location (optional)"
- Caption input: Placeholder, 0/200 counter
- Button: "Share"

### 9. Profile Screen
**Own Profile:**
- 120px avatar with edit badge
- @username
- Stats row: Posts | Friends | Views
- Buttons: "👥 Friends" | "Log Out"
- Posts grid

**Other User:**
- No edit badge
- Friend action button instead

### 10. Friends Screen
- Header: "← Back" | "Friends"
- Search input
- Tabs: "Friends (X)" | "Requests (X)"
- Request cards: Accept | Decline buttons
- Friend cards: ••• menu

### 11. Settings Screen
- Grouped sections: Account, Privacy, About
- Account: Username, User ID
- Privacy: Location Precision (Exact/Neighborhood/City)
- About: Terms, Privacy, Feedback
- Destructive: "Delete Account"

---

## ANIMATIONS & MICRO-INTERACTIONS

### Timer Bar
```typescript
// Smooth depletion
animation: width 0.5s ease

// Color transitions at thresholds
50%: crossfade green → yellow
25%: crossfade yellow → red
<5m: pulse opacity 0.7 ↔ 1.0 (1s)
```

### Button Press
```typescript
duration: 100ms
transform: scale(0.97)
haptic: light impact
release: spring animation back to 1.0
```

### Card Appearance
```typescript
initial: { opacity: 0, translateY: 20 }
animate: { opacity: 1, translateY: 0 }
duration: 300ms
easing: spring(response: 0.3, dampingFraction: 0.7)
stagger: 50ms between cards
```

### Reaction Button
```typescript
1. Tap → scale 1.3 (100ms, spring)
2. Haptic: light impact
3. Scale back 1.0 (200ms, spring)
4. Count slides up, fades in
```

### Pull to Refresh
```typescript
1. Pull down → rotation indicator
2. Hit threshold → spinner
3. Release → refresh
4. Complete → fade spinner, update content
```

---

## ERROR STATES

### Network Error Toast
```
┌───────────────────────────────────────┐
│ ⚠️ Couldn't connect. Check network    │
│                           Retry       │
└───────────────────────────────────────┘
```

### Post Failed Toast
```
┌───────────────────────────────────────┐
│ ✕ Post failed to upload               │
│                       Try Again       │
└───────────────────────────────────────┘
```

### Permission Denied
- Icon: Relevant SF Symbol with slash
- Title: "[Permission] Access Needed"
- Description: Explanation
- Button: "Open Settings"

---

## ACCESSIBILITY REQUIREMENTS

- All interactive elements: 44x44pt minimum tap target
- Color contrast: WCAG AA compliant
- VoiceOver labels on all icons
- Reduce Motion: Disable parallax, reduce animations
- Dynamic Type: Support up to xxxLarge
- High Contrast: Increase border visibility

---

## SF SYMBOLS REFERENCE

| Usage | Symbol Name |
|-------|-------------|
| Menu | line.3.horizontal |
| Profile | person.circle.fill |
| Close | xmark |
| Back | chevron.left |
| Camera | camera.fill |
| Flip | arrow.triangle.2.circlepath.camera |
| Gallery | photo.on.rectangle |
| Flash Auto | bolt.badge.a.fill |
| Flash On | bolt.fill |
| Flash Off | bolt.slash.fill |
| Location | mappin.circle.fill |
| Search | magnifyingglass |
| Settings | gearshape.fill |
| Friends | person.2.fill |
| Add | plus |
| Check | checkmark |
| Error | xmark.circle.fill |
| Eye | eye.fill / eye.slash.fill |
| Lock | lock.fill |
| Mail | envelope.fill |

---

## IMPLEMENTATION NOTES

### React Native Specifics
```typescript
// Continuous corners (iOS-like)
borderRadius: 16,
overflow: 'hidden',

// Spring animations with react-native-reanimated
withSpring(value, {
  damping: 15,
  stiffness: 150,
})

// SF Symbols via @expo/vector-icons
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
```

### Performance Guidelines
- Use FlatList for feed with initialNumToRender: 5
- Implement image caching (expo-image or react-native-fast-image)
- Prefetch next page of posts
- Use skeleton loading states
- Optimize re-renders with React.memo

---

*This is **EXPERIENCES**. Clean. Fast. Ephemeral. Stunning.*
