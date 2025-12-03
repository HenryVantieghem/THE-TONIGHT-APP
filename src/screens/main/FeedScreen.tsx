import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { PostCard } from '../../components/feed/PostCard';
import { EmptyState } from '../../components/feed/EmptyState';
import { PostCardSkeleton } from '../../components/feed/PostCardSkeleton';
import { FloatingCameraButton } from '../../components/ui/FloatingCameraButton';
import { usePosts } from '../../hooks/usePosts';
import { useAuth } from '../../hooks/useAuth';
import { useFriends } from '../../hooks/useFriends';
import { colors, shadows } from '../../constants/colors';
import { textStyles } from '../../constants/typography';
import { spacing } from '../../constants/config';
import type { Post, ReactionEmoji, MainStackParamList } from '../../types';

type FeedNavigationProp = NativeStackNavigationProp<MainStackParamList, 'Feed'>;

// Animated post card wrapper for entry animations (per spec)
function AnimatedPostCard({
  post,
  isOwner,
  onReact,
  onDelete,
  onUserPress,
  index,
}: {
  post: Post;
  isOwner: boolean;
  onReact: (postId: string, emoji: ReactionEmoji) => void;
  onDelete: (postId: string) => void;
  onUserPress: (userId: string) => void;
  index: number;
}) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    const delay = Math.min(index * 50, 300); // Stagger 50ms per spec
    
    setTimeout(() => {
      opacity.value = withTiming(1, { duration: 300 });
      translateY.value = withSpring(0, {
        damping: 15,
        stiffness: 150,
      });
    }, delay);
  }, [index, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <PostCard
        post={post}
        isOwner={isOwner}
        onReact={onReact}
        onDelete={onDelete}
        onUserPress={onUserPress}
        onMediaPress={() => {}}
      />
    </Animated.View>
  );
}

export function FeedScreen() {
  const navigation = useNavigation<FeedNavigationProp>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { activePosts, loadPosts, loadMorePosts, refreshPosts, toggleReaction, deletePost, isRefreshing } = usePosts();
  const { friendIds, loadFriends } = useFriends();

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Initial load
  useEffect(() => {
    const initialLoad = async () => {
      setIsLoading(true);
      await Promise.all([loadPosts(true), loadFriends()]);
      setIsLoading(false);
    };

    initialLoad();
  }, [loadPosts, loadFriends]);

  // Refresh posts when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refreshPosts();
    });

    return unsubscribe;
  }, [navigation, refreshPosts]);

  const handleRefresh = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await refreshPosts();
  }, [refreshPosts]);

  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || isRefreshing) return;
    
    setIsLoadingMore(true);
    try {
      await loadMorePosts();
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, isRefreshing, loadMorePosts]);

  const handleReact = useCallback(
    async (postId: string, emoji: ReactionEmoji) => {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await toggleReaction(postId, emoji);
    },
    [toggleReaction]
  );

  const handleDelete = useCallback(
    (postId: string) => {
      Alert.alert(
        'Delete Post',
        'Are you sure you want to delete this post? This action cannot be undone.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              await deletePost(postId);
            },
          },
        ],
        { cancelable: true }
      );
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

  const handleMenuPress = useCallback(() => {
    // Menu action (could open settings or drawer)
    navigation.navigate('Settings');
  }, [navigation]);

  const handleProfilePress = useCallback(() => {
    navigation.navigate('Profile', {});
  }, [navigation]);

  const renderPost = useCallback(
    ({ item, index }: { item: Post; index: number }) => (
      <AnimatedPostCard
        post={item}
        isOwner={item.user_id === user?.id}
        onReact={handleReact}
        onDelete={handleDelete}
        onUserPress={handleUserPress}
        index={index}
      />
    ),
    [user?.id, handleReact, handleDelete, handleUserPress]
  );

  const renderHeader = () => (
    <View style={[styles.header, { paddingTop: insets.top }]}>
      <TouchableOpacity onPress={handleMenuPress} hitSlop={spacing.sm}>
        <Ionicons name="menu" size={24} color={colors.textPrimary} />
      </TouchableOpacity>
      
      <Text style={[textStyles.title2, styles.title]}>Experiences</Text>
      
      <TouchableOpacity onPress={handleProfilePress} hitSlop={spacing.sm}>
        <Ionicons name="person-circle" size={24} color={colors.textPrimary} />
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => {
    if (friendIds.length === 0) {
      return (
        <EmptyState
          type="no-friends"
          onAction={() => navigation.navigate('Friends')}
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

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      {isLoading ? (
        <View style={styles.content}>
          {[1, 2, 3].map((i) => (
            <PostCardSkeleton key={i} />
          ))}
        </View>
      ) : (
        <FlatList
          data={activePosts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.content,
            activePosts.length === 0 && styles.emptyContent,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.accent}
            />
          }
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isLoadingMore ? (
              <View style={styles.loadingMore}>
                <ActivityIndicator size="small" color={colors.accent} />
              </View>
            ) : null
          }
        />
      )}

      {/* FAB: Camera button center bottom, 24px above safe area (per spec) */}
      <View style={[styles.fabContainer, { bottom: insets.bottom + spacing.lg }]}>
        <FloatingCameraButton onPress={handleCameraPress} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    color: colors.textPrimary,
  },
  content: {
    padding: spacing.md,
    paddingBottom: 100, // Space for FAB
  },
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
  },
  fabContainer: {
    position: 'absolute',
    alignSelf: 'center',
  },
  loadingMore: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
});
