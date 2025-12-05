#!/bin/bash

# Clear all caches for Expo/React Native app

echo "🧹 Clearing all caches..."

# Kill any running Metro/Expo processes
echo "Stopping running processes..."
lsof -ti:8081 | xargs kill -9 2>/dev/null || true
pkill -f "expo start" 2>/dev/null || true
pkill -f "metro" 2>/dev/null || true

# Clear Expo caches
echo "Clearing Expo caches..."
rm -rf .expo
rm -rf .expo-shared
rm -rf node_modules/.cache

# Clear Metro bundler cache
echo "Clearing Metro cache..."
rm -rf .metro-cache
rm -rf $TMPDIR/metro-* 2>/dev/null || true
rm -rf $TMPDIR/haste-* 2>/dev/null || true

# Clear Watchman
echo "Clearing Watchman..."
watchman watch-del-all 2>/dev/null || true

# Clear npm cache (optional, uncomment if needed)
# echo "Clearing npm cache..."
# npm cache clean --force

# Clear iOS build artifacts (if exists)
echo "Clearing iOS build artifacts..."
rm -rf ios/build 2>/dev/null || true
rm -rf ios/Pods 2>/dev/null || true
rm -rf ios/Podfile.lock 2>/dev/null || true

# Clear Android build artifacts (if exists)
echo "Clearing Android build artifacts..."
rm -rf android/build 2>/dev/null || true
rm -rf android/app/build 2>/dev/null || true
rm -rf android/.gradle 2>/dev/null || true

echo "✅ All caches cleared!"
echo ""
echo "To start the app with a clean cache, run:"
echo "  npx expo start --clear"

