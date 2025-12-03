import React, { useState, useCallback } from 'react';
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
  ScrollView,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/ui/Button';
import { usePosts } from '../../hooks/usePosts';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { spacing, borderRadius, config } from '../../constants/config';
import type { MainStackParamList, LocationData } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PREVIEW_HEIGHT = SCREEN_WIDTH * 1.1;

type PostPreviewNavigationProp = NativeStackNavigationProp<MainStackParamList, 'PostPreview'>;
type PostPreviewRouteProp = NativeStackScreenProps<MainStackParamList, 'PostPreview'>['route'];

export function PostPreviewScreen() {
  const navigation = useNavigation<PostPreviewNavigationProp>();
  const route = useRoute<PostPreviewRouteProp>();
  const insets = useSafeAreaInsets();
  const { createPost } = usePosts();

  const params = route.params || {};
  const mediaUri = params.mediaUri || '';
  const mediaType = params.mediaType || 'image';
  const location = params.location || null;

  const [caption, setCaption] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const characterCount = caption.length;
  const isOverLimit = characterCount > config.MAX_CAPTION_LENGTH;

  const isLocationValid = useCallback(() => {
    if (!location) return false;
    if (!location.name || location.name.trim() === '') return false;
    const { lat, lng } = location;
    if (typeof lat !== 'number' || typeof lng !== 'number') return false;
    if (isNaN(lat) || isNaN(lng)) return false;
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  }, [location]);

  const handlePost = useCallback(async () => {
    if (isOverLimit) {
      Alert.alert('Caption Too Long', `Max ${config.MAX_CAPTION_LENGTH} characters.`);
      return;
    }

    if (!mediaUri) {
      Alert.alert('Error', 'No media to post.');
      return;
    }

    // Validate file exists
    try {
      const fileInfo = await FileSystem.getInfoAsync(mediaUri);
      if (!fileInfo.exists) {
        Alert.alert('Error', 'Media file not found. Please try again.');
        return;
      }
    } catch (error) {
      Alert.alert('Error', 'Could not access media file.');
      return;
    }

    setIsPosting(true);

    try {
      const validLocation: LocationData | undefined = isLocationValid()
        ? {
            name: location!.name.trim(),
            lat: location!.lat,
            lng: location!.lng,
            city: location!.city?.trim() || undefined,
            state: location!.state?.trim() || undefined,
          }
        : undefined;

      const { data, error } = await createPost({
        mediaUri,
        mediaType,
        caption: caption.trim() || undefined,
        location: validLocation,
      });

      if (error) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Error', error.message || 'Failed to create post.');
        setIsPosting(false);
        return;
      }

      if (data) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Posted!', 'Your post is now live for 1 hour.', [
          {
            text: 'OK',
            onPress: () => {
              if (navigation.canGoBack()) {
                navigation.popToTop();
              } else {
                navigation.navigate('Feed');
              }
            },
          },
        ]);
      }
    } catch (err) {
      console.error('Post error:', err);
      Alert.alert('Error', 'Something went wrong.');
    } finally {
      setIsPosting(false);
    }
  }, [isOverLimit, isLocationValid, mediaUri, mediaType, caption, location, createPost, navigation]);

  const handleCancel = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Discard Post?', 'Your photo will be lost.', [
      { text: 'Keep Editing', style: 'cancel' },
      {
        text: 'Discard',
        style: 'destructive',
        onPress: () => navigation.goBack(),
      },
    ]);
  }, [navigation]);

  const getCharacterCountColor = () => {
    const ratio = characterCount / config.MAX_CAPTION_LENGTH;
    if (ratio > 1) return colors.error;
    if (ratio > 0.9) return colors.warning;
    return colors.textTertiary;
  };

  const canPost = !isPosting && !isOverLimit;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity onPress={handleCancel} disabled={isPosting} style={styles.headerButton}>
          <Ionicons name="close" size={28} color={isPosting ? colors.textTertiary : colors.text} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Create</Text>

        <TouchableOpacity onPress={handlePost} disabled={!canPost} style={styles.headerButton}>
          <Ionicons name="checkmark" size={32} color={canPost ? colors.primary : colors.textTertiary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Media preview */}
        <View style={styles.mediaContainer}>
          <Image source={{ uri: mediaUri }} style={styles.media} contentFit="cover" />
        </View>

        {/* Location Section */}
        {isLocationValid() && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>LOCATION</Text>
            <View style={styles.locationCard}>
              <Ionicons name="location" size={20} color={colors.primary} />
              <Text style={styles.locationName} numberOfLines={1}>
                {location!.name}
              </Text>
            </View>
          </View>
        )}

        {/* Caption */}
        <View style={styles.section}>
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
              editable={!isPosting}
            />
            <Text style={[styles.characterCount, { color: getCharacterCountColor() }]}>
              {characterCount}/{config.MAX_CAPTION_LENGTH}
            </Text>
          </View>
        </View>

        {/* Timer info */}
        <View style={styles.timerInfo}>
          <Ionicons name="time" size={22} color={colors.timerGreen} />
          <View style={styles.timerText}>
            <Text style={styles.timerTitle}>Disappears in 1 hour</Text>
            <Text style={styles.timerSubtitle}>Your friends will see this until then</Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
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
      </View>
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
    backgroundColor: colors.backgroundSecondary,
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  mediaContainer: {
    width: '100%',
    height: PREVIEW_HEIGHT,
    backgroundColor: colors.black,
  },
  media: {
    width: '100%',
    height: '100%',
  },
  section: {
    padding: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  sectionLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  locationName: {
    flex: 1,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text,
  },
  captionContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  captionInput: {
    fontSize: typography.sizes.md,
    color: colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: typography.sizes.sm,
    textAlign: 'right',
    marginTop: spacing.sm,
  },
  timerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    margin: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.md,
  },
  timerText: {
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
});
