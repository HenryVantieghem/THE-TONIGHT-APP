import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
  SharedValue,
} from 'react-native-reanimated';
import { colors, shadows } from '../../constants/colors';
import { spacing, borderRadius } from '../../constants/config';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MEDIA_HEIGHT = SCREEN_WIDTH * 0.75;

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

interface PostCardSkeletonProps {
  animated?: boolean;
}

// Reusable shimmer skeleton element
function SkeletonBox({
  width,
  height,
  borderRadius: radius = 4,
  shimmerProgress,
  style,
}: {
  width: number | `${number}%`;
  height: number;
  borderRadius?: number;
  shimmerProgress: SharedValue<number>;
  style?: ViewStyle;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmerProgress.value,
      [0, 1],
      [-SCREEN_WIDTH, SCREEN_WIDTH]
    );
    return {
      transform: [{ translateX }],
    };
  });

  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: colors.surface,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <AnimatedLinearGradient
        colors={[colors.surface, colors.surfaceSecondary, colors.surface]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[StyleSheet.absoluteFill, { width: SCREEN_WIDTH * 2 }, animatedStyle]}
      />
    </View>
  );
}

export function PostCardSkeleton({ animated = true }: PostCardSkeletonProps) {
  const shimmerProgress = useSharedValue(0);

  useEffect(() => {
    if (!animated) return;

    shimmerProgress.value = withRepeat(
      withTiming(1, {
        duration: 1500,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      false
    );
  }, [animated, shimmerProgress]);

  return (
    <View style={styles.container}>
      {/* Header skeleton */}
      <View style={styles.header}>
        <SkeletonBox
          width={44}
          height={44}
          borderRadius={22}
          shimmerProgress={shimmerProgress}
        />
        <View style={styles.headerText}>
          <SkeletonBox
            width={100}
            height={16}
            borderRadius={borderRadius.xs}
            shimmerProgress={shimmerProgress}
          />
          <SkeletonBox
            width={150}
            height={12}
            borderRadius={borderRadius.xs}
            shimmerProgress={shimmerProgress}
            style={{ marginTop: 6 }}
          />
        </View>
      </View>

      {/* Media skeleton */}
      <SkeletonBox
        width="100%"
        height={MEDIA_HEIGHT}
        borderRadius={0}
        shimmerProgress={shimmerProgress}
      />

      {/* Caption skeleton */}
      <View style={styles.captionContainer}>
        <SkeletonBox
          width="90%"
          height={14}
          borderRadius={borderRadius.xs}
          shimmerProgress={shimmerProgress}
        />
        <SkeletonBox
          width="60%"
          height={14}
          borderRadius={borderRadius.xs}
          shimmerProgress={shimmerProgress}
          style={{ marginTop: 6 }}
        />
      </View>

      {/* Timer skeleton */}
      <View style={styles.timerContainer}>
        <View style={styles.timerLabel}>
          <SkeletonBox
            width={16}
            height={16}
            borderRadius={8}
            shimmerProgress={shimmerProgress}
          />
          <SkeletonBox
            width={70}
            height={12}
            borderRadius={borderRadius.xs}
            shimmerProgress={shimmerProgress}
            style={{ marginLeft: 6 }}
          />
        </View>
        <SkeletonBox
          width="100%"
          height={6}
          borderRadius={borderRadius.round}
          shimmerProgress={shimmerProgress}
          style={{ marginTop: 8 }}
        />
      </View>

      {/* Reactions skeleton */}
      <View style={styles.reactionsContainer}>
        {[1, 2, 3, 4].map((i) => (
          <SkeletonBox
            key={i}
            width={52}
            height={36}
            borderRadius={borderRadius.lg}
            shimmerProgress={shimmerProgress}
          />
        ))}
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

// Standalone shimmer placeholder component
export function ShimmerPlaceholder({
  width,
  height,
  borderRadius: radius = 4,
  style,
}: {
  width: number | `${number}%`;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
}) {
  const shimmerProgress = useSharedValue(0);

  useEffect(() => {
    shimmerProgress.value = withRepeat(
      withTiming(1, {
        duration: 1500,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      false
    );
  }, [shimmerProgress]);

  return (
    <SkeletonBox
      width={width}
      height={height}
      borderRadius={radius}
      shimmerProgress={shimmerProgress}
      style={style}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    marginBottom: spacing.md,
    borderRadius: borderRadius.md,
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
  captionContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  timerContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  timerLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reactionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
});
