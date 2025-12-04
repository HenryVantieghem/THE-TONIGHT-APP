/**
 * Scena - Shared Success Screen
 * Gentle, quiet confirmation - not celebratory, just peaceful
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { RootStackParamList } from '../types';
import { colors, typography, gradients, durations } from '../theme';

export const SharedSuccessScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const checkScale = useSharedValue(0);
  const checkOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);

  useEffect(() => {
    // Gentle haptic feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Animate check mark
    checkScale.value = withSequence(
      withTiming(1.2, { duration: durations.normal }),
      withTiming(1, { duration: durations.fast })
    );
    checkOpacity.value = withTiming(1, { duration: durations.normal });

    // Fade in text
    textOpacity.value = withDelay(
      durations.fast,
      withTiming(1, { duration: durations.normal })
    );

    // Auto-navigate back after brief moment
    const timer = setTimeout(() => {
      navigation.popToTop();
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkOpacity.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradients.ambient}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.content}>
        {/* Check mark */}
        <Animated.View style={[styles.checkContainer, checkStyle]}>
          <Ionicons
            name="checkmark"
            size={48}
            color={colors.accent.success}
          />
        </Animated.View>

        {/* Text */}
        <Animated.Text style={[styles.text, textStyle]}>
          shared
        </Animated.Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkContainer: {
    marginBottom: 16,
  },
  text: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.light,
    color: colors.text.secondary,
    textTransform: 'lowercase',
    letterSpacing: typography.letterSpacing.wide,
  },
});

export default SharedSuccessScreen;
