import React, { useCallback, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  Pressable,
} from 'react-native';
import { Image } from 'expo-image';
import { Video, ResizeMode } from 'expo-av';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Avatar } from '../ui/Avatar';
import { TimerBar } from '../ui/TimerBar';
import { EmojiReactions } from './EmojiReactions';
import { colors, shadows } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/config';
import type { Post, ReactionEmoji } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MEDIA_HEIGHT = SCREEN_WIDTH * 0.75;
const DOUBLE_TAP_DELAY = 300;

interface PostCardProps {
  post: Post;
  isOwner: boolean;
  onReact: (postId: string, emoji: ReactionEmoji) => void;
  onDelete: (postId: string) => void;
  onUserPress: (userId: string) => void;
  onMediaPress: (post: Post) => void;
}

export function PostCard({
  post,
  isOwner,
  onReact,
  onDelete,
  onUserPress,
  onMediaPress,
}: PostCardProps) {
  // Double tap detection
  const lastTapRef = useRef<number>(0);
  const [showExpandedCaption, setShowExpandedCaption] = useState(false);

  // Heart animation values
  const heartScale = useSharedValue(0);
  const heartOpacity = useSharedValue(0);

  const handleReact = useCallback(
    (emoji: ReactionEmoji) => {
      onReact(post.id, emoji);
    },
    [post.id, onReact]
  );

  // Trigger heart animation and add reaction
  const triggerHeartAnimation = useCallback(() => {
    'worklet';
    heartScale.value = 0;
    heartOpacity.value = 1;

    // Scale up with spring
    heartScale.value = withSpring(1.2, {
      damping: 8,
      stiffness: 200,
    });

    // After animation, fade out
    heartOpacity.value = withSequence(
      withTiming(1, { duration: 100 }),
      withTiming(1, { duration: 400 }),
      withTiming(0, { duration: 300, easing: Easing.out(Easing.ease) })
    );
  }, [heartScale, heartOpacity]);

  const handleDoubleTap = useCallback(async () => {
    // Trigger haptic
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Add heart reaction
    onReact(post.id, '❤️');

    // Trigger animation (on JS thread, animation runs on UI thread)
    triggerHeartAnimation();
  }, [post.id, onReact, triggerHeartAnimation]);

  const handleMediaPress = useCallback(() => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;

    if (timeSinceLastTap < DOUBLE_TAP_DELAY) {
      // Double tap detected
      handleDoubleTap();
    } else {
      // Single tap - open fullscreen after delay if no double tap
      lastTapRef.current = now;
      setTimeout(() => {
        if (Date.now() - lastTapRef.current >= DOUBLE_TAP_DELAY) {
          onMediaPress(post);
        }
      }, DOUBLE_TAP_DELAY);
    }
  }, [handleDoubleTap, onMediaPress, post]);

  const handleLongPress = useCallback(async () => {
    if (!isOwner) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(post.id),
        },
      ]
    );
  }, [isOwner, post.id, onDelete]);

  const handleUserPress = useCallback(() => {
    if (post.user) {
      onUserPress(post.user.id);
    }
  }, [post.user, onUserPress]);

  // Heart animation styles
  const heartAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
    opacity: heartOpacity.value,
  }));

  const locationDisplay = post.location_city
    ? `${post.location_name}\n${post.location_city}${post.location_state ? `, ${post.location_state}` : ''}`
    : post.location_name;

  // Caption truncation
  const shouldTruncateCaption = post.caption && post.caption.length > 100;
  const displayCaption = shouldTruncateCaption && !showExpandedCaption
    ? `${post.caption!.slice(0, 100)}...`
    : post.caption;

  return (
    <View style={styles.container}>
      {/* Header */}
      <TouchableOpacity style={styles.header} onPress={handleUserPress}>
        <Avatar
          uri={post.user?.avatar_url}
          name={post.user?.username}
          size="medium"
        />
        <View style={styles.headerText}>
          <Text style={styles.username}>
            @{post.user?.username || 'unknown'}
          </Text>
          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.locationText} numberOfLines={2}>
              {locationDisplay}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Media with double-tap detection */}
      <Pressable
        style={styles.mediaContainer}
        onPress={handleMediaPress}
        onLongPress={handleLongPress}
        delayLongPress={500}
      >
        {post.media_type === 'video' ? (
          <Video
            source={{ uri: post.media_url }}
            style={styles.media}
            resizeMode={ResizeMode.COVER}
            isLooping
            isMuted
            shouldPlay
          />
        ) : (
          <Image
            source={{ uri: post.media_url }}
            style={styles.media}
            contentFit="cover"
            transition={200}
          />
        )}

        {/* Video indicator */}
        {post.media_type === 'video' && (
          <View style={styles.videoIndicator}>
            <Text style={styles.videoIcon}>▶️</Text>
          </View>
        )}

        {/* Large heart animation overlay */}
        <Animated.View style={[styles.heartContainer, heartAnimatedStyle]}>
          <Text style={styles.heartEmoji}>❤️</Text>
        </Animated.View>
      </Pressable>

      {/* Caption with "see more" */}
      {post.caption && (
        <TouchableOpacity
          style={styles.captionContainer}
          onPress={() => shouldTruncateCaption && setShowExpandedCaption(!showExpandedCaption)}
          activeOpacity={shouldTruncateCaption ? 0.7 : 1}
        >
          <Text style={styles.caption}>
            {displayCaption}
            {shouldTruncateCaption && !showExpandedCaption && (
              <Text style={styles.seeMore}> see more</Text>
            )}
          </Text>
        </TouchableOpacity>
      )}

      {/* Timer Bar */}
      <View style={styles.timerContainer}>
        <TimerBar
          createdAt={post.created_at}
          expiresAt={post.expires_at}
          showTimeLeft
        />
      </View>

      {/* Reactions */}
      <View style={styles.reactionsContainer}>
        <EmojiReactions
          reactions={post.reactions || []}
          myReaction={post.my_reaction}
          onReact={handleReact}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.md,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerText: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  username: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 2,
  },
  locationIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  locationText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    flex: 1,
  },
  mediaContainer: {
    width: '100%',
    height: MEDIA_HEIGHT,
    backgroundColor: colors.surface,
    position: 'relative',
  },
  media: {
    width: '100%',
    height: '100%',
  },
  videoIndicator: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.overlay,
    borderRadius: borderRadius.xs,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  videoIcon: {
    fontSize: 12,
  },
  heartContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  heartEmoji: {
    fontSize: 100,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
  },
  captionContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  caption: {
    fontSize: typography.sizes.md,
    color: colors.text,
    lineHeight: 22,
  },
  seeMore: {
    color: colors.textSecondary,
    fontWeight: '500',
  },
  timerContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  reactionsContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
});
