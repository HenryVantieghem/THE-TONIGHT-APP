import React, { useCallback, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Pressable,
} from 'react-native';
import { Image } from 'expo-image';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../ui/Avatar';
import { TimerBar } from '../ui/TimerBar';
import { EmojiReactions } from './EmojiReactions';
import { colors, shadows } from '../../constants/colors';
import { textStyles } from '../../constants/typography';
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
  const [showExpandedCaption, setShowExpandedCaption] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<Video>(null);
  const lastTapRef = React.useRef<number>(0);
  
  // Heart animation for double tap
  const heartScale = useSharedValue(0);
  const heartOpacity = useSharedValue(0);
  const cardScale = useSharedValue(1);

  const handleUserPress = useCallback(() => {
    if (post.user) {
      onUserPress(post.user.id);
    }
  }, [post.user, onUserPress]);

  const triggerHeartAnimation = useCallback(() => {
    heartScale.value = 0;
    heartOpacity.value = 1;
    heartScale.value = withSequence(
      withSpring(1.3, { damping: 8, stiffness: 200 }),
      withTiming(1, { duration: 200 })
    );
    heartOpacity.value = withSequence(
      withTiming(1, { duration: 100 }),
      withTiming(1, { duration: 400 }),
      withTiming(0, { duration: 300, easing: Easing.out(Easing.ease) })
    );
  }, [heartScale, heartOpacity]);

  const handleDoubleTap = useCallback(async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onReact(post.id, '❤️');
    triggerHeartAnimation();
  }, [post.id, onReact, triggerHeartAnimation]);

  const handleMediaPress = useCallback(() => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;

    if (timeSinceLastTap < DOUBLE_TAP_DELAY) {
      handleDoubleTap();
    } else {
      lastTapRef.current = now;
      setTimeout(() => {
        if (Date.now() - lastTapRef.current >= DOUBLE_TAP_DELAY) {
          onMediaPress(post);
        }
      }, DOUBLE_TAP_DELAY);
    }
  }, [handleDoubleTap, onMediaPress, post]);

  const handlePressIn = useCallback(() => {
    cardScale.value = withSpring(0.98, { damping: 15, stiffness: 150 });
  }, [cardScale]);

  const handlePressOut = useCallback(() => {
    cardScale.value = withSpring(1, { damping: 15, stiffness: 150 });
  }, [cardScale]);

  // Video playback handlers
  const handleVideoTap = useCallback(async () => {
    if (post.media_type === 'video') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setIsMuted(!isMuted);
    }
  }, [isMuted, post.media_type]);

  const handlePlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setIsVideoPlaying(status.isPlaying);
    }
  }, []);

  // Heart animation style
  const heartAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
    opacity: heartOpacity.value,
  }));

  // Card press animation
  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  // Location display
  const locationDisplay = post.location_name || null;

  // Caption truncation (2 lines max per spec)
  const maxCaptionLength = 100;
  const shouldTruncateCaption = post.caption && post.caption.length > maxCaptionLength;
  const displayCaption = shouldTruncateCaption && !showExpandedCaption
    ? `${post.caption!.slice(0, maxCaptionLength)}...`
    : post.caption;

  // Get image URL
  const imageUrl = post.media_type === 'image' ? post.media_url : post.thumbnail_url;

  return (
    <Animated.View style={[styles.container, cardAnimatedStyle]}>
      {/* Header: Avatar + Username + Location */}
      <TouchableOpacity style={styles.header} onPress={handleUserPress}>
        <Avatar
          uri={post.user?.avatar_url}
          name={post.user?.username}
          size="md" // 40px per spec
        />
        <View style={styles.headerText}>
          <Text style={[textStyles.headline, styles.username]}>
            @{post.user?.username || 'unknown'}
          </Text>
          {locationDisplay && (
            <View style={styles.locationRow}>
              <Ionicons name="location" size={14} color={colors.textSecondary} />
              <Text style={[textStyles.subheadline, styles.locationText]} numberOfLines={1}>
                {locationDisplay}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* Media */}
      <Pressable
        style={styles.mediaContainer}
        onPress={post.media_type === 'video' ? handleVideoTap : handleMediaPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onLongPress={() => post.media_type !== 'video' && handleMediaPress()}
      >
        {post.media_type === 'video' ? (
          <>
            <Video
              ref={videoRef}
              source={{ uri: post.media_url }}
              style={styles.media}
              resizeMode={ResizeMode.COVER}
              shouldPlay
              isLooping
              isMuted={isMuted}
              onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
              posterSource={{ uri: post.thumbnail_url || undefined }}
              usePoster={!!post.thumbnail_url}
            />
            {/* Mute/Unmute indicator */}
            <View style={styles.videoControls}>
              <View style={styles.muteButton}>
                <Ionicons
                  name={isMuted ? 'volume-mute' : 'volume-high'}
                  size={20}
                  color={colors.white}
                />
              </View>
            </View>
          </>
        ) : (
          imageUrl && (
            <Image
              source={{ uri: imageUrl }}
              style={styles.media}
              contentFit="cover"
              transition={200}
            />
          )
        )}

        {/* Double-tap heart animation */}
        <Animated.View style={[styles.heartOverlay, heartAnimatedStyle]}>
          <Ionicons name="heart" size={64} color={colors.error} />
        </Animated.View>
      </Pressable>

      {/* Caption */}
      {displayCaption && (
        <View style={styles.captionContainer}>
          <Text
            style={[textStyles.body, styles.caption]}
            numberOfLines={showExpandedCaption ? undefined : 2}
          >
            {displayCaption}
          </Text>
          {shouldTruncateCaption && (
            <TouchableOpacity
              onPress={() => setShowExpandedCaption(!showExpandedCaption)}
            >
              <Text style={[textStyles.callout, styles.expandText]}>
                {showExpandedCaption ? 'Show less' : 'Show more'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Timer Bar */}
      <View style={styles.timerContainer}>
        <TimerBar
          createdAt={post.created_at}
          expiresAt={post.expires_at}
          showLabel={false}
          showTimeLeft={true}
        />
      </View>

      {/* Reactions */}
      <View style={styles.reactionsContainer}>
        <EmojiReactions
          reactions={post.reactions || []}
          myReaction={post.my_reaction}
          onReact={(emoji) => onReact(post.id, emoji)}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerText: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  username: {
    color: colors.textPrimary,
    marginBottom: spacing['2xs'],
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2xs'],
  },
  locationText: {
    color: colors.textSecondary,
    flex: 1,
  },
  mediaContainer: {
    width: '100%',
    height: MEDIA_HEIGHT,
    borderRadius: borderRadius.md, // 12px per spec
    overflow: 'hidden',
    marginBottom: spacing.md,
    backgroundColor: colors.backgroundTertiary,
  },
  media: {
    width: '100%',
    height: '100%',
  },
  heartOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  videoControls: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
  },
  muteButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: borderRadius.full,
    padding: spacing.xs,
  },
  captionContainer: {
    marginBottom: spacing.sm,
  },
  caption: {
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  expandText: {
    color: colors.accent,
  },
  timerContainer: {
    marginBottom: spacing.sm,
  },
  reactionsContainer: {
    marginTop: spacing.xs,
  },
});
