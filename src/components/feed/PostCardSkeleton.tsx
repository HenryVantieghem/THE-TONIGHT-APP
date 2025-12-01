import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../constants/colors';
import { spacing, borderRadius, shadows } from '../../constants/config';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MEDIA_HEIGHT = SCREEN_WIDTH * 0.75;

interface PostCardSkeletonProps {
  animated?: boolean;
}

export function PostCardSkeleton({ animated = true }: PostCardSkeletonProps) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animated) return;

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [animated, shimmerAnim]);

  const shimmerStyle = {
    opacity: animated
      ? shimmerAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.4, 0.8],
        })
      : 0.6,
  };

  return (
    <View style={styles.container}>
      {/* Header skeleton */}
      <View style={styles.header}>
        <Animated.View style={[styles.avatar, shimmerStyle]} />
        <View style={styles.headerText}>
          <Animated.View style={[styles.username, shimmerStyle]} />
          <Animated.View style={[styles.location, shimmerStyle]} />
        </View>
      </View>

      {/* Media skeleton */}
      <Animated.View style={[styles.media, shimmerStyle]} />

      {/* Caption skeleton */}
      <View style={styles.captionContainer}>
        <Animated.View style={[styles.captionLine, shimmerStyle]} />
        <Animated.View style={[styles.captionLineShort, shimmerStyle]} />
      </View>

      {/* Timer skeleton */}
      <View style={styles.timerContainer}>
        <Animated.View style={[styles.timerText, shimmerStyle]} />
        <Animated.View style={[styles.timerBar, shimmerStyle]} />
      </View>

      {/* Reactions skeleton */}
      <View style={styles.reactionsContainer}>
        <View style={styles.emojiRow}>
          {[1, 2, 3, 4].map((_, index) => (
            <Animated.View
              key={index}
              style={[styles.emojiButton, shimmerStyle]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

// Multiple skeleton cards for loading state
export function PostCardsSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <View>
      {Array.from({ length: count }).map((_, index) => (
        <PostCardSkeleton key={index} />
      ))}
    </View>
  );
}

// Shimmer component that can be used for any element
export function ShimmerPlaceholder({
  width,
  height,
  borderRadius: radius = 4,
  style,
}: {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: object;
}) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [shimmerAnim]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: colors.surfaceSecondary,
          opacity: shimmerAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.4, 0.8],
          }),
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    marginBottom: spacing.md,
    borderRadius: borderRadius.md,
    ...shadows.medium,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceSecondary,
  },
  headerText: {
    marginLeft: spacing.sm,
    flex: 1,
    gap: 6,
  },
  username: {
    width: 100,
    height: 14,
    borderRadius: 4,
    backgroundColor: colors.surfaceSecondary,
  },
  location: {
    width: 150,
    height: 12,
    borderRadius: 4,
    backgroundColor: colors.surfaceSecondary,
  },
  media: {
    width: '100%',
    height: MEDIA_HEIGHT,
    backgroundColor: colors.surfaceSecondary,
  },
  captionContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    gap: 6,
  },
  captionLine: {
    width: '90%',
    height: 14,
    borderRadius: 4,
    backgroundColor: colors.surfaceSecondary,
  },
  captionLineShort: {
    width: '60%',
    height: 14,
    borderRadius: 4,
    backgroundColor: colors.surfaceSecondary,
  },
  timerContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    gap: 6,
  },
  timerText: {
    width: 80,
    height: 12,
    borderRadius: 4,
    backgroundColor: colors.surfaceSecondary,
  },
  timerBar: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surfaceSecondary,
  },
  reactionsContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  emojiRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  emojiButton: {
    width: 44,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceSecondary,
  },
});
