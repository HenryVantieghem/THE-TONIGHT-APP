/**
 * Scena - Glass Button Component
 * Gentle, pressable button with liquid glass effect
 */

import React from 'react';
import {
  Text,
  StyleSheet,
  Pressable,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, typography, borderRadius, shadows, durations } from '../theme';

interface GlassButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const GlassButton: React.FC<GlassButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: interpolate(pressed.value, [0, 1], [1, 0.97]),
        },
      ],
      opacity: interpolate(pressed.value, [0, 1], [1, 0.9]),
    };
  });

  const handlePressIn = () => {
    if (!disabled) {
      pressed.value = withTiming(1, { duration: 100 });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePressOut = () => {
    pressed.value = withTiming(0, { duration: durations.normal });
  };

  const handlePress = () => {
    if (!disabled) {
      onPress();
    }
  };

  const sizeStyles = {
    small: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      fontSize: typography.sizes.sm,
    },
    medium: {
      paddingVertical: 14,
      paddingHorizontal: 28,
      fontSize: typography.sizes.base,
    },
    large: {
      paddingVertical: 18,
      paddingHorizontal: 36,
      fontSize: typography.sizes.md,
    },
  };

  const variantStyles = {
    primary: {
      backgroundColor: colors.glass.light,
      borderColor: colors.glass.border,
      textColor: colors.text.primary,
    },
    secondary: {
      backgroundColor: 'transparent',
      borderColor: colors.glass.border,
      textColor: colors.text.secondary,
    },
    ghost: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      textColor: colors.text.secondary,
    },
  };

  const currentVariant = variantStyles[variant];
  const currentSize = sizeStyles[size];

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[
        styles.container,
        {
          paddingVertical: currentSize.paddingVertical,
          paddingHorizontal: currentSize.paddingHorizontal,
          borderColor: currentVariant.borderColor,
          opacity: disabled ? 0.5 : 1,
        },
        fullWidth && styles.fullWidth,
        animatedStyle,
        style,
      ]}
    >
      {/* Background blur (iOS only) */}
      {Platform.OS === 'ios' && variant === 'primary' && (
        <BlurView
          intensity={50}
          tint="light"
          style={StyleSheet.absoluteFill}
        />
      )}

      {/* Background overlay */}
      {variant === 'primary' && (
        <LinearGradient
          colors={[
            'rgba(255, 255, 255, 0.85)',
            'rgba(255, 255, 255, 0.7)',
          ]}
          style={StyleSheet.absoluteFill}
        />
      )}

      {/* Inner glow */}
      {variant === 'primary' && (
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.5)', 'transparent']}
          style={styles.innerGlow}
        />
      )}

      <Text
        style={[
          styles.text,
          {
            fontSize: currentSize.fontSize,
            color: currentVariant.textColor,
          },
          textStyle,
        ]}
      >
        {title}
      </Text>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.button,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...shadows.soft,
  },
  fullWidth: {
    width: '100%',
  },
  innerGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    borderTopLeftRadius: borderRadius.button,
    borderTopRightRadius: borderRadius.button,
  },
  text: {
    fontWeight: typography.weights.medium,
    letterSpacing: typography.letterSpacing.wide,
    textTransform: 'lowercase',
  },
});

export default GlassButton;
