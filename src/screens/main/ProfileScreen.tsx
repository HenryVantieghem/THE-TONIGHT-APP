import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
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

export function ProfileScreen() {
  const navigation = useNavigation<ProfileNavigationProp>();
  const route = useRoute<ProfileRouteProp>();
  const userId = route.params?.userId;

  const insets = useSafeAreaInsets();
  const { user, updateAvatar, signOut } = useAuth();
  const { sendFriendRequest, removeFriend, getFriendshipStatus } = useFriends();

  const isOwnProfile = !userId || userId === user?.id;
  const [profileUser, setProfileUser] = useState<User | null>(isOwnProfile ? user : null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [friendshipStatus, setFriendshipStatus] = useState<string>('none');

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
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
      } catch (error) {
        console.error('Load profile error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [userId, user?.id, isOwnProfile, getFriendshipStatus]);

  const handleChangeAvatar = useCallback(async () => {
    try {
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
        await updateAvatar(urlData.publicUrl);
      }
    } catch (error) {
      console.error('Change avatar error:', error);
      Alert.alert('Error', 'Failed to change avatar');
    }
  }, [user, updateAvatar]);

  const handleFriendAction = useCallback(async () => {
    if (!userId) return;

    try {
      if (friendshipStatus === 'accepted') {
        Alert.alert(
          'Remove Friend',
          'Are you sure you want to remove this friend?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Remove',
              style: 'destructive',
              onPress: async () => {
                await removeFriend(userId);
                setFriendshipStatus('none');
              },
            },
          ]
        );
      } else if (friendshipStatus === 'none') {
        await sendFriendRequest(userId);
        setFriendshipStatus('pending_sent');
      }
    } catch (error) {
      console.error('Friend action error:', error);
    }
  }, [userId, friendshipStatus, sendFriendRequest, removeFriend]);

  const handleLogout = useCallback(() => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: signOut,
        },
      ]
    );
  }, [signOut]);

  const handleClose = () => {
    navigation.goBack();
  };

  const handleSettingsPress = () => {
    navigation.navigate('Settings');
  };

  const handleFriendsPress = () => {
    navigation.navigate('Friends');
  };

  const getFriendButtonTitle = () => {
    switch (friendshipStatus) {
      case 'accepted':
        return 'Friends ✓';
      case 'pending_sent':
        return 'Request Sent';
      case 'pending_received':
        return 'Accept Request';
      default:
        return 'Add Friend';
    }
  };

  const renderPostItem = ({ item }: { item: Post }) => (
    <TouchableOpacity style={styles.gridItem}>
      <Image
        source={{ uri: item.thumbnail_url || item.media_url }}
        style={styles.gridImage}
        contentFit="cover"
      />
      {item.media_type === 'video' && (
        <View style={styles.videoOverlay}>
          <Text style={styles.videoIcon}>▶</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const displayUser = isOwnProfile ? user : profileUser;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity onPress={handleClose}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          @{displayUser?.username || 'Profile'}
        </Text>

        {isOwnProfile ? (
          <TouchableOpacity onPress={handleSettingsPress}>
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile info */}
        <View style={styles.profileSection}>
          <TouchableOpacity
            onPress={isOwnProfile ? handleChangeAvatar : undefined}
            disabled={!isOwnProfile}
          >
            <Avatar
              uri={displayUser?.avatar_url}
              name={displayUser?.username}
              size="xlarge"
            />
            {isOwnProfile && (
              <View style={styles.changeAvatarBadge}>
                <Text style={styles.changeAvatarIcon}>📷</Text>
              </View>
            )}
          </TouchableOpacity>

          <Text style={styles.username}>@{displayUser?.username}</Text>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userStats?.total_posts || 0}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <TouchableOpacity
              style={styles.statItem}
              onPress={isOwnProfile ? handleFriendsPress : undefined}
            >
              <Text style={styles.statValue}>{userStats?.total_friends || 0}</Text>
              <Text style={styles.statLabel}>Friends</Text>
            </TouchableOpacity>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userStats?.total_views || 0}</Text>
              <Text style={styles.statLabel}>Views</Text>
            </View>
          </View>

          {/* Action buttons */}
          {isOwnProfile ? (
            <View style={styles.actionButtons}>
              <Button
                title="Friends"
                variant="secondary"
                onPress={handleFriendsPress}
                style={styles.actionButton}
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
              title={getFriendButtonTitle()}
              variant={friendshipStatus === 'accepted' ? 'secondary' : 'primary'}
              onPress={handleFriendAction}
              disabled={friendshipStatus === 'pending_sent'}
              style={styles.friendButton}
            />
          )}
        </View>

        {/* Posts grid */}
        <View style={styles.postsSection}>
          <Text style={styles.sectionTitle}>Posts</Text>
          {posts.length > 0 ? (
            <FlatList
              data={posts}
              renderItem={renderPostItem}
              keyExtractor={(item) => item.id}
              numColumns={3}
              scrollEnabled={false}
              contentContainerStyle={styles.postsGrid}
            />
          ) : (
            <View style={styles.emptyPosts}>
              <Text style={styles.emptyText}>No posts yet</Text>
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
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backText: {
    fontSize: typography.sizes.md,
    color: colors.primary,
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
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  changeAvatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeAvatarIcon: {
    fontSize: 12,
  },
  username: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginTop: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    gap: spacing.xl,
  },
  statItem: {
    alignItems: 'center',
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
    minWidth: 100,
  },
  friendButton: {
    marginTop: spacing.lg,
    minWidth: 140,
  },
  postsSection: {
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  postsGrid: {
    gap: GRID_GAP,
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
    top: 4,
    right: 4,
    backgroundColor: colors.overlay,
    borderRadius: 4,
    padding: 2,
  },
  videoIcon: {
    fontSize: 10,
    color: colors.white,
  },
  emptyPosts: {
    padding: spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
});
