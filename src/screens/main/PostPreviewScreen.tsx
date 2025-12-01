import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
  Animated,
  Modal,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import { Video, ResizeMode } from 'expo-av';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Button } from '../../components/ui/Button';
import { LocationStripCompact } from '../../components/camera/LocationStrip';
import { usePosts } from '../../hooks/usePosts';
import { useLocation } from '../../hooks/useLocation';
import { validateCaption } from '../../utils/validation';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { spacing, borderRadius, config } from '../../constants/config';
import type { MainStackParamList, LocationData } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PREVIEW_HEIGHT = SCREEN_WIDTH * 1.2;

type PostPreviewNavigationProp = NativeStackNavigationProp<MainStackParamList, 'PostPreview'>;
type PostPreviewRouteProp = NativeStackScreenProps<MainStackParamList, 'PostPreview'>['route'];

// Success checkmark animation component
function SuccessAnimation({
  visible,
  onComplete,
}: {
  visible: boolean;
  onComplete: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const checkScaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Circle animation
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Checkmark animation
        Animated.spring(checkScaleAnim, {
          toValue: 1,
          friction: 3,
          tension: 120,
          useNativeDriver: true,
        }).start(() => {
          // Wait then complete
          setTimeout(() => {
            Animated.parallel([
              Animated.timing(opacityAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
              }),
              Animated.timing(scaleAnim, {
                toValue: 1.2,
                duration: 300,
                useNativeDriver: true,
              }),
            ]).start(onComplete);
          }, 500);
        });
      });
    }
  }, [visible, scaleAnim, opacityAnim, checkScaleAnim, onComplete]);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={successStyles.container}>
        <Animated.View
          style={[
            successStyles.circle,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <LinearGradient
            colors={[colors.success, '#22C55E']}
            style={successStyles.gradient}
          >
            <Animated.Text
              style={[
                successStyles.checkmark,
                { transform: [{ scale: checkScaleAnim }] },
              ]}
            >
              ✓
            </Animated.Text>
          </LinearGradient>
        </Animated.View>
        <Animated.Text
          style={[successStyles.text, { opacity: opacityAnim }]}
        >
          Posted!
        </Animated.Text>
      </View>
    </Modal>
  );
}

const successStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    fontSize: 60,
    color: colors.white,
    fontWeight: '700',
  },
  text: {
    marginTop: spacing.lg,
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
});

