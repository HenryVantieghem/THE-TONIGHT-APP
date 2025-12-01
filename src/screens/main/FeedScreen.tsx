import React, { useEffect, useCallback, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Platform,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
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
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/config';
import {
  liquidGlass,
  glassShadows,
  glassMotion,
  glassColors,
  glassTabBar,
} from '../../constants/liquidGlass';
import type { Post, ReactionEmoji, MainStackParamList } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<Post>);

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
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);

  useEffect(() => {
    const delay = Math.min(index * 80, 240);
    
    opacity.value = withTiming(1, {
      duration: glassMotion.duration.smooth,
    });
    translateY.value = withSpring(0, {
      ...glassMotion.spring.smooth,
      delay,
    });
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
  const { activePosts, loadPosts, toggleReaction, deletePost } = usePosts();
  const { friendIds, loadFriends, pendingRequests } = useFriends();

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Scroll tracking for Liquid Glass header animation
  const scrollY = useSharedValue(0);
  const headerHeight = 56 + insets.top;

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Initial load
  useEffect(() => {
    const initialLoad = async () => {
      setIsLoading(true);
      await Promise.all([loadPosts(), loadFriends()]);
      setIsLoading(false);
    };

    initialLoad();
  }, [loadPosts, loadFriends]);

  // Refresh posts when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadPosts();
    });

    return unsubscribe;
  }, [navigation, loadPosts]);

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

  // Liquid Glass Header Animation
  const headerBackgroundStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 50, 100],
      [0.6, 0.85, 1],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  const headerShadowStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 60],
      [0, 1],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  const renderHeader = () => {
    return (
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        {/* Liquid Glass Background */}
        <Animated.View style={[StyleSheet.absoluteFill, headerBackgroundStyle]}>
          {Platform.OS === 'ios' ? (
            <BlurView
              intensity={liquidGlass.blur.regular}
              tint="light"
              style={StyleSheet.absoluteFill}
            />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.background }]} />
          )}
          {/* Glass material color layer */}
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: liquidGlass.material.primary.backgroundColor },
            ]}
          />
          {/* Top highlight gradient */}
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.4)', 'transparent']}
            style={[StyleSheet.absoluteFill, { height: '60%' }]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          />
        </Animated.View>

        {/* Header Content */}
        <View style={styles.headerContent}>
          {/* Friends Button - Glass Pill Style */}
          <TouchableOpacity
            onPress={handleFriendsPress}
            style={styles.headerButton}
            activeOpacity={0.7}
          >
            <View style={styles.glassIconButton}>
              {Platform.OS === 'ios' && (
                <BlurView
                  intensity={liquidGlass.blur.light}
                  tint="light"
                  style={StyleSheet.absoluteFill}
                />
              )}
              <View style={styles.glassIconBg} />
              <Text style={styles.menuIcon}>👥</Text>
              {pendingRequests.length > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {pendingRequests.length > 9 ? '9+' : pendingRequests.length}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          {/* Title with Logo */}
          <View style={styles.titleContainer}>
            <DiscoBallLogo size={28} animated={true} />
            <Text style={styles.title}>Tonight</Text>
          </View>

          {/* Profile Button - Glass Avatar Ring */}
          <TouchableOpacity
            onPress={handleProfilePress}
            style={styles.headerButton}
            activeOpacity={0.7}
          >
            <View style={styles.avatarRing}>
              <Avatar
                uri={user?.avatar_url}
                name={user?.username}
                size="small"
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* Bottom divider with shadow */}
        <Animated.View style={[styles.headerDivider, headerShadowStyle]} />
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
        <View style={{ paddingTop: headerHeight }}>
          {renderLoadingState()}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Liquid Glass Header */}
      {renderHeader()}

      {/* Feed List */}
      <AnimatedFlatList
        data={activePosts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingTop: headerHeight + spacing.md },
          activePosts.length === 0 && styles.emptyListContent,
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
            progressBackgroundColor={colors.background}
            progressViewOffset={headerHeight}
          />
        }
        ListEmptyComponent={renderEmptyState}
        // Performance optimizations
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        windowSize={5}
        initialNumToRender={3}
        getItemLayout={(data, index) => ({
          length: 450,
          offset: 450 * index,
          index,
        })}
      />

      {/* Floating Camera Button - Liquid Glass Style */}
      <FloatingCameraButton onPress={handleCameraPress} variant="gradient" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    overflow: 'hidden',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glassIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  glassIconBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: liquidGlass.material.subtle.backgroundColor,
    borderRadius: 20,
    borderWidth: liquidGlass.border.width,
    borderColor: liquidGlass.border.color,
  },
  menuIcon: {
    fontSize: 20,
    zIndex: 1,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: colors.white,
    ...glassShadows.ambient,
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
    color: glassColors.text.primary,
    letterSpacing: -0.5,
  },
  avatarRing: {
    borderRadius: 22,
    padding: 2,
    borderWidth: 2,
    borderColor: liquidGlass.border.colorStrong,
  },
  headerDivider: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: liquidGlass.border.color,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: 120,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    padding: spacing.md,
  },
});
