import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  RefreshControl,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { ShimmerPlaceholder } from '../../components/feed/PostCardSkeleton';
import { useAuth } from '../../hooks/useAuth';
import { useFriends } from '../../hooks/useFriends';
import * as postsService from '../../services/posts';
import { supabase, BUCKETS } from '../../services/supabase';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/config';
import {
  liquidGlass,
  glassShadows,
  glassMotion,
  glassColors,
} from '../../constants/liquidGlass';
import type { Post, User, UserStats, MainStackParamList } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_GAP = 2;
const GRID_ITEM_SIZE = (SCREEN_WIDTH - GRID_GAP * 2) / 3;

type ProfileNavigationProp = NativeStackNavigationProp<MainStackParamList, 'Profile'>;
type ProfileRouteProp = NativeStackScreenProps<MainStackParamList, 'Profile'>['route'];

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

// Animated stat counter component with glass styling
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
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);
  const [displayValue, setDisplayValue] = useState(0);
  const countValue = useSharedValue(0);

  useEffect(() => {
    // Entry animation
    opacity.value = withTiming(1, { duration: glassMotion.duration.smooth });
    scale.value = 0.8;
    setTimeout(() => {
      scale.value = withSpring(1, {
        ...glassMotion.spring.smooth,
      });
    }, delay);

    // Count animation
    countValue.value = withTiming(value, { duration: 800 }, () => {});
    
    const interval = setInterval(() => {
      setDisplayValue(Math.floor(countValue.value));
    }, 50);

    setTimeout(() => {
      setDisplayValue(value);
      clearInterval(interval);
    }, 900);

    return () => clearInterval(interval);
  }, [value, delay, opacity, scale, countValue]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const content = (
    <Animated.View style={[styles.statItem, animatedStyle]}>
      {/* Glass background */}
      <View style={styles.statGlassBackground}>
        {Platform.OS === 'ios' && (
          <BlurView
            intensity={liquidGlass.blur.light}
            tint="light"
            style={StyleSheet.absoluteFill}
          />
        )}
        <View style={styles.statGlassBg} />
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.3)', 'transparent']}
          style={styles.statGlassHighlight}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.5 }}
        />
      </View>
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