export function PostPreviewScreen() {
  const navigation = useNavigation<PostPreviewNavigationProp>();
  const route = useRoute<PostPreviewRouteProp>();
  const { mediaUri, mediaType, location } = route.params;

  const insets = useSafeAreaInsets();
  const { createPost } = usePosts();
  const { getCurrentLocation: refreshLocation, requestPermission: requestLocationPermission, checkPermission: checkLocationPermission } = useLocation();

  const [caption, setCaption] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationData>(location);
  const [isRefreshingLocation, setIsRefreshingLocation] = useState(false);
  const [hasLocationPermission, setHasLocationPermission] = useState<boolean | null>(null);

  // Check location permission and auto-refresh location on mount if location is invalid
  useEffect(() => {
    const initLocation = async () => {
      // Check permission first
      const hasPermission = await checkLocationPermission();
      setHasLocationPermission(hasPermission);

      // If location is default/unknown, try to get real location
      if (!selectedLocation || selectedLocation.name === 'Location Unknown' || 
          (selectedLocation.lat === 0 && selectedLocation.lng === 0)) {
        if (hasPermission) {
          setIsRefreshingLocation(true);
          try {
            const newLocation = await refreshLocation();
            if (newLocation) {
              setSelectedLocation(newLocation);
            }
          } catch (error) {
            console.error('Failed to refresh location:', error);
          } finally {
            setIsRefreshingLocation(false);
          }
        }
      }
    };

    initLocation();
  }, [checkLocationPermission, refreshLocation, selectedLocation]);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Entrance animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const captionValidation = validateCaption(caption);
  const characterCount = caption.length;
  const isOverLimit = characterCount > config.MAX_CAPTION_LENGTH;

  const handlePost = useCallback(async () => {
    if (isOverLimit) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Caption Too Long', 'Please shorten your caption.');
      return;
    }

    // Validate location
    if (!selectedLocation || !selectedLocation.name || selectedLocation.name.trim() === '' || 
        selectedLocation.lat === undefined || selectedLocation.lng === undefined ||
        isNaN(selectedLocation.lat) || isNaN(selectedLocation.lng) ||
        (selectedLocation.lat === 0 && selectedLocation.lng === 0)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        'Location Required',
        'Please select a valid location for your post. You can search for a location or use your current location.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Select Location', 
            onPress: handleSelectLocation
          }
        ]
      );
      return;
    }

    // Validate coordinates (already checked above, but ensure they're valid numbers)
    const lat = typeof selectedLocation.lat === 'number' ? selectedLocation.lat : parseFloat(String(selectedLocation.lat));
    const lng = typeof selectedLocation.lng === 'number' ? selectedLocation.lng : parseFloat(String(selectedLocation.lng));

    if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0 || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Invalid Location', 'Please select a valid location. Tap the location to search or refresh your current location.');
      return;
    }

    // Validate media URI
    if (!mediaUri) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Media Required', 'Please capture a photo or video first.');
      return;
    }

    setIsPosting(true);

    try {
      // Ensure location has valid coordinates
      const validLocation: LocationData = {
        name: selectedLocation.name.trim(),
        lat: typeof selectedLocation.lat === 'number' ? selectedLocation.lat : parseFloat(String(selectedLocation.lat)),
        lng: typeof selectedLocation.lng === 'number' ? selectedLocation.lng : parseFloat(String(selectedLocation.lng)),
        city: selectedLocation.city?.trim() || undefined,
        state: selectedLocation.state?.trim() || undefined,
      };

      const { data, error } = await createPost({
        mediaUri,
        mediaType,
        caption: caption.trim() || undefined,
        location: validLocation,
      });

      if (error) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        console.error('Post creation error:', error);
        Alert.alert('Error', error.message || 'Failed to create post. Please try again.');
        setIsPosting(false);
        return;
      }

      if (data) {
        // Show success animation
        setShowSuccess(true);
        // Don't set isPosting to false here - let success animation handle it
      } else {
        // No data returned but no error - this shouldn't happen
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Error', 'Failed to create post. Please try again.');
        setIsPosting(false);
      }
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      console.error('Post creation exception:', err);
      Alert.alert('Error', 'Failed to create post. Please try again.');
      setIsPosting(false);
    }
  }, [isOverLimit, createPost, mediaUri, mediaType, caption, selectedLocation]);

  const handleSuccessComplete = useCallback(() => {
    // Reset posting state
    setIsPosting(false);
    setShowSuccess(false);
    // Navigate back to feed
    // Post is already added to store via usePosts hook, so it will appear immediately
    // popToTop() will return to Feed screen, and focus listener will refresh if needed
    if (navigation.canGoBack()) {
      navigation.popToTop();
    } else {
      navigation.navigate('Feed');
    }
  }, [navigation]);

  const handleCancel = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    Alert.alert(
      'Discard Post?',
      'Your photo will be lost if you go back.',
      [
        {
          text: 'Keep Editing',
          style: 'cancel',
        },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            if (navigation.canGoBack()) {
              navigation.goBack();
            }
          },
        },
      ]
    );
  }, [navigation]);

  const handleRequestLocationPermission = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const granted = await requestLocationPermission();
    
    if (granted) {
      setHasLocationPermission(true);
      setIsRefreshingLocation(true);
      try {
        const newLocation = await refreshLocation();
        if (newLocation) {
          setSelectedLocation(newLocation);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } catch (error) {
        console.error('Failed to get location after permission grant:', error);
        Alert.alert('Error', 'Failed to get your location. Please try selecting a location manually.');
      } finally {
        setIsRefreshingLocation(false);
      }
    } else {
      Alert.alert(
        'Location Permission Required',
        'To tag your posts with your location, please enable location access in Settings.',
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
            }
          }
        ]
      );
    }
  }, [requestLocationPermission, refreshLocation]);

  const handleSelectLocation = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('LocationSearch', {
      currentLocation: selectedLocation,
      onLocationSelect: (loc: LocationData) => {
        setSelectedLocation(loc);
      },
    });
  }, [navigation, selectedLocation]);

  // Character count color
  const getCharacterCountColor = () => {
    const ratio = characterCount / config.MAX_CAPTION_LENGTH;
    if (ratio > 1) return colors.error;
    if (ratio > 0.9) return colors.timerOrange;
    if (ratio > 0.8) return colors.timerYellow;
    return colors.textTertiary;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity
          onPress={handleCancel}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>New Post</Text>

        <View style={{ width: 60 }} />
      </View>

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Media preview */}
        <View style={styles.mediaContainer}>
          {mediaType === 'video' ? (
            <Video
              source={{ uri: mediaUri }}
              style={styles.media}
              resizeMode={ResizeMode.COVER}
              isLooping
              isMuted
              shouldPlay
            />
          ) : (
            <Image
              source={{ uri: mediaUri }}
              style={styles.media}
              contentFit="cover"
              transition={300}
            />
          )}

          {mediaType === 'video' && (
            <View style={styles.videoIndicator}>
              <Text style={styles.videoIcon}>🎬</Text>
              <Text style={styles.videoLabel}>Video</Text>
            </View>
          )}

          {/* Gradient overlay at bottom */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.3)']}
            style={styles.mediaGradient}
          />
        </View>

        {/* Location */}
        <View style={styles.locationContainer}>
          <TouchableOpacity
            style={styles.locationContent}
            onPress={handleSelectLocation}
            activeOpacity={0.7}
          >
            <View style={styles.locationIconContainer}>
              <Text style={styles.locationIcon}>📍</Text>
            </View>
            <View style={styles.locationTextContainer}>
              {isRefreshingLocation ? (
                <View style={styles.locationLoadingContainer}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={styles.locationLoadingText}>Updating location...</Text>
                </View>
              ) : (
                <>
                  <Text style={styles.locationName} numberOfLines={1}>
                    {selectedLocation?.name || 'Location Unknown'}
                  </Text>
                  {(selectedLocation?.city || selectedLocation?.state) && (
                    <Text style={styles.locationDetails} numberOfLines={1}>
                      {[selectedLocation.city, selectedLocation.state].filter(Boolean).join(', ')}
                    </Text>
                  )}
                </>
              )}
            </View>
            <Text style={styles.editLocationText}>Change</Text>
          </TouchableOpacity>
          
          {/* Refresh location button or request permission button */}
          {!isRefreshingLocation && (
            <TouchableOpacity
              style={styles.refreshLocationButton}
              onPress={async () => {
                // Check permission first
                if (hasLocationPermission === false) {
                  await handleRequestLocationPermission();
                  return;
                }
                
                // If permission status unknown, check it
                if (hasLocationPermission === null) {
                  const hasPermission = await checkLocationPermission();
                  setHasLocationPermission(hasPermission);
                  if (!hasPermission) {
                    await handleRequestLocationPermission();
                    return;
                  }
                }
                
                setIsRefreshingLocation(true);
                try {
                  const newLocation = await refreshLocation();
                  if (newLocation) {
                    setSelectedLocation(newLocation);
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  } else {
                    // If location fetch failed, offer to search manually
                    Alert.alert(
                      'Location Not Available',
                      'Unable to get your current location. Would you like to search for a location?',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { 
                          text: 'Search', 
                          onPress: handleSelectLocation
                        }
                      ]
                    );
                  }
                } catch (error) {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                  Alert.alert(
                    'Error',
                    'Failed to refresh location. Would you like to search for a location?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { 
                        text: 'Search', 
                        onPress: handleSelectLocation
                      }
                    ]
                  );
                } finally {
                  setIsRefreshingLocation(false);
                }
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.refreshIcon}>
                {hasLocationPermission === false ? '🔒' : '🔄'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Caption input */}
        <View style={styles.captionContainer}>
          <TextInput
            style={styles.captionInput}
            placeholder="What's happening tonight?"
            placeholderTextColor={colors.textTertiary}
            value={caption}
            onChangeText={setCaption}
            multiline
            maxLength={config.MAX_CAPTION_LENGTH + 20} // Allow typing past limit to see
            returnKeyType="done"
            blurOnSubmit
          />

          <View style={styles.captionFooter}>
            <Text style={styles.captionHint}>
              Add a caption (optional)
            </Text>
            <Text
              style={[
                styles.characterCount,
                { color: getCharacterCountColor() },
              ]}
            >
              {characterCount}/{config.MAX_CAPTION_LENGTH}
            </Text>
          </View>
        </View>

        {/* Timer info */}
        <View style={styles.timerInfo}>
          <View style={styles.timerIconContainer}>
            <Text style={styles.timerIcon}>⏱️</Text>
          </View>
          <View style={styles.timerTextContainer}>
            <Text style={styles.timerTitle}>Disappears in 1 hour</Text>
            <Text style={styles.timerSubtitle}>
              Your friends will see this until then
            </Text>
          </View>
        </View>
      </Animated.View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <Button
          title={isPosting ? 'Sharing...' : 'Share with Friends'}
          onPress={handlePost}
          loading={isPosting}
          disabled={isPosting || isOverLimit}
          fullWidth
          size="lg"
          variant="primary"
        />
        {isOverLimit && (
          <Text style={styles.errorText}>
            Caption is too long. Please shorten it to {config.MAX_CAPTION_LENGTH} characters.
          </Text>
        )}
      </View>

      {/* Success animation */}
      <SuccessAnimation
        visible={showSuccess}
        onComplete={handleSuccessComplete}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  cancelText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  content: {
    flex: 1,
  },
  mediaContainer: {
    width: '100%',
    height: PREVIEW_HEIGHT,
    backgroundColor: colors.black,
    position: 'relative',
  },
  media: {
    width: '100%',
    height: '100%',
  },
  mediaGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  videoIndicator: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    backgroundColor: colors.overlay,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  videoIcon: {
    fontSize: 14,
  },
  videoLabel: {
    fontSize: typography.sizes.sm,
    color: colors.white,
    fontWeight: typography.weights.medium,
  },
  locationContainer: {
    padding: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
    position: 'relative',
  },
  locationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  locationIcon: {
    fontSize: 18,
  },
  locationTextContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  locationLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  locationLoadingText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  locationName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: 2,
  },
  locationDetails: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  editLocationText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  refreshLocationButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  refreshIcon: {
    fontSize: 16,
  },
  captionContainer: {
    padding: spacing.md,
  },
  captionInput: {
    fontSize: typography.sizes.md,
    color: colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
    lineHeight: typography.lineHeights.lg,
  },
  captionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  captionHint: {
    fontSize: typography.sizes.xs,
    color: colors.textTertiary,
  },
  characterCount: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  timerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  timerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerIcon: {
    fontSize: 20,
  },
  timerTextContainer: {
    flex: 1,
  },
  timerTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  timerSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  footer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  errorText: {
    marginTop: spacing.sm,
    fontSize: typography.sizes.sm,
    color: colors.error,
    textAlign: 'center',
  },
});
