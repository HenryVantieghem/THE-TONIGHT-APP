/**
 * Scena - Friends Screen
 * Manage friends and friend requests
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../types';
import { useFriends } from '../hooks/useFriends';
import { FriendCard } from '../components';
import { colors, typography, spacing, gradients, hitSlop } from '../theme';
import { useApp } from '../context/AppContext';

type FriendsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Friends'>;
};

export const FriendsScreen: React.FC<FriendsScreenProps> = ({ navigation }) => {
  const { state } = useApp();
  const { friends, pendingRequests, loading, removeFriend } = useFriends();
  const [searchQuery, setSearchQuery] = useState('');

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSearch = () => {
    navigation.navigate('UserSearch');
  };

  const handleFriendRequests = () => {
    navigation.navigate('FriendRequests');
  };

  const handleRemoveFriend = async (friendshipId: string, friendId: string) => {
    await removeFriend(friendshipId);
  };

  const handleFriendPress = (friendId: string) => {
    navigation.navigate('Profile', { userId: friendId });
  };

  const renderFriend = ({ item }: { item: any }) => {
    const friend = item.friend || item;
    return (
      <FriendCard
        friend={friend}
        onPress={() => handleFriendPress(friend.id)}
        onRemove={() => handleRemoveFriend(item.id, friend.id)}
      />
    );
  };

  const renderEmpty = () => (
    <Animated.View entering={FadeIn.duration(600)} style={styles.emptyContainer}>
      <Text style={styles.emptyText}>no friends yet</Text>
      <Text style={styles.emptySubtext}>search for people to add</Text>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradients.ambient}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
          <Pressable onPress={handleBack} hitSlop={hitSlop.large}>
            <Ionicons name="chevron-back" size={24} color={colors.text.secondary} />
          </Pressable>
          <Text style={styles.title}>friends</Text>
          <View style={styles.headerRight}>
            {pendingRequests.length > 0 && (
              <Pressable onPress={handleFriendRequests} hitSlop={hitSlop.large}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{pendingRequests.length}</Text>
                </View>
                <Ionicons name="person-add-outline" size={24} color={colors.text.secondary} />
              </Pressable>
            )}
          </View>
        </Animated.View>

        {/* Actions */}
        <Animated.View entering={FadeInUp.duration(400).delay(100)} style={styles.actions}>
          <Pressable onPress={handleSearch} style={styles.searchButton}>
            <Ionicons name="search-outline" size={20} color={colors.text.secondary} />
            <Text style={styles.searchText}>search users</Text>
          </Pressable>

          {pendingRequests.length > 0 && (
            <Pressable onPress={handleFriendRequests} style={styles.requestsButton}>
              <Ionicons name="person-add-outline" size={20} color={colors.text.primary} />
              <Text style={styles.requestsText}>
                {pendingRequests.length} {pendingRequests.length === 1 ? 'request' : 'requests'}
              </Text>
            </Pressable>
          )}
        </Animated.View>

        {/* Friends List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>loading...</Text>
          </View>
        ) : (
          <FlatList
            data={friends}
            renderItem={renderFriend}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmpty}
          />
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.screenHorizontal,
    paddingVertical: spacing.md,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.light,
    color: colors.text.primary,
    letterSpacing: typography.letterSpacing.wide,
    textTransform: 'lowercase',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.timer.urgent,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    zIndex: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.white,
  },
  actions: {
    paddingHorizontal: spacing.screenHorizontal,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.glass.light,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.glass.border,
    gap: spacing.sm,
  },
  searchText: {
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
    textTransform: 'lowercase',
  },
  requestsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.glass.light,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.glass.border,
    gap: spacing.sm,
  },
  requestsText: {
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    textTransform: 'lowercase',
  },
  listContent: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingBottom: spacing.xl,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.light,
    color: colors.text.tertiary,
    textTransform: 'lowercase',
  },
  emptySubtext: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
    textTransform: 'lowercase',
    marginTop: spacing.xs,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: typography.sizes.base,
    color: colors.text.tertiary,
    textTransform: 'lowercase',
  },
});

export default FriendsScreen;

