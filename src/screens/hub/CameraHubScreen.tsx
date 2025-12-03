import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Dimensions,
  Animated,
  TouchableOpacity,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Camera } from 'expo-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { CameraViewComponent } from '../../components/camera/CameraView';
import { SwipeableView } from '../../components/gestures/SwipeableView';
import { useLocation } from '../../hooks/useLocation';
import { useAuth } from '../../hooks/useAuth';
import * as locationService from '../../services/location';
import { colors, spacing, typography, shadows } from '../../constants/theme';
import type { LocationData, MainStackParamList } from '../../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type CameraHubNavigationProp = NativeStackNavigationProp<MainStackParamList, 'Camera'>;

export function CameraHubScreen() {
  const navigation = useNavigation<CameraHubNavigationProp>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { currentLocation, getCurrentLocation } = useLocation();

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [showHints, setShowHints] = useState(true);

  // Auto-hide hints after 3 seconds
  const hintsOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(hintsOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => setShowHints(false));
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Check camera permission
  useEffect(() => {
    const init = async () => {
      const { status } = await Camera.getCameraPermissionsAsync();
      setHasPermission(status === 'granted');

      // Try to get location if permission granted
      setIsLoadingLocation(true);
      try {
        const hasLocationPermission = await locationService.hasLocationPermission();
        if (hasLocationPermission) {
          await getCurrentLocation();
        }
      } catch (error) {
        console.error('Location fetch error:', error);
      } finally {
        setIsLoadingLocation(false);
      }
    };

    init();
  }, [getCurrentLocation]);

  const handleCapture = useCallback((uri: string, type: 'image' | 'video') => {
    const isValidLocation = currentLocation && 
      currentLocation.lat !== 0 && 
      currentLocation.lng !== 0 &&
      currentLocation.name &&
      currentLocation.name.trim() !== '';

    navigation.navigate('PostPreview', {
      mediaUri: uri,
      mediaType: type,
      location: isValidLocation ? currentLocation : null,
      isLoadingLocation,
    });
  }, [currentLocation, isLoadingLocation, navigation]);

  const handleSwipeLeft = () => {
    // Go to Feed
    navigation.navigate('Feed');
  };

  const handleSwipeRight = () => {
    // Go to Map (when implemented)
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert('Coming Soon', 'Map view will be available soon!');
  };

  const handleSwipeDown = () => {
    // Go to Profile
    navigation.navigate('Profile', {});
  };

  const handleClose = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Feed');
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading camera...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <View style={styles.permissionContent}>
          <Ionicons name="camera" size={64} color={colors.primary} />
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            Enable camera access to capture and share moments with friends.
          </Text>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => {
              if (Platform.OS === 'ios') {
                Linking.openURL('app-settings:');
              } else {
                Linking.openSettings();
              }
            }}
          >
            <Text style={styles.settingsButtonText}>Open Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backButton} onPress={handleClose}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SwipeableView
        onSwipeLeft={handleSwipeLeft}
        onSwipeRight={handleSwipeRight}
        onSwipeDown={handleSwipeDown}
        swipeThreshold={80}
        velocityThreshold={0.6}
      >
        <CameraViewComponent
          location={currentLocation}
          isLoadingLocation={isLoadingLocation}
          onCapture={handleCapture}
          onClose={handleClose}
        />
      </SwipeableView>

      {/* Gesture hints - fade out after 3s */}
      {showHints && (
        <Animated.View
          style={[styles.hintsContainer, { opacity: hintsOpacity }]}
          pointerEvents="none"
        >
          <View style={[styles.hint, styles.hintLeft]}>
            <Ionicons name="chevron-back" size={20} color={colors.primary} />
            <Text style={styles.hintText}>Feed</Text>
          </View>
          <View style={[styles.hint, styles.hintRight]}>
            <Text style={styles.hintText}>Map</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.primary} />
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.md,
    marginTop: spacing.md,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  permissionContent: {
    alignItems: 'center',
    maxWidth: 300,
  },
  permissionTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  permissionText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: typography.lineHeights.relaxed * typography.sizes.md,
  },
  settingsButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 999,
    marginBottom: spacing.md,
    ...shadows.glow,
  },
  settingsButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textInverse,
  },
  backButton: {
    paddingVertical: spacing.sm,
  },
  backButtonText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  hintsContainer: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glassBlack,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    gap: spacing.xs,
  },
  hintLeft: {
    paddingLeft: spacing.xs,
  },
  hintRight: {
    paddingRight: spacing.xs,
  },
  hintText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.primary,
  },
});

