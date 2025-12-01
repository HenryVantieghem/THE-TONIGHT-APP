import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PostCard } from '../../components/feed/PostCard';
import { EmptyState, PostsLoadingPlaceholder } from '../../components/feed/EmptyState';
import { FloatingCameraButton } from '../../components/camera/CaptureButton';
import { Avatar } from '../../components/ui/Avatar';
import { usePosts } from '../../hooks/usePosts';
import { useAuth } from '../../hooks/useAuth';
import { useFriends } from '../../hooks/useFriends';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { spacing } from '../../constants/config';
import type { Post, ReactionEmoji, MainStackParamList } from '../../types';

type FeedNavigationProp = NativeStackNavigationProp<MainStackParamList, 'Feed'>;

export function FeedScreen() {
  const navigation = useNavigation<FeedNavigationProp>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { activePosts, loadPosts, toggleReaction, deletePost } = usePosts();
  const { friendIds, loadFriends } = useFriends();

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Initial load
  useEffect(() => {
    const initialLoad = async () => {
      setIsLoading(true);
      await Promise.all([loadPosts(), loadFriends()]);
      setIsLoading(false);
    };

    initialLoad();
  }, [loadPosts, loadFriends]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadPosts();
    setIsRefreshing(false);
  }, [loadPosts]);

  const handleReact = useCallback(
    async (postId: string, emoji: ReactionEmoji) => {
      await toggleReaction(postId, emoji);
    },
    [toggleReaction]
  );

  const handleDelete = useCallback(
    async (postId: string) => {
      await deletePost(postId);
    },
    [deletePost]
  );

  const handleUserPress = useCallback(
    (userId: string) => {
      navigation.navigate('Profile', { userId });
    },
    [navigation]
  );

  const handleCameraPress = useCallback(() => {
    navigation.navigate('Camera');
  }, [navigation]);

  const handleProfilePress = useCallback(() => {
    navigation.navigate('Profile', {});
  }, [navigation]);

  const handleFriendsPress = useCallback(() => {
    navigation.navigate('Friends');
  }, [navigation]);

  const renderPost = useCallback(
    ({ item }: { item: Post }) => (
      <PostCard
        post={item}
        isOwner={item.user_id === user?.id}
        onReact={handleReact}
        onDelete={handleDelete}
        onUserPress={handleUserPress}
        onMediaPress={() => {}}
      />
    ),
    [user?.id, handleReact, handleDelete, handleUserPress]
  );

  const renderHeader = () => (
    <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
      <TouchableOpacity onPress={handleFriendsPress}>
        <Text style={styles.menuIcon}>☰</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Tonight</Text>

      <TouchableOpacity onPress={handleProfilePress}>
        <Avatar
          uri={user?.avatar_url}
          name={user?.username}
          size="small"
        />
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => {
    if (friendIds.length === 0) {
      return (
        <EmptyState
          type="no-friends"
          onAction={handleFriendsPress}
          actionLabel="Add Friends"
        />
      );
    }

    return (
      <EmptyState
        type="no-posts"
        onAction={handleCameraPress}
        actionLabel="Take a Photo"
      />
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <PostsLoadingPlaceholder count={3} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}

      <FlatList
        data={activePosts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          activePosts.length === 0 && styles.emptyListContent,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={renderEmptyState}
      />

      <FloatingCameraButton onPress={handleCameraPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuIcon: {
    fontSize: 24,
    color: colors.text,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: 120, // Space for floating button
  },
  emptyListContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    padding: spacing.md,
  },
});
