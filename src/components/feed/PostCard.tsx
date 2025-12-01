import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { Video, ResizeMode } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { Avatar } from '../ui/Avatar';
import { TimerBar } from '../ui/TimerBar';
import { EmojiReactions } from './EmojiReactions';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { spacing, borderRadius, shadows } from '../../constants/config';
import type { Post, ReactionEmoji } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MEDIA_HEIGHT = SCREEN_WIDTH * 0.75;

interface PostCardProps {
  post: Post;
  isOwner: boolean;
  onReact: (postId: string, emoji: ReactionEmoji) => void;
  onDelete: (postId: string) => void;
  onUserPress: (userId: string) => void;
  onMediaPress: (post: Post) => void;
}

export function PostCard({
  post,
  isOwner,
  onReact,
  onDelete,
  onUserPress,
  onMediaPress,
}: PostCardProps) {
  const handleReact = useCallback(
    (emoji: ReactionEmoji) => {
      onReact(post.id, emoji);
    },
    [post.id, onReact]
  );

  const handleLongPress = useCallback(async () => {
    if (!isOwner) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(post.id),
        },
      ]
    );
  }, [isOwner, post.id, onDelete]);

  const handleUserPress = useCallback(() => {
    if (post.user) {
      onUserPress(post.user.id);
    }
  }, [post.user, onUserPress]);

  const handleMediaPress = useCallback(() => {
    onMediaPress(post);
  }, [post, onMediaPress]);

  const locationDisplay = post.location_city
    ? `${post.location_name}\n${post.location_city}${post.location_state ? `, ${post.location_state}` : ''}`
    : post.location_name;

  return (
    <View style={styles.container}>
      {/* Header */}
      <TouchableOpacity style={styles.header} onPress={handleUserPress}>
        <Avatar
          uri={post.user?.avatar_url}
          name={post.user?.username}
          size="medium"
        />
        <View style={styles.headerText}>
          <Text style={styles.username}>
            @{post.user?.username || 'unknown'}
          </Text>
          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.locationText} numberOfLines={2}>
              {locationDisplay}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Media */}
      <TouchableOpacity
        style={styles.mediaContainer}
        onPress={handleMediaPress}
        onLongPress={handleLongPress}
        activeOpacity={0.95}
        delayLongPress={500}
      >
        {post.media_type === 'video' ? (
          <Video
            source={{ uri: post.media_url }}
            style={styles.media}
            resizeMode={ResizeMode.COVER}
            isLooping
            isMuted
            shouldPlay
          />
        ) : (
          <Image
            source={{ uri: post.media_url }}
            style={styles.media}
            contentFit="cover"
            transition={200}
          />
        )}

        {post.media_type === 'video' && (
          <View style={styles.videoIndicator}>
            <Text style={styles.videoIcon}>▶️</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Caption */}
      {post.caption && (
        <View style={styles.captionContainer}>
          <Text style={styles.caption}>{post.caption}</Text>
        </View>
      )}

      {/* Timer Bar */}
      <View style={styles.timerContainer}>
        <TimerBar
          createdAt={post.created_at}
          expiresAt={post.expires_at}
          showTimeLeft
        />
      </View>

      {/* Reactions */}
      <View style={styles.reactionsContainer}>
        <EmojiReactions
          reactions={post.reactions || []}
          myReaction={post.my_reaction}
          onReact={handleReact}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    marginBottom: spacing.md,
    borderRadius: borderRadius.md,
    ...shadows.medium,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerText: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  username: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 2,
  },
  locationIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  locationText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    flex: 1,
  },
  mediaContainer: {
    width: '100%',
    height: MEDIA_HEIGHT,
    backgroundColor: colors.surface,
  },
  media: {
    width: '100%',
    height: '100%',
  },
  videoIndicator: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.overlay,
    borderRadius: borderRadius.xs,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  videoIcon: {
    fontSize: 12,
  },
  captionContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  caption: {
    fontSize: typography.sizes.md,
    color: colors.text,
    lineHeight: typography.lineHeights.md,
  },
  timerContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  reactionsContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
});
