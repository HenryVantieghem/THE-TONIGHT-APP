/**
 * Scena - Camera Screen
 * Calm capture - clean, simple, no pressure
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  FadeIn,
} from 'react-native-reanimated';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../types';
import { colors, spacing, borderRadius, durations, springConfigs, hitSlop } from '../theme';

type CameraScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Camera'>;
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const CameraScreen: React.FC<CameraScreenProps> = ({ navigation }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'front' | 'back'>('back');
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const [dualCamera, setDualCamera] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const captureScale = useSharedValue(1);

  const captureAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: captureScale.value }],
  }));

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission?.granted, requestPermission]);

  const handleClose = () => {
    navigation.goBack();
  };

  const handleFlip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const handleFlash = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setFlash(current => (current === 'off' ? 'on' : 'off'));
  };

  const handleCapture = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});

    // Animate capture
    captureScale.value = withSpring(0.9, springConfigs.responsive, () => {
      captureScale.value = withSpring(1, springConfigs.gentle);
    });

    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
        });

        if (photo?.uri) {
          navigation.navigate('PostEditor', {
            imageUri: photo.uri,
            frontCameraUri: dualCamera ? undefined : undefined, // Would capture from front camera too
          });
        }
      } catch (e) {
        console.log('Capture error:', e);
      }
    }
  };

  const handleGallery = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        navigation.navigate('PostEditor', {
          imageUri: result.assets[0].uri,
        });
      }
    } catch (e) {
      console.log('Gallery error:', e);
    }
  };

  const toggleDualCamera = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setDualCamera(!dualCamera);
  };

  if (!permission?.granted) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.permissionContainer}>
            <Text style={styles.permissionText}>camera access needed</Text>
            <Pressable onPress={requestPermission} style={styles.permissionButton}>
              <Text style={styles.permissionButtonText}>allow camera</Text>
            </Pressable>
            <Pressable onPress={handleClose} style={styles.permissionButton}>
              <Text style={styles.permissionButtonText}>maybe later</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera preview */}
      {dualCamera ? (
        // Dual camera layout
        <View style={styles.dualCameraContainer}>
          <View style={styles.dualTop}>
            <CameraView
              style={styles.dualCameraPreview}
              facing="back"
            />
          </View>
          <View style={styles.dualBottom}>
            <CameraView
              ref={cameraRef}
              style={styles.dualCameraPreview}
              facing="front"
              flash={flash}
            />
          </View>
        </View>
      ) : (
        // Single camera
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={facing}
          flash={flash}
        />
      )}

      {/* Controls overlay */}
      <SafeAreaView style={styles.overlay}>
        {/* Top controls */}
        <Animated.View entering={FadeIn.duration(300)} style={styles.topControls}>
          <Pressable onPress={handleClose} hitSlop={hitSlop.large} style={styles.controlButton}>
            <Ionicons name="close" size={28} color={colors.white} />
          </Pressable>

          <Pressable onPress={handleFlash} hitSlop={hitSlop.large} style={styles.controlButton}>
            <Ionicons
              name={flash === 'on' ? 'flash' : 'flash-off'}
              size={24}
              color={colors.white}
            />
          </Pressable>
        </Animated.View>

        {/* Bottom controls */}
        <Animated.View entering={FadeIn.duration(300).delay(100)} style={styles.bottomControls}>
          {/* Gallery */}
          <Pressable onPress={handleGallery} style={styles.sideButton}>
            <Ionicons name="images-outline" size={28} color={colors.white} />
          </Pressable>

          {/* Capture button */}
          <AnimatedPressable
            onPress={handleCapture}
            style={[styles.captureButton, captureAnimatedStyle]}
          >
            <View style={styles.captureInner} />
          </AnimatedPressable>

          {/* Flip camera */}
          <Pressable onPress={handleFlip} style={styles.sideButton}>
            <Ionicons name="camera-reverse-outline" size={28} color={colors.white} />
          </Pressable>
        </Animated.View>

        {/* Dual camera toggle */}
        <Animated.View entering={FadeIn.duration(300).delay(200)} style={styles.dualToggle}>
          <Pressable onPress={toggleDualCamera} style={styles.dualToggleButton}>
            <View style={[styles.radioOuter, dualCamera && styles.radioOuterActive]}>
              {dualCamera && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.dualToggleText}>dual camera</Text>
          </Pressable>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  safeArea: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  dualCameraContainer: {
    flex: 1,
  },
  dualTop: {
    flex: 0.3,
    borderBottomWidth: 2,
    borderBottomColor: colors.black,
  },
  dualBottom: {
    flex: 0.7,
  },
  dualCameraPreview: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: spacing.md,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  sideButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  captureInner: {
    width: '100%',
    height: '100%',
    borderRadius: 36,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  dualToggle: {
    alignItems: 'center',
    paddingBottom: spacing.xl,
  },
  dualToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
  },
  radioOuterActive: {
    borderColor: colors.white,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.white,
  },
  dualToggleText: {
    color: colors.white,
    fontSize: 14,
    textTransform: 'lowercase',
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  permissionText: {
    color: colors.text.secondary,
    fontSize: 16,
    textTransform: 'lowercase',
    marginBottom: spacing.xl,
  },
  permissionButton: {
    padding: spacing.md,
    marginVertical: spacing.xs,
  },
  permissionButtonText: {
    color: colors.text.primary,
    fontSize: 16,
    textTransform: 'lowercase',
  },
});

export default CameraScreen;
