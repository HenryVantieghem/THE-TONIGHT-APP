/**
 * Scena - User Search Result Component
 * Display user in search results with friend status
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { GlassCard } from './GlassCard';
import { Avatar } from './Avatar';
import { GlassButton } from './GlassButton';
import { colors, typography, spacing } from '../theme';

export type FriendStatus = 'none' | 'pending' | 'friends';

interface UserSearchResultProps {
  user: {
    id: string;
    username: string;
    avatar_url?: string | null;
    bio?: string | null;
  };
  friendStatus: FriendStatus;
  onPress?: () => void;
  onAddFriend?: () => void;
  loading?: boolean;
}

export const UserSearchResult: React.FC<UserSearchResultProps> = ({
  user,
  friendStatus,
  onPress,
  onAddFriend,
  loading = false,
}) => {
  const getButtonText = () => {
    switch (friendStatus) {
      case 'friends':
        return 'friends';
      case 'pending':
        return 'pending';
      default:
        return 'add friend';
    }
  };

  return (
    <Animated.View entering={FadeInUp.duration(300)}>
      <Pressable onPress={onPress}>
        <GlassCard style={styles.card}>
          <View style={styles.content}>
            <Avatar
              uri={user.avatar_url}
              username={user.username}
              size={56}
            />
            
            <View style={styles.info}>
              <Text style={styles.username}>{user.username}</Text>
              {user.bio && (
                <Text style={styles.bio} numberOfLines={1}>{user.bio}</Text>
              )}
            </View>

            {friendStatus !== 'friends' && onAddFriend && (
              <GlassButton
                title={getButtonText()}
                onPress={onAddFriend}
                variant={friendStatus === 'pending' ? 'secondary' : 'primary'}
                size="small"
                disabled={friendStatus === 'pending' || loading}
              />
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
    marginRight: spacing.md,
  },
  username: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    textTransform: 'lowercase',
    marginBottom: spacing.xs / 2,
  },
  bio: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
    textTransform: 'lowercase',
  },
});

