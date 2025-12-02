# Cache Clear Instructions for Fresh Preview

## ✅ Completed Actions

1. ✅ Cleared npm cache (`npm cache clean --force`)
2. ✅ Cleared Watchman cache (if installed)
3. ✅ Removed `.expo` directory
4. ✅ Removed `.metro` cache directory
5. ✅ Removed `node_modules/.cache`
6. ✅ Cleared build directories (ios/android)
7. ✅ Started Expo with `--clear` flag

## 📱 Clear Expo Go Cache on Your Device

### iOS (iPhone/iPad):
1. Open **Settings** app
2. Go to **General** → **iPhone Storage** (or iPad Storage)
3. Find **Expo Go** app
4. Tap **Offload App** or **Delete App**
5. Reinstall Expo Go from App Store
6. OR: Shake device → **Reload** → **Clear Cache**

### Android:
1. Open **Settings** app
2. Go to **Apps** → **Expo Go**
3. Tap **Storage** → **Clear Cache**
4. Tap **Clear Data** (optional, more thorough)
5. OR: Shake device → **Reload** → **Clear Cache**

## 🚀 Start Fresh Preview

The Expo dev server is now running with cleared cache. To start fresh:

```bash
# Stop current server (Ctrl+C) then:
npx expo start --clear

# Or if using yarn:
yarn expo start --clear
```

## 🔄 Additional Clean Steps (if needed)

If you still see issues, try:

```bash
# Remove node_modules and reinstall
rm -rf node_modules
npm install

# Clear all Metro bundler cache
npx react-native start --reset-cache

# Clear Expo cache completely
npx expo start -c
```

## 📝 Notes

- The Expo dev server is running in the background with `--clear` flag
- All local caches have been cleared
- You may need to clear Expo Go cache on your device for a completely fresh preview
- If you see any stale data, restart the Expo dev server

