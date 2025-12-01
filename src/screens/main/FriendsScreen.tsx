import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/feed/EmptyState';
import { useFriends } from '../../hooks/useFriends';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { spacing, borderRadius, config } from '../../constants/config';
import { debounce } from '../../utils/validation';
import type { User, Friendship, MainStackParamList } from '../../types';

type FriendsNavigationProp = NativeStackNavigationProp<MainStackParamList, 'Friends'>;

type Tab = 'friends' | 'requests' | 'search';

export function FriendsScreen() {
  const navigation = useNavigation<FriendsNavigationProp>();
  const insets = useSafeAreaInsets();
  const {
    friends,
    pendingRequests,
    searchResults,
    isSearching,
    loadAllFriendData,
    searchUsers,
    clearSearchResults,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
  } = useFriends();

  const [activeTab, setActiveTab] = useState<Tab>('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await loadAllFriendData();
      setIsLoading(false);
    };
    load();
  }, [loadAllFriendData]);

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      searchUsers(query);
    }, config.DEBOUNCE.SEARCH),
    [searchUsers]
  );

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    if (text.trim()) {
      setActiveTab('search');
      debouncedSearch(text);
    } else {
      clearSearchResults();
      if (activeTab === 'search') {
        setActiveTab('friends');
      }
    }
  };

  const handleSendRequest = async (userId: string) => {
    const { error } = await sendFriendRequest(userId);
    if (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleAcceptRequest = async (friendshipId: string, requesterId: string) => {
    const { error } = await acceptFriendRequest(friendshipId, requesterId);
    if (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleDeclineRequest = async (friendshipId: string) => {
    const { error } = await declineFriendRequest(friendshipId);
    if (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleRemoveFriend = async (friendId: string, username: string) => {
    Alert.alert(
      'Remove Friend',
      `Are you sure you want to remove @${username} as a friend?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const { error } = await removeFriend(friendId);
            if (error) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  const handleUserPress = (userId: string) => {
    navigation.navigate('Profile', { userId });
  };

  const handleClose = () => {
    navigation.goBack();
  };

  const renderFriend = ({ item }: { item: Friendship }) => (
    <Card style={styles.userCard}>
      <TouchableOpacity
        style={styles.userInfo}
        onPress={() => handleUserPress(item.friend_id)}
      >
        <Avatar
          uri={item.friend?.avatar_url}
          name={item.friend?.username}
          size="medium"
        />
        <Text style={styles.username}>@{item.friend?.username}</Text>
      </TouchableOpacity>
      <Button
        title="Remove"
        variant="ghost"
        size="sm"
        onPress={() => handleRemoveFriend(item.friend_id, item.friend?.username || '')}
      />
    </Card>
  );

  const renderRequest = ({ item }: { item: Friendship }) => (
    <Card style={styles.userCard}>
      <TouchableOpacity
        style={styles.userInfo}
        onPress={() => handleUserPress(item.user_id)}
      >
        <Avatar
          uri={item.user?.avatar_url}
          name={item.user?.username}
          size="medium"
        />
        <Text style={styles.username}>@{item.user?.username}</Text>
      </TouchableOpacity>
      <View style={styles.requestActions}>
        <Button
          title="Accept"
          variant="primary"
          size="sm"
          onPress={() => handleAcceptRequest(item.id, item.user_id)}
        />
        <Button
          title="Decline"
          variant="ghost"
          size="sm"
          onPress={() => handleDeclineRequest(item.id)}
        />
      </View>
    </Card>
  );

  const renderSearchResult = ({ item }: { item: User }) => {
    const isFriend = friends.some((f) => f.friend_id === item.id);

    return (
      <Card style={styles.userCard}>
        <TouchableOpacity
          style={styles.userInfo}
          onPress={() => handleUserPress(item.id)}
        >
          <Avatar
            uri={item.avatar_url}
            name={item.username}
            size="medium"
          />
          <Text style={styles.username}>@{item.username}</Text>
        </TouchableOpacity>
        {isFriend ? (
          <Text style={styles.friendBadge}>Friends ✓</Text>
        ) : (
          <Button
            title="Add"
            variant="primary"
            size="sm"
            onPress={() => handleSendRequest(item.id)}
          />
        )}
      </Card>
    );
  };

  const renderContent = () => {
    if (activeTab === 'search' && searchQuery.trim()) {
      return (
        <FlatList
          data={searchResults}
          renderItem={renderSearchResult}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            isSearching ? (
              <Text style={styles.loadingText}>Searching...</Text>
            ) : (
              <EmptyState type="no-requests" />
            )
          }
        />
      );
    }

    if (activeTab === 'requests') {
      return (
        <FlatList
          data={pendingRequests}
          renderItem={renderRequest}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<EmptyState type="no-requests" />}
        />
      );
    }

    return (
      <FlatList
        data={friends}
        renderItem={renderFriend}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<EmptyState type="no-friends" />}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity onPress={handleClose}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Friends</Text>

        <View style={{ width: 60 }} />
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by username"
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={handleSearchChange}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                clearSearchResults();
                setActiveTab('friends');
              }}
            >
              <Text style={styles.clearButton}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tabs */}
      {!searchQuery.trim() && (
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'friends' && styles.activeTab]}
            onPress={() => setActiveTab('friends')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'friends' && styles.activeTabText,
              ]}
            >
              Friends ({friends.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'requests' && styles.activeTab]}
            onPress={() => setActiveTab('requests')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'requests' && styles.activeTabText,
              ]}
            >
              Requests ({pendingRequests.length})
            </Text>
            {pendingRequests.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{pendingRequests.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      )}

      {renderContent()}
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
  searchContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.text,
    paddingVertical: spacing.sm,
  },
  clearButton: {
    fontSize: 16,
    color: colors.textSecondary,
    padding: spacing.xs,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: typography.weights.semibold,
  },
  badge: {
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: typography.sizes.xs,
    color: colors.white,
    fontWeight: typography.weights.bold,
  },
  listContent: {
    padding: spacing.md,
    flexGrow: 1,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  username: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  requestActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  friendBadge: {
    fontSize: typography.sizes.sm,
    color: colors.success,
    fontWeight: typography.weights.medium,
  },
  loadingText: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: spacing.xl,
  },
});
