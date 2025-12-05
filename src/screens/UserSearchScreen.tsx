/**
 * Scena - User Search Screen
 * Search for users to add as friends
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../types';
import { useFriends } from '../hooks/useFriends';
import { UserSearchResult, FriendStatus } from '../components';
import { colors, typography, spacing, gradients, hitSlop } from '../theme';
import { useApp } from '../context/AppContext';

type UserSearchScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'UserSearch'>;
};

export const UserSearchScreen: React.FC<UserSearchScreenProps> = ({ navigation }) => {
  const { state } = useApp();
  const { searchUsers, sendFriendRequest, friends, sentRequests } = useFriends();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);

  // Debounced search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setSearching(true);
      const users = await searchUsers(query);
      setResults(users.filter(u => u.id !== state.user?.id)); // Exclude current user
      setSearching(false);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query, searchUsers, state.user?.id]);

  const getFriendStatus = (userId: string): FriendStatus => {
    // Check if already friends
    if (friends.some(f => f.friend?.id === userId || f.friend_id === userId)) {
      return 'friends';
    }
    // Check if request sent
    if (sentRequests.some(r => r.to_user?.id === userId || r.to_user_id === userId)) {
      return 'pending';
    }
    return 'none';
  };

  const handleAddFriend = async (userId: string) => {
    setLoading(true);
    await sendFriendRequest(userId);
    setLoading(false);
  };

  const handleUserPress = (userId: string) => {
    navigation.navigate('Profile', { userId });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const renderResult = ({ item }: { item: any }) => {
    const friendStatus = getFriendStatus(item.id);
    return (
      <UserSearchResult
        user={item}
        friendStatus={friendStatus}
        onPress={() => handleUserPress(item.id)}
        onAddFriend={() => handleAddFriend(item.id)}
        loading={loading}
      />
    );
  };

  const renderEmpty = () => {
    if (query.trim().length < 2) {
      return (
        <Animated.View entering={FadeIn.duration(600)} style={styles.emptyContainer}>
          <Text style={styles.emptyText}>search for users</Text>
          <Text style={styles.emptySubtext}>type at least 2 characters</Text>
        </Animated.View>
      );
    }

    if (searching) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="small" color={colors.text.tertiary} />
          <Text style={styles.emptyText}>searching...</Text>
        </View>
      );
    }

    return (
      <Animated.View entering={FadeIn.duration(600)} style={styles.emptyContainer}>
        <Text style={styles.emptyText}>no users found</Text>
        <Text style={styles.emptySubtext}>try a different search</Text>
      </Animated.View>
    );
  };

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
          <Text style={styles.title}>search users</Text>
          <View style={styles.headerRight} />
        </Animated.View>

        {/* Search Input */}
        <Animated.View entering={FadeInUp.duration(400).delay(100)} style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search-outline" size={20} color={colors.text.tertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="username..."
              placeholderTextColor={colors.text.tertiary}
              value={query}
              onChangeText={setQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {query.length > 0 && (
              <Pressable onPress={() => setQuery('')} hitSlop={hitSlop.default}>
                <Ionicons name="close-circle" size={20} color={colors.text.tertiary} />
              </Pressable>
            )}
          </View>
        </Animated.View>

        {/* Results */}
        <FlatList
          data={results}
          renderItem={renderResult}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmpty}
          keyboardShouldPersistTaps="handled"
        />
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
    width: 24,
  },
  searchContainer: {
    paddingHorizontal: spacing.screenHorizontal,
    marginBottom: spacing.md,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.glass.light,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.glass.border,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
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
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
    textTransform: 'lowercase',
    marginTop: spacing.xs,
  },
});

export default UserSearchScreen;

