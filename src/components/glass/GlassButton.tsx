import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, radius, shadows } from '../../constants/theme';

interface GlassButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'glass' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function GlassButton({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  style,
  textStyle,
}: GlassButtonProps) {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePressOut = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    }
  };

  const handlePress = () => {
    if (!disabled && !loading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onPress();
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Size configurations
  const sizeConfig = {
    sm: {
      height: 36,
      paddingHorizontal: spacing.md,
      fontSize: typography.sizes.sm,
    },
    md: {
      height: 44,
      paddingHorizontal: spacing.lg,
      fontSize: typography.sizes.md,
    },
    lg: {
      height: 56,
      paddingHorizontal: spacing.xl,
      fontSize: typography.sizes.lg,
    },
    xl: {
      height: 64,
      paddingHorizontal: spacing['2xl'],
      fontSize: typography.sizes.xl,
    },
  };

  // Variant configurations
  const variantConfig = {
    primary: {
      backgroundColor: colors.primary,
      textColor: colors.textInverse,
      borderColor: colors.primary,
      shadow: shadows.glow,
    },
    secondary: {
      backgroundColor: colors.backgroundSecondary,
      textColor: colors.text,
      borderColor: colors.border,
      shadow: shadows.md,
    },
    glass: {
      backgroundColor: colors.glass,
      textColor: colors.text,
      borderColor: colors.border,
      shadow: shadows.md,
    },
    ghost: {
      backgroundColor: 'transparent',
      textColor: colors.text,
      borderColor: 'transparent',
      shadow: shadows.none,
    },
  };

  const sizeStyle = sizeConfig[size];
  const variantStyle = variantConfig[variant];
  const isDisabled = disabled || loading;

  return (
    <AnimatedTouchable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      disabled={isDisabled}
      style={[
        styles.container,
        {
          height: sizeStyle.height,
          paddingHorizontal: sizeStyle.paddingHorizontal,
          backgroundColor: variantStyle.backgroundColor,
          borderColor: variantStyle.borderColor,
        },
        variantStyle.shadow,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        animatedStyle,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variantStyle.textColor} />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.text,
              {
                fontSize: sizeStyle.fontSize,
                color: variantStyle.textColor,
                fontWeight: typography.weights.semibold,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.full,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    textAlign: 'center',
  },
});

