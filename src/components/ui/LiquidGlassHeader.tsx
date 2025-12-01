// LiquidGlassHeader - Dynamic header that adapts on scroll
// Part of Apple's Liquid Glass design language
// Content-first hierarchy where controls adapt/shrink on scroll

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
  ViewStyle,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
  SharedValue,
  useDerivedValue,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import {
  liquidGlass,
  glassShadows,
  glassMotion,
  glassTabBar,
  glassColors,
} from '../../constants/liquidGlass';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { spacing } from '../../constants/config';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface LiquidGlassHeaderProps {
  // Content
  title?: string;
  subtitle?: string;
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  centerContent?: React.ReactNode;
  // Scroll binding
  scrollY?: SharedValue<number>;
  scrollThreshold?: number;
  // Visual options
  transparent?: boolean;
  showDivider?: boolean;
  largeTitleEnabled?: boolean;
  tintColor?: string;
  // Actions
  onLeftPress?: () => void;
  onRightPress?: () => void;
  // Style
  style?: ViewStyle;
}

export function LiquidGlassHeader({
  title,
  subtitle,
  leftContent,
  rightContent,
  centerContent,
  scrollY,
  scrollThreshold = glassTabBar.animation.scrollThreshold,
  transparent = false,
  showDivider = true,
  largeTitleEnabled = true,
  tintColor = colors.primary,
  onLeftPress,
  onRightPress,
  style,
}: LiquidGlassHeaderProps) {
  const insets = useSafeAreaInsets();

  // Calculate collapse progress from scroll position
  const collapseProgress = useDerivedValue(() => {
    if (!scrollY) return 0;
    return Math.min(Math.max(scrollY.value / scrollThreshold, 0), 1);
  });

  // Animated styles for the glass background
  const backgroundStyle = useAnimatedStyle(() => {
    const opacity = transparent
      ? interpolate(collapseProgress.value, [0, 0.5, 1], [0, 0.5, 1])
      : 1;

    const blurOpacity = interpolate(
      collapseProgress.value,
      [0, 0.3, 1],
      [0.6, 0.8, 1]
    );

    return {
      opacity: blurOpacity,
    };
  });

  // Animated styles for large title (collapses into small)
  const largeTitleStyle = useAnimatedStyle(() => {
    if (!largeTitleEnabled) return { opacity: 0, transform: [{ scale: 0 }] };

    const opacity = interpolate(
      collapseProgress.value,
      [0, 0.3],
      [1, 0],
      Extrapolation.CLAMP
    );

    const translateY = interpolate(
      collapseProgress.value,
      [0, 0.5],
      [0, -20],
      Extrapolation.CLAMP
    );

    const scale = interpolate(
      collapseProgress.value,
      [0, 0.5],
      [1, 0.85],
      Extrapolation.CLAMP
    );

    return {
      opacity,
      transform: [{ translateY }, { scale }],
    };
  });

  // Animated styles for small/inline title
  const smallTitleStyle = useAnimatedStyle(() => {
    const opacity = largeTitleEnabled
      ? interpolate(collapseProgress.value, [0.3, 0.6], [0, 1], Extrapolation.CLAMP)
      : 1;

    return {
      opacity,
    };
  });

  // Header height animation
  const headerHeightStyle = useAnimatedStyle(() => {
    const height = largeTitleEnabled
      ? interpolate(
          collapseProgress.value,
          [0, 1],
          [110 + insets.top, 56 + insets.top],
          Extrapolation.CLAMP
        )
      : 56 + insets.top;

    return {
      height,
    };
  });

  // Divider opacity
  const dividerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      collapseProgress.value,
      [0, 0.5],
      [0, showDivider ? 1 : 0],
      Extrapolation.CLAMP
    );

    return {
      opacity,
    };
  });

  return (
    <Animated.View style={[styles.container, headerHeightStyle, style]}>
      {/* Glass Background */}
      <Animated.View style={[StyleSheet.absoluteFill, backgroundStyle]}>
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
            { backgroundColor: liquidGlass.material.primary.backgroundColor },
          ]}
        />
        {/* Top highlight */}
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.4)', 'transparent']}
          style={[StyleSheet.absoluteFill, { height: '30%' }]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </Animated.View>

      {/* Content */}
      <View style={[styles.content, { paddingTop: insets.top }]}>
        {/* Top row with left/center/right */}
        <View style={styles.topRow}>
          {/* Left */}
          <View style={styles.leftContainer}>
            {leftContent ? (
              onLeftPress ? (
                <TouchableOpacity onPress={onLeftPress} style={styles.button}>
                  {leftContent}
                </TouchableOpacity>
              ) : (
                leftContent
              )
            ) : (
              <View style={styles.buttonPlaceholder} />
            )}
          </View>

          {/* Center */}
          <Animated.View style={[styles.centerContainer, smallTitleStyle]}>
            {centerContent || (
              <Text style={styles.smallTitle} numberOfLines={1}>
                {title}
              </Text>
            )}
          </Animated.View>

          {/* Right */}
          <View style={styles.rightContainer}>
            {rightContent ? (
              onRightPress ? (
                <TouchableOpacity onPress={onRightPress} style={styles.button}>
                  {rightContent}
                </TouchableOpacity>
              ) : (
                rightContent
              )
            ) : (
              <View style={styles.buttonPlaceholder} />
            )}
          </View>
        </View>

        {/* Large title row (animated out on scroll) */}
        {largeTitleEnabled && (
          <Animated.View style={[styles.largeTitleContainer, largeTitleStyle]}>
            <Text style={styles.largeTitle}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </Animated.View>
        )}
      </View>

      {/* Divider */}
      <Animated.View style={[styles.divider, dividerStyle]} />
    </Animated.View>
  );
}

// Compact header variant (no large title)
export function LiquidGlassHeaderCompact(
  props: Omit<LiquidGlassHeaderProps, 'largeTitleEnabled'>
) {
  return <LiquidGlassHeader {...props} largeTitleEnabled={false} />;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
    paddingTop: spacing.xs,
  },
  leftContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  centerContainer: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  button: {
    padding: spacing.xs,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPlaceholder: {
    width: 44,
    height: 44,
  },
  smallTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: glassColors.text.primary,
    letterSpacing: -0.3,
  },
  largeTitleContainer: {
    paddingTop: spacing.xs,
    paddingBottom: spacing.md,
  },
  largeTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: glassColors.text.primary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: glassColors.text.secondary,
    marginTop: 2,
  },
  divider: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: liquidGlass.border.color,
  },
});

