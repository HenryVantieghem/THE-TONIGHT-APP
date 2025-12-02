import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, shadows } from '../../constants/colors';
import { borderRadius, spacing } from '../../constants/config';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: ViewStyle;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'level1' | 'level2' | 'level3';
  variant?: 'primary' | 'secondary' | 'white';
}

const paddingMap = {
  none: 0,
  sm: spacing.sm,
  md: spacing.md,
  lg: spacing.lg,
} as const;

const shadowMap = {
  none: {},
  level1: shadows.level1,
  level2: shadows.level2,
  level3: shadows.level3,
} as const;

const variantBackgrounds = {
  primary: colors.backgroundPrimary,
  secondary: colors.backgroundSecondary,
  white: colors.white,
} as const;

export function Card({
  children,
  onPress,
  onLongPress,
  style,
  padding = 'md',
  shadow = 'level2',
  variant = 'secondary',
}: CardProps) {
  const pressScale = useSharedValue(1);

  const handlePressIn = () => {
    if (onPress || onLongPress) {
      pressScale.value = withSpring(0.98, {
        damping: 15,
        stiffness: 150,
      });
    }
  };

  const handlePressOut = () => {
    pressScale.value = withSpring(1, {
      damping: 15,
      stiffness: 150,
    });
  };

  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const handleLongPress = () => {
    if (onLongPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onLongPress();
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  const cardStyles: ViewStyle[] = [
    styles.card,
    {
      backgroundColor: variantBackgrounds[variant],
      padding: paddingMap[padding],
    },
    shadowMap[shadow],
    style,
  ];

  if (onPress || onLongPress) {
    return (
      <AnimatedTouchable
        style={[cardStyles, animatedStyle]}
        onPress={handlePress}
        onLongPress={handleLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        {children}
      </AnimatedTouchable>
    );
  }

  return <View style={cardStyles}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg, // 16px per spec
    overflow: 'hidden',
  },
});
