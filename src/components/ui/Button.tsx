import React, { useCallback } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, shadows } from '../../constants/colors';
import { typography } from '../../constants/typography';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

// Custom spinner component
function LoadingSpinner({ color, size }: { color: string; size: number }) {
  return (
    <ActivityIndicator
      color={color}
      size={size < 20 ? 'small' : 'small'}
    />
  );
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  textStyle,
}: ButtonProps) {
  const scale = useSharedValue(1);
  const isDisabled = disabled || loading;

  const handlePressIn = useCallback(() => {
    if (isDisabled) return;
    scale.value = withSpring(0.97, {
      damping: 15,
      stiffness: 400,
    });
  }, [isDisabled, scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 400,
    });
  }, [scale]);

  const handlePress = useCallback(async () => {
    if (isDisabled) return;

    // Haptic feedback based on variant
    const hapticStyle = variant === 'danger'
      ? Haptics.ImpactFeedbackStyle.Heavy
      : Haptics.ImpactFeedbackStyle.Medium;

    await Haptics.impactAsync(hapticStyle);
    onPress();
  }, [isDisabled, variant, onPress]);

  const animatedStyle = useAnimatedStyle(() => {
    const shadowOpacity = interpolate(
      scale.value,
      [0.97, 1],
      [0.05, variant === 'primary' ? 0.4 : 0.1],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ scale: scale.value }],
      shadowOpacity,
    };
  });

  // Size configurations
  const sizeConfig: Record<ButtonSize, { height: number; paddingHorizontal: number; fontSize: number; iconSize: number }> = {
    sm: { height: 40, paddingHorizontal: 16, fontSize: typography.sizes.sm, iconSize: 16 },
    md: { height: 50, paddingHorizontal: 24, fontSize: typography.sizes.md, iconSize: 18 },
    lg: { height: 56, paddingHorizontal: 32, fontSize: typography.sizes.lg, iconSize: 20 },
  };

  // Ensure config is always defined with a fallback to 'md'
  const config = sizeConfig[size] ?? sizeConfig.md;
  const spinnerColor = variant === 'primary' || variant === 'danger'
    ? colors.white
    : colors.primary;

  // Get gradient colors for primary variant
  const gradientColors = variant === 'primary'
    ? colors.primaryGradient
    : variant === 'danger'
    ? [colors.error, '#DC2626'] as const
    : [colors.surface, colors.surface] as const;

  // Render button content
  const renderContent = () => (
    <View style={styles.contentContainer}>
      {loading ? (
        <LoadingSpinner color={spinnerColor} size={config.iconSize} />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <View style={styles.iconLeft}>{icon}</View>
          )}
          <Text
            style={[
              styles.text,
              {
                fontSize: config.fontSize,
                color: variant === 'primary' || variant === 'danger'
                  ? colors.white
                  : variant === 'ghost'
                  ? colors.primary
                  : colors.text,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <View style={styles.iconRight}>{icon}</View>
          )}
        </>
      )}
    </View>
  );

  // Primary and Danger use gradient backgrounds
  if (variant === 'primary' || variant === 'danger') {
    return (
      <AnimatedTouchable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        activeOpacity={1}
        style={[
          animatedStyle,
          fullWidth && styles.fullWidth,
          isDisabled && styles.disabled,
          variant === 'primary' && shadows.glow(colors.primary),
          variant === 'danger' && shadows.glow(colors.error),
          style,
        ]}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.gradient,
            {
              height: config.height,
              paddingHorizontal: config.paddingHorizontal,
            },
          ]}
        >
          {renderContent()}
        </LinearGradient>
      </AnimatedTouchable>
    );
  }

  // Secondary and Ghost variants
  return (
    <AnimatedTouchable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      activeOpacity={1}
      style={[
        styles.base,
        animatedStyle,
        {
          height: config.height,
          paddingHorizontal: config.paddingHorizontal,
        },
        variant === 'secondary' && styles.secondary,
        variant === 'ghost' && styles.ghost,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        variant === 'secondary' && shadows.sm,
        style,
      ]}
    >
      {renderContent()}
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    overflow: 'hidden',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    overflow: 'hidden',
  },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});
