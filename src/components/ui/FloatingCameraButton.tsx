import React, { useEffect } from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle, Text, View, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors } from '../../constants/colors';
import {
  liquidGlass,
  glassShadows,
  glassMotion,
  glassPill,
  glassLayout,
} from '../../constants/liquidGlass';

interface FloatingCameraButtonProps {
  onPress: () => void;
  style?: ViewStyle;
  size?: 'sm' | 'md' | 'lg';
  // Liquid Glass options
  variant?: 'gradient' | 'glass' | 'glassDark';
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function FloatingCameraButton({
  onPress,
  style,
  size = 'md',
  variant = 'gradient',
}: FloatingCameraButtonProps) {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const glowOpacity = useSharedValue(0.4);
  const pressProgress = useSharedValue(0);

  // Size configurations - pill-shaped FAB
  const sizeConfig = {
    sm: { width: 56, height: 56, iconSize: 24, borderRadius: 28 },
    md: { width: 64, height: 64, iconSize: 28, borderRadius: 32 },
    lg: { width: 72, height: 72, iconSize: 32, borderRadius: 36 },
  };

  const config = sizeConfig[size];

  // Subtle floating animation - makes it feel alive
  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-4, {
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(4, {
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
        })
      ),
      -1,
      true
    );

    // Subtle glow pulse for glass effect
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 2500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, [translateY, glowOpacity]);

  const animatedContainerStyle = useAnimatedStyle(() => {
    const scaleValue = interpolate(
      pressProgress.value,
      [0, 1],
      [1, glassMotion.pressScale.prominent],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { scale: scaleValue },
        { translateY: translateY.value },
      ],
    };
  });

  const animatedGlowStyle = useAnimatedStyle(() => ({
    shadowOpacity: glowOpacity.value,
  }));

  const handlePressIn = () => {
    pressProgress.value = withSpring(1, glassMotion.spring.snappy);
  };

  const handlePressOut = () => {
    pressProgress.value = withSpring(0, glassMotion.spring.smooth);
  };

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  // Render button background based on variant
  const renderBackground = () => {
    switch (variant) {
      case 'glass':
        return (
          <View style={[StyleSheet.absoluteFill, { borderRadius: config.borderRadius, overflow: 'hidden' }]}>
            {Platform.OS === 'ios' ? (
              <BlurView
                intensity={liquidGlass.blur.prominent}
                tint="light"
                style={StyleSheet.absoluteFill}
              />
            ) : null}
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: liquidGlass.material.elevated.backgroundColor },
              ]}
            />
            {/* Inner glow */}
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.5)', 'transparent']}
              style={[StyleSheet.absoluteFill, { height: '50%' }]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
            />
            {/* Border */}
            <View
              style={[
                styles.glassBorder,
                { borderRadius: config.borderRadius },
              ]}
            />
          </View>
        );

      case 'glassDark':
        return (
          <View style={[StyleSheet.absoluteFill, { borderRadius: config.borderRadius, overflow: 'hidden' }]}>
            {Platform.OS === 'ios' ? (
              <BlurView
                intensity={liquidGlass.blur.prominent}
                tint="dark"
                style={StyleSheet.absoluteFill}
              />
            ) : null}
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: liquidGlass.material.dark.backgroundColor },
              ]}
            />
            {/* Inner glow */}
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.2)', 'transparent']}
              style={[StyleSheet.absoluteFill, { height: '50%' }]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
            />
            {/* Border */}
            <View
              style={[
                styles.glassBorderDark,
                { borderRadius: config.borderRadius },
              ]}
            />
          </View>
        );

      case 'gradient':
      default:
        return (
          <LinearGradient
            colors={colors.primaryGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFill, { borderRadius: config.borderRadius }]}
          >
            {/* Glass highlight overlay */}
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.35)', 'transparent']}
              style={[StyleSheet.absoluteFill, { height: '55%', borderRadius: config.borderRadius }]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
            />
          </LinearGradient>
        );
    }
  };

  // Get shadow style based on variant
  const getShadowStyle = () => {
    switch (variant) {
      case 'glass':
        return glassShadows.floating;
      case 'glassDark':
        return glassShadows.ambient;
      case 'gradient':
      default:
        return glassShadows.glow(colors.primary, 0.45);
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        getShadowStyle(),
        animatedContainerStyle,
        animatedGlowStyle,
        style,
      ]}
    >
      <AnimatedTouchable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={[
          styles.touchable,
          {
            width: config.width,
            height: config.height,
            borderRadius: config.borderRadius,
          },
        ]}
      >
        {renderBackground()}
        <Text style={[styles.icon, { fontSize: config.iconSize }]}>📷</Text>
      </AnimatedTouchable>
    </Animated.View>
  );
}

// Mini version for navigation bars
export function FloatingCameraButtonMini({
  onPress,
  style,
  variant = 'gradient',
}: {
  onPress: () => void;
  style?: ViewStyle;
  variant?: 'gradient' | 'glass' | 'glassDark';
}) {
  return <FloatingCameraButton onPress={onPress} style={style} size="sm" variant={variant} />;
}

// Glass variant shortcut
export function FloatingCameraButtonGlass({
  onPress,
  style,
  size = 'md',
}: Omit<FloatingCameraButtonProps, 'variant'>) {
  return <FloatingCameraButton onPress={onPress} style={style} size={size} variant="glass" />;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: glassLayout.floatingOffset.fromBottom,
    alignSelf: 'center',
  },
  touchable: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    textAlign: 'center',
    zIndex: 1,
  },
  glassBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: liquidGlass.border.width,
    borderColor: liquidGlass.border.colorStrong,
    pointerEvents: 'none',
  },
  glassBorderDark: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: liquidGlass.border.width,
    borderColor: liquidGlass.border.colorDark,
    pointerEvents: 'none',
  },
});
