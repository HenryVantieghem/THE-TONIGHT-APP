import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { colors } from '../../constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const PARTICLE_COUNT = 30;
const COLORS = [colors.primary, colors.accentRed, colors.accentGreen, colors.accentBlue, colors.accentPurple];

interface ConfettiProps {
  active: boolean;
  duration?: number;
}

function ConfettiParticle({ delay, color, startX }: { delay: number; color: string; startX: number }) {
  const translateY = useSharedValue(-50);
  const translateX = useSharedValue(0);
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    const randomX = (Math.random() - 0.5) * 200;
    const randomRotation = Math.random() * 720 - 360;

    translateY.value = withDelay(
      delay,
      withTiming(SCREEN_HEIGHT + 100, {
        duration: 2000,
        easing: Easing.inOut(Easing.ease),
      })
    );
    translateX.value = withDelay(
      delay,
      withTiming(randomX, {
        duration: 2000,
        easing: Easing.out(Easing.ease),
      })
    );
    rotation.value = withDelay(
      delay,
      withRepeat(
        withTiming(randomRotation, {
          duration: 1000,
          easing: Easing.linear,
        }),
        -1,
        false
      )
    );
    opacity.value = withDelay(
      delay + 1500,
      withTiming(0, {
        duration: 500,
        easing: Easing.out(Easing.ease),
      })
    );

    return () => {
      cancelAnimation(translateY);
      cancelAnimation(translateX);
      cancelAnimation(rotation);
      cancelAnimation(opacity);
    };
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: startX + translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          backgroundColor: color,
        },
        animatedStyle,
      ]}
    />
  );
}

export function Confetti({ active, duration = 2000 }: ConfettiProps) {
  if (!active) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {Array.from({ length: PARTICLE_COUNT }).map((_, index) => {
        const delay = (index / PARTICLE_COUNT) * 500;
        const color = COLORS[index % COLORS.length];
        const startX = (index / PARTICLE_COUNT) * SCREEN_WIDTH;
        return <ConfettiParticle key={index} delay={delay} color={color} startX={startX} />;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

