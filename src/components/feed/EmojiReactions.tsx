import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { spacing, config } from '../../constants/config';
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

function EmojiButton({ emoji, count, isSelected, onPress, disabled }: EmojiButtonProps) {
  const handlePress = useCallback(async () => {
    if (disabled) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }, [disabled, onPress]);

  return (
    <Pressable onPress={handlePress} disabled={disabled}>
      <View style={[styles.emojiButton, isSelected && styles.emojiButtonSelected]}>
        <Text style={styles.emoji}>{emoji}</Text>
        {count > 0 && (
          <Text style={[styles.count, isSelected && styles.countSelected]}>{count}</Text>
        )}
      </View>
    </Pressable>
  );
}

export function EmojiReactionsCompact({ reactions }: { reactions: Reaction[] }) {
  if (reactions.length === 0) return null;

  const uniqueEmojis = [...new Set(reactions.map((r) => r.emoji))];

  return (
    <View style={styles.compactContainer}>
      {uniqueEmojis.slice(0, 3).map((emoji, index) => (
        <Text key={emoji} style={[styles.compactEmoji, { zIndex: 3 - index }]}>
          {emoji}
        </Text>
      ))}
      {reactions.length > 0 && <Text style={styles.compactCount}>{reactions.length}</Text>}
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
    minHeight: 40,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emojiButtonSelected: {
    backgroundColor: `${colors.primary}15`,
    borderColor: `${colors.primary}50`,
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
    color: colors.primary,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 14,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.border,
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
