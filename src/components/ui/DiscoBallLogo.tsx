import React from 'react';
import { View, StyleSheet, Text, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { useEffect } from 'react';

interface DiscoBallLogoProps {
  size?: number;
  animated?: boolean;
  style?: ViewStyle;
}

export function DiscoBallLogo({
  size = 48,
  animated = true,
  style,
}: DiscoBallLogoProps) {
  const rotation = useSharedValue(0);
  const glowOpacity = useSharedValue(0.6);

  useEffect(() => {
    if (animated) {
      // Slow rotation animation
      rotation.value = withRepeat(
        withTiming(360, {
          duration: 8000,
          easing: Easing.linear,
        }),
        -1,
        false
      );

      // Pulsing glow effect
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.4, { duration: 2000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }
  }, [animated, rotation, glowOpacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const ballSize = size;
  const mirrorSize = ballSize / 8;
  const shadowOffset = size * 0.15;

  return (
    <View style={[styles.container, { width: ballSize, height: ballSize }, style]}>
      {/* Outer glow shadow */}
      <Animated.View
        style={[
          styles.glow,
          glowStyle,
          {
            width: ballSize * 1.3,
            height: ballSize * 1.3,
            borderRadius: (ballSize * 1.3) / 2,
            shadowRadius: size * 0.4,
          },
        ]}
      />

      {/* Main disco ball container */}
      <Animated.View
        style={[
          styles.ballContainer,
          animatedStyle,
          {
            width: ballSize,
            height: ballSize,
            borderRadius: ballSize / 2,
          },
        ]}
      >
        {/* Base gradient sphere */}
        <LinearGradient
          colors={['#E8E8E8', '#C0C0C0', '#A0A0A0', '#808080']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.ball,
            {
              width: ballSize,
              height: ballSize,
              borderRadius: ballSize / 2,
            },
          ]}
        >
          {/* Disco ball emoji */}
          <Text
            style={[
              styles.emoji,
              {
                fontSize: size * 0.7,
              },
            ]}
          >
            🪩
          </Text>

          {/* Reflective mirrors overlay pattern */}
          <View style={styles.mirrorsContainer}>
            {/* Top mirrors */}
            <View style={[styles.mirror, styles.mirrorTopLeft, { width: mirrorSize, height: mirrorSize }]} />
            <View style={[styles.mirror, styles.mirrorTopRight, { width: mirrorSize, height: mirrorSize }]} />
            {/* Middle mirrors */}
            <View style={[styles.mirror, styles.mirrorMiddleLeft, { width: mirrorSize * 0.8, height: mirrorSize * 0.8 }]} />
            <View style={[styles.mirror, styles.mirrorMiddleRight, { width: mirrorSize * 0.8, height: mirrorSize * 0.8 }]} />
            {/* Bottom mirrors */}
            <View style={[styles.mirror, styles.mirrorBottomLeft, { width: mirrorSize * 0.6, height: mirrorSize * 0.6 }]} />
            <View style={[styles.mirror, styles.mirrorBottomRight, { width: mirrorSize * 0.6, height: mirrorSize * 0.6 }]} />
          </View>

          {/* Highlight shine */}
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.6)', 'rgba(255, 255, 255, 0)', 'transparent']}
            start={{ x: 0.2, y: 0.2 }}
            end={{ x: 0.8, y: 0.8 }}
            style={StyleSheet.absoluteFill}
          />
        </LinearGradient>

        {/* 3D shadow effect */}
        <View
          style={[
            styles.shadow,
            {
              width: ballSize * 0.9,
              height: ballSize * 0.3,
              borderRadius: (ballSize * 0.3) / 2,
              bottom: -shadowOffset,
            },
          ]}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 192, 203, 0.3)',
    shadowColor: '#FF69B4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    elevation: 8,
  },
  ballContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  ball: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  emoji: {
    textAlign: 'center',
    zIndex: 2,
  },
  mirrorsContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  mirror: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 2,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  mirrorTopLeft: {
    top: '15%',
    left: '20%',
  },
  mirrorTopRight: {
    top: '15%',
    right: '20%',
  },
  mirrorMiddleLeft: {
    top: '40%',
    left: '15%',
  },
  mirrorMiddleRight: {
    top: '40%',
    right: '15%',
  },
  mirrorBottomLeft: {
    bottom: '20%',
    left: '25%',
  },
  mirrorBottomRight: {
    bottom: '20%',
    right: '25%',
  },
  shadow: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
});

