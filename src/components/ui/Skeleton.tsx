import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { colors } from '../../constants/colors';
import { borderRadius as br } from '../../constants/config';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
  variant?: 'default' | 'circle' | 'text' | 'media';
}

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = br.sm,
  style,
  variant = 'default',
}: SkeletonProps) {
  const shimmerTranslate = useSharedValue(-1);

  // Continuous shimmer animation
  useEffect(() => {
    shimmerTranslate.value = withRepeat(
      withTiming(1, {
        duration: 1500,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      false
    );
  }, [shimmerTranslate]);

  const animatedGradientStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmerTranslate.value,
      [-1, 1],
      [-SCREEN_WIDTH, SCREEN_WIDTH]
    );

    return {
      transform: [{ translateX }],
    };
  });

  // Variant-specific configurations
  const variantStyles = {
    default: {
      width,
      height,
      borderRadius,
    },
    circle: {
      width: height,
      height,
      borderRadius: height / 2,
    },
    text: {
      width,
      height: 14,
      borderRadius: br.xs,
    },
    media: {
      width: '100%' as const,
      height: 200,
      borderRadius: br.md,
    },
  };

  const variantStyle = variantStyles[variant];

  return (
    <View
      style={[
        styles.container,
        variantStyle,
        style,
      ]}
    >
      <AnimatedLinearGradient
        colors={[
          colors.surface,
          colors.surfaceSecondary,
          colors.surface,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.shimmer, animatedGradientStyle]}
      />
    </View>
  );
}

// Preset skeleton shapes for common use cases
export function SkeletonAvatar({ size = 40 }: { size?: number }) {
  return <Skeleton variant="circle" height={size} />;
}

export function SkeletonText({
  width = '100%',
  lines = 1,
  spacing = 8,
}: {
  width?: number | string;
  lines?: number;
  spacing?: number;
}) {
  return (
    <View style={{ gap: spacing }}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          width={index === lines - 1 && lines > 1 ? '60%' : width}
        />
      ))}
    </View>
  );
}

export function SkeletonMedia({ height = 200 }: { height?: number }) {
  return <Skeleton variant="media" height={height} />;
}

// Row skeleton for header-like content
export function SkeletonRow({
  avatarSize = 40,
  textLines = 2,
  textWidth = 120,
}: {
  avatarSize?: number;
  textLines?: number;
  textWidth?: number;
}) {
  return (
    <View style={styles.row}>
      <SkeletonAvatar size={avatarSize} />
      <View style={styles.rowText}>
        <Skeleton variant="text" width={textWidth} />
        {textLines > 1 && (
          <Skeleton
            variant="text"
            width={textWidth * 0.7}
            style={{ marginTop: 6 }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
    width: SCREEN_WIDTH * 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowText: {
    marginLeft: 12,
    flex: 1,
  },
});
