// GlassPill - Floating pill-shaped controls
// Part of Apple's Liquid Glass design language
// Not edge-anchored, emerges from tap points

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import {
  liquidGlass,
  glassShadows,
  glassPill,
  glassMotion,
  glassColors,
  GlassPillSize,
} from '../../constants/liquidGlass';
import { colors } from '../../constants/colors';

interface GlassPillProps {
  // Content
  label?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  // Sizing
  size?: GlassPillSize;
  fullWidth?: boolean;
  // Variants
  variant?: 'glass' | 'solid' | 'gradient' | 'outline';
  // Colors
  accentColor?: string;
  gradientColors?: readonly [string, string];
  // Interaction
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  // Visual
  active?: boolean;
  withGlow?: boolean;
  style?: ViewStyle;
  labelStyle?: TextStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function GlassPill({
  label,
  icon,
  iconPosition = 'left',
  size = 'standard',
  fullWidth = false,
  variant = 'glass',
  accentColor = colors.primary,
  gradientColors,
  onPress,
  onLongPress,
  disabled = false,
  loading = false,
  active = false,
  withGlow = false,
  style,
  labelStyle,
}: GlassPillProps) {
  // Animation values
  const pressProgress = useSharedValue(0);
  const glowOpacity = useSharedValue(active ? 0.4 : 0);

  // Pill dimensions based on size
  const getPillDimensions = () => {
    const config = glassPill[size];
    if ('size' in config) {
      return {
        width: config.size,
        height: config.size,
        borderRadius: config.borderRadius,
        paddingHorizontal: 0,
      };
    }
    return {
      height: config.height,
      minWidth: fullWidth ? undefined : config.minWidth,
      borderRadius: config.borderRadius,
      paddingHorizontal: config.paddingHorizontal,
    };
  };

  const dimensions = getPillDimensions();

  // Animated styles
  const animatedPillStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      pressProgress.value,
      [0, 1],
      [1, glassMotion.pressScale.moderate],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ scale }],
    };
  });

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  // Handlers
  const handlePressIn = () => {
    if (!disabled && !loading) {
      pressProgress.value = withSpring(1, glassMotion.spring.snappy);
    }
  };

  const handlePressOut = () => {
    pressProgress.value = withSpring(0, glassMotion.spring.smooth);
  };

  const handlePress = () => {
    if (!disabled && !loading && onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onPress();
    }
  };

  const handleLongPress = () => {
    if (!disabled && !loading && onLongPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      onLongPress();
    }
  };

  // Determine background based on variant
  const renderBackground = () => {
    switch (variant) {
      case 'gradient':
        return (
          <LinearGradient
            colors={gradientColors || colors.primaryGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        );
      case 'solid':
        return (
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: accentColor },
            ]}
          />
        );
      case 'outline':
        return (
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: 'transparent',
                borderWidth: 1.5,
                borderColor: accentColor,
                borderRadius: dimensions.borderRadius,
              },
            ]}
          />
        );
      case 'glass':
      default:
        return (
          <>
            {Platform.OS === 'ios' ? (
              <BlurView
                intensity={liquidGlass.blur.regular}
                tint="light"
                style={StyleSheet.absoluteFill}
              />
            ) : null}
            <View
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor: active
                    ? `${accentColor}20`
                    : liquidGlass.material.primary.backgroundColor,
                },
              ]}
            />
            {/* Inner top glow */}
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.4)', 'transparent']}
              style={[StyleSheet.absoluteFill, { height: '50%' }]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
            />
          </>
        );
    }
  };

  // Text color based on variant
  const getTextColor = () => {
    if (disabled) return glassColors.text.tertiary;
    switch (variant) {
      case 'gradient':
      case 'solid':
        return '#FFFFFF';
      case 'outline':
        return accentColor;
      case 'glass':
      default:
        return active ? accentColor : glassColors.text.primary;
    }
  };

  // Shadow based on variant
  const getShadowStyle = () => {
    if (disabled) return {};
    if (withGlow || variant === 'gradient' || variant === 'solid') {
      return glassShadows.glow(accentColor, 0.3);
    }
    return glassShadows.key;
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onLongPress={handleLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[
        styles.pill,
        dimensions,
        fullWidth && styles.fullWidth,
        getShadowStyle(),
        disabled && styles.disabled,
        animatedPillStyle,
        style,
      ]}
    >
      {/* Background */}
      {renderBackground()}

      {/* Glow overlay for active state */}
      {(active || withGlow) && (
        <Animated.View
          style={[
            styles.glowOverlay,
            { backgroundColor: accentColor },
            animatedGlowStyle,
          ]}
        />
      )}

      {/* Border */}
      {variant === 'glass' && (
        <View
          style={[
            styles.border,
            {
              borderRadius: dimensions.borderRadius,
              borderColor: active
                ? `${accentColor}40`
                : liquidGlass.border.color,
            },
          ]}
        />
      )}

      {/* Content */}
      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingIndicator}>
            <View style={[styles.loadingDot, { backgroundColor: getTextColor() }]} />
          </View>
        ) : (
          <>
            {icon && iconPosition === 'left' && (
              <View style={styles.iconLeft}>{icon}</View>
            )}
            {label && (
              <Text
                style={[
                  styles.label,
                  { color: getTextColor() },
                  labelStyle,
                ]}
                numberOfLines={1}
              >
                {label}
              </Text>
            )}
            {icon && iconPosition === 'right' && (
              <View style={styles.iconRight}>{icon}</View>
            )}
          </>
        )}
      </View>
    </AnimatedPressable>
  );
}

// Icon-only pill button
export function GlassPillIcon({
  icon,
  size = 'icon',
  ...props
}: Omit<GlassPillProps, 'label' | 'iconPosition'> & { icon: React.ReactNode }) {
  return <GlassPill {...props} icon={icon} size={size} />;
}

// Group of pills (horizontal row)
export function GlassPillGroup({
  children,
  gap = 10,
  style,
}: {
  children: React.ReactNode;
  gap?: number;
  style?: ViewStyle;
}) {
  return (
    <View style={[styles.pillGroup, { gap }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  border: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: liquidGlass.border.width,
    pointerEvents: 'none',
  },
  glowOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.15,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  loadingIndicator: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.8,
  },
  pillGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

