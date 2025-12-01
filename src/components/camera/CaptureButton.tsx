import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  GestureResponderEvent,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../../constants/colors';

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
const RECORDING_COLOR = colors.error;

export function CaptureButton({
  onCapture,
  onVideoStart,
  onVideoEnd,
  disabled = false,
  isRecording = false,
  videoEnabled = true,
}: CaptureButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const scaleValue = useRef(new Animated.Value(1)).current;
  const innerScaleValue = useRef(new Animated.Value(1)).current;
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressRef = useRef(false);

  const handlePressIn = useCallback(() => {
    if (disabled) return;

    setIsPressed(true);

    // Scale down animation
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();

    // Start long press timer for video (if enabled)
    if (videoEnabled && onVideoStart) {
      longPressTimerRef.current = setTimeout(() => {
        isLongPressRef.current = true;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

        // Animate inner circle to indicate recording
        Animated.timing(innerScaleValue, {
          toValue: 0.6,
          duration: 200,
          useNativeDriver: true,
        }).start();

        onVideoStart();
      }, 500);
    }
  }, [disabled, videoEnabled, onVideoStart, scaleValue, innerScaleValue]);

  const handlePressOut = useCallback(() => {
    if (disabled) return;

    setIsPressed(false);

    // Clear long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // Scale back animation
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();

    // Reset inner scale
    Animated.timing(innerScaleValue, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    if (isLongPressRef.current) {
      // End video recording
      isLongPressRef.current = false;
      onVideoEnd?.();
    }
  }, [disabled, scaleValue, innerScaleValue, onVideoEnd]);

  const handlePress = useCallback(() => {
    if (disabled || isLongPressRef.current) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onCapture();
  }, [disabled, onCapture]);

  const outerColor = isRecording ? RECORDING_COLOR : colors.white;
  const innerColor = isRecording ? RECORDING_COLOR : colors.white;

  return (
    <TouchableOpacity
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={1}
      style={styles.touchable}
    >
      <Animated.View
        style={[
          styles.outerRing,
          {
            borderColor: outerColor,
            transform: [{ scale: scaleValue }],
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.innerCircle,
            {
              backgroundColor: innerColor,
              transform: [{ scale: innerScaleValue }],
            },
            isRecording && styles.innerRecording,
          ]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

// Small floating camera button for feed
export function FloatingCameraButton({
  onPress,
}: {
  onPress: () => void;
}) {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      style={styles.floatingTouchable}
    >
      <Animated.View
        style={[
          styles.floatingButton,
          { transform: [{ scale: scaleValue }] },
        ]}
      >
        <View style={styles.floatingInner}>
          <View style={styles.cameraIconOuter}>
            <View style={styles.cameraIconLens} />
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touchable: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
  },
  outerRing: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  innerCircle: {
    width: INNER_SIZE,
    height: INNER_SIZE,
    borderRadius: INNER_SIZE / 2,
  },
  innerRecording: {
    borderRadius: 8,
    width: 32,
    height: 32,
  },

  // Floating button styles
  floatingTouchable: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  floatingButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingInner: {
    width: 32,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIconOuter: {
    width: 32,
    height: 24,
    borderRadius: 4,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIconLens: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.white,
  },
});
