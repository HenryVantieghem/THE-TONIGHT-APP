import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  Alert,
  Linking,
} from 'react-native';
import { CameraView as ExpoCameraView, CameraType, FlashMode } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CaptureButton } from './CaptureButton';
import { LocationStrip } from './LocationStrip';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { spacing } from '../../constants/config';
import type { LocationData } from '../../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CameraViewComponentProps {
  location: LocationData | null;
  isLoadingLocation: boolean;
  onCapture: (uri: string, type: 'image' | 'video') => void;
  onClose: () => void;
  onLocationPress?: () => void;
}

export function CameraViewComponent({
  location,
  isLoadingLocation,
  onCapture,
  onClose,
  onLocationPress,
}: CameraViewComponentProps) {
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<ExpoCameraView>(null);

  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<FlashMode>('auto');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Clean up recording timer on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, []);

  const toggleFacing = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  }, []);

  const toggleFlash = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFlash((current) => {
      const modes: FlashMode[] = ['off', 'auto', 'on'];
      const currentIndex = modes.indexOf(current);
      return modes[(currentIndex + 1) % modes.length];
    });
  }, []);

  const handleCapture = useCallback(async () => {
    if (!cameraRef.current) {
      console.error('[Camera] Camera ref not available');
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      console.log('[Camera] Taking picture...');
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: Platform.OS === 'android',
      });

      console.log('[Camera] Photo result:', {
        hasUri: !!photo?.uri,
        uri: photo?.uri ? `${photo.uri.substring(0, 50)}...` : 'NONE',
        width: photo?.width,
        height: photo?.height,
      });

      if (photo?.uri) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        console.log('[Camera] Calling onCapture with URI:', photo.uri);
        onCapture(photo.uri, 'image');
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        console.error('[Camera] No photo URI returned from camera');
        Alert.alert('Camera Error', 'Failed to capture photo. Please try again.');
      }
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      console.error('[Camera] Error taking photo:', error);
      Alert.alert('Camera Error', 'Failed to capture photo. Please try again.');
    }
  }, [onCapture]);

  const handleVideoStart = useCallback(async () => {
    if (!cameraRef.current || isRecording) return;

    setIsRecording(true);
    setRecordingDuration(0);

    // Start duration counter
    recordingTimerRef.current = setInterval(() => {
      setRecordingDuration((prev) => prev + 1);
    }, 1000);

    try {
      const video = await cameraRef.current.recordAsync({
        maxDuration: 30,
      });

      // Clean up timer
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }

      setIsRecording(false);
      setRecordingDuration(0);

      if (video?.uri) {
        onCapture(video.uri, 'video');
      }
    } catch (error) {
      console.error('Error recording video:', error);
      // Clean up on error
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      setIsRecording(false);
      setRecordingDuration(0);
    }
  }, [isRecording, onCapture]);

  const handleVideoEnd = useCallback(async () => {
    if (!cameraRef.current || !isRecording) return;

    // Clear recording timer
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    setIsRecording(false);
    setRecordingDuration(0);

    try {
      cameraRef.current.stopRecording();
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  }, [isRecording]);

  const handlePickImage = useCallback(async () => {
    try {
      // Check media library permission first
      const { status: existingStatus } = await ImagePicker.getMediaLibraryPermissionsAsync();
      
      let finalStatus = existingStatus;
      
      // Request permission if not granted
      if (existingStatus !== 'granted') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        finalStatus = status;
      }
      
      // If permission denied, show alert
      if (finalStatus !== 'granted') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert(
          'Photo Library Access Required',
          'Please grant photo library access to select photos and videos.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Settings',
              onPress: () => {
                if (Platform.OS === 'ios') {
                  Linking.openURL('app-settings:');
                } else {
                  Linking.openSettings();
                }
              },
            },
          ]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        quality: 0.8,
        videoMaxDuration: 30,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const type = asset.type === 'video' ? 'video' : 'image';
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onCapture(asset.uri, type);
      }
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to open photo library. Please try again.');
    }
  }, [onCapture]);

  const getFlashIcon = () => {
    switch (flash) {
      case 'on':
        return '⚡';
      case 'off':
        return '⚡';
      case 'auto':
      default:
        return '⚡A';
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <ExpoCameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        flash={flash}
      />
      {/* Top controls - positioned absolutely outside CameraView */}
      <View style={[styles.topControls, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={onClose}
        >
          <Text style={styles.controlIcon}>✕</Text>
        </TouchableOpacity>

        <View style={styles.topRight}>
          <TouchableOpacity
            style={[
              styles.controlButton,
              flash === 'off' && styles.controlButtonDim,
            ]}
            onPress={toggleFlash}
          >
            <Text style={styles.controlIcon}>{getFlashIcon()}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recording indicator - positioned absolutely */}
      {isRecording && (
        <View style={styles.recordingIndicator}>
          <View style={styles.recordingDot} />
          <Text style={styles.recordingTime}>
            {formatDuration(recordingDuration)}
          </Text>
        </View>
      )}

      {/* Location strip - positioned absolutely */}
      <View style={[styles.locationContainer, { bottom: 200 + insets.bottom }]}>
        <LocationStrip
          location={location}
          isLoading={isLoadingLocation}
          onPress={onLocationPress}
        />
      </View>

      {/* Bottom controls - positioned absolutely */}
      <View style={[styles.bottomControls, { paddingBottom: insets.bottom + spacing.lg }]}>
        <TouchableOpacity
          style={styles.sideButton}
          onPress={toggleFacing}
        >
          <Text style={styles.sideButtonIcon}>🔄</Text>
        </TouchableOpacity>

        <CaptureButton
          onCapture={handleCapture}
          onVideoStart={handleVideoStart}
          onVideoEnd={handleVideoEnd}
          isRecording={isRecording}
          videoEnabled
        />

        <TouchableOpacity
          style={styles.sideButton}
          onPress={handlePickImage}
        >
          <Text style={styles.sideButtonIcon}>🖼️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  camera: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  topControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    zIndex: 10,
    pointerEvents: 'box-none',
  },
  topRight: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonDim: {
    opacity: 0.5,
  },
  controlIcon: {
    fontSize: 20,
    color: colors.white,
  },
  recordingIndicator: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.overlay,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    gap: spacing.xs,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.error,
  },
  recordingTime: {
    color: colors.white,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  locationContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 10,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    zIndex: 10,
    pointerEvents: 'box-none',
  },
  sideButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sideButtonIcon: {
    fontSize: 24,
  },
});
