/**
 * Scena - Glass Card Component
 * Liquid Glass effect with blur and translucency
 */

import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  Pressable,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, borderRadius, shadows, durations, easings } from '../theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: 'light' | 'medium' | 'strong';
  onPress?: () => void;
  pressable?: boolean;
  noPadding?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  intensity = 'light',
  onPress,
  pressable = false,
  noPadding = false,
}) => {
  const pressed = useSharedValue(0);

  const blurIntensity = {
    light: 40,
    medium: 60,
    strong: 80,
  }[intensity];

  const backgroundColor = {
    light: colors.glass.light,
    medium: colors.glass.medium,
    strong: colors.glass.dark,
  }[intensity];

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: interpolate(pressed.value, [0, 1], [1, 0.98]),
        },
      ],
      opacity: interpolate(pressed.value, [0, 1], [1, 0.95]),
    };
  });

  const handlePressIn = () => {
    if (pressable || onPress) {
      pressed.value = withTiming(1, { duration: durations.fast });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePressOut = () => {
    if (pressable || onPress) {
      pressed.value = withTiming(0, { duration: durations.normal });
    }
  };

  const content = (
    <View style={styles.innerContainer}>
      {/* Blur layer */}
      {Platform.OS === 'ios' ? (
        <BlurView
          intensity={blurIntensity}
          tint="light"
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: colors.glass.light },
          ]}
        />
      )}

      {/* Glass overlay with gradient effect */}
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor,
            borderWidth: 1,
            borderColor: colors.glass.border,
            borderRadius: borderRadius.card,
          },
        ]}
      />

      {/* Inner glow (top edge) */}
      <View style={styles.innerGlow} />

      {/* Content */}
      <View style={[styles.content, noPadding && styles.noPadding]}>
        {children}
      </View>
    </View>
  );

  if (onPress || pressable) {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.container, animatedStyle, style]}
      >
        {content}
      </AnimatedPressable>
    );
  }

  return <View style={[styles.container, style]}>{content}</View>;
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.card,
    overflow: 'hidden',
    ...shadows.soft,
  },
  innerContainer: {
    borderRadius: borderRadius.card,
    overflow: 'hidden',
  },
  innerGlow: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    height: 1,
    backgroundColor: colors.glass.innerGlow,
    borderRadius: 1,
  },
  content: {
    padding: 20,
  },
  noPadding: {
    padding: 0,
  },
});

export default GlassCard;
