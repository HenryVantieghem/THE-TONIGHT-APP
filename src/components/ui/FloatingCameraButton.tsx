import React, { useEffect } from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, shadows } from '../../constants/colors';

interface FloatingCameraButtonProps {
  onPress: () => void;
  style?: ViewStyle;
  size?: 'sm' | 'md' | 'lg';
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function FloatingCameraButton({
  onPress,
  style,
  size = 'md',
}: FloatingCameraButtonProps) {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const glowOpacity = useSharedValue(0.4);

  // Size configurations
  const sizeConfig = {
    sm: { button: 56, icon: 24 },
    md: { button: 64, icon: 28 },
    lg: { button: 72, icon: 32 },
  };

  const config = sizeConfig[size];

  // Subtle floating animation - makes it feel alive
  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-4, {
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(4, {
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
        })
      ),
      -1,
      true
    );

    // Subtle glow pulse
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, [translateY, glowOpacity]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    shadowOpacity: glowOpacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.92, {
      damping: 15,
      stiffness: 400,
    });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 12,
      stiffness: 300,
    });
  };

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        animatedContainerStyle,
        animatedGlowStyle,
        {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 8 },
          shadowRadius: 16,
          elevation: 12,
        },
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
            width: config.button,
            height: config.button,
            borderRadius: config.button / 2,
          },
        ]}
      >
        <LinearGradient
          colors={colors.primaryGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.gradient,
            {
              width: config.button,
              height: config.button,
              borderRadius: config.button / 2,
            },
          ]}
        >
          <Text style={[styles.icon, { fontSize: config.icon }]}>📷</Text>
        </LinearGradient>
      </AnimatedTouchable>
    </Animated.View>
  );
}

// Mini version for navigation bars
export function FloatingCameraButtonMini({
  onPress,
  style,
}: {
  onPress: () => void;
  style?: ViewStyle;
}) {
  return <FloatingCameraButton onPress={onPress} style={style} size="sm" />;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
  },
  touchable: {
    overflow: 'hidden',
  },
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    textAlign: 'center',
  },
});
