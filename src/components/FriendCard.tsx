/**
 * Scena - Friend Card Component
 * Display friend with glass card styling
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { GlassCard } from './GlassCard';
import { Avatar } from './Avatar';
import { colors, typography, spacing } from '../theme';

interface FriendCardProps {
  friend: {
    id: string;
    username: string;
    avatar_url?: string | null;
  };
  onPress?: () => void;
  onRemove?: () => void;
}

export const FriendCard: React.FC<FriendCardProps> = ({ friend, onPress, onRemove }) => {
  return (
    <Animated.View entering={FadeInRight.duration(300)}>
      <Pressable onPress={onPress}>
        <GlassCard style={styles.card}>
          <View style={styles.content}>
            <Avatar
              uri={friend.avatar_url}
              username={friend.username}
              size={48}
            />
            
            <View style={styles.info}>
              <Text style={styles.username}>{friend.username}</Text>
            </View>

            {onRemove && (
              <Pressable onPress={onRemove} style={styles.removeButton}>
                <Ionicons name="close-circle" size={24} color={colors.text.tertiary} />
              </Pressable>
            )}
          </View>
        </GlassCard>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
  },
  username: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    textTransform: 'lowercase',
  },
  removeButton: {
    padding: spacing.xs,
  },
});

