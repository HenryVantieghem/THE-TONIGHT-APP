import React, { useState } from 'react';
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
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import { Video, ResizeMode } from 'expo-av';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../components/ui/Button';
import { LocationStripCompact } from '../../components/camera/LocationStrip';
import { usePosts } from '../../hooks/usePosts';
import { validateCaption } from '../../utils/validation';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { spacing, borderRadius, config } from '../../constants/config';
import type { MainStackParamList } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PREVIEW_HEIGHT = SCREEN_WIDTH * 1.2;

type PostPreviewNavigationProp = NativeStackNavigationProp<MainStackParamList, 'PostPreview'>;
type PostPreviewRouteProp = NativeStackScreenProps<MainStackParamList, 'PostPreview'>['route'];

export function PostPreviewScreen() {
  const navigation = useNavigation<PostPreviewNavigationProp>();
  const route = useRoute<PostPreviewRouteProp>();
  const { mediaUri, mediaType, location } = route.params;

  const insets = useSafeAreaInsets();
  const { createPost } = usePosts();

  const [caption, setCaption] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const captionValidation = validateCaption(caption);
  const characterCount = caption.length;
  const isOverLimit = characterCount > config.MAX_CAPTION_LENGTH;

  const handlePost = async () => {
    if (isOverLimit) {
      Alert.alert('Caption Too Long', 'Please shorten your caption.');
      return;
    }

    setIsPosting(true);

    try {
      const { data, error } = await createPost({
        mediaUri,
        mediaType,
        caption: caption.trim() || undefined,
        location,
      });

      if (error) {
        Alert.alert('Error', error.message);
        return;
      }

      if (data) {
        // Navigate back to feed
        navigation.popToTop();
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setIsPosting(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity onPress={handleCancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>New Post</Text>

        <View style={{ width: 60 }} />
      </View>

      <View style={styles.content}>
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
            />
          )}

          {mediaType === 'video' && (
            <View style={styles.videoIndicator}>
              <Text style={styles.videoIcon}>🎬 Video</Text>
            </View>
          )}
        </View>

        {/* Location */}
        <View style={styles.locationContainer}>
          <LocationStripCompact location={location} />
        </View>

        {/* Caption input */}
        <View style={styles.captionContainer}>
          <TextInput
            style={styles.captionInput}
            placeholder="Add a caption..."
            placeholderTextColor={colors.textTertiary}
            value={caption}
            onChangeText={setCaption}
            multiline
            maxLength={config.MAX_CAPTION_LENGTH + 20} // Allow typing past limit to see
          />

          <Text
            style={[
              styles.characterCount,
              isOverLimit && styles.characterCountError,
            ]}
          >
            {characterCount}/{config.MAX_CAPTION_LENGTH}
          </Text>
        </View>

        {/* Timer info */}
        <View style={styles.timerInfo}>
          <Text style={styles.timerIcon}>⏱️</Text>
          <Text style={styles.timerText}>
            This post will disappear in 1 hour
          </Text>
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <Button
          title="Post"
          onPress={handlePost}
          loading={isPosting}
          disabled={isPosting || isOverLimit}
          fullWidth
          size="lg"
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
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cancelText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
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
  },
  media: {
    width: '100%',
    height: '100%',
  },
  videoIndicator: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    backgroundColor: colors.overlay,
    borderRadius: borderRadius.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  videoIcon: {
    fontSize: typography.sizes.sm,
    color: colors.white,
  },
  locationContainer: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  captionContainer: {
    padding: spacing.md,
  },
  captionInput: {
    fontSize: typography.sizes.md,
    color: colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  characterCountError: {
    color: colors.error,
  },
  timerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    gap: spacing.xs,
  },
  timerIcon: {
    fontSize: 16,
  },
  timerText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  footer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
