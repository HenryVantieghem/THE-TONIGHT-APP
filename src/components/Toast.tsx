/**
 * Scena - Toast Component
 * Gentle, non-intrusive notifications
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withDelay,
  runOnJS,
  cancelAnimation,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, durations } from '../theme';

interface ToastProps {
  message: string;
  type?: 'success' | 'info' | 'warning';
  visible: boolean;
  onHide: () => void;
  duration?: number;
}

const iconMap = {
  success: 'checkmark-circle-outline',
  info: 'information-circle-outline',
  warning: 'alert-circle-outline',
} as const;

const colorMap = {
  success: colors.accent.success,
  info: colors.accent.primary,
  warning: colors.accent.warning,
};

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  visible,
  onHide,
  duration = 2500,
}) => {
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Slide in
      translateY.value = withTiming(0, { duration: durations.normal });
      opacity.value = withTiming(1, { duration: durations.normal });

      // Auto hide after duration
      translateY.value = withDelay(
        duration,
        withTiming(-100, { duration: durations.normal }, () => {
          runOnJS(onHide)();
        })
      );
      opacity.value = withDelay(
        duration,
        withTiming(0, { duration: durations.normal })
      );
    } else {
      translateY.value = -100;
      opacity.value = 0;
    }

    // Cleanup animations on unmount
    return () => {
      cancelAnimation(translateY);
      cancelAnimation(opacity);
    };
  }, [visible, duration, onHide, translateY, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {Platform.OS === 'ios' && (
        <BlurView
          intensity={80}
          tint="light"
          style={StyleSheet.absoluteFill}
        />
      )}
      <View style={styles.content}>
        <Ionicons
          name={iconMap[type]}
          size={20}
          color={colorMap[type]}
          style={styles.icon}
        />
        <Text style={styles.message}>{message}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: spacing.screenHorizontal,
    right: spacing.screenHorizontal,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: Platform.OS === 'ios' ? 'transparent' : colors.glass.light,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: Platform.OS === 'ios' ? 'rgba(255, 255, 255, 0.7)' : 'transparent',
  },
  icon: {
    marginRight: spacing.sm,
  },
  message: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    textTransform: 'lowercase',
  },
});

export default Toast;
