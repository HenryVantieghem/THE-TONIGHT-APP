import React, { useEffect, useCallback, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { PostCard } from '../../components/feed/PostCard';
import { EmptyState } from '../../components/feed/EmptyState';
import { PostCardSkeleton } from '../../components/feed/PostCardSkeleton';
import { FloatingCameraButton } from '../../components/ui/FloatingCameraButton';
import { Avatar } from '../../components/ui/Avatar';
import { DiscoBallLogo } from '../../components/ui/DiscoBallLogo';
import { usePosts } from '../../hooks/usePosts';
import { useAuth } from '../../hooks/useAuth';
import { useFriends } from '../../hooks/useFriends';
import { colors, shadows } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { spacing } from '../../constants/config';
import type { Post, ReactionEmoji, MainStackParamList } from '../../types';

type FeedNavigationProp = NativeStackNavigationProp<MainStackParamList, 'Feed'>;

// Animated post card wrapper for entry animations
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
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    const delay = Math.min(index * 100, 300); // Cap delay at 300ms

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index, fadeAnim, slideAnim]);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
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
  const { activePosts, loadPosts, toggleReaction, deletePost } = usePosts();
  const { friendIds, loadFriends, pendingRequests } = useFriends();

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

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
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await loadPosts();
    setIsRefreshing(false);
  }, [loadPosts]);

  const handleReact = useCallback(
    async (postId: string, emoji: ReactionEmoji) => {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await toggleReaction(postId, emoji);
    },
    [toggleReaction]
  );

  const handleDelete = useCallback(
    async (postId: string) => {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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

  const renderHeader = () => {
    // Animated header opacity based on scroll
    const headerOpacity = scrollY.interpolate({
      inputRange: [0, 50],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });

    return (
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        {/* Blur background when scrolled */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { opacity: headerOpacity },
          ]}
        >
          {Platform.OS === 'ios' ? (
            <BlurView intensity={80} style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.background }]} />
          )}
        </Animated.View>

        <TouchableOpacity
          onPress={handleFriendsPress}
          style={styles.headerButton}
          activeOpacity={0.7}
        >
          <Text style={styles.menuIcon}>👥</Text>
          {pendingRequests.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {pendingRequests.length > 9 ? '9+' : pendingRequests.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <DiscoBallLogo size={28} animated={true} />
          <Text style={styles.title}>Tonight</Text>
        </View>

        <TouchableOpacity
          onPress={handleProfilePress}
          style={styles.headerButton}
          activeOpacity={0.7}
        >
          <Avatar
            uri={user?.avatar_url}
            name={user?.username}
            size="small"
          />
        </TouchableOpacity>
      </View>
    );
  };

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

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      {[1, 2, 3].map((_, index) => (
        <PostCardSkeleton key={index} />
      ))}
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        {renderLoadingState()}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}

      <Animated.FlatList
        data={activePosts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          activePosts.length === 0 && styles.emptyListContent,
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
            progressBackgroundColor={colors.background}
          />
        }
        ListEmptyComponent={renderEmptyState}
        // Performance optimizations
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        windowSize={5}
        initialNumToRender={3}
        getItemLayout={(data, index) => ({
          length: 450, // Approximate height of PostCard
          offset: 450 * index,
          index,
        })}
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
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    zIndex: 10,
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: {
    fontSize: 24,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: typography.weights.bold,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    letterSpacing: -0.5,
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
