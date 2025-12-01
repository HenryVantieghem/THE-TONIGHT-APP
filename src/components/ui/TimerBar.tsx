import React, { useEffect, useMemo, useCallback } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import { differenceInSeconds } from 'date-fns';
import * as Haptics from 'expo-haptics';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/config';

interface TimerBarProps {
  createdAt: string;
  expiresAt: string;
  showLabel?: boolean;
  showTimeLeft?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onExpire?: () => void;
}

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

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

// Get gradient colors based on progress
function getGradientColors(progress: number): readonly [string, string] {
  if (progress > 0.5) {
    return [colors.timerGreen, colors.timerGreenDark] as const;
  }
  if (progress > 0.25) {
    return [colors.timerYellow, colors.timerYellowDark] as const;
  }
  return [colors.timerRed, colors.timerRedDark] as const;
}

// Format time remaining
function formatTimeRemaining(expiresAt: string): string {
  const seconds = differenceInSeconds(new Date(expiresAt), new Date());

  if (seconds <= 0) return 'Expired';
  if (seconds < 60) return `${seconds}s left`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m left`;

  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h left`;
}

export function TimerBar({
  createdAt,
  expiresAt,
  showLabel = true,
  showTimeLeft = true,
  size = 'md',
  onExpire,
}: TimerBarProps) {
  // Animation values
  const progress = useSharedValue(calculateProgress(createdAt, expiresAt));
  const pulseOpacity = useSharedValue(1);
  const pulseScale = useSharedValue(1);
  const urgencyGlow = useSharedValue(0);

  // Memoized initial values
  const initialProgress = useMemo(
    () => calculateProgress(createdAt, expiresAt),
    [createdAt, expiresAt]
  );

  const [timeText, setTimeText] = React.useState(() => formatTimeRemaining(expiresAt));
  const [currentProgress, setCurrentProgress] = React.useState(initialProgress);
  const [hasExpired, setHasExpired] = React.useState(false);
  const [hasTriggeredUrgency, setHasTriggeredUrgency] = React.useState(false);

  // Update timer
  const updateTimer = useCallback(() => {
    const newProgress = calculateProgress(createdAt, expiresAt);
    const newTimeText = formatTimeRemaining(expiresAt);

    setCurrentProgress(newProgress);
    setTimeText(newTimeText);

    // Animate progress bar
    progress.value = withTiming(newProgress, {
      duration: 1000,
      easing: Easing.linear,
    });

    // Handle expiration
    if (newProgress <= 0 && !hasExpired) {
      setHasExpired(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      onExpire?.();
    }

    // Start pulsing when critical (< 25%)
    if (newProgress < 0.25 && newProgress > 0) {
      if (!hasTriggeredUrgency) {
        setHasTriggeredUrgency(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        // Start pulse animation
        pulseOpacity.value = withRepeat(
          withSequence(
            withTiming(0.6, { duration: 400, easing: Easing.inOut(Easing.ease) }),
            withTiming(1, { duration: 400, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );

        // Start scale pulse
        pulseScale.value = withRepeat(
          withSequence(
            withTiming(1.02, { duration: 400, easing: Easing.inOut(Easing.ease) }),
            withTiming(1, { duration: 400, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );

        // Glow animation
        urgencyGlow.value = withRepeat(
          withSequence(
            withTiming(1, { duration: 600 }),
            withTiming(0.3, { duration: 600 })
          ),
          -1,
          true
        );
      }
    }

    // Low priority haptic at 25%
    if (newProgress < 0.25 && newProgress >= 0.24) {
      Haptics.selectionAsync();
    }
  }, [createdAt, expiresAt, progress, pulseOpacity, pulseScale, urgencyGlow, hasExpired, hasTriggeredUrgency, onExpire]);

  // Set up interval
  useEffect(() => {
    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => {
      clearInterval(interval);
      cancelAnimation(pulseOpacity);
      cancelAnimation(pulseScale);
      cancelAnimation(urgencyGlow);
    };
  }, [updateTimer, pulseOpacity, pulseScale, urgencyGlow]);

  // Size configurations
  const sizeConfig = {
    sm: { height: 4, labelSize: 11, iconSize: 10 },
    md: { height: 6, labelSize: 13, iconSize: 12 },
    lg: { height: 8, labelSize: 15, iconSize: 14 },
  };

  const config = sizeConfig[size];
  const gradientColors = getGradientColors(currentProgress);

  // Animated styles
  const barContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: pulseScale.value }],
  }));

  const barFillStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
    opacity: pulseOpacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => {
    const opacity = interpolate(urgencyGlow.value, [0, 1], [0, 0.6]);
    return {
      opacity,
      shadowOpacity: opacity,
    };
  });

  // Label color based on progress
  const labelColor = currentProgress > 0.5
    ? colors.timerGreen
    : currentProgress > 0.25
    ? colors.timerYellow
    : colors.timerRed;

  return (
    <View style={styles.container}>
      {(showLabel || showTimeLeft) && (
        <View style={styles.labelRow}>
          <Text style={[styles.clockIcon, { fontSize: config.iconSize }]}>
            {currentProgress <= 0.25 ? '🔥' : '⏱️'}
          </Text>
          <Text
            style={[
              styles.timeText,
              {
                fontSize: config.labelSize,
                color: labelColor,
              },
            ]}
          >
            {timeText}
          </Text>
          {currentProgress <= 0.25 && currentProgress > 0 && (
            <Text style={styles.urgentIndicator}>!</Text>
          )}
        </View>
      )}

      <Animated.View style={[styles.trackContainer, barContainerStyle]}>
        {/* Background track */}
        <View style={[styles.track, { height: config.height }]}>
          {/* Animated fill with gradient */}
          <Animated.View
            style={[
              styles.fillContainer,
              barFillStyle,
              { height: config.height },
            ]}
          >
            <LinearGradient
              colors={gradientColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[StyleSheet.absoluteFill, { borderRadius: borderRadius.round }]}
            />
          </Animated.View>

          {/* Urgency glow overlay */}
          {currentProgress <= 0.25 && currentProgress > 0 && (
            <Animated.View
              style={[
                styles.glowOverlay,
                glowStyle,
                {
                  height: config.height,
                  shadowColor: colors.timerRed,
                },
              ]}
            />
          )}
        </View>
      </Animated.View>
    </View>
  );
}

// Compact timer bar for smaller displays (like in lists)
export function TimerBarCompact({
  createdAt,
  expiresAt,
}: Pick<TimerBarProps, 'createdAt' | 'expiresAt'>) {
  const [progress, setProgress] = React.useState(() =>
    calculateProgress(createdAt, expiresAt)
  );

  useEffect(() => {
    const updateProgress = () => {
      setProgress(calculateProgress(createdAt, expiresAt));
    };

    const interval = setInterval(updateProgress, 1000);
    return () => clearInterval(interval);
  }, [createdAt, expiresAt]);

  const gradientColors = getGradientColors(progress);

  return (
    <View style={[styles.track, styles.compactBar]}>
      <View
        style={[
          styles.compactFill,
          { width: `${progress * 100}%` },
        ]}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </View>
    </View>
  );
}

// Mini timer badge for notifications/thumbnails
export function TimerBadge({
  createdAt,
  expiresAt,
}: Pick<TimerBarProps, 'createdAt' | 'expiresAt'>) {
  const [timeText, setTimeText] = React.useState(() => formatTimeRemaining(expiresAt));
  const progress = calculateProgress(createdAt, expiresAt);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeText(formatTimeRemaining(expiresAt));
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const badgeColor = progress > 0.5
    ? colors.timerGreen
    : progress > 0.25
    ? colors.timerYellow
    : colors.timerRed;

  return (
    <View style={[styles.badge, { backgroundColor: badgeColor }]}>
      <Text style={styles.badgeText}>{timeText}</Text>
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
  clockIcon: {
    marginRight: 4,
  },
  timeText: {
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  urgentIndicator: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '800',
    color: colors.timerRed,
  },
  trackContainer: {
    width: '100%',
  },
  track: {
    width: '100%',
    backgroundColor: colors.border,
    borderRadius: borderRadius.round,
    overflow: 'hidden',
  },
  fillContainer: {
    borderRadius: borderRadius.round,
    overflow: 'hidden',
  },
  glowOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    borderRadius: borderRadius.round,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    elevation: 4,
  },

  // Compact styles
  compactBar: {
    height: 4,
  },
  compactFill: {
    height: 4,
    borderRadius: borderRadius.round,
    overflow: 'hidden',
  },

  // Badge styles
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  badgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    color: colors.white,
  },
});
