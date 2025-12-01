import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  View,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import {
  liquidGlass,
  glassShadows,
  glassMotion,
  glassColors,
} from '../../constants/liquidGlass';
import { colors } from '../../constants/colors';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'glass' | 'glassDark';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
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
}: ButtonProps) {
  const pressProgress = useSharedValue(0);

  const handlePress = () => {
    if (!disabled && !loading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onPress();
    }
  };

  const handlePressIn = () => {
    if (!disabled && !loading) {
      pressProgress.value = withSpring(1, glassMotion.spring.snappy);
    }
  };

  const handlePressOut = () => {
    pressProgress.value = withSpring(0, glassMotion.spring.smooth);
  };

  const isDisabled = disabled || loading;

  // Size configurations with pill-shaped design
  const sizeStyles = {
    sm: { height: 44, fontSize: 14, borderRadius: 22, paddingHorizontal: 18 },
    md: { height: 52, fontSize: 16, borderRadius: 26, paddingHorizontal: 24 },
    lg: { height: 58, fontSize: 16, borderRadius: 29, paddingHorizontal: 28 },
  };

  const { height, fontSize, borderRadius: pillRadius, paddingHorizontal } = sizeStyles[size];

  // Animated scale effect
  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      pressProgress.value,
      [0, 1],
      [1, glassMotion.pressScale.moderate],
      Extrapolation.CLAMP
    );
    return { transform: [{ scale }] };
  });

  // Glass variant - frosted glass effect
  if (variant === 'glass' || variant === 'glassDark') {
    const isDark = variant === 'glassDark';
    
    return (
      <AnimatedTouchable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        activeOpacity={1}
        style={[
          styles.glassButton,
          {
            height,
            borderRadius: pillRadius,
            paddingHorizontal,
          },
          isDark ? glassShadows.ambient : glassShadows.key,
          fullWidth && styles.fullWidth,
          isDisabled && styles.disabledOpacity,
          animatedStyle,
          style,
        ]}
      >
        {/* Glass Background */}
        <View style={[StyleSheet.absoluteFill, { borderRadius: pillRadius, overflow: 'hidden' }]}>
          {Platform.OS === 'ios' ? (
            <BlurView
              intensity={liquidGlass.blur.regular}
              tint={isDark ? 'dark' : 'light'}
              style={StyleSheet.absoluteFill}
            />
          ) : null}
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: isDark
                  ? liquidGlass.material.dark.backgroundColor
                  : liquidGlass.material.primary.backgroundColor,
              },
            ]}
          />
          {/* Top highlight */}
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.35)', 'transparent']}
            style={[StyleSheet.absoluteFill, { height: '50%' }]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          />
        </View>

        {/* Border */}
        <View
          style={[
            styles.glassBorder,
            {
              borderRadius: pillRadius,
              borderColor: isDark
                ? liquidGlass.border.colorDark
                : liquidGlass.border.color,
            },
          ]}
        />

        {/* Content */}
        {loading ? (
          <ActivityIndicator
            color={isDark ? '#FFFFFF' : glassColors.text.primary}
            size="small"
          />
        ) : (
          <View style={styles.buttonContent}>
            {icon && <View style={styles.iconContainer}>{icon}</View>}
            <Text
              style={[
                styles.glassText,
                {
                  fontSize,
                  color: isDark ? '#FFFFFF' : glassColors.text.primary,
                },
              ]}
            >
              {title}
            </Text>
          </View>
        )}
      </AnimatedTouchable>
    );
  }

  // Primary button with gradient and glass overlay
  if (variant === 'primary') {
    return (
      <AnimatedTouchable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        activeOpacity={1}
        style={[
          fullWidth && styles.fullWidth,
          animatedStyle,
          style,
        ]}
      >
        <LinearGradient
          colors={isDisabled ? ['#CBD5E1', '#94A3B8'] : colors.primaryGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.primaryButton,
            {
              height,
              borderRadius: pillRadius,
              paddingHorizontal,
            },
            !isDisabled && glassShadows.glow(colors.primary, 0.35),
          ]}
        >
          {/* Glass highlight overlay */}
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.3)', 'transparent']}
            style={[styles.glassHighlight, { borderRadius: pillRadius }]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 0.6 }}
          />

          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <View style={styles.buttonContent}>
              {icon && <View style={styles.iconContainer}>{icon}</View>}
              <Text style={[styles.primaryText, { fontSize }]}>{title}</Text>
            </View>
          )}
        </LinearGradient>
      </AnimatedTouchable>
    );
  }

  // Secondary button with glass border
  if (variant === 'secondary') {
    return (
      <AnimatedTouchable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        activeOpacity={1}
        style={[
          styles.secondaryButton,
          {
            height,
            borderRadius: pillRadius,
            paddingHorizontal,
          },
          fullWidth && styles.fullWidth,
          isDisabled && styles.disabledOpacity,
          animatedStyle,
          style,
        ]}
      >
        {/* Glass background */}
        <View style={[StyleSheet.absoluteFill, { borderRadius: pillRadius, overflow: 'hidden' }]}>
          {Platform.OS === 'ios' ? (
            <BlurView
              intensity={liquidGlass.blur.light}
              tint="light"
              style={StyleSheet.absoluteFill}
            />
          ) : null}
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: `${colors.primary}10` },
            ]}
          />
        </View>

        {/* Accent border */}
        <View
          style={[
            styles.secondaryBorder,
            { borderRadius: pillRadius },
          ]}
        />

        {loading ? (
          <ActivityIndicator color={colors.primary} size="small" />
        ) : (
          <View style={styles.buttonContent}>
            {icon && <View style={styles.iconContainer}>{icon}</View>}
            <Text style={[styles.secondaryText, { fontSize }]}>{title}</Text>
          </View>
        )}
      </AnimatedTouchable>
    );
  }

  // Ghost button (text only with subtle hover)
  return (
    <AnimatedTouchable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      activeOpacity={1}
      style={[
        styles.ghostButton,
        {
          height: height - 8,
          borderRadius: pillRadius,
          paddingHorizontal: paddingHorizontal - 8,
        },
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabledOpacity,
        animatedStyle,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.primary} size="small" />
      ) : (
        <View style={styles.buttonContent}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={[styles.ghostText, { fontSize: fontSize - 2 }]}>{title}</Text>
        </View>
      )}
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  primaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  glassHighlight: {
    ...StyleSheet.absoluteFillObject,
    height: '60%',
  },
  primaryText: {
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  glassButton: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  glassBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: liquidGlass.border.width,
    pointerEvents: 'none',
  },
  glassText: {
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  secondaryBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1.5,
    borderColor: colors.primary,
    pointerEvents: 'none',
  },
  secondaryText: {
    fontWeight: '600',
    color: colors.primary,
    letterSpacing: 0.3,
  },
  ghostButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostText: {
    fontWeight: '500',
    color: colors.primary,
  },
  fullWidth: {
    width: '100%',
  },
  disabledOpacity: {
    opacity: 0.5,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    zIndex: 1,
  },
  iconContainer: {
    marginRight: -4,
  },
});
