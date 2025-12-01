import React, { useRef, useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors } from '../../constants/colors';
import { config } from '../../constants/config';

interface CaptureButtonProps {
  onCapture: () => void;
  onVideoStart?: () => void;
  onVideoEnd?: () => void;
  disabled?: boolean;
  isRecording?: boolean;
  videoEnabled?: boolean;
}

const BUTTON_SIZE = 80;
const INNER_SIZE = 64;
const STROKE_WIDTH = 4;
const RECORDING_COLOR = colors.error;
const MAX_RECORDING_TIME = config.VIDEO_MAX_DURATION_SECONDS * 1000;

export function CaptureButton({
  onCapture,
  onVideoStart,
  onVideoEnd,
  disabled = false,
  isRecording = false,
  videoEnabled = true,
}: CaptureButtonProps) {
  const [localRecording, setLocalRecording] = useState(false);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isLongPressRef = useRef(false);
  const recordingStartRef = useRef<number>(0);

  // Animation values
  const buttonScale = useSharedValue(1);
  const innerScale = useSharedValue(1);
  const innerBorderRadius = useSharedValue(INNER_SIZE / 2);
  const flashOpacity = useSharedValue(0);
  const recordingProgress = useSharedValue(0);

  const isActiveRecording = isRecording || localRecording;

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, []);

  // Handle recording progress updates
  const startRecordingProgress = useCallback(() => {
    recordingStartRef.current = Date.now();
    recordingProgress.value = 0;
    setLocalRecording(true);

    recordingTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - recordingStartRef.current;
      const progress = Math.min(elapsed / MAX_RECORDING_TIME, 1);

      recordingProgress.value = withTiming(progress, {
        duration: 100,
        easing: Easing.linear,
      });

      // Auto-stop at max duration
      if (progress >= 1) {
        runOnJS(stopRecording)();
      }
    }, 100);
  }, [recordingProgress]);

  const stopRecording = useCallback(() => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    recordingProgress.value = withTiming(0, { duration: 200 });
    isLongPressRef.current = false;
    setLocalRecording(false);
    onVideoEnd?.();
  }, [recordingProgress, onVideoEnd]);

  const handlePressIn = useCallback(() => {
    if (disabled) return;

    // Scale down with spring
    buttonScale.value = withSpring(0.95, {
      damping: 15,
      stiffness: 400,
    });

    // Start long press timer for video
    if (videoEnabled && onVideoStart) {
      longPressTimerRef.current = setTimeout(() => {
        isLongPressRef.current = true;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

        // Morph inner circle to rounded square
        innerScale.value = withTiming(0.6, {
          duration: 200,
          easing: Easing.out(Easing.ease),
        });
        innerBorderRadius.value = withTiming(8, {
          duration: 200,
          easing: Easing.out(Easing.ease),
        });

        // Start recording
        onVideoStart();
        startRecordingProgress();
      }, 500);
    }
  }, [
    disabled,
    videoEnabled,
    onVideoStart,
    buttonScale,
    innerScale,
    innerBorderRadius,
    startRecordingProgress,
  ]);

  const handlePressOut = useCallback(() => {
    if (disabled) return;

    // Clear long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // Scale back with spring
    buttonScale.value = withSpring(1, {
      damping: 12,
      stiffness: 300,
    });

    // Reset inner circle
    innerScale.value = withSpring(1, {
      damping: 12,
      stiffness: 300,
    });
    innerBorderRadius.value = withTiming(INNER_SIZE / 2, {
      duration: 200,
      easing: Easing.out(Easing.ease),
    });

    // Stop video recording if in progress
    if (isLongPressRef.current) {
      stopRecording();
    }
  }, [disabled, buttonScale, innerScale, innerBorderRadius, stopRecording]);

  const handlePress = useCallback(async () => {
    if (disabled || isLongPressRef.current) return;

    // Haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Flash animation for photo capture
    flashOpacity.value = withSequence(
      withTiming(1, { duration: 50 }),
      withTiming(0, { duration: 200 })
    );

    onCapture();
  }, [disabled, onCapture, flashOpacity]);

  // Animated styles
  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
    opacity: disabled ? 0.5 : 1,
  }));

  const animatedInnerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: innerScale.value }],
    borderRadius: innerBorderRadius.value,
  }));

  const animatedFlashStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
  }));

  // Progress ring style (using border approach)
  const animatedProgressStyle = useAnimatedStyle(() => {
    // Calculate rotation based on progress (360 degrees for full circle)
    const rotation = recordingProgress.value * 360;
    return {
      transform: [{ rotate: `${rotation}deg` }],
    };
  });

  const outerColor = isActiveRecording ? RECORDING_COLOR : colors.white;
  const innerColor = isActiveRecording ? RECORDING_COLOR : colors.white;

  return (
    <View style={styles.container}>
      {/* Flash overlay */}
      <Animated.View style={[styles.flash, animatedFlashStyle]} />

      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={styles.touchable}
      >
        <Animated.View style={[styles.outerRing, animatedButtonStyle]}>
          {/* Progress indicator for recording */}
          {isActiveRecording && (
            <Animated.View style={[styles.progressContainer, animatedProgressStyle]}>
              <View style={styles.progressIndicator} />
            </Animated.View>
          )}

          {/* Outer ring border */}
          <View
            style={[
              styles.outerRingBorder,
              { borderColor: outerColor },
            ]}
          />

          {/* Inner circle */}
          <Animated.View
            style={[
              styles.innerCircle,
              animatedInnerStyle,
              { backgroundColor: innerColor },
            ]}
          />
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
  },
  touchable: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
  },
  outerRing: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outerRingBorder: {
    position: 'absolute',
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    borderWidth: STROKE_WIDTH,
    backgroundColor: 'transparent',
  },
  innerCircle: {
    width: INNER_SIZE,
    height: INNER_SIZE,
  },
  progressContainer: {
    position: 'absolute',
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  progressIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: RECORDING_COLOR,
    marginTop: -2,
  },
  flash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.white,
    zIndex: 100,
    pointerEvents: 'none',
  },
});
