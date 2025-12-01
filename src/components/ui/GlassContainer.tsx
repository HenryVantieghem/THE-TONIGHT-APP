// GlassContainer - Core Liquid Glass component
// Translucent material that reflects and refracts surroundings
// with multi-layered shadows and dynamic adaptation

import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  Platform,
  TouchableOpacity,
  Pressable,
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
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import {
  liquidGlass,
  glassShadows,
  glassMotion,
  glassGradients,
  glassColors,
  GlassMaterialVariant,
  GlassBlurIntensity,
} from '../../constants/liquidGlass';
import { borderRadius } from '../../constants/config';

interface GlassContainerProps {
  children: React.ReactNode;
  variant?: GlassMaterialVariant;
  blur?: GlassBlurIntensity;
  borderRadius?: number;
  style?: ViewStyle;
  // Interaction
  onPress?: () => void;
  onLongPress?: () => void;
  activeOpacity?: number;
  // Visual options
  withBorder?: boolean;
  withInnerGlow?: boolean;
  withShadow?: boolean;
  shadowColor?: string;
  // Tint gradient overlay
  tint?: keyof typeof glassGradients.tints;
  // Animation
  animated?: boolean;
  parallaxEnabled?: boolean;
}

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function GlassContainer({
  children,
  variant = 'primary',
  blur = 'regular',
  borderRadius: customBorderRadius = 20,
  style,
  onPress,
  onLongPress,
  activeOpacity = 0.95,
  withBorder = true,
  withInnerGlow = true,
  withShadow = true,
  shadowColor,
  tint,
  animated = true,
  parallaxEnabled = false,
}: GlassContainerProps) {
  const material = liquidGlass.material[variant];
  const blurIntensity = liquidGlass.blur[blur];
  
  // Animation values
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const pressProgress = useSharedValue(0);

  // Press animation style
  const animatedContainerStyle = useAnimatedStyle(() => {
    const scaleValue = interpolate(
      pressProgress.value,
      [0, 1],
      [1, glassMotion.pressScale.subtle],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ scale: animated ? scaleValue : 1 }],
      opacity: opacity.value,
    };
  });

  // Inner glow animation (subtle pulse)
  const innerGlowStyle = useAnimatedStyle(() => {
    const glowOpacity = interpolate(
      pressProgress.value,
      [0, 1],
      [0.35, 0.5],
      Extrapolation.CLAMP
    );

    return {
      opacity: glowOpacity,
    };
  });

  const handlePressIn = () => {
    if (animated && (onPress || onLongPress)) {
      pressProgress.value = withSpring(1, glassMotion.spring.snappy);
    }
  };

  const handlePressOut = () => {
    if (animated) {
      pressProgress.value = withSpring(0, glassMotion.spring.smooth);
    }
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

  // Shadow style based on variant and custom color
  const shadowStyle = withShadow
    ? shadowColor
      ? glassShadows.glow(shadowColor)
      : variant === 'elevated'
      ? glassShadows.floating
      : glassShadows.key
    : {};

  const containerContent = (
    <View style={[styles.container, { borderRadius: customBorderRadius }]}>
      {/* Blur background */}
      {Platform.OS === 'ios' ? (
        <BlurView
          intensity={blurIntensity}
          tint={variant === 'dark' ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
      ) : (
        // Android fallback with semi-transparent background
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: material.backgroundColor },
          ]}
        />
      )}

      {/* Background color layer */}
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: material.backgroundColor },
        ]}
      />

      {/* Tint gradient overlay */}
      {tint && (
        <LinearGradient
          colors={glassGradients.tints[tint]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      )}

      {/* Inner glow highlight (top edge) */}
      {withInnerGlow && (
        <Animated.View style={[styles.innerGlow, innerGlowStyle]}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.5)', 'transparent']}
            style={styles.innerGlowGradient}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 0.5 }}
          />
        </Animated.View>
      )}

      {/* Border */}
      {withBorder && (
        <View
          style={[
            styles.border,
            {
              borderRadius: customBorderRadius,
              borderColor:
                variant === 'dark'
                  ? liquidGlass.border.colorDark
                  : liquidGlass.border.color,
            },
          ]}
        />
      )}

      {/* Content */}
      <View style={styles.content}>{children}</View>
    </View>
  );

  // If interactive, wrap in Pressable
  if (onPress || onLongPress) {
    return (
      <AnimatedPressable
        onPress={handlePress}
        onLongPress={handleLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.wrapper,
          { borderRadius: customBorderRadius },
          shadowStyle,
          animatedContainerStyle,
          style,
        ]}
      >
        {containerContent}
      </AnimatedPressable>
    );
  }

  // Non-interactive container
  return (
    <Animated.View
      style={[
        styles.wrapper,
        { borderRadius: customBorderRadius },
        shadowStyle,
        animatedContainerStyle,
        style,
      ]}
    >
      {containerContent}
    </Animated.View>
  );
}

// Convenience wrapper for dark variant
export function GlassContainerDark(
  props: Omit<GlassContainerProps, 'variant'>
) {
  return <GlassContainer {...props} variant="dark" />;
}

// Convenience wrapper for elevated variant
export function GlassContainerElevated(
  props: Omit<GlassContainerProps, 'variant'>
) {
  return <GlassContainer {...props} variant="elevated" />;
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: 'hidden',
  },
  container: {
    overflow: 'hidden',
  },
  border: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: liquidGlass.border.width,
    pointerEvents: 'none',
  },
  innerGlow: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
  },
  innerGlowGradient: {
    height: '50%',
    width: '100%',
  },
  content: {
    flex: 1,
  },
});

