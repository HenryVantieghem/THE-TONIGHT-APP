import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
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

  const handlePress = async (emoji: ReactionEmoji) => {
    if (disabled) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onReact(emoji);
  };

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
            onPress={() => handlePress(emoji)}
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
  const scaleValue = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.85,
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

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={0.9}
    >
      <Animated.View
        style={[
          styles.emojiButton,
          isSelected && styles.emojiButtonSelected,
          { transform: [{ scale: scaleValue }] },
        ]}
      >
        <Text style={styles.emoji}>{emoji}</Text>
        {count > 0 && (
          <Text
            style={[styles.count, isSelected && styles.countSelected]}
          >
            {count}
          </Text>
        )}
      </Animated.View>
    </TouchableOpacity>
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
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    gap: 4,
  },
  emojiButtonSelected: {
    backgroundColor: colors.primaryLight + '30',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  emoji: {
    fontSize: 20,
  },
  count: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
    minWidth: 16,
    textAlign: 'center',
  },
  countSelected: {
    color: colors.primary,
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
  },
});
