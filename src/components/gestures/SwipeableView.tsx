import React, { useRef } from 'react';
import { View, StyleSheet, Dimensions, PanResponder, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SwipeableViewProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  swipeThreshold?: number;
  velocityThreshold?: number;
  enabled?: boolean;
}

export function SwipeableView({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  swipeThreshold = 50,
  velocityThreshold = 0.5,
  enabled = true,
}: SwipeableViewProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => enabled,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        if (!enabled) return false;
        const { dx, dy } = gestureState;
        return Math.abs(dx) > 10 || Math.abs(dy) > 10;
      },
      onPanResponderGrant: () => {
        Haptics.selectionAsync();
      },
      onPanResponderMove: (_, gestureState) => {
        if (!enabled) return;
        translateX.setValue(gestureState.dx);
        translateY.setValue(gestureState.dy);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (!enabled) {
          resetPosition();
          return;
        }

        const { dx, dy, vx, vy } = gestureState;
        const absX = Math.abs(dx);
        const absY = Math.abs(dy);
        const absVx = Math.abs(vx);
        const absVy = Math.abs(vy);

        // Determine if it's a horizontal or vertical swipe
        const isHorizontal = absX > absY;

        if (isHorizontal) {
          // Horizontal swipe
          if (absX > swipeThreshold || absVx > velocityThreshold) {
            if (dx > 0 && onSwipeRight) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onSwipeRight();
            } else if (dx < 0 && onSwipeLeft) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onSwipeLeft();
            }
          }
        } else {
          // Vertical swipe
          if (absY > swipeThreshold || absVy > velocityThreshold) {
            if (dy > 0 && onSwipeDown) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onSwipeDown();
            } else if (dy < 0 && onSwipeUp) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onSwipeUp();
            }
          }
        }

        resetPosition();
      },
    })
  ).current;

  const resetPosition = () => {
    Animated.parallel([
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
        tension: 80,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
        tension: 80,
      }),
    ]).start();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateX }, { translateY }],
        },
      ]}
      {...panResponder.panHandlers}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

