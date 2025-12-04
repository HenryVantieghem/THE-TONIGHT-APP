/**
 * Scena - Loading Dots Component
 * Gentle, pulsing loading indicator
 */

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withDelay,
  withSequence,
} from 'react-native-reanimated';
import { colors, durations } from '../theme';

interface LoadingDotsProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

const sizes = {
  small: 6,
  medium: 8,
  large: 10,
};

const gaps = {
  small: 4,
  medium: 6,
  large: 8,
};

export const LoadingDots: React.FC<LoadingDotsProps> = ({
  size = 'medium',
  color = colors.accent.primary,
}) => {
  const dotSize = sizes[size];
  const gap = gaps[size];

  return (
    <View style={styles.container}>
      {[0, 1, 2].map((index) => (
        <AnimatedDot
          key={index}
          delay={index * 150}
          size={dotSize}
          color={color}
          gap={gap}
        />
      ))}
    </View>
  );
};

interface AnimatedDotProps {
  delay: number;
  size: number;
  color: string;
  gap: number;
}

const AnimatedDot: React.FC<AnimatedDotProps> = ({
  delay,
  size,
  color,
  gap,
}) => {
  const opacity = useSharedValue(0.3);
  const scale = useSharedValue(1);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: durations.slow }),
          withTiming(0.3, { duration: durations.slow })
        ),
        -1,
        false
      )
    );

    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.2, { duration: durations.slow }),
          withTiming(1, { duration: durations.slow })
        ),
        -1,
        false
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          marginHorizontal: gap / 2,
        },
        animatedStyle,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default LoadingDots;
