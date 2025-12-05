/**
 * Scena - Reactions Detail Screen
 * See who reacted - but no counts, just names
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { reactionsService, ReactionWithUser } from '../services/reactions.service';
import { Header, GlassCard, Avatar, EmptyState } from '../components';
import { colors, typography, spacing, gradients } from '../theme';

type ReactionsDetailScreenProps = {
  route: RouteProp<RootStackParamList, 'ReactionsDetail'>;
};

export const ReactionsDetailScreen: React.FC<ReactionsDetailScreenProps> = ({
  route,
}) => {
  const { momentId } = route.params;
  const [reactions, setReactions] = useState<ReactionWithUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReactions = async () => {
      setLoading(true);
      try {
        const data = await reactionsService.getMomentReactionsWithUsers(momentId);
        setReactions(data);
      } catch (error) {
        if (__DEV__) {
          console.error('Failed to fetch reactions:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReactions();
  }, [momentId]);

  // Group reactions by emoji
  const groupedReactions = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = [];
    }
    acc[reaction.emoji].push(reaction);
    return acc;
  }, {} as Record<string, ReactionWithUser[]>);

  const renderReactionGroup = ({ item, index }: { item: [string, ReactionWithUser[]]; index: number }) => {
    const [emoji, reactionList] = item;

    return (
      <Animated.View entering={FadeInUp.duration(300).delay(index * 50)}>
        <GlassCard style={styles.groupCard}>
          <View style={styles.emojiHeader}>
            <Text style={styles.emoji}>{emoji}</Text>
          </View>

          {reactionList.map((reaction) => {
            const username = reaction.profiles?.username || 'friend';
            const avatarUrl = reaction.profiles?.avatar_url;

            return (
              <View key={reaction.id} style={styles.userRow}>
                <Avatar
                  name={username}
                  uri={avatarUrl}
                  size="small"
                />
                <Text style={styles.username}>
                  @{username}
                </Text>
              </View>
            );
          })}
        </GlassCard>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={gradients.ambient}
          style={StyleSheet.absoluteFill}
        />
        <SafeAreaView style={styles.safeArea}>
          <Header title="reactions" />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.text.primary} />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (reactions.length === 0) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={gradients.ambient}
          style={StyleSheet.absoluteFill}
        />

        <SafeAreaView style={styles.safeArea}>
          <Header title="reactions" />
          <EmptyState
            icon="heart-outline"
            title="no reactions yet"
            message="be the first to react"
          />
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradients.ambient}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        <Header title="reactions" />

        <FlatList
          data={Object.entries(groupedReactions)}
          renderItem={renderReactionGroup}
          keyExtractor={([emoji]) => emoji}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
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
  listContent: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingBottom: spacing.xxl,
  },
  groupCard: {
    marginBottom: spacing.md,
  },
  emojiHeader: {
    marginBottom: spacing.sm,
  },
  emoji: {
    fontSize: 28,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  username: {
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    textTransform: 'lowercase',
    marginLeft: spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ReactionsDetailScreen;
