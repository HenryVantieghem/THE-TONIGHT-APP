import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Camera } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { CameraViewComponent } from '../../components/camera/CameraView';
import { Button } from '../../components/ui/Button';
import { useLocation } from '../../hooks/useLocation';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { spacing } from '../../constants/config';
import type { LocationData, MainStackParamList } from '../../types';

type CameraNavigationProp = NativeStackNavigationProp<MainStackParamList, 'Camera'>;

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = 100;
const SWIPE_VELOCITY_THRESHOLD = 0.5;

export function CameraScreen() {
  const navigation = useNavigation<CameraNavigationProp>();
  const { currentLocation, getCurrentLocation } = useLocation();

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  // Swipe-to-close animation
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  // Pan responder for swipe-to-close
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to downward swipes from the top portion of the screen
        return gestureState.dy > 10 && Math.abs(gestureState.dx) < Math.abs(gestureState.dy);
      },
      onPanResponderGrant: () => {
        Haptics.selectionAsync();
      },
      onPanResponderMove: (_, gestureState) => {
        // Only allow downward movement
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
          opacity.setValue(1 - gestureState.dy / SCREEN_HEIGHT);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (
          gestureState.dy > SWIPE_THRESHOLD ||
          gestureState.vy > SWIPE_VELOCITY_THRESHOLD
        ) {
          // Close the camera
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          Animated.parallel([
            Animated.timing(translateY, {
              toValue: SCREEN_HEIGHT,
              duration: 250,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 250,
              useNativeDriver: true,
            }),
          ]).start(() => {
            navigation.goBack();
          });
        } else {
          // Snap back
          Animated.parallel([
            Animated.spring(translateY, {
              toValue: 0,
              friction: 8,
              tension: 80,
              useNativeDriver: true,
            }),
            Animated.spring(opacity, {
              toValue: 1,
              friction: 8,
              tension: 80,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
    })
  ).current;

  // Check camera permission and get location on mount
  useEffect(() => {
    const init = async () => {
      const { status } = await Camera.getCameraPermissionsAsync();
      setHasPermission(status === 'granted');

      // Get location
      setIsLoadingLocation(true);
      await getCurrentLocation();
      setIsLoadingLocation(false);
    };

    init();
  }, [getCurrentLocation]);

  const handleCapture = useCallback((uri: string, type: 'image' | 'video') => {
    const location: LocationData = currentLocation || {
      name: 'Unknown Location',
      lat: 0,
      lng: 0,
    };

    navigation.replace('PostPreview', {
      mediaUri: uri,
      mediaType: type,
      location,
    });
  }, [currentLocation, navigation]);

  const handleClose = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Animate out
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      navigation.goBack();
    });
  }, [navigation, translateY, opacity]);

  const requestPermission = useCallback(async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  }, []);

  if (hasPermission === null) {
    return (
      <View style={styles.permissionContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Initializing camera...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <Animated.View
        style={[
          styles.permissionContainer,
          {
            transform: [{ translateY }],
            opacity,
          },
        ]}
        {...panResponder.panHandlers}
      >
        {/* Swipe indicator */}
        <View style={styles.swipeIndicator} />

        <Text style={styles.permissionIcon}>📷</Text>
        <Text style={styles.permissionTitle}>Camera Access Required</Text>
        <Text style={styles.permissionText}>
          We need access to your camera to take photos and videos. Your moments won't be shared without your permission.
        </Text>
        <Button
          title="Enable Camera"
          onPress={requestPermission}
          variant="primary"
          style={styles.permissionButton}
        />
        <Button
          title="Maybe Later"
          onPress={handleClose}
          variant="ghost"
          style={styles.backButton}
        />

        <Text style={styles.swipeHint}>Swipe down to close</Text>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
      {...panResponder.panHandlers}
    >
      <CameraViewComponent
        location={currentLocation}
        isLoadingLocation={isLoadingLocation}
        onCapture={handleCapture}
        onClose={handleClose}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: colors.black,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  swipeIndicator: {
    position: 'absolute',
    top: 12,
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  permissionIcon: {
    fontSize: 72,
    marginBottom: spacing.lg,
  },
  permissionTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  permissionText: {
    fontSize: typography.sizes.md,
    color: colors.white,
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: spacing.xl,
    lineHeight: typography.lineHeights.lg,
    maxWidth: 300,
  },
  permissionButton: {
    minWidth: 200,
    marginBottom: spacing.md,
  },
  backButton: {
    minWidth: 200,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.white,
    opacity: 0.8,
  },
  swipeHint: {
    position: 'absolute',
    bottom: 50,
    fontSize: typography.sizes.sm,
    color: colors.white,
    opacity: 0.5,
  },
});
