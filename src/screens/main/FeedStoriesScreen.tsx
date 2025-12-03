import React, { useEffect, useCallback, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Animated,
  PanResponder,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { HeartAnimation } from '../../components/animations/HeartAnimation';
import { EmojiReactions } from '../../components/feed/EmojiReactions';
import { Avatar } from '../../components/ui/Avatar';
import { usePosts } from '../../hooks/usePosts';
import { useAuth } from '../../hooks/useAuth';
import { useFriends } from '../../hooks/useFriends';
import { colors, typography, spacing, radius } from '../../constants/theme';
import type { Post, ReactionEmoji, MainStackParamList } from '../../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const DOUBLE_TAP_DELAY = 300;

type FeedStoriesNavigationProp = NativeStackNavigationProp<MainStackParamList, 'Feed'>;

// Full-screen story-style post
function StoryPost({
  post,
  isOwner,
  onReact,
  onUserPress,
}: {
  post: Post;
  isOwner: boolean;
  onReact: (postId: string, emoji: ReactionEmoji) => void;
  onUserPress: (userId: string) => void;
}) {
  const [showHeart, setShowHeart] = useState(false);
  const lastTapRef = useRef<number>(0);

  const handleDoubleTap = () => {
    setShowHeart(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onReact(post.id, '❤️');
    setTimeout(() => setShowHeart(false), 1500);
  };

  const handleTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      handleDoubleTap();
    }
    lastTapRef.current = now;
  };

  const handleUserPress = () => {
    if (post.user) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onUserPress(post.user.id);
    }
  };

  // Calculate time remaining
  const expiresAt = new Date(post.expires_at);
  const now = new Date();
  const remaining = Math.max(0, expiresAt.getTime() - now.getTime());
  const minutesLeft = Math.floor(remaining / 60000);

  return (
    <TouchableOpacity
      style={styles.storyContainer}
      activeOpacity={1}
      onPress={handleTap}
    >
      {/* Full-screen media */}
      <Image
        source={{ uri: post.media_url }}
        style={styles.storyMedia}
        contentFit="cover"
        transition={200}
      />

      {/* Top gradient overlay */}
      <LinearGradient
        colors={['rgba(0, 0, 0, 0.6)', 'transparent']}
        style={styles.topGradient}
      >
        {/* Header - Username + Location */}
        <TouchableOpacity style={styles.storyHeader} onPress={handleUserPress}>
          <Avatar
            uri={post.user?.avatar_url}
            name={post.user?.username}
            size="md"
          />
          <View style={styles.headerText}>
            <Text style={styles.username} numberOfLines={1}>
              @{post.user?.username || 'unknown'}
            </Text>
            {post.location_name && (
              <View style={styles.locationRow}>
                <Ionicons name="location" size={12} color={colors.textSecondary} />
                <Text style={styles.locationText} numberOfLines={1}>
                  {post.location_name}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.timeLeft}>{minutesLeft}m</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Bottom gradient overlay */}
      <LinearGradient
        colors={['transparent', 'rgba(0, 0, 0, 0.8)']}
        style={styles.bottomGradient}
      >
        {/* Caption */}
        {post.caption && (
          <Text style={styles.caption} numberOfLines={3}>
            {post.caption}
          </Text>
        )}

        {/* Reactions */}
        <View style={styles.reactionsContainer}>
          <EmojiReactions
            reactions={post.reactions || []}
            myReaction={post.my_reaction}
            onReact={(emoji) => onReact(post.id, emoji)}
          />
        </View>
      </LinearGradient>

      {/* Heart animation overlay */}
      <HeartAnimation trigger={showHeart} />
    </TouchableOpacity>
  );
}

export function FeedStoriesScreen() {
  const navigation = useNavigation<FeedStoriesNavigationProp>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { activePosts, loadPosts, toggleReaction, refreshPosts } = usePosts();
  const { loadFriends } = useFriends();

  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Swipe gesture to go back to camera
  const translateX = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dx > 20 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onPanResponderGrant: () => {
        Haptics.selectionAsync();
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx > 0) {
          translateX.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > 100 || gestureState.vx > 0.5) {
          // Go back to camera
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          Animated.timing(translateX, {
            toValue: SCREEN_WIDTH,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('Camera');
            }
          });
        } else {
          // Snap back
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            friction: 8,
            tension: 80,
          }).start();
        }
      },
    })
  ).current;

  // Initial load
  useEffect(() => {
    const initialLoad = async () => {
      setIsLoading(true);
      await Promise.all([loadPosts(true), loadFriends()]);
      setIsLoading(false);
    };

    initialLoad();
  }, [loadPosts, loadFriends]);

  // Refresh when screen focuses
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refreshPosts();
    });

    return unsubscribe;
  }, [navigation, refreshPosts]);

  const handleReact = useCallback(
    async (postId: string, emoji: ReactionEmoji) => {
      await toggleReaction(postId, emoji);
    },
    [toggleReaction]
  );

  const handleUserPress = useCallback(
    (userId: string) => {
      navigation.navigate('Profile', { userId });
    },
    [navigation]
  );

  const renderStoryPost = useCallback(
    ({ item }: { item: Post }) => (
      <StoryPost
        post={item}
        isOwner={item.user_id === user?.id}
        onReact={handleReact}
        onUserPress={handleUserPress}
      />
    ),
    [user?.id, handleReact, handleUserPress]
  );

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (activePosts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>👻</Text>
        <Text style={styles.emptyTitle}>No Posts Yet</Text>
        <Text style={styles.emptyText}>
          Be the first to share what you're doing tonight!
        </Text>
        <TouchableOpacity
          style={styles.cameraButton}
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('Camera');
            }
          }}
        >
          <Text style={styles.cameraButtonText}>Open Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <Animated.View
      style={[styles.container, { transform: [{ translateX }] }]}
      {...panResponder.panHandlers}
    >
      <FlatList
        data={activePosts}
        renderItem={renderStoryPost}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        decelerationRate="fast"
        snapToInterval={SCREEN_HEIGHT}
        snapToAlignment="start"
        disableIntervalMomentum
        contentContainerStyle={styles.listContent}
      />

      {/* Swipe hint - right edge */}
      <View style={[styles.swipeHint, { top: SCREEN_HEIGHT / 2 - 20 }]}>
        <Ionicons name="chevron-back" size={24} color={colors.textQuaternary} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    flexGrow: 1,
  },
  storyContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: colors.background,
    position: 'relative',
  },
  storyMedia: {
    width: '100%',
    height: '100%',
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  storyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerText: {
    flex: 1,
  },
  username: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
  },
  locationText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  timeLeft: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 250,
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  caption: {
    fontSize: typography.sizes.md,
    color: colors.text,
    lineHeight: typography.lineHeights.relaxed * typography.sizes.md,
    marginBottom: spacing.md,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  reactionsContainer: {
    marginBottom: spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.lineHeights.relaxed * typography.sizes.md,
    marginBottom: spacing.xl,
  },
  cameraButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 999,
  },
  cameraButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textInverse,
  },
  swipeHint: {
    position: 'absolute',
    left: spacing.xs,
    opacity: 0.3,
  },
});

