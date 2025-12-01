import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { spacing, config, borderRadius } from '../../constants/config';
import {
  liquidGlass,
  glassShadows,
  glassMotion,
  glassColors,
} from '../../constants/liquidGlass';
import type { Reaction, ReactionEmoji } from '../../types';

interface EmojiReactionsProps {
  reactions: Reaction[];
  myReaction?: Reaction | null;
  onReact: (emoji: ReactionEmoji) => void;
  disabled?: boolean;
}

export function EmojiReactions({
  reactions,
  myReaction,
  onReact,
  disabled = false,
}: EmojiReactionsProps) {
  // Count reactions by emoji
  const reactionCounts = config.REACTIONS.reduce(
    (acc, emoji) => {
      acc[emoji] = reactions.filter((r) => r.emoji === emoji).length;
      return acc;
    },
    {} as Record<ReactionEmoji, number>
  );

  return (
    <View style={styles.container}>
      {config.REACTIONS.map((emoji) => {
        const count = reactionCounts[emoji];
        const isSelected = myReaction?.emoji === emoji;

        return (
          <EmojiButton
            key={emoji}
            emoji={emoji}
            count={count}
            isSelected={isSelected}
            onPress={() => onReact(emoji)}
            disabled={disabled}
          />
        );
      })}
    </View>
  );
}

interface EmojiButtonProps {
  emoji: ReactionEmoji;
  count: number;
  isSelected: boolean;
  onPress: () => void;
  disabled: boolean;
}

function EmojiButton({
  emoji,
  count,
  isSelected,
  onPress,
  disabled,
}: EmojiButtonProps) {
  const scale = useSharedValue(1);
  const emojiScale = useSharedValue(1);
  const pressProgress = useSharedValue(0);

  const handlePress = useCallback(async () => {
    if (disabled) return;

    // Haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Bounce animation for the whole button
    scale.value = withSequence(
      withSpring(0.85, glassMotion.spring.snappy),
      withSpring(1, glassMotion.spring.smooth)
    );

    // Extra bounce for the emoji itself when selecting
    if (!isSelected) {
      emojiScale.value = withSequence(
        withTiming(1.4, { duration: 100 }),
        withSpring(1, { damping: 6, stiffness: 200 })
      );
    }

    onPress();
  }, [disabled, isSelected, onPress, scale, emojiScale]);

  const handlePressIn = useCallback(() => {
    if (disabled) return;
    pressProgress.value = withSpring(1, glassMotion.spring.snappy);
  }, [disabled, pressProgress]);

  const handlePressOut = useCallback(() => {
    pressProgress.value = withSpring(0, glassMotion.spring.smooth);
  }, [pressProgress]);

  const animatedButtonStyle = useAnimatedStyle(() => {
    const scaleValue = interpolate(
      pressProgress.value,
      [0, 1],
      [1, glassMotion.pressScale.moderate],
      Extrapolation.CLAMP
    );
    return {
      transform: [{ scale: scale.value * scaleValue }],
    };
  });

  const animatedEmojiStyle = useAnimatedStyle(() => ({
    transform: [{ scale: emojiScale.value }],
  }));

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
    >
      <Animated.View
        style={[
          styles.emojiButton,
          isSelected && styles.emojiButtonSelected,
          animatedButtonStyle,
        ]}
      >
        {/* Glass Background */}
        <View style={styles.glassBackground}>
          {Platform.OS === 'ios' && (
            <BlurView
              intensity={isSelected ? liquidGlass.blur.light : liquidGlass.blur.subtle}
              tint="light"
              style={StyleSheet.absoluteFill}
            />
          )}
          <View
            style={[
              styles.glassBg,
              isSelected && styles.glassBgSelected,
            ]}
          />
          {/* Top highlight */}
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.35)', 'transparent']}
            style={styles.glassHighlight}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 0.6 }}
          />
        </View>

        {/* Border */}
        <View
          style={[
            styles.glassBorder,
            isSelected && styles.glassBorderSelected,
          ]}
        />

        {/* Content */}
        <Animated.Text style={[styles.emoji, animatedEmojiStyle]}>
          {emoji}
        </Animated.Text>
        {count > 0 && (
          <Text style={[styles.count, isSelected && styles.countSelected]}>
            {count}
          </Text>
        )}
      </Animated.View>
    </Pressable>
  );
}

// Compact version for smaller displays
export function EmojiReactionsCompact({
  reactions,
}: {
  reactions: Reaction[];
}) {
  if (reactions.length === 0) return null;

  // Get unique emojis
  const uniqueEmojis = [...new Set(reactions.map((r) => r.emoji))];

  return (
    <View style={styles.compactContainer}>
      {/* Glass pill background */}
      <View style={styles.compactGlass}>
        {Platform.OS === 'ios' && (
          <BlurView
            intensity={liquidGlass.blur.subtle}
            tint="light"
            style={StyleSheet.absoluteFill}
          />
        )}
        <View style={styles.compactGlassBg} />
      </View>
      {uniqueEmojis.slice(0, 3).map((emoji, index) => (
        <Text key={emoji} style={[styles.compactEmoji, { zIndex: 3 - index }]}>
          {emoji}
        </Text>
      ))}
      {reactions.length > 0 && (
        <Text style={styles.compactCount}>{reactions.length}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: spacing.sm,
  },
  emojiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.xs + 4,
    borderRadius: 20,
    gap: 4,
    overflow: 'hidden',
    minHeight: 40,
  },
  emojiButtonSelected: {
    // Styles handled by child elements
  },
  glassBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
    overflow: 'hidden',
  },
  glassBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: liquidGlass.material.subtle.backgroundColor,
  },
  glassBgSelected: {
    backgroundColor: `${colors.primary}15`,
  },
  glassHighlight: {
    ...StyleSheet.absoluteFillObject,
    height: '50%',
  },
  glassBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
    borderWidth: liquidGlass.border.width,
    borderColor: liquidGlass.border.color,
    pointerEvents: 'none',
  },
  glassBorderSelected: {
    borderColor: `${colors.primary}50`,
    borderWidth: 1.5,
  },
  emoji: {
    fontSize: 20,
    zIndex: 1,
  },
  count: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: glassColors.text.secondary,
    minWidth: 14,
    textAlign: 'center',
    zIndex: 1,
  },
  countSelected: {
    color: colors.primary,
  },

  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 14,
    overflow: 'hidden',
  },
  compactGlass: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 14,
    overflow: 'hidden',
  },
  compactGlassBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: liquidGlass.material.subtle.backgroundColor,
    borderWidth: liquidGlass.border.width,
    borderColor: liquidGlass.border.color,
    borderRadius: 14,
  },
  compactEmoji: {
    fontSize: 14,
    marginLeft: -4,
    zIndex: 1,
  },
  compactCount: {
    fontSize: typography.sizes.xs,
    color: glassColors.text.secondary,
    marginLeft: spacing.xs,
    fontWeight: '500',
    zIndex: 1,
  },
});
