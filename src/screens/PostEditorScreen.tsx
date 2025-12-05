/**
 * Scena - Post Editor Screen
 * Light touch - optional fields, no pressure, just share when ready
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../types';
import { useApp } from '../context/AppContext';
import { useImageUpload } from '../hooks/useImageUpload';
import { GlassButton, GlassInput, GlassCard, ImageUploadProgress } from '../components';
import { colors, typography, spacing, borderRadius, gradients, hitSlop } from '../theme';

type PostEditorScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'PostEditor'>;
  route: RouteProp<RootStackParamList, 'PostEditor'>;
};

export const PostEditorScreen: React.FC<PostEditorScreenProps> = ({
  navigation,
  route,
}) => {
  const { imageUri, frontCameraUri, location: routeLocation } = route.params;
  const { state } = useApp();
  const { uploadMoment, uploading, progress } = useImageUpload();

  const [location, setLocation] = useState<string>(routeLocation || '');
  const [caption, setCaption] = useState<string>('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  useEffect(() => {
    // If location was passed from LocationSearch, use it
    if (routeLocation) {
      setLocation(routeLocation);
      setIsLoadingLocation(false);
    } else {
      detectLocation();
    }
  }, [routeLocation]);

  const detectLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status === 'granted') {
        // Set timeout for location request (10 seconds)
        const locationPromise = Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Location timeout')), 10000)
        );

        const loc = await Promise.race([locationPromise, timeoutPromise]) as Location.LocationObject;
        
        const [place] = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });

        if (place) {
          // Create a simple, friendly location name
          const locationName = place.name || place.street || place.city || 'somewhere nice';
          setLocation(locationName.toLowerCase());
        } else {
          setLocation(''); // Clear location if geocoding fails
        }
      } else {
        // Permission denied
        if (__DEV__) {
          console.log('Location permission denied');
        }
      }
    } catch (e) {
      // Location not available - that's okay
      if (__DEV__) {
        console.log('Location detection failed:', e);
      }
      setLocation(''); // Clear location on error
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleClose = () => {
    navigation.goBack();
  };

  const handleLocationEdit = () => {
    navigation.navigate('LocationSearch', { 
      currentLocation: location,
      imageUri,
      frontCameraUri,
    });
  };

  const handleShare = async () => {
    if (uploading) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const moment = await uploadMoment({
      imageUri,
      frontCameraUri,
      location: location || undefined,
      caption: caption || undefined,
    });

    if (moment) {
      // Navigate back to feed
      navigation.popToTop();
      navigation.navigate('MainTabs');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradients.ambient}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          {/* Header */}
          <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
            <Pressable onPress={handleClose} hitSlop={hitSlop.large}>
              <Ionicons name="close" size={28} color={colors.text.secondary} />
            </Pressable>
          </Animated.View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Image preview */}
            <Animated.View entering={FadeInUp.duration(400)} style={styles.imageContainer}>
              <GlassCard noPadding style={styles.imageCard}>
                <Image
                  source={{ uri: imageUri }}
                  style={styles.image}
                  resizeMode="cover"
                />
                {frontCameraUri && (
                  <View style={styles.frontCameraPreview}>
                    <Image
                      source={{ uri: frontCameraUri }}
                      style={styles.frontCameraImage}
                      resizeMode="cover"
                    />
                  </View>
                )}
              </GlassCard>
            </Animated.View>

            {/* Location */}
            <Animated.View entering={FadeInUp.duration(400).delay(100)}>
              <Pressable onPress={handleLocationEdit} style={styles.locationContainer}>
                <Text style={styles.label}>where</Text>
                <View style={styles.locationValue}>
                  {isLoadingLocation ? (
                    <Text style={styles.locationText}>detecting...</Text>
                  ) : (
                    <>
                      <Text style={styles.locationText}>{location || 'tap to add'}</Text>
                      <Ionicons name="chevron-forward" size={16} color={colors.text.tertiary} />
                    </>
                  )}
                </View>
              </Pressable>
            </Animated.View>

            {/* Caption */}
            <Animated.View entering={FadeInUp.duration(400).delay(200)}>
              <GlassInput
                value={caption}
                onChangeText={setCaption}
                label="say something"
                placeholder="(optional)"
                multiline
                maxLength={200}
              />
            </Animated.View>

            {/* Info */}
            <Animated.View entering={FadeIn.duration(400).delay(400)} style={styles.infoContainer}>
              <Text style={styles.infoText}>disappears in an hour</Text>
            </Animated.View>
          </ScrollView>

          {/* Upload Progress - shown as overlay */}
          <ImageUploadProgress progress={progress} visible={uploading} />

          {/* Share button */}
          <Animated.View entering={FadeInUp.duration(400).delay(300)} style={styles.shareContainer}>
            <GlassButton
              title={uploading ? "sharing..." : "share"}
              onPress={handleShare}
              variant="primary"
              size="large"
              fullWidth
              disabled={uploading}
            />
          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screenHorizontal,
    paddingVertical: spacing.md,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.screenHorizontal,
  },
  imageContainer: {
    marginBottom: spacing.xl,
  },
  imageCard: {
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    aspectRatio: 4 / 5,
    borderRadius: borderRadius.card,
  },
  frontCameraPreview: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    width: 64,
    height: 80,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.glass.border,
  },
  frontCameraImage: {
    width: '100%',
    height: '100%',
  },
  locationContainer: {
    marginBottom: spacing.lg,
    paddingVertical: spacing.sm,
  },
  label: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
    textTransform: 'lowercase',
    letterSpacing: typography.letterSpacing.wide,
  },
  locationValue: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationText: {
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    textTransform: 'lowercase',
  },
  infoContainer: {
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  infoText: {
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
    textTransform: 'lowercase',
    letterSpacing: typography.letterSpacing.wide,
  },
  shareContainer: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingBottom: spacing.xl,
  },
  progressContainer: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingBottom: spacing.md,
    alignItems: 'center',
  },
});

export default PostEditorScreen;
