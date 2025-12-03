import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  Linking,
  Platform,
  AppState,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Camera } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { CameraViewComponent } from '../../components/camera/CameraView';
import { Button } from '../../components/ui/Button';
import { useLocation } from '../../hooks/useLocation';
import * as locationService from '../../services/location';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { spacing } from '../../constants/config';
import type { MainStackParamList } from '../../types';

type CameraNavigationProp = NativeStackNavigationProp<MainStackParamList, 'Camera'>;

export function CameraScreen() {
  const navigation = useNavigation<CameraNavigationProp>();
  const { currentLocation, getCurrentLocation } = useLocation();

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  // Check camera permission
  const checkCameraPermission = useCallback(async () => {
    const { status } = await Camera.getCameraPermissionsAsync();
    const granted = status === 'granted';
    setHasPermission(granted);
    if (granted && permissionDenied) {
      setPermissionDenied(false);
    }
    return granted;
  }, [permissionDenied]);

  // Initialize camera and location
  useEffect(() => {
    const init = async () => {
      await checkCameraPermission();

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
  }, [getCurrentLocation, checkCameraPermission]);

  // Re-check permission when app becomes active
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (nextAppState === 'active') {
        const granted = await checkCameraPermission();
        if (granted) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    });

    return () => subscription.remove();
  }, [checkCameraPermission]);

  const handleCapture = useCallback((uri: string, type: 'image' | 'video') => {
    if (!uri) {
      Alert.alert('Error', 'Failed to capture media. Please try again.');
      return;
    }

    // Only pass location if valid
    const isValidLocation = currentLocation &&
      currentLocation.lat !== 0 &&
      currentLocation.lng !== 0 &&
      currentLocation.name &&
      currentLocation.name !== 'Location Unknown' &&
      currentLocation.name !== 'Current Location' &&
      currentLocation.name.trim() !== '';

    navigation.replace('PostPreview', {
      mediaUri: uri,
      mediaType: type,
      location: isValidLocation ? currentLocation : null,
      isLoadingLocation,
    });
  }, [currentLocation, isLoadingLocation, navigation]);

  const handleClose = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  }, [navigation]);

  const requestPermission = useCallback(async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
    if (status !== 'granted') {
      setPermissionDenied(true);
    }
  }, []);

  const openSettings = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  }, []);

  // Loading state
  if (hasPermission === null) {
    return (
      <View style={styles.permissionContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Initializing camera...</Text>
      </View>
    );
  }

  // Permission denied state
  if (hasPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <View style={styles.permissionIconContainer}>
          <Ionicons name="camera" size={64} color={colors.white} />
        </View>
        <Text style={styles.permissionTitle}>Camera Access Required</Text>
        <Text style={styles.permissionText}>
          {permissionDenied
            ? 'Camera access was denied. Please enable it in Settings.'
            : 'We need access to your camera to take photos.'}
        </Text>
        {permissionDenied ? (
          <Button
            title="Open Settings"
            onPress={openSettings}
            variant="primary"
            style={styles.permissionButton}
          />
        ) : (
          <Button
            title="Enable Camera"
            onPress={requestPermission}
            variant="primary"
            style={styles.permissionButton}
          />
        )}
        <Button
          title="Go Back"
          onPress={handleClose}
          variant="ghost"
          style={styles.backButton}
        />
      </View>
    );
  }

  // Camera view
  return (
    <View style={styles.container}>
      <CameraViewComponent
        location={currentLocation}
        isLoadingLocation={isLoadingLocation}
        onCapture={handleCapture}
        onClose={handleClose}
      />
    </View>
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
  permissionIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
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
});
