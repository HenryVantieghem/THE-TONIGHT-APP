import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Camera } from 'expo-camera';
import { CameraViewComponent } from '../../components/camera/CameraView';
import { Button } from '../../components/ui/Button';
import { useLocation } from '../../hooks/useLocation';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { spacing } from '../../constants/config';
import type { LocationData, MainStackParamList } from '../../types';

type CameraNavigationProp = NativeStackNavigationProp<MainStackParamList, 'Camera'>;

export function CameraScreen() {
  const navigation = useNavigation<CameraNavigationProp>();
  const { currentLocation, getCurrentLocation } = useLocation();

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

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

  const handleCapture = (uri: string, type: 'image' | 'video') => {
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
  };

  const handleClose = () => {
    navigation.goBack();
  };

  const requestPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  if (hasPermission === null) {
    return (
      <View style={styles.permissionContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionIcon}>📷</Text>
        <Text style={styles.permissionTitle}>Camera Access Required</Text>
        <Text style={styles.permissionText}>
          We need access to your camera to take photos and videos.
        </Text>
        <Button
          title="Enable Camera"
          onPress={requestPermission}
          variant="primary"
          style={styles.permissionButton}
        />
        <Button
          title="Go Back"
          onPress={handleClose}
          variant="ghost"
          style={styles.backButton}
        />
      </View>
    );
  }

  return (
    <CameraViewComponent
      location={currentLocation}
      isLoadingLocation={isLoadingLocation}
      onCapture={handleCapture}
      onClose={handleClose}
    />
  );
}

const styles = StyleSheet.create({
  permissionContainer: {
    flex: 1,
    backgroundColor: colors.black,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  permissionIcon: {
    fontSize: 64,
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
  },
  permissionButton: {
    minWidth: 180,
    marginBottom: spacing.md,
  },
  backButton: {
    minWidth: 180,
  },
});
