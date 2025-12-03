import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  RefreshControl,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
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
import type { Post, User, UserStats, MainStackParamList } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_GAP = 2;
const GRID_ITEM_SIZE = (SCREEN_WIDTH - GRID_GAP * 2) / 3;

type ProfileNavigationProp = NativeStackNavigationProp<MainStackParamList, 'Profile'>;
type ProfileRouteProp = NativeStackScreenProps<MainStackParamList, 'Profile'>['route'];

function StatItem({ value, label, onPress }: { value: number; label: string; onPress?: () => void }) {
  const content = (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value.toLocaleString()}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
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

function ProfileSkeleton() {
  return (
    <View style={styles.profileSection}>
      <ShimmerPlaceholder width={100} height={100} borderRadius={50} />
      <ShimmerPlaceholder width={150} height={24} borderRadius={12} style={{ marginTop: spacing.md }} />
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

  const loadProfile = useCallback(async () => {
    const targetId = userId || user?.id;
    if (!targetId) {
      setIsLoading(false);
      return;
    }

    try {
      if (!isOwnProfile) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', targetId)
          .single();

        if (profileData) {
          setProfileUser(profileData as User);
        }

        const status = await getFriendshipStatus(targetId);
        setFriendshipStatus(status);
      }

      const { data: statsData } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', targetId)
        .single();

      if (statsData) {
        setUserStats(statsData as UserStats);
      }

      const { data: postsData } = await postsService.getMyPosts(targetId, true);
      if (postsData) {
        setPosts(postsData);
      }
    } catch (error) {
      console.error('Load profile error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, user?.id, isOwnProfile, getFriendshipStatus]);

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
        const uri = result.assets[0].uri;
        const response = await fetch(uri);
        const blob = await response.blob();
        const fileName = `${user.id}/avatar.jpg`;

        const { data, error } = await supabase.storage
          .from(BUCKETS.AVATARS)
          .upload(fileName, blob, { upsert: true, contentType: 'image/jpeg' });

        if (error) {
          Alert.alert('Error', 'Failed to upload avatar');
          return;
        }

        const { data: urlData } = supabase.storage.from(BUCKETS.AVATARS).getPublicUrl(data.path);
        const { error: updateError } = await updateAvatar(urlData.publicUrl);

        if (updateError) {
          Alert.alert('Error', updateError.message || 'Failed to update avatar');
          return;
        }

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
        Alert.alert('Friend Options', `@${profileUser?.username}`, [
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
        ]);
      } else if (friendshipStatus === 'pending_received' && friendshipId) {
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
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          signOut();
        },
      },
    ]);
  }, [signOut]);

  const handleClose = useCallback(() => {
    if (navigation.canGoBack()) navigation.goBack();
  }, [navigation]);

  const handleSettingsPress = useCallback(() => navigation.navigate('Settings'), [navigation]);
  const handleFriendsPress = useCallback(() => navigation.navigate('Friends'), [navigation]);

  const getFriendButtonConfig = () => {
    switch (friendshipStatus) {
      case 'accepted':
        return { title: 'Friends', variant: 'secondary' as const };
      case 'pending_sent':
        return { title: 'Request Sent', variant: 'secondary' as const };
      case 'pending_received':
        return { title: 'Accept Request', variant: 'primary' as const };
      default:
        return { title: 'Add Friend', variant: 'primary' as const };
    }
  };

  const displayUser = isOwnProfile ? user : profileUser;
  const friendButtonConfig = getFriendButtonConfig();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {displayUser?.username ? `@${displayUser.username}` : 'Profile'}
        </Text>

        {isOwnProfile ? (
          <TouchableOpacity onPress={handleSettingsPress} style={styles.headerButton}>
            <Ionicons name="settings-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 44 }} />
        )}
      </View>

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
          <View style={styles.profileSection}>
            {/* Avatar */}
            <TouchableOpacity
              onPress={isOwnProfile ? handleChangeAvatar : undefined}
              disabled={!isOwnProfile}
              activeOpacity={0.8}
            >
              <View style={styles.avatarContainer}>
                <Avatar uri={displayUser?.avatar_url} name={displayUser?.username} size="xxl" />
                {isOwnProfile && (
                  <View style={styles.changeAvatarBadge}>
                    <Ionicons name="camera" size={16} color={colors.white} />
                  </View>
                )}
              </View>
            </TouchableOpacity>

            <Text style={styles.username}>@{displayUser?.username}</Text>

            {/* Stats */}
            <View style={styles.statsRow}>
              <StatItem value={userStats?.total_posts || 0} label="Posts" />
              <StatItem
                value={userStats?.total_friends || 0}
                label="Friends"
                onPress={isOwnProfile ? handleFriendsPress : undefined}
              />
              <StatItem value={userStats?.total_views || 0} label="Views" />
            </View>

            {/* Action buttons */}
            {isOwnProfile ? (
              <View style={styles.actionButtons}>
                <Button title="Friends" variant="secondary" onPress={handleFriendsPress} style={styles.actionButton} />
                <Button title="Log Out" variant="ghost" onPress={handleLogout} style={styles.actionButton} />
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
          </View>
        )}

        {/* Posts grid */}
        <View style={styles.postsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Posts</Text>
            <View style={styles.postCountBadge}>
              <Text style={styles.postCount}>{posts.length}</Text>
            </View>
          </View>

          {posts.length > 0 ? (
            <View style={styles.postsGrid}>
              {posts.map((post) => (
                <TouchableOpacity
                  key={post.id}
                  style={styles.gridItem}
                  activeOpacity={0.8}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                >
                  <Image
                    source={{ uri: post.thumbnail_url || post.media_url }}
                    style={styles.gridImage}
                    contentFit="cover"
                    transition={200}
                  />
                  {post.media_type === 'video' && (
                    <View style={styles.videoOverlay}>
                      <Ionicons name="play" size={12} color={colors.white} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyPosts}>
              <Ionicons name="camera-outline" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyText}>No posts yet</Text>
              {isOwnProfile && <Text style={styles.emptySubtext}>Share your first experience!</Text>}
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
    backgroundColor: colors.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
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
  changeAvatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  username: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginTop: spacing.md,
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
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
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
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  postCountBadge: {
    backgroundColor: `${colors.primary}20`,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
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
    backgroundColor: colors.glassBlack,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  emptyPosts: {
    padding: spacing.xxl,
    alignItems: 'center',
    marginHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
  },
  emptyText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
