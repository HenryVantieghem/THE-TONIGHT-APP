import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors } from '../../constants/colors';
import { borderRadius, shadows, spacing } from '../../constants/config';
import {
  liquidGlass,
  glassShadows,
  glassMotion,
  glassGradients,
  GlassMaterialVariant,
} from '../../constants/liquidGlass';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: ViewStyle;
  padding?: 'none' | 'small' | 'medium' | 'large';
  shadow?: 'none' | 'small' | 'medium' | 'large';
  // Liquid Glass options
  variant?: 'solid' | 'glass' | 'glassDark' | 'glassElevated';
  tint?: keyof typeof glassGradients.tints;
  withBorder?: boolean;
  withInnerGlow?: boolean;
  borderRadiusSize?: 'sm' | 'md' | 'lg' | 'xl';
}

const paddingStyles = {
  none: undefined,
  small: { padding: spacing.sm },
  medium: { padding: spacing.md },
  large: { padding: spacing.lg },
} as const;

const borderRadiusSizes = {
  sm: borderRadius.sm,
  md: borderRadius.md,
  lg: borderRadius.lg,
  xl: borderRadius.xl,
} as const;

export function Card({
  children,
  onPress,
  onLongPress,
  style,
  padding = 'medium',
  shadow = 'medium',
  variant = 'glass',
  tint,
  withBorder = true,
  withInnerGlow = true,
  borderRadiusSize = 'lg',
}: CardProps) {
  const pressProgress = useSharedValue(0);
  const cardRadius = borderRadiusSizes[borderRadiusSize];

  const handlePressIn = () => {
    if (onPress || onLongPress) {
      pressProgress.value = withSpring(1, glassMotion.spring.snappy);
    }
  };

  const handlePressOut = () => {
    pressProgress.value = withSpring(0, glassMotion.spring.smooth);
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

  // Animated style for press effect
  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      pressProgress.value,
      [0, 1],
      [1, glassMotion.pressScale.subtle],
      Extrapolation.CLAMP
    );
    return { transform: [{ scale }] };
  });

  // Determine shadow style
  const getShadowStyle = () => {
    if (shadow === 'none') return {};
    switch (shadow) {
      case 'small':
        return glassShadows.ambient;
      case 'large':
        return glassShadows.floating;
      default:
        return glassShadows.key;
    }
  };

  // Glass material based on variant
  const getMaterial = () => {
    switch (variant) {
      case 'glassDark':
        return liquidGlass.material.dark;
      case 'glassElevated':
        return liquidGlass.material.elevated;
      case 'glass':
        return liquidGlass.material.primary;
      default:
        return null;
    }
  };

  const material = getMaterial();

  // Render glass background
  const renderGlassBackground = () => {
    if (!material) return null;

    return (
      <View style={[StyleSheet.absoluteFill, { borderRadius: cardRadius, overflow: 'hidden' }]}>
        {/* Blur layer */}
        {Platform.OS === 'ios' ? (
          <BlurView
            intensity={material.backdropBlur}
            tint={variant === 'glassDark' ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />
        ) : null}

        {/* Color layer */}
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

        {/* Inner glow highlight */}
        {withInnerGlow && (
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.35)', 'transparent']}
            style={[StyleSheet.absoluteFill, { height: '40%' }]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          />
        )}
      </View>
    );
  };

  // Card content
  const cardContent = (
    <View style={[styles.cardInner, { borderRadius: cardRadius }]}>
      {/* Glass background for glass variants */}
      {variant !== 'solid' && renderGlassBackground()}

      {/* Border */}
      {withBorder && variant !== 'solid' && (
        <View
          style={[
            styles.border,
            {
              borderRadius: cardRadius,
              borderColor:
                variant === 'glassDark'
                  ? liquidGlass.border.colorDark
                  : liquidGlass.border.color,
            },
          ]}
        />
      )}

      {/* Content */}
      <View style={[styles.content, paddingStyles[padding]]}>
        {children}
      </View>
    </View>
  );

  const cardStyles = [
    styles.card,
    { borderRadius: cardRadius },
    variant === 'solid' && { backgroundColor: colors.white },
    getShadowStyle(),
    animatedStyle,
    style,
  ];

  if (onPress || onLongPress) {
    return (
      <AnimatedTouchable
        style={cardStyles}
        onPress={handlePress}
        onLongPress={handleLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        {cardContent}
      </AnimatedTouchable>
    );
  }

  return <Animated.View style={cardStyles}>{cardContent}</Animated.View>;
}

// Convenience variants
export function GlassCard(props: Omit<CardProps, 'variant'>) {
  return <Card {...props} variant="glass" />;
}

export function GlassCardDark(props: Omit<CardProps, 'variant'>) {
  return <Card {...props} variant="glassDark" />;
}

export function GlassCardElevated(props: Omit<CardProps, 'variant'>) {
  return <Card {...props} variant="glassElevated" />;
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  cardInner: {
    overflow: 'hidden',
    flex: 1,
  },
  border: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: liquidGlass.border.width,
    pointerEvents: 'none',
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
});
