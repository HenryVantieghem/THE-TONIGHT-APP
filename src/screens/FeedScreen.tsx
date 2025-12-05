/**
 * Scena - Feed Screen
 * Peaceful scrolling, no urgency, floating glass cards
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, MainTabParamList } from '../types';
import { useApp } from '../context/AppContext';
import { useMoments } from '../hooks/useMoments';
import { reactionsService } from '../services/reactions.service';
import { MomentCard, EmojiPicker } from '../components';
import { colors, typography, spacing, gradients, hitSlop } from '../theme';
import { SkeletonCard } from '../components';

type FeedScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Feed'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type FeedScreenProps = {
  navigation: FeedScreenNavigationProp;
};

export const FeedScreen: React.FC<FeedScreenProps> = ({ navigation }) => {
  const { state } = useApp();
  const { moments, loading, refreshing, refresh } = useMoments();
  const [selectedMomentId, setSelectedMomentId] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleRefresh = useCallback(async () => {
    await refresh();
  }, [refresh]);

  const handleMomentPress = (momentId: string) => {
    navigation.navigate('FullscreenMoment', { momentId });
  };

  const handleReactPress = (momentId: string) => {
    setSelectedMomentId(momentId);
    setShowEmojiPicker(true);
  };

  const handleEmojiSelect = async (emoji: string) => {
    if (selectedMomentId) {
      await reactionsService.addReaction(selectedMomentId, emoji);
      setShowEmojiPicker(false);
      setSelectedMomentId(null);
    }
  };

  const handleProfilePress = () => {
    navigation.navigate('Profile', {});
  };

  const handleSharePress = () => {
    navigation.navigate('Camera');
  };

  // Convert MomentRow to Moment type for MomentCard
  const convertMoment = (momentRow: any) => {
    return {
      id: momentRow.id,
      user: {
        id: momentRow.profiles?.id || momentRow.user_id,
        username: momentRow.profiles?.username || 'user',
        avatarUrl: momentRow.profiles?.avatar_url || undefined,
      },
      imageUri: momentRow.image_url,
      frontCameraUri: momentRow.front_camera_url || undefined,
      location: momentRow.location || undefined,
      caption: momentRow.caption || undefined,
      createdAt: new Date(momentRow.created_at),
      expiresAt: new Date(momentRow.expires_at),
      reactions: (momentRow.reactions || []).map((r: any) => ({
        id: r.id,
        userId: r.user_id,
        emoji: r.emoji,
        createdAt: new Date(r.created_at),
      })),
    };
  };

  const renderMoment = ({ item, index }: { item: any; index: number }) => {
    const moment = convertMoment(item);
    return (
      <Animated.View entering={FadeInUp.duration(400).delay(index * 100)}>
        <MomentCard
          moment={moment}
          onPress={() => handleMomentPress(moment.id)}
          onReact={() => handleReactPress(moment.id)}
        />
      </Animated.View>
    );
  };

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      );
    }
    
    return (
      <Animated.View entering={FadeIn.duration(600)} style={styles.emptyContainer}>
        <Text style={styles.emptyText}>nothing yet</Text>
        <Text style={styles.emptySubtext}>
          {state.user ? 'add friends to see their moments' : 'be the first to share'}
        </Text>
      </Animated.View>
    );
  };

  const renderHeader = () => (
    <View style={styles.listHeader}>
      {/* This creates space below the header */}
    </View>
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
          <Text style={styles.appName}>scena</Text>
          <Pressable onPress={handleProfilePress} hitSlop={hitSlop.large}>
            <Ionicons name="person-circle-outline" size={28} color={colors.text.secondary} />
          </Pressable>
        </Animated.View>

        {/* Feed */}
        <FlatList
          data={moments}
          renderItem={renderMoment}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.text.tertiary}
            />
          }
        />

        {/* Share button */}
        <Animated.View entering={FadeInUp.duration(500).delay(300)} style={styles.shareContainer}>
          <Pressable onPress={handleSharePress} style={styles.shareButton}>
            <Text style={styles.shareText}>share</Text>
          </Pressable>
        </Animated.View>
      </SafeAreaView>

      {/* Emoji Picker Modal */}
      <EmojiPicker
        visible={showEmojiPicker}
        onClose={() => setShowEmojiPicker(false)}
        onSelect={handleEmojiSelect}
      />
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
  appName: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.light,
    color: colors.text.primary,
    letterSpacing: typography.letterSpacing.wide,
    textTransform: 'lowercase',
  },
  listContent: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingBottom: 100,
  },
  listHeader: {
    height: spacing.md,
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
  shareContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  shareButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  shareText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
    textTransform: 'lowercase',
    letterSpacing: typography.letterSpacing.wide,
  },
});

export default FeedScreen;
