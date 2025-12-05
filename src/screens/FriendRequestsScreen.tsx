/**
 * Scena - Friend Requests Screen
 * View and manage incoming friend requests
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../types';
import { useFriends } from '../hooks/useFriends';
import { GlassCard } from '../components';
import { Avatar } from '../components';
import { GlassButton } from '../components';
import { colors, typography, spacing, gradients, hitSlop } from '../theme';

type FriendRequestsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'FriendRequests'>;
};

export const FriendRequestsScreen: React.FC<FriendRequestsScreenProps> = ({ navigation }) => {
  const { pendingRequests, acceptFriendRequest, rejectFriendRequest, loading } = useFriends();

  const handleBack = () => {
    navigation.goBack();
  };

  const handleAccept = async (requestId: string) => {
    await acceptFriendRequest(requestId);
  };

  const handleReject = async (requestId: string) => {
    await rejectFriendRequest(requestId);
  };

  const handleUserPress = (userId: string) => {
    navigation.navigate('Profile', { userId });
  };

  const renderRequest = ({ item }: { item: any }) => {
    const fromUser = item.from_user || item;
    
    return (
      <Animated.View entering={FadeInUp.duration(300)}>
        <GlassCard style={styles.card}>
          <Pressable onPress={() => handleUserPress(fromUser.id)}>
            <View style={styles.content}>
              <Avatar
                uri={fromUser.avatar_url}
                username={fromUser.username}
                size={56}
              />
              
              <View style={styles.info}>
                <Text style={styles.username}>{fromUser.username}</Text>
                <Text style={styles.requestText}>wants to be friends</Text>
              </View>
            </View>
          </Pressable>

          <View style={styles.actions}>
            <GlassButton
              title="accept"
              onPress={() => handleAccept(item.id)}
              variant="primary"
              size="small"
              style={styles.acceptButton}
            />
            <GlassButton
              title="decline"
              onPress={() => handleReject(item.id)}
              variant="secondary"
              size="small"
              style={styles.rejectButton}
            />
          </View>
        </GlassCard>
      </Animated.View>
    );
  };

  const renderEmpty = () => (
    <Animated.View entering={FadeIn.duration(600)} style={styles.emptyContainer}>
      <Ionicons name="person-add-outline" size={64} color={colors.text.tertiary} />
      <Text style={styles.emptyText}>no requests</Text>
      <Text style={styles.emptySubtext}>friend requests will appear here</Text>
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
          <Text style={styles.title}>friend requests</Text>
          <View style={styles.headerRight} />
        </Animated.View>

        {/* Requests List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>loading...</Text>
          </View>
        ) : (
          <FlatList
            data={pendingRequests}
            renderItem={renderRequest}
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
    width: 24,
  },
  listContent: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingBottom: spacing.xl,
  },
  card: {
    marginBottom: spacing.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
  },
  username: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    textTransform: 'lowercase',
    marginBottom: spacing.xs / 2,
  },
  requestText: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
    textTransform: 'lowercase',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  acceptButton: {
    flex: 1,
  },
  rejectButton: {
    flex: 1,
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

export default FriendRequestsScreen;

