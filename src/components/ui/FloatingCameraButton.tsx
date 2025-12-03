import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../../constants/colors';
import { borderRadius, spacing, hitSlop, animations } from '../../constants/config';

interface FloatingCameraButtonProps {
  onPress: () => void;
  style?: ViewStyle;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function FloatingCameraButton({
  onPress,
  style,
}: FloatingCameraButtonProps) {
  const pressScale = useSharedValue(1);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  const handlePressIn = () => {
    pressScale.value = withSpring(0.9, {
      damping: 15,
      stiffness: 150,
    });
  };

  const handlePressOut = () => {
    pressScale.value = withSpring(1, {
      damping: 15,
      stiffness: 150,
    });
  };

  // Dark red glowing button
  const size = 72;
  const iconSize = 32;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  return (
    <AnimatedTouchable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      hitSlop={hitSlop.large}
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.primary,
          ...shadows.glow,
        },
        animatedStyle,
        style,
      ]}
    >
      <Ionicons
        name="camera"
        size={iconSize}
        color={colors.textInverse}
      />
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    // Position: Center bottom, 24px above safe area (handled by parent)
  },
});
