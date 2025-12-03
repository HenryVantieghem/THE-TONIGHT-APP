import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/theme';

interface HeartAnimationProps {
  trigger: boolean;
  size?: number;
  color?: string;
}

export function HeartAnimation({
  trigger,
  size = 64,
  color = colors.accentRed,
}: HeartAnimationProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (trigger) {
      // Reset
      scale.value = 0;
      opacity.value = 0;

      // Animate in
      scale.value = withSequence(
        withSpring(1.3, { damping: 8, stiffness: 200 }),
        withTiming(1, { duration: 200 })
      );
      opacity.value = withSequence(
        withTiming(1, { duration: 100 }),
        withDelay(600, withTiming(0, { duration: 300, easing: Easing.out(Easing.ease) }))
      );
    }
  }, [trigger, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]} pointerEvents="none">
      <Ionicons name="heart" size={size} color={color} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignSelf: 'center',
    top: '45%',
  },
});

