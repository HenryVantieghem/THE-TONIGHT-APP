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
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/ui/Button';
import { usePosts } from '../../hooks/usePosts';
import { useLocation } from '../../hooks/useLocation';
import { validateCaption } from '../../utils/validation';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { spacing, borderRadius, config } from '../../constants/config';
import type { MainStackParamList, LocationData } from '../../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const PREVIEW_HEIGHT = SCREEN_WIDTH * 1.1;

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
          }, 600);
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
            <Animated.View
              style={[
                { transform: [{ scale: checkScaleAnim }] },
              ]}
            >
              <Ionicons name="checkmark" size={60} color={colors.white} />
            </Animated.View>
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
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
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
  const { mediaUri, mediaType, location: initialLocation } = route.params;

  const insets = useSafeAreaInsets();
  const { createPost } = usePosts();
  const { 
    getCurrentLocation: refreshLocation, 
    requestPermission: requestLocationPermission, 
    checkPermission: checkLocationPermission 
  } = useLocation();

  const [caption, setCaption] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(
    initialLocation && initialLocation.name && initialLocation.name !== '' 
      ? initialLocation 
      : null
  );
  const [isRefreshingLocation, setIsRefreshingLocation] = useState(false);
  const [hasLocationPermission, setHasLocationPermission] = useState<boolean | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Track if we've already tried to auto-fetch location
  const hasTriedAutoFetch = useRef(false);

  // Video player for video preview
  const videoPlayer = useVideoPlayer(mediaType === 'video' ? mediaUri : '');
  
  // Configure video player when it's created
  useEffect(() => {
    if (mediaType === 'video' && videoPlayer) {
      try {
        videoPlayer.loop = true;
        videoPlayer.muted = true;
        videoPlayer.play();
      } catch (error) {
        console.warn('Error configuring video player:', error);
      }
    }
    
    // Cleanup: pause video when component unmounts
    return () => {
      if (videoPlayer && mediaType === 'video') {
        try {
          // Check if player is still valid before calling pause
          if (videoPlayer.currentTime !== undefined) {
            videoPlayer.pause();
          }
        } catch (error) {
          // Silently ignore cleanup errors - player may already be destroyed
          console.warn('Error pausing video player during cleanup:', error);
        }
      }
    };
  }, [mediaType, videoPlayer]);

  // Update location when route params change (from LocationSearchScreen)
  useEffect(() => {
    const params = route.params as any;
    if (params?.selectedLocation) {
      setSelectedLocation(params.selectedLocation);
      setLocationError(null);
      // Clear the param to avoid re-applying
      navigation.setParams({ selectedLocation: undefined } as any);
    }
  }, [route.params, navigation]);

  // Auto-fetch location on mount if needed
  useEffect(() => {
    const initLocation = async () => {
      if (hasTriedAutoFetch.current) return;
      hasTriedAutoFetch.current = true;

      // Check permission first
      const hasPermission = await checkLocationPermission();
      setHasLocationPermission(hasPermission);

      // If we don't have a valid location, try to get one
      if (!selectedLocation && hasPermission) {
        setIsRefreshingLocation(true);
        setLocationError(null);
        try {
          const newLocation = await refreshLocation();
          if (newLocation && newLocation.lat !== 0 && newLocation.lng !== 0 && newLocation.name) {
            setSelectedLocation(newLocation);
          } else {
            setLocationError('Could not determine your location. Please select manually.');
          }
        } catch (error) {
          console.error('Failed to get location:', error);
          setLocationError('Could not get your location. Please select manually.');
        } finally {
          setIsRefreshingLocation(false);
        }
      } else if (!selectedLocation && !hasPermission) {
        setLocationError('Location permission required. Tap to enable.');
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

  // Check if location is valid for posting
  const isLocationValid = useCallback(() => {
    if (!selectedLocation) return false;
    if (!selectedLocation.name || selectedLocation.name.trim() === '') return false;
    if (selectedLocation.lat === undefined || selectedLocation.lng === undefined) return false;
    if (isNaN(selectedLocation.lat) || isNaN(selectedLocation.lng)) return false;
    if (selectedLocation.lat === 0 && selectedLocation.lng === 0) return false;
    if (selectedLocation.lat < -90 || selectedLocation.lat > 90) return false;
    if (selectedLocation.lng < -180 || selectedLocation.lng > 180) return false;
    return true;
  }, [selectedLocation]);

  const handleSelectLocation = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('LocationSearch', {
      currentLocation: selectedLocation,
    });
  }, [navigation, selectedLocation]);

  const handleRefreshLocation = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Check permission first
    if (hasLocationPermission === false) {
      const granted = await requestLocationPermission();
      setHasLocationPermission(granted);
      
      if (!granted) {
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
      return;
    }
    }

    setIsRefreshingLocation(true);
    setLocationError(null);
    
    try {
      const newLocation = await refreshLocation();
      if (newLocation && newLocation.lat !== 0 && newLocation.lng !== 0 && newLocation.name) {
        setSelectedLocation(newLocation);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        setLocationError('Could not get your location. Try selecting manually.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (error) {
      console.error('Failed to refresh location:', error);
      setLocationError('Failed to get location. Please try again.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsRefreshingLocation(false);
    }
  }, [hasLocationPermission, requestLocationPermission, refreshLocation]);

  const handlePost = useCallback(async () => {
    // Validate caption
    if (isOverLimit) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Caption Too Long', `Please shorten your caption to ${config.MAX_CAPTION_LENGTH} characters.`);
      return;
    }

    // Validate media
    if (!mediaUri) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'No media to post. Please go back and capture a photo or video.');
      return;
    }

    setIsPosting(true);

    try {
      // Location is OPTIONAL - build location object only if valid
      const validLocation: LocationData | undefined = isLocationValid()
        ? {
            name: selectedLocation!.name.trim(),
            lat: selectedLocation!.lat,
            lng: selectedLocation!.lng,
            city: selectedLocation!.city?.trim() || undefined,
            state: selectedLocation!.state?.trim() || undefined,
          }
        : undefined;

      console.log('Creating post with:', {
        mediaUri: mediaUri.substring(0, 50) + '...',
        mediaType,
        caption: caption.trim() || '(no caption)',
        location: validLocation || '(no location)',
      });

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
        console.log('Post created successfully:', data.id);
        setShowSuccess(true);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Error', 'Something went wrong. Please try again.');
        setIsPosting(false);
      }
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      console.error('Post creation exception:', err);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      setIsPosting(false);
    }
  }, [isOverLimit, isLocationValid, mediaUri, mediaType, caption, selectedLocation, createPost, handleSelectLocation]);

  const handleSuccessComplete = useCallback(() => {
    setIsPosting(false);
    setShowSuccess(false);
    
    // Navigate back to feed
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
        { text: 'Keep Editing', style: 'cancel' },
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

  // Character count color
  const getCharacterCountColor = () => {
    const ratio = characterCount / config.MAX_CAPTION_LENGTH;
    if (ratio > 1) return colors.error;
    if (ratio > 0.9) return colors.timerOrange;
    if (ratio > 0.8) return colors.timerYellow;
    return colors.textTertiary;
  };

  // Determine if we can post - location is OPTIONAL
  const canPost = !isPosting && !isOverLimit && !isRefreshingLocation;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity
          onPress={handleCancel}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          disabled={isPosting}
        >
          <Text style={[styles.cancelText, isPosting && styles.disabledText]}>Cancel</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>New Post</Text>

        <View style={{ width: 60 }} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
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
          {mediaType === 'video' && videoPlayer ? (
            <VideoView
              player={videoPlayer}
              style={styles.media}
              contentFit="cover"
              nativeControls={false}
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
              <Ionicons name="videocam" size={14} color={colors.white} />
              <Text style={styles.videoLabel}>Video</Text>
            </View>
          )}

          {/* Gradient overlay at bottom */}
          <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.4)']}
            style={styles.mediaGradient}
          />
        </View>

          {/* Location Section */}
          <View style={styles.locationSection}>
            <View style={styles.locationHeader}>
              <Text style={styles.sectionLabel}>LOCATION (OPTIONAL)</Text>
              {!isRefreshingLocation && hasLocationPermission !== false && (
                <TouchableOpacity
                  onPress={handleRefreshLocation}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={styles.refreshButton}
                >
                  <Ionicons name="locate" size={14} color={colors.primary} />
                  <Text style={styles.refreshText}>Use Current</Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={styles.locationCard}
              onPress={handleSelectLocation}
              activeOpacity={0.7}
              disabled={isRefreshingLocation}
            >
              {isRefreshingLocation ? (
                <View style={styles.locationLoading}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={styles.locationLoadingText}>Getting your location...</Text>
                </View>
              ) : selectedLocation && isLocationValid() ? (
                <>
                  <View style={styles.locationIconContainer}>
                    <Ionicons name="location" size={18} color={colors.primary} />
                  </View>
                  <View style={styles.locationTextContainer}>
                    <Text style={styles.locationName} numberOfLines={1}>
                      {selectedLocation.name}
                    </Text>
                    {(selectedLocation.city || selectedLocation.state) && (
                      <Text style={styles.locationDetails} numberOfLines={1}>
                        {[selectedLocation.city, selectedLocation.state].filter(Boolean).join(', ')}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity onPress={handleSelectLocation} activeOpacity={0.7}>
                    <Text style={styles.changeText}>Change</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <View style={[styles.locationIconContainer, styles.locationIconOptional]}>
                    <Ionicons name="location-outline" size={18} color={colors.textTertiary} />
                  </View>
                  <View style={styles.locationTextContainer}>
                    <Text style={styles.locationPlaceholder}>
                      Add a location
                    </Text>
                    <Text style={styles.locationOptionalHint}>
                      Let friends know where you are
                    </Text>
                  </View>
                  <Text style={styles.addText}>Add</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

        {/* Caption input */}
          <View style={styles.captionSection}>
            <Text style={styles.sectionLabel}>CAPTION (OPTIONAL)</Text>
        <View style={styles.captionContainer}>
          <TextInput
            style={styles.captionInput}
            placeholder="Add a caption..."
            placeholderTextColor={colors.textTertiary}
            value={caption}
            onChangeText={setCaption}
            multiline
                maxLength={config.MAX_CAPTION_LENGTH + 20}
            returnKeyType="done"
            blurOnSubmit
                editable={!isPosting}
          />
          <View style={styles.captionFooter}>
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
        </View>

        {/* Timer info */}
        <View style={styles.timerInfo}>
          <View style={styles.timerIconContainer}>
            <Ionicons name="time" size={22} color={colors.timerGreen} />
          </View>
          <View style={styles.timerTextContainer}>
            <Text style={styles.timerTitle}>Disappears in 1 hour</Text>
            <Text style={styles.timerSubtitle}>
              Your friends will see this until then
            </Text>
          </View>
        </View>
      </Animated.View>
      </ScrollView>

      {/* Footer with Post button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <Button
          title={isPosting ? 'Posting...' : 'Share with Friends'}
          onPress={handlePost}
          loading={isPosting}
          disabled={!canPost}
          fullWidth
          size="lg"
          variant="primary"
        />
        {isOverLimit && (
          <Text style={styles.errorText}>
            Caption is too long ({characterCount - config.MAX_CAPTION_LENGTH} characters over)
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
    backgroundColor: colors.background,
    zIndex: 10,
  },
  cancelText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  disabledText: {
    opacity: 0.5,
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
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
    height: 100,
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
  videoLabel: {
    fontSize: typography.sizes.sm,
    color: colors.white,
    fontWeight: typography.weights.medium,
  },
  locationSection: {
    padding: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: colors.primaryLight + '15',
    borderRadius: borderRadius.sm,
  },
  refreshText: {
    fontSize: typography.sizes.xs,
    color: colors.primary,
    fontWeight: typography.weights.medium,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  locationIconOptional: {
    backgroundColor: colors.textTertiary + '20',
  },
  locationLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  locationLoadingText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  locationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  locationOptionalHint: {
    fontSize: typography.sizes.sm,
    color: colors.textTertiary,
    marginTop: 2,
  },
  locationTextContainer: {
    flex: 1,
    marginRight: spacing.sm,
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
  locationPlaceholder: {
    fontSize: typography.sizes.md,
    color: colors.textTertiary,
  },
  changeText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
  addText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
  captionSection: {
    padding: spacing.md,
  },
  captionContainer: {
    marginTop: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  captionInput: {
    fontSize: typography.sizes.md,
    color: colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
    lineHeight: typography.lineHeights.lg,
    padding: 0,
  },
  captionFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
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
    marginTop: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timerIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.timerGreen + '20',
    justifyContent: 'center',
    alignItems: 'center',
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
