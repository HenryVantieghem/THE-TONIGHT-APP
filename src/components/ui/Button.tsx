import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  View,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../../constants/colors';
import { textStyles } from '../../constants/typography';
import { borderRadius, spacing, hitSlop, animations } from '../../constants/config';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  fullWidth = false,
  size = 'md',
  icon,
  iconPosition = 'left',
}: ButtonProps) {
  const pressScale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const handlePress = () => {
    if (!disabled && !loading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const handlePressIn = () => {
    if (!disabled && !loading) {
      pressScale.value = withSpring(0.97, {
        damping: 15,
        stiffness: 150,
      });
      opacity.value = withTiming(0.9, { duration: animations.fast });
    }
  };

  const handlePressOut = () => {
    pressScale.value = withSpring(1, {
      damping: 15,
      stiffness: 150,
    });
    opacity.value = withTiming(1, { duration: animations.fast });
  };

  const isDisabled = disabled || loading;

  // Size configurations per spec
  const sizeConfig = {
    sm: { height: 40, paddingHorizontal: 24, fontSize: textStyles.callout.fontSize },
    md: { height: 48, paddingHorizontal: 32, fontSize: textStyles.headline.fontSize },
    lg: { height: 56, paddingHorizontal: 32, fontSize: textStyles.headline.fontSize },
  };

  const config = sizeConfig[size];

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
    opacity: opacity.value,
  }));

  // Variant styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: isDisabled ? colors.textTertiary : colors.accent,
          shadow: isDisabled ? undefined : shadows.accentGlow,
        };
      case 'secondary':
        return {
          backgroundColor: `${colors.accent}1A`, // 10% opacity
          shadow: undefined,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          shadow: undefined,
        };
      case 'destructive':
        return {
          backgroundColor: isDisabled ? colors.textTertiary : colors.error,
          shadow: undefined,
        };
      default:
        return {
          backgroundColor: colors.accent,
          shadow: shadows.accentGlow,
        };
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary':
      case 'destructive':
        return colors.textInverse;
      case 'secondary':
        return colors.accent;
      case 'ghost':
        return colors.textSecondary;
      default:
        return colors.textInverse;
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <AnimatedTouchable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      activeOpacity={1}
      hitSlop={hitSlop.medium}
      style={[
        styles.button,
        {
          height: config.height,
          paddingHorizontal: config.paddingHorizontal,
          borderRadius: borderRadius.full,
          backgroundColor: variantStyles.backgroundColor,
          ...variantStyles.shadow,
        },
        fullWidth && styles.fullWidth,
        animatedStyle,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'destructive' ? colors.textInverse : colors.accent}
          size="small"
        />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' && (
            <Ionicons
              name={icon}
              size={20}
              color={getTextColor()}
              style={styles.iconLeft}
            />
          )}
          <Text
            style={[
              textStyles.headline,
              {
                fontSize: config.fontSize,
                color: getTextColor(),
              },
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <Ionicons
              name={icon}
              size={20}
              color={getTextColor()}
              style={styles.iconRight}
            />
          )}
        </View>
      )}
    </AnimatedTouchable>
  );
}

// Icon Button component (44x44pt minimum per spec)
interface IconButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  size?: number;
  color?: string;
  disabled?: boolean;
  style?: ViewStyle;
}

export function IconButton({
  icon,
  onPress,
  size = 24,
  color = colors.textPrimary,
  disabled = false,
  style,
}: IconButtonProps) {
  const pressScale = useSharedValue(1);

  const handlePressIn = () => {
    if (!disabled) {
      pressScale.value = withSpring(0.9, {
        damping: 15,
        stiffness: 150,
      });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePressOut = () => {
    pressScale.value = withSpring(1, {
      damping: 15,
      stiffness: 150,
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  // Ensure minimum 44pt tap target
  const minSize = Math.max(44, size + 20);

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={1}
      hitSlop={hitSlop.icon}
      style={[
        styles.iconButton,
        {
          width: minSize,
          height: minSize,
          borderRadius: minSize / 2,
          opacity: disabled ? 0.5 : 1,
        },
        animatedStyle,
        style,
      ]}
    >
      <Ionicons name={icon} size={size} color={color} />
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: spacing.xs,
  },
  iconRight: {
    marginLeft: spacing.xs,
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
});
