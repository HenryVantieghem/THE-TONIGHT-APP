/**
 * Scena - Skeleton Card Component
 * Loading placeholder for moment cards
 */

import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { GlassCard } from './GlassCard';
import { colors, spacing, borderRadius, durations } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - spacing.screenHorizontal * 2;
const IMAGE_HEIGHT = CARD_WIDTH * 0.85;

export const SkeletonCard: React.FC = () => {
  const shimmerOpacity = useSharedValue(0.3);

  useEffect(() => {
    shimmerOpacity.value = withRepeat(
      withTiming(0.7, { duration: durations.drift }),
      -1,
      true
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: shimmerOpacity.value,
  }));

  return (
    <GlassCard style={styles.card} noPadding>
      {/* Header skeleton */}
      <View style={styles.header}>
        <Animated.View style={[styles.avatarSkeleton, shimmerStyle]} />
        <View style={styles.headerText}>
          <Animated.View style={[styles.usernameSkeleton, shimmerStyle]} />
          <Animated.View style={[styles.locationSkeleton, shimmerStyle]} />
        </View>
      </View>

      {/* Image skeleton */}
      <Animated.View style={[styles.imageSkeleton, shimmerStyle]} />

      {/* Caption skeleton */}
      <View style={styles.captionContainer}>
        <Animated.View style={[styles.captionSkeleton, shimmerStyle]} />
      </View>

      {/* Footer skeleton */}
      <View style={styles.footer}>
        <Animated.View style={[styles.reactionsSkeleton, shimmerStyle]} />
        <Animated.View style={[styles.timerSkeleton, shimmerStyle]} />
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.cardMargin,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.cardPadding,
    paddingBottom: spacing.sm,
  },
  avatarSkeleton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background.tertiary,
    marginRight: spacing.sm,
  },
  headerText: {
    flex: 1,
  },
  usernameSkeleton: {
    width: 80,
    height: 14,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background.tertiary,
    marginBottom: 4,
  },
  locationSkeleton: {
    width: 60,
    height: 12,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background.tertiary,
  },
  imageSkeleton: {
    width: '100%',
    height: IMAGE_HEIGHT,
    backgroundColor: colors.background.tertiary,
  },
  captionContainer: {
    padding: spacing.cardPadding,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  captionSkeleton: {
    width: '70%',
    height: 14,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background.tertiary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.cardPadding,
    paddingTop: spacing.sm,
  },
  reactionsSkeleton: {
    width: 60,
    height: 24,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background.tertiary,
  },
  timerSkeleton: {
    width: 80,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.background.tertiary,
  },
});

export default SkeletonCard;
