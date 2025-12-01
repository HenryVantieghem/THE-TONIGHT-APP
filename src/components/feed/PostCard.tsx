import React, { useCallback, useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  Pressable,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { VideoView, useVideoPlayer } from 'expo-video';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  runOnJS,
  Easing,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Avatar } from '../ui/Avatar';
import { TimerBar } from '../ui/TimerBar';
import { EmojiReactions } from './EmojiReactions';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/config';
import {
  liquidGlass,
  glassShadows,
  glassMotion,
  glassColors,
} from '../../constants/liquidGlass';
import type { Post, ReactionEmoji } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MEDIA_HEIGHT = SCREEN_WIDTH * 0.75;
const DOUBLE_TAP_DELAY = 300;
const CARD_BORDER_RADIUS = 24;

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
  const pressProgress = useSharedValue(0);

  // Video player for video posts
  const videoPlayer = useVideoPlayer(post.media_type === 'video' ? post.media_url : '');
  
  // Configure video player when it's created
  useEffect(() => {
    if (post.media_type === 'video' && videoPlayer) {
      videoPlayer.loop = true;
      videoPlayer.muted = true;
      videoPlayer.play();
    }
    
    // Cleanup: pause video when component unmounts or post changes
    return () => {
      if (videoPlayer) {
        videoPlayer.pause();
      }
    };
  }, [post.media_type, post.media_url, videoPlayer]);

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

  const singleTapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (singleTapTimerRef.current) {
        clearTimeout(singleTapTimerRef.current);
      }
    };
  }, []);

  const handleMediaPress = useCallback(() => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;

    // Clear any pending single tap timer
    if (singleTapTimerRef.current) {
      clearTimeout(singleTapTimerRef.current);
      singleTapTimerRef.current = null;
    }

    if (timeSinceLastTap < DOUBLE_TAP_DELAY) {
      // Double tap detected
      handleDoubleTap();
    } else {
      // Single tap - open fullscreen after delay if no double tap
      lastTapRef.current = now;
      singleTapTimerRef.current = setTimeout(() => {
        if (Date.now() - lastTapRef.current >= DOUBLE_TAP_DELAY) {
          onMediaPress(post);
        }
        singleTapTimerRef.current = null;
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

  // Press animation handlers
  const handlePressIn = () => {
    pressProgress.value = withSpring(1, glassMotion.spring.snappy);
  };

  const handlePressOut = () => {
    pressProgress.value = withSpring(0, glassMotion.spring.smooth);
  };

  // Heart animation styles
  const heartAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
    opacity: heartOpacity.value,
  }));

  // Card press animation
  const cardAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      pressProgress.value,
      [0, 1],
      [1, 0.98],
      Extrapolation.CLAMP
    );
    return { transform: [{ scale }] };
  });

  const locationDisplay = post.location_city
    ? `${post.location_name}\n${post.location_city}${post.location_state ? `, ${post.location_state}` : ''}`
    : post.location_name;

  // Caption truncation
  const shouldTruncateCaption = post.caption && post.caption.length > 100;
  const displayCaption = shouldTruncateCaption && !showExpandedCaption
    ? `${post.caption!.slice(0, 100)}...`
    : post.caption;

  return (
    <Animated.View style={[styles.container, cardAnimatedStyle]}>
      {/* Glass Background */}
      <View style={styles.glassBackground}>
        {Platform.OS === 'ios' ? (
          <BlurView
            intensity={liquidGlass.blur.regular}
            tint="light"
            style={StyleSheet.absoluteFill}
          />
        ) : null}
        <View style={styles.glassColorLayer} />
        {/* Top highlight */}
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.4)', 'transparent']}
          style={styles.glassHighlight}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.3 }}
        />
      </View>

      {/* Glass Border */}
      <View style={styles.glassBorder} />

      {/* Header */}
      <TouchableOpacity style={styles.header} onPress={handleUserPress}>
        <View style={styles.avatarRing}>
          <Avatar
            uri={post.user?.avatar_url}
            name={post.user?.username}
            size="medium"
          />
        </View>
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
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onLongPress={handleLongPress}
        delayLongPress={500}
      >
        {post.media_type === 'video' && videoPlayer ? (
          <VideoView
            player={videoPlayer}
            style={styles.media}
            contentFit="cover"
            nativeControls={false}
          />
        ) : (
          <Image
            source={{ uri: post.media_url }}
            style={styles.media}
            contentFit="cover"
            transition={200}
          />
        )}

        {/* Video indicator - Glass Pill Style */}
        {post.media_type === 'video' && (
          <View style={styles.videoIndicator}>
            {Platform.OS === 'ios' && (
              <BlurView
                intensity={liquidGlass.blur.light}
                tint="dark"
                style={StyleSheet.absoluteFill}
              />
            )}
            <View style={styles.videoIndicatorBg} />
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

      {/* Timer Bar - Glass Style */}
      <View style={styles.timerContainer}>
        <View style={styles.timerGlass}>
          {Platform.OS === 'ios' && (
            <BlurView
              intensity={liquidGlass.blur.subtle}
              tint="light"
              style={StyleSheet.absoluteFill}
            />
          )}
          <View style={styles.timerGlassBg} />
          <TimerBar
            createdAt={post.created_at}
            expiresAt={post.expires_at}
            showTimeLeft
          />
        </View>
      </View>

      {/* Reactions - Glass Pill Style */}
      <View style={styles.reactionsContainer}>
        <EmojiReactions
          reactions={post.reactions || []}
          myReaction={post.my_reaction}
          onReact={handleReact}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
    borderRadius: CARD_BORDER_RADIUS,
    overflow: 'hidden',
    ...glassShadows.key,
  },
  glassBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: CARD_BORDER_RADIUS,
    overflow: 'hidden',
  },
  glassColorLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: liquidGlass.material.elevated.backgroundColor,
  },
  glassHighlight: {
    ...StyleSheet.absoluteFillObject,
    height: '30%',
  },
  glassBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: CARD_BORDER_RADIUS,
    borderWidth: liquidGlass.border.width,
    borderColor: liquidGlass.border.colorStrong,
    pointerEvents: 'none',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  avatarRing: {
    borderRadius: 24,
    padding: 2,
    borderWidth: 2,
    borderColor: liquidGlass.border.color,
  },
  headerText: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  username: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: glassColors.text.primary,
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
    color: glassColors.text.secondary,
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
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    overflow: 'hidden',
    minWidth: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoIndicatorBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: liquidGlass.material.dark.backgroundColor,
    borderRadius: 12,
  },
  videoIcon: {
    fontSize: 12,
    zIndex: 1,
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
    color: glassColors.text.primary,
    lineHeight: 22,
  },
  seeMore: {
    color: glassColors.text.secondary,
    fontWeight: '500',
  },
  timerContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  timerGlass: {
    borderRadius: 12,
    padding: spacing.sm,
    overflow: 'hidden',
  },
  timerGlassBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: liquidGlass.material.subtle.backgroundColor,
    borderRadius: 12,
    borderWidth: liquidGlass.border.width,
    borderColor: liquidGlass.border.color,
  },
  reactionsContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
});
