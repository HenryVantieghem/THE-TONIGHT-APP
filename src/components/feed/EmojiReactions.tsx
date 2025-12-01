import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { spacing, config, borderRadius } from '../../constants/config';
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

  const handlePress = useCallback(async () => {
    if (disabled) return;

    // Haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Bounce animation for the whole button
    scale.value = withSequence(
      withSpring(0.85, { damping: 10, stiffness: 400 }),
      withSpring(1, { damping: 8, stiffness: 300 })
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
    scale.value = withSpring(0.92, { damping: 15, stiffness: 400 });
  }, [disabled, scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 12, stiffness: 300 });
  }, [scale]);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

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
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.reactionBackground,
    gap: 4,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  emojiButtonSelected: {
    backgroundColor: colors.reactionActive,
    borderColor: colors.reactionBorder,
  },
  emoji: {
    fontSize: 20,
  },
  count: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.textSecondary,
    minWidth: 14,
    textAlign: 'center',
  },
  countSelected: {
    color: colors.reactionBorder,
  },

  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactEmoji: {
    fontSize: 14,
    marginLeft: -4,
  },
  compactCount: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
    fontWeight: '500',
  },
});
