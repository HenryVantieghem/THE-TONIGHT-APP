import React, { useRef } from 'react';
import { View, StyleSheet, Dimensions, PanResponder, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, spacing } from '../../constants/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PullDownDismissProps {
  children: React.ReactNode;
  onDismiss: () => void;
  threshold?: number;
  enabled?: boolean;
}

export function PullDownDismiss({
  children,
  onDismiss,
  threshold = 100,
  enabled = true,
}: PullDownDismissProps) {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => enabled,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return enabled && gestureState.dy > 10 && Math.abs(gestureState.dx) < Math.abs(gestureState.dy);
      },
      onPanResponderGrant: () => {
        Haptics.selectionAsync();
      },
      onPanResponderMove: (_, gestureState) => {
        if (!enabled) return;
        // Only allow downward movement
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
          // Rubber band effect
          const newOpacity = 1 - gestureState.dy / SCREEN_HEIGHT;
          opacity.setValue(Math.max(0.3, newOpacity));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (!enabled) {
          resetPosition();
          return;
        }

        if (gestureState.dy > threshold || gestureState.vy > 0.5) {
          // Dismiss
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          Animated.parallel([
            Animated.timing(translateY, {
              toValue: SCREEN_HEIGHT,
              duration: 250,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 250,
              useNativeDriver: true,
            }),
          ]).start(() => {
            onDismiss();
          });
        } else {
          // Snap back
          resetPosition();
        }
      },
    })
  ).current;

  const resetPosition = () => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
        tension: 80,
      }),
      Animated.spring(opacity, {
        toValue: 1,
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
          transform: [{ translateY }],
          opacity,
        },
      ]}
      {...panResponder.panHandlers}
    >
      {/* Pull indicator */}
      <View style={styles.pullIndicatorContainer}>
        <View style={styles.pullIndicator} />
      </View>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pullIndicatorContainer: {
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  pullIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.textQuaternary,
  },
});

