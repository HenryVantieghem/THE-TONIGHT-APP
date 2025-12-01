import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Button } from '../ui/Button';
import { colors, shadows } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/config';

type EmptyStateType = 'no-posts' | 'no-friends' | 'no-requests' | 'error';

interface EmptyStateProps {
  type: EmptyStateType;
  onAction?: () => void;
  actionLabel?: string;
}

const emptyStateContent: Record<
  EmptyStateType,
  { icon: string; title: string; subtitle: string; defaultAction?: string }
> = {
  'no-posts': {
    icon: '📷',
    title: 'No Posts Yet',
    subtitle: "Your friends haven't posted anything in the last hour. Be the first to share what you're doing tonight!",
    defaultAction: 'Take a Photo',
  },
  'no-friends': {
    icon: '👥',
    title: 'Find Your Friends',
    subtitle: 'Add friends to see what they\'re up to right now.',
    defaultAction: 'Add Friends',
  },
  'no-requests': {
    icon: '📬',
    title: 'No Pending Requests',
    subtitle: 'You don\'t have any friend requests at the moment.',
  },
  error: {
    icon: '😕',
    title: 'Something Went Wrong',
    subtitle: 'We couldn\'t load the content. Please try again.',
    defaultAction: 'Try Again',
  },
};

export function EmptyState({
  type,
  onAction,
  actionLabel,
}: EmptyStateProps) {
  const content = emptyStateContent[type];
  const showButton = onAction && (actionLabel || content.defaultAction);

  // Floating animation values
  const floatY = useSharedValue(0);
  const floatRotate = useSharedValue(0);
  const iconScale = useSharedValue(1);

  // Start floating animation on mount
  useEffect(() => {
    // Gentle up/down float
    floatY.value = withRepeat(
      withSequence(
        withTiming(-8, {
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(8, {
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
        })
      ),
      -1,
      true
    );

    // Subtle rotation
    floatRotate.value = withRepeat(
      withSequence(
        withTiming(-3, {
          duration: 2500,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(3, {
          duration: 2500,
          easing: Easing.inOut(Easing.ease),
        })
      ),
      -1,
      true
    );

    // Gentle scale pulse
    iconScale.value = withRepeat(
      withSequence(
        withTiming(1.05, {
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(0.95, {
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
        })
      ),
      -1,
      true
    );
  }, [floatY, floatRotate, iconScale]);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: floatY.value },
      { rotate: `${floatRotate.value}deg` },
      { scale: iconScale.value },
    ],
  }));

  return (
    <View style={styles.container}>
      {/* Floating icon with glow effect */}
      <View style={styles.iconWrapper}>
        <View style={styles.iconGlow} />
        <Animated.Text style={[styles.icon, animatedIconStyle]}>
          {content.icon}
        </Animated.Text>
      </View>

      <Text style={styles.title}>{content.title}</Text>
      <Text style={styles.subtitle}>{content.subtitle}</Text>

      {showButton && (
        <Button
          title={actionLabel || content.defaultAction || ''}
          onPress={onAction}
          variant="primary"
          style={styles.button}
        />
      )}
    </View>
  );
}

// Loading placeholder with shimmer for posts
export function PostLoadingPlaceholder() {
  const shimmerOpacity = useSharedValue(0.4);

  useEffect(() => {
    shimmerOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 1000 }),
        withTiming(0.4, { duration: 1000 })
      ),
      -1,
      true
    );
  }, [shimmerOpacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: shimmerOpacity.value,
  }));

  return (
    <View style={loadingStyles.container}>
      <View style={loadingStyles.header}>
        <Animated.View style={[loadingStyles.avatar, animatedStyle]} />
        <View style={loadingStyles.textContainer}>
          <Animated.View style={[loadingStyles.textShort, animatedStyle]} />
          <Animated.View style={[loadingStyles.textLong, animatedStyle]} />
        </View>
      </View>
      <Animated.View style={[loadingStyles.media, animatedStyle]} />
      <View style={loadingStyles.footer}>
        <Animated.View style={[loadingStyles.textLong, animatedStyle]} />
        <Animated.View style={[loadingStyles.bar, animatedStyle]} />
      </View>
    </View>
  );
}

// Multiple loading placeholders
export function PostsLoadingPlaceholder({ count = 3 }: { count?: number }) {
  return (
    <View>
      {Array.from({ length: count }).map((_, index) => (
        <PostLoadingPlaceholder key={index} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  iconWrapper: {
    marginBottom: spacing.lg,
    position: 'relative',
  },
  iconGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primaryLight,
    opacity: 0.2,
    top: -18,
    left: -18,
  },
  icon: {
    fontSize: 64,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.lg,
    maxWidth: 280,
  },
  button: {
    minWidth: 160,
  },
});

const loadingStyles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    overflow: 'hidden',
    ...shadows.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
  },
  textContainer: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  textShort: {
    width: 100,
    height: 14,
    borderRadius: borderRadius.xs,
    backgroundColor: colors.surface,
    marginBottom: 6,
  },
  textLong: {
    width: 150,
    height: 12,
    borderRadius: borderRadius.xs,
    backgroundColor: colors.surface,
  },
  media: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  footer: {
    gap: spacing.sm,
  },
  bar: {
    width: '100%',
    height: 6,
    borderRadius: borderRadius.round,
    backgroundColor: colors.surface,
  },
});
