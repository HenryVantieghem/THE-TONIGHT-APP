import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  interpolate,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { differenceInSeconds } from 'date-fns';
import { colors } from '../../constants/colors';
import { textStyles } from '../../constants/typography';
import { borderRadius, spacing, config } from '../../constants/config';

interface TimerBarProps {
  createdAt: string;
  expiresAt: string;
  showLabel?: boolean;
  showTimeLeft?: boolean;
  onExpire?: () => void;
}

// Calculate progress (0-1) based on time
function calculateProgress(createdAt: string, expiresAt: string): number {
  const created = new Date(createdAt).getTime();
  const expires = new Date(expiresAt).getTime();
  const now = Date.now();

  if (now >= expires) return 0;
  if (now <= created) return 1;

  const total = expires - created;
  const remaining = expires - now;
  return Math.max(0, Math.min(1, remaining / total));
}

// Get timer color based on progress (per spec)
function getTimerColor(progress: number): string {
  if (progress > 0.5) {
    return colors.timerFresh; // >50% Green
  }
  if (progress > 0.25) {
    return colors.timerMid; // 25-50% Yellow
  }
  return colors.timerUrgent; // <25% Red
}

// Format time remaining
function formatTimeRemaining(expiresAt: string): string {
  const seconds = differenceInSeconds(new Date(expiresAt), new Date());

  if (seconds <= 0) return 'Expired';
  if (seconds < 60) return `${seconds}s`;
  
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m`;
}

export function TimerBar({
  createdAt,
  expiresAt,
  showLabel = true,
  showTimeLeft = true,
  onExpire,
}: TimerBarProps) {
  // Animation values
  const progress = useSharedValue(calculateProgress(createdAt, expiresAt));
  const pulseOpacity = useSharedValue(1);
  const isPulsing = useSharedValue(false);

  // Memoized initial values
  const initialProgress = useMemo(
    () => calculateProgress(createdAt, expiresAt),
    [createdAt, expiresAt]
  );

  const [timeText, setTimeText] = React.useState(() => formatTimeRemaining(expiresAt));
  const [currentProgress, setCurrentProgress] = React.useState(initialProgress);
  const [hasExpired, setHasExpired] = React.useState(false);

  // Update timer
  const updateTimer = React.useCallback(() => {
    const newProgress = calculateProgress(createdAt, expiresAt);
    const newTimeText = formatTimeRemaining(expiresAt);
    const minutesLeft = Math.floor(differenceInSeconds(new Date(expiresAt), new Date()) / 60);

    setCurrentProgress(newProgress);
    setTimeText(newTimeText);

    // Animate progress bar (smooth 0.5s transition per spec)
    progress.value = withTiming(newProgress, {
      duration: 500,
      easing: Easing.linear,
    });

    // Handle expiration
    if (newProgress <= 0 && !hasExpired) {
      setHasExpired(true);
      onExpire?.();
    }

    // Start pulsing when <5 minutes (per spec)
    if (minutesLeft < config.TIMER_PULSE_THRESHOLD && minutesLeft > 0 && !isPulsing.value) {
      isPulsing.value = true;
      // Pulse opacity 0.7 ↔ 1.0, 1s duration per spec
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.7, { duration: 500, easing: Easing.inOut(Easing.ease) }),
          withTiming(1.0, { duration: 500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }

    // Stop pulsing if expired or >5m
    if (minutesLeft >= config.TIMER_PULSE_THRESHOLD || newProgress <= 0) {
      if (isPulsing.value) {
        isPulsing.value = false;
        cancelAnimation(pulseOpacity);
        pulseOpacity.value = 1;
      }
    }
  }, [createdAt, expiresAt, progress, pulseOpacity, isPulsing, hasExpired, onExpire]);

  // Set up interval
  useEffect(() => {
    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => {
      clearInterval(interval);
      cancelAnimation(pulseOpacity);
    };
  }, [updateTimer, pulseOpacity]);

  const timerColor = getTimerColor(currentProgress);
  const minutesLeft = Math.floor(differenceInSeconds(new Date(expiresAt), new Date()) / 60);
  const shouldPulse = minutesLeft < config.TIMER_PULSE_THRESHOLD && minutesLeft > 0;

  // Animated styles
  const barFillStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
    opacity: pulseOpacity.value,
  }));

  return (
    <View style={styles.container}>
      {(showLabel || showTimeLeft) && (
        <View style={styles.labelRow}>
          {showTimeLeft && (
            <Text style={[textStyles.caption1, { color: timerColor }]}>
              {timeText} left
            </Text>
          )}
        </View>
      )}

      {/* Timer Bar */}
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.fill,
            {
              backgroundColor: timerColor,
            },
            barFillStyle,
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  track: {
    width: '100%',
    height: 4, // Per spec
    backgroundColor: colors.backgroundTertiary,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: borderRadius.full,
    // Smooth color transitions handled by React state
  },
});
