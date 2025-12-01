import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Alert,
  Animated,
  RefreshControl,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { ShimmerPlaceholder } from '../../components/feed/PostCardSkeleton';
import { useAuth } from '../../hooks/useAuth';
import { useFriends } from '../../hooks/useFriends';
import * as postsService from '../../services/posts';
import * as authService from '../../services/auth';
import { supabase, BUCKETS } from '../../services/supabase';
import { colors, shadows } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/config';
import type { Post, User, UserStats, MainStackParamList } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_GAP = 2;
const GRID_ITEM_SIZE = (SCREEN_WIDTH - GRID_GAP * 2) / 3;

type ProfileNavigationProp = NativeStackNavigationProp<MainStackParamList, 'Profile'>;
type ProfileRouteProp = NativeStackScreenProps<MainStackParamList, 'Profile'>['route'];

// Animated stat counter component
function AnimatedStat({
  value,
  label,
  onPress,
  delay = 0,
}: {
  value: number;
  label: string;
  onPress?: () => void;
  delay?: number;
}) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    // Entry animation
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
    ]).start();

    // Value counter animation
    animatedValue.addListener(({ value: v }) => {
      setDisplayValue(Math.floor(v));
    });

    Animated.timing(animatedValue, {
      toValue: value,
      duration: 800,
      delay: delay + 200,
      useNativeDriver: false,
    }).start();

    return () => {
      animatedValue.removeAllListeners();
    };
  }, [value, delay, animatedValue, scaleAnim, opacityAnim]);

  const content = (
    <Animated.View
      style={[
        styles.statItem,
        {
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <Text style={styles.statValue}>{displayValue.toLocaleString()}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

// Loading skeleton for profile
function ProfileSkeleton() {
  return (
    <View style={styles.profileSection}>
      <ShimmerPlaceholder width={100} height={100} borderRadius={50} />
      <ShimmerPlaceholder
        width={150}
        height={24}
        borderRadius={8}
        style={{ marginTop: spacing.md }}
      />
      <View style={[styles.statsRow, { marginTop: spacing.lg }]}>
        <ShimmerPlaceholder width={60} height={50} borderRadius={8} />
        <ShimmerPlaceholder width={60} height={50} borderRadius={8} />
        <ShimmerPlaceholder width={60} height={50} borderRadius={8} />
      </View>
    </View>
  );
}

export function ProfileScreen() {
  const navigation = useNavigation<ProfileNavigationProp>();
  const route = useRoute<ProfileRouteProp>();
  const userId = route.params?.userId;

  const insets = useSafeAreaInsets();
  const { user, updateAvatar, signOut } = useAuth();
  const { sendFriendRequest, removeFriend, getFriendshipStatus, acceptFriendRequest } = useFriends();

  const isOwnProfile = !userId || userId === user?.id;
  const [profileUser, setProfileUser] = useState<User | null>(isOwnProfile ? user : null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [friendshipStatus, setFriendshipStatus] = useState<string>('none');
  const [friendshipId, setFriendshipId] = useState<string | null>(null);

  // Animation values
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslate = useRef(new Animated.Value(30)).current;

  // Load profile data
  const loadProfile = useCallback(async () => {
    const targetId = userId || user?.id;

    if (!targetId) {
      setIsLoading(false);
      return;
    }

    try {
      // Load user profile if not own
      if (!isOwnProfile) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', targetId)
          .single();

        if (profileData) {
          setProfileUser(profileData as User);
        }

        // Get friendship status
        const status = await getFriendshipStatus(targetId);
        setFriendshipStatus(status);
      }

      // Load user stats
      const { data: statsData } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', targetId)
        .single();

      if (statsData) {
        setUserStats(statsData as UserStats);
      }

      // Load user's posts
      const { data: postsData } = await postsService.getMyPosts(targetId, true);
      if (postsData) {
        setPosts(postsData);
      }

      // Animate in content
      Animated.parallel([
        Animated.timing(headerOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(contentTranslate, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    } catch (error) {
      console.error('Load profile error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, user?.id, isOwnProfile, getFriendshipStatus, headerOpacity, contentTranslate]);

  useEffect(() => {
    setIsLoading(true);
    loadProfile();
  }, [loadProfile]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadProfile();
    setIsRefreshing(false);
  }, [loadProfile]);

  const handleChangeAvatar = useCallback(async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0] && user) {
        // Upload to storage
        const uri = result.assets[0].uri;
        const response = await fetch(uri);
        const blob = await response.blob();
        const fileName = `${user.id}/avatar.jpg`;

        const { data, error } = await supabase.storage
          .from(BUCKETS.AVATARS)
          .upload(fileName, blob, {
            upsert: true,
            contentType: 'image/jpeg',
          });

        if (error) {
          Alert.alert('Error', 'Failed to upload avatar');
          return;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from(BUCKETS.AVATARS)
          .getPublicUrl(data.path);

        // Update profile
        const { error: updateError } = await updateAvatar(urlData.publicUrl);
        if (updateError) {
          Alert.alert('Error', updateError.message || 'Failed to update avatar');
          return;
        }
        
        // Reload profile to show updated avatar
        await loadProfile();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Change avatar error:', error);
      Alert.alert('Error', 'Failed to change avatar');
    }
  }, [user, updateAvatar]);

  const handleFriendAction = useCallback(async () => {
    if (!userId) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      if (friendshipStatus === 'accepted') {
        Alert.alert(
          'Friend Options',
          `@${profileUser?.username}`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Remove Friend',
              style: 'destructive',
              onPress: async () => {
                await removeFriend(userId);
                setFriendshipStatus('none');
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              },
            },
          ]
        );
      } else if (friendshipStatus === 'pending_received' && friendshipId) {
        // Accept the friend request
        await acceptFriendRequest(friendshipId, userId);
        setFriendshipStatus('accepted');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (friendshipStatus === 'none') {
        await sendFriendRequest(userId);
        setFriendshipStatus('pending_sent');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Friend action error:', error);
    }
  }, [userId, friendshipStatus, friendshipId, profileUser, sendFriendRequest, removeFriend, acceptFriendRequest]);

  const handleLogout = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            signOut();
          },
        },
      ]
    );
  }, [signOut]);

  const handleClose = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [navigation]);

  const handleSettingsPress = useCallback(() => {
    navigation.navigate('Settings');
  }, [navigation]);

  const handleFriendsPress = useCallback(() => {
    navigation.navigate('Friends');
  }, [navigation]);

  const getFriendButtonConfig = () => {
    switch (friendshipStatus) {
      case 'accepted':
        return {
          title: 'Friends ✓',
          variant: 'secondary' as const,
          icon: '👥',
        };
      case 'pending_sent':
        return {
          title: 'Request Sent',
          variant: 'secondary' as const,
          icon: '⏳',
        };
      case 'pending_received':
        return {
          title: 'Accept Request',
          variant: 'primary' as const,
          icon: '✓',
        };
      default:
        return {
          title: 'Add Friend',
          variant: 'primary' as const,
          icon: '+',
        };
    }
  };

  const renderPostItem = useCallback(({ item, index }: { item: Post; index: number }) => (
    <TouchableOpacity
      style={styles.gridItem}
      activeOpacity={0.8}
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
    >
      <Image
        source={{ uri: item.thumbnail_url || item.media_url }}
        style={styles.gridImage}
        contentFit="cover"
        transition={200}
      />
      {item.media_type === 'video' && (
        <View style={styles.videoOverlay}>
          <Text style={styles.videoIcon}>▶</Text>
        </View>
      )}
    </TouchableOpacity>
  ), []);

  const displayUser = isOwnProfile ? user : profileUser;
  const friendButtonConfig = getFriendButtonConfig();

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.header,
          { paddingTop: insets.top + spacing.sm, opacity: headerOpacity },
        ]}
      >
        <TouchableOpacity onPress={handleClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {displayUser?.username ? `@${displayUser.username}` : 'Profile'}
        </Text>

        {isOwnProfile ? (
          <TouchableOpacity
            onPress={handleSettingsPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {isLoading ? (
          <ProfileSkeleton />
        ) : (
          <Animated.View
            style={[
              styles.profileSection,
              { transform: [{ translateY: contentTranslate }] },
            ]}
          >
            <TouchableOpacity
              onPress={isOwnProfile ? handleChangeAvatar : undefined}
              disabled={!isOwnProfile}
              activeOpacity={0.8}
            >
              <View style={styles.avatarContainer}>
                <Avatar
                  uri={displayUser?.avatar_url}
                  name={displayUser?.username}
                  size="xlarge"
                />
                {isOwnProfile && (
                  <View style={styles.changeAvatarBadge}>
                    <LinearGradient
                      colors={colors.primaryGradient}
                      style={styles.badgeGradient}
                    >
                      <Text style={styles.changeAvatarIcon}>📷</Text>
                    </LinearGradient>
                  </View>
                )}
              </View>
            </TouchableOpacity>

            <Text style={styles.username}>@{displayUser?.username}</Text>

            {/* Animated Stats */}
            <View style={styles.statsRow}>
              <AnimatedStat
                value={userStats?.total_posts || 0}
                label="Posts"
                delay={0}
              />
              <AnimatedStat
                value={userStats?.total_friends || 0}
                label="Friends"
                onPress={isOwnProfile ? handleFriendsPress : undefined}
                delay={100}
              />
              <AnimatedStat
                value={userStats?.total_views || 0}
                label="Views"
                delay={200}
              />
            </View>

            {/* Action buttons */}
            {isOwnProfile ? (
              <View style={styles.actionButtons}>
                <Button
                  title="Friends"
                  variant="secondary"
                  onPress={handleFriendsPress}
                  style={styles.actionButton}
                  icon={<Text>👥</Text>}
                />
                <Button
                  title="Log Out"
                  variant="ghost"
                  onPress={handleLogout}
                  style={styles.actionButton}
                />
              </View>
            ) : (
              <Button
                title={friendButtonConfig.title}
                variant={friendButtonConfig.variant}
                onPress={handleFriendAction}
                disabled={friendshipStatus === 'pending_sent'}
                style={styles.friendButton}
              />
            )}
          </Animated.View>
        )}

        {/* Posts grid */}
        <View style={styles.postsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Posts</Text>
            <Text style={styles.postCount}>{posts.length}</Text>
          </View>

          {posts.length > 0 ? (
            <View style={styles.postsGrid}>
              {posts.map((post, index) => (
                <View key={post.id} style={styles.gridItem}>
                  {renderPostItem({ item: post, index })}
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyPosts}>
              <Text style={styles.emptyIcon}>📷</Text>
              <Text style={styles.emptyText}>No posts yet</Text>
              {isOwnProfile && (
                <Text style={styles.emptySubtext}>
                  Share your first moment tonight!
                </Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>
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
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
    zIndex: 10,
  },
  backText: {
    fontSize: typography.sizes.md,
    color: colors.primary,
    fontWeight: typography.weights.medium,
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  settingsIcon: {
    fontSize: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  profileSection: {
    alignItems: 'center',
    padding: spacing.lg,
    paddingTop: spacing.xl,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  avatarContainer: {
    position: 'relative',
  },
  changeAvatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderRadius: 14,
    overflow: 'hidden',
    ...shadows.md,
  },
  badgeGradient: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeAvatarIcon: {
    fontSize: 14,
  },
  username: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginTop: spacing.md,
    letterSpacing: -0.5,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    gap: spacing.xl,
  },
  statItem: {
    alignItems: 'center',
    minWidth: 70,
  },
  statValue: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  statLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  actionButton: {
    minWidth: 110,
  },
  friendButton: {
    marginTop: spacing.lg,
    minWidth: 160,
  },
  postsSection: {
    paddingTop: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  postCount: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  postsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    width: GRID_ITEM_SIZE,
    height: GRID_ITEM_SIZE,
    marginRight: GRID_GAP,
    marginBottom: GRID_GAP,
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: colors.overlay,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  videoIcon: {
    fontSize: 10,
    color: colors.white,
  },
  emptyPosts: {
    padding: spacing.xxl,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  emptySubtext: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
