/**
 * Scena - Timer Dots Component
 * Peaceful visual timer - no anxiety-inducing countdown
 * Just gentle dots that fill as time passes
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { colors, durations } from '../theme';

interface TimerDotsProps {
  createdAt: Date;
  expiresAt: Date;
  totalDots?: number;
  size?: 'small' | 'medium';
}

export const TimerDots: React.FC<TimerDotsProps> = ({
  createdAt,
  expiresAt,
  totalDots = 6,
  size = 'small',
}) => {
  const [filledCount, setFilledCount] = useState(() => {
    const now = new Date();
    const totalDuration = expiresAt.getTime() - createdAt.getTime();
    const elapsed = now.getTime() - createdAt.getTime();
    const progress = Math.min(Math.max(elapsed / totalDuration, 0), 1);
    return Math.round((1 - progress) * totalDots);
  });

  useEffect(() => {
    // Update timer every 10 seconds
    const interval = setInterval(() => {
      const now = new Date();
      const totalDuration = expiresAt.getTime() - createdAt.getTime();
      const elapsed = now.getTime() - createdAt.getTime();
      const progress = Math.min(Math.max(elapsed / totalDuration, 0), 1);
      const newFilledCount = Math.round((1 - progress) * totalDots);
      
      setFilledCount(newFilledCount);
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [createdAt, expiresAt, totalDots]);

  const dotSize = size === 'small' ? 6 : 8;
  const dotSpacing = size === 'small' ? 6 : 8;

  return (
    <View style={styles.container}>
      {Array.from({ length: totalDots }).map((_, index) => (
        <AnimatedDot
          key={index}
          isFilled={index < filledCount}
          delay={index * 50}
          size={dotSize}
          spacing={dotSpacing}
          isLastFew={filledCount <= 2}
        />
      ))}
    </View>
  );
};

interface AnimatedDotProps {
  isFilled: boolean;
  delay: number;
  size: number;
  spacing: number;
  isLastFew: boolean;
}

const AnimatedDot: React.FC<AnimatedDotProps> = ({
  isFilled,
  delay,
  size,
  spacing,
  isLastFew,
}) => {
  const fillValue = useSharedValue(isFilled ? 1 : 0);

  useEffect(() => {
    fillValue.value = withDelay(
      delay,
      withTiming(isFilled ? 1 : 0, { duration: durations.drift })
    );
  }, [isFilled]);

  const animatedStyle = useAnimatedStyle(() => {
    const filledColor = isLastFew ? colors.timer.urgent : colors.timer.filled;
    const emptyColor = colors.timer.empty;

    return {
      backgroundColor:
        fillValue.value === 1 ? filledColor : emptyColor,
      transform: [
        {
          scale: 0.9 + fillValue.value * 0.1,
        },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        styles.dot,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          marginHorizontal: spacing / 2,
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
  dot: {
    // Base styles applied inline
  },
});

export default TimerDots;
