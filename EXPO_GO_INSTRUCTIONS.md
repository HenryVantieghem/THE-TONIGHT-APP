# 🚀 Run "Tonight" App in Expo Go - Fresh Preview

## ✅ ALL CHANGES ARE NOW ON GITHUB!

**Status**: All changes committed and pushed to main branch  
**Theme**: Dark red (#DC143C) / Black / White liquid glass aesthetic

---

## 📱 Step-by-Step Instructions

### Step 1: Clear ALL Caches

In your terminal, run these commands:

```bash
# Navigate to project
cd /Users/henryvantieghem/.cursor/worktrees/THE-TONIGHT-APP/pka

# Clear Metro bundler cache
rm -rf node_modules/.cache

# Clear Expo cache
rm -rf .expo

# Clear temp files
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/react-*

# Clear watchman (if installed)
watchman watch-del-all

echo "✅ All caches cleared!"
```

### Step 2: Start Expo with Clear Flag

```bash
# Start with cleared cache (THIS IS IMPORTANT!)
npm run start:clear

# Or manually:
expo start --clear
```

### Step 3: On Your Phone - Clear Expo Go Cache

**iOS:**
1. Open Expo Go app
2. Shake your device (or use simulator menu)
3. Tap "Clear cache and reload"
4. Or: Delete Expo Go app and reinstall from App Store

**Android:**
1. Open Expo Go app
2. Shake your device
3. Tap "Clear cache"
4. Or: Settings → Apps → Expo Go → Clear Data

### Step 4: Scan QR Code

1. After running `npm run start:clear`, you'll see a QR code
2. Scan it with:
   - **iOS**: Camera app (opens Expo Go)
   - **Android**: Expo Go app scanner
3. Wait for bundle to load (first time takes longer)

---

## 🎨 What You Should See (Ghost Mode)

✅ **Splash Screen**: Black background with glowing red flash icon  
✅ **Onboarding**: 4 slides with dark red accent and dark theme  
✅ **Camera**: Opens as DEFAULT screen (not feed)  
✅ **Colors**: Pure black + Crimson Red (#DC143C)  
✅ **UI**: Glassmorphic effects throughout  
✅ **Navigation**: Camera first, swipe for feed  

---

## ❌ If You Still See Old Design

Try these steps:

### Option 1: Force Reload

```bash
# Kill any running Metro bundler
killall node

# Clear everything again
rm -rf node_modules/.cache .expo $TMPDIR/metro-* $TMPDIR/react-*

# Reinstall dependencies
npm install

# Start completely fresh
expo start --clear
```

### Option 2: Reset Expo Go Completely

**On Phone:**
1. Delete Expo Go app completely
2. Reinstall from App Store/Play Store
3. Scan QR code again

### Option 3: Check You're Running Latest Code

```bash
# Verify you're on latest commit
git log --oneline -1
# Should show: 823d803 fix: Remove remaining BlurView references

# If not, pull latest:
git fetch origin
git reset --hard origin/main
npm install
npm run start:clear
```

---

## 🔍 Troubleshooting

### "Module not found" errors?
```bash
npm install
```

### "Unable to resolve module" errors?
```bash
rm -rf node_modules
npm install
expo start --clear
```

### Still seeing old brown/cream colors?
- Make sure Expo Go app is fully restarted
- Try closing and reopening Expo Go
- Check you scanned the correct QR code
- Verify terminal shows "› Metro waiting on..."

### App crashes on startup?
- Check terminal for error messages
- Make sure you're using Expo SDK 54
- Run: `npm run type-check` to verify no errors

---

## ✅ Expected Behavior

When working correctly, you should see:

1. **Terminal shows**: `› Metro waiting on exp://192.168.x.x:8081`
2. **Expo Go opens to**: Black splash screen with red icon
3. **After splash**: Interactive onboarding (4 slides, dark theme)
4. **After onboarding**: Camera screen as default (not feed!)
5. **Colors**: Black backgrounds, dark red accents everywhere
6. **Swipe left from camera**: See feed with full-screen posts

---

## 🎯 Quick Commands Reference

```bash
# Start fresh (USE THIS)
npm run start:clear

# Just start (if caches already cleared)
npm start

# Type check
npm run type-check

# Lint check
npm run lint

# Kill Metro if stuck
killall node
```

---

## 📱 Verify It's Working

Open the app and check:
- [ ] Splash screen is BLACK (not white)
- [ ] Flash icon is DARK RED (crimson)
- [ ] Onboarding has 4 slides (not 3)
- [ ] Camera opens FIRST (not feed)
- [ ] All backgrounds are DARK
- [ ] Primary color is DARK RED (#DC143C) everywhere

If all checked, congratulations! 🎉 You're seeing the new Ghost Mode design!