// Loading skeleton for profile with glass styling
function ProfileSkeleton() {
  return (
    <View style={styles.profileSection}>
      <ShimmerPlaceholder width={100} height={100} borderRadius={50} />
      <ShimmerPlaceholder
        width={150}
        height={24}
        borderRadius={12}
        style={{ marginTop: spacing.md }}
      />
      <View style={[styles.statsRow, { marginTop: spacing.lg }]}>
        <ShimmerPlaceholder width={70} height={70} borderRadius={16} />
        <ShimmerPlaceholder width={70} height={70} borderRadius={16} />
        <ShimmerPlaceholder width={70} height={70} borderRadius={16} />
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

  // Scroll tracking for header animation
  const scrollY = useSharedValue(0);
  const headerHeight = 56 + insets.top;

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Animation values
  const contentOpacity = useSharedValue(0);
  const contentTranslate = useSharedValue(30);

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
      contentOpacity.value = withTiming(1, { duration: glassMotion.duration.smooth });
      contentTranslate.value = withSpring(0, glassMotion.spring.smooth);
    } catch (error) {
      console.error('Load profile error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, user?.id, isOwnProfile, getFriendshipStatus, contentOpacity, contentTranslate]);

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
  }, [user, updateAvatar, loadProfile]);

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
          title: 'Friends',
          variant: 'glass' as const,
          icon: <Ionicons name="checkmark-circle" size={18} color={colors.primary} />,
        };
      case 'pending_sent':
        return {
          title: 'Request Sent',
          variant: 'glass' as const,
          icon: <Ionicons name="time-outline" size={18} color={colors.textSecondary} />,
        };
      case 'pending_received':
        return {
          title: 'Accept Request',
          variant: 'primary' as const,
          icon: <Ionicons name="checkmark" size={18} color={colors.white} />,
        };
      default:
        return {
          title: 'Add Friend',
          variant: 'primary' as const,
          icon: <Ionicons name="person-add" size={18} color={colors.white} />,
        };
    }
  };

  // Animated header background
  const headerBackgroundStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 60],
      [0, 1],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  // Animated content style
  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslate.value }],
  }));

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
          {Platform.OS === 'ios' && (
            <BlurView
              intensity={liquidGlass.blur.subtle}
              tint="dark"
              style={StyleSheet.absoluteFill}
            />
          )}
          <View style={styles.videoOverlayBg} />
          <Ionicons name="play" size={12} color={colors.white} style={{ zIndex: 1 }} />
        </View>
      )}
    </TouchableOpacity>
  ), []);

  const displayUser = isOwnProfile ? user : profileUser;
  const friendButtonConfig = getFriendButtonConfig();

  return (
    <View style={styles.container}>
      {/* Liquid Glass Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        {/* Glass Background */}
        <Animated.View style={[StyleSheet.absoluteFill, headerBackgroundStyle]}>
          {Platform.OS === 'ios' ? (
            <BlurView
              intensity={liquidGlass.blur.regular}
              tint="light"
              style={StyleSheet.absoluteFill}
            />
          ) : null}
          <View style={styles.headerGlassBg} />
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.4)', 'transparent']}
            style={styles.headerHighlight}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          />
        </Animated.View>

        <TouchableOpacity 
          onPress={handleClose} 
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.headerBackButton}
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
            <Ionicons name="chevron-back" size={20} color={glassColors.text.primary} style={{ zIndex: 1 }} />
          </View>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {displayUser?.username ? `@${displayUser.username}` : 'Profile'}
        </Text>

        {isOwnProfile ? (
          <TouchableOpacity
            onPress={handleSettingsPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.headerSettingsButton}
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
              <Ionicons name="settings-outline" size={20} color={glassColors.text.primary} style={{ zIndex: 1 }} />
            </View>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 44 }} />
        )}
      </View>

      <AnimatedScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: headerHeight }]}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            progressViewOffset={headerHeight}
          />
        }
      >
        {isLoading ? (
          <ProfileSkeleton />
        ) : (
          <Animated.View style={[styles.profileSection, contentStyle]}>
            {/* Avatar with glass ring */}
            <TouchableOpacity
              onPress={isOwnProfile ? handleChangeAvatar : undefined}
              disabled={!isOwnProfile}
              activeOpacity={0.8}
            >
              <View style={styles.avatarContainer}>
                {/* Glass ring */}
                <View style={styles.avatarGlassRing}>
                  {Platform.OS === 'ios' && (
                    <BlurView
                      intensity={liquidGlass.blur.light}
                      tint="light"
                      style={StyleSheet.absoluteFill}
                    />
                  )}
                  <LinearGradient
                    colors={colors.primaryGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.avatarGradientRing}
                  />
                </View>
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
                      <Ionicons name="camera" size={16} color={colors.white} />
                    </LinearGradient>
                  </View>
                )}
              </View>
            </TouchableOpacity>

            <Text style={styles.username}>@{displayUser?.username}</Text>

            {/* Animated Stats with Glass Cards */}
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

            {/* Action buttons with glass styling */}
            {isOwnProfile ? (
              <View style={styles.actionButtons}>
                <Button
                  title="Friends"
                  variant="glass"
                  onPress={handleFriendsPress}
                  style={styles.actionButton}
                  icon={<Ionicons name="people" size={18} color={colors.primary} />}
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
          {/* Section header with glass background */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderGlass}>
              {Platform.OS === 'ios' && (
                <BlurView
                  intensity={liquidGlass.blur.subtle}
                  tint="light"
                  style={StyleSheet.absoluteFill}
                />
              )}
              <View style={styles.sectionHeaderBg} />
            </View>
            <Text style={styles.sectionTitle}>Posts</Text>
            <View style={styles.postCountBadge}>
              <Text style={styles.postCount}>{posts.length}</Text>
            </View>
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
              <View style={styles.emptyGlassContainer}>
                {Platform.OS === 'ios' && (
                  <BlurView
                    intensity={liquidGlass.blur.light}
                    tint="light"
                    style={StyleSheet.absoluteFill}
                  />
                )}
                <View style={styles.emptyGlassBg} />
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.3)', 'transparent']}
                  style={styles.emptyGlassHighlight}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 0.5 }}
                />
              </View>
              <Ionicons name="camera-outline" size={48} color={glassColors.text.secondary} style={{ marginBottom: spacing.md, zIndex: 1 }} />
              <Text style={styles.emptyText}>No posts yet</Text>
              {isOwnProfile && (
                <Text style={styles.emptySubtext}>
                  Share your first experience!
                </Text>
              )}
            </View>
          )}
        </View>
      </AnimatedScrollView>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerGlassBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: liquidGlass.material.primary.backgroundColor,
  },
  headerHighlight: {
    ...StyleSheet.absoluteFillObject,
    height: '60%',
  },
  headerBackButton: {
    width: 44,
    height: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerSettingsButton: {
    width: 44,
    height: 44,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  glassIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  glassIconBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: liquidGlass.material.subtle.backgroundColor,
    borderRadius: 18,
    borderWidth: liquidGlass.border.width,
    borderColor: liquidGlass.border.color,
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: glassColors.text.primary,
    flex: 1,
    textAlign: 'center',
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
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarGlassRing: {
    ...StyleSheet.absoluteFillObject,
    margin: -6,
    borderRadius: 60,
    overflow: 'hidden',
  },
  avatarGradientRing: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.3,
  },
  changeAvatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderRadius: 16,
    overflow: 'hidden',
    ...glassShadows.key,
  },
  badgeGradient: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  username: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: glassColors.text.primary,
    marginTop: spacing.md,
    letterSpacing: -0.5,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  statItem: {
    alignItems: 'center',
    minWidth: 80,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statGlassBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statGlassBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: liquidGlass.material.subtle.backgroundColor,
    borderWidth: liquidGlass.border.width,
    borderColor: liquidGlass.border.color,
    borderRadius: 16,
  },
  statGlassHighlight: {
    ...StyleSheet.absoluteFillObject,
    height: '50%',
  },
  statValue: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: glassColors.text.primary,
    zIndex: 1,
  },
  statLabel: {
    fontSize: typography.sizes.sm,
    color: glassColors.text.secondary,
    marginTop: 2,
    zIndex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  actionButton: {
    minWidth: 120,
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
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
    marginHorizontal: spacing.md,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionHeaderGlass: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionHeaderBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: liquidGlass.material.subtle.backgroundColor,
    borderWidth: liquidGlass.border.width,
    borderColor: liquidGlass.border.color,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: glassColors.text.primary,
    zIndex: 1,
  },
  postCountBadge: {
    backgroundColor: `${colors.primary}20`,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    zIndex: 1,
  },
  postCount: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    fontWeight: '600',
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
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 3,
    overflow: 'hidden',
  },
  videoOverlayBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: liquidGlass.material.dark.backgroundColor,
    borderRadius: 10,
  },
  emptyPosts: {
    padding: spacing.xxl,
    alignItems: 'center',
    marginHorizontal: spacing.md,
    borderRadius: 20,
    overflow: 'hidden',
  },
  emptyGlassContainer: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
    overflow: 'hidden',
  },
  emptyGlassBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: liquidGlass.material.subtle.backgroundColor,
    borderWidth: liquidGlass.border.width,
    borderColor: liquidGlass.border.color,
    borderRadius: 20,
  },
  emptyGlassHighlight: {
    ...StyleSheet.absoluteFillObject,
    height: '50%',
  },
  emptyText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: glassColors.text.primary,
    zIndex: 1,
  },
  emptySubtext: {
    fontSize: typography.sizes.sm,
    color: glassColors.text.secondary,
    marginTop: spacing.xs,
    zIndex: 1,
  },
});
