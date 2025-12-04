/**
 * Scena - Reactions Detail Screen
 * See who reacted - but no counts, just names
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, Reaction } from '../types';
import { useApp } from '../context/AppContext';
import { Header, GlassCard, Avatar, EmptyState } from '../components';
import { colors, typography, spacing, gradients } from '../theme';

type ReactionsDetailScreenProps = {
  route: RouteProp<RootStackParamList, 'ReactionsDetail'>;
};

// Mock users for demo
const mockUsernames: Record<string, string> = {
  '1': 'emma',
  '2': 'jack',
  '3': 'sophia',
  '4': 'noah',
  '5': 'olivia',
  'guest': 'you',
};

export const ReactionsDetailScreen: React.FC<ReactionsDetailScreenProps> = ({
  route,
}) => {
  const { momentId } = route.params;
  const { getMomentById } = useApp();
  const moment = getMomentById(momentId);

  const reactions = moment?.reactions || [];

  // Group reactions by emoji
  const groupedReactions = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = [];
    }
    acc[reaction.emoji].push(reaction);
    return acc;
  }, {} as Record<string, Reaction[]>);

  const renderReactionGroup = ({ item, index }: { item: [string, Reaction[]]; index: number }) => {
    const [emoji, reactionList] = item;

    return (
      <Animated.View entering={FadeInUp.duration(300).delay(index * 50)}>
        <GlassCard style={styles.groupCard}>
          <View style={styles.emojiHeader}>
            <Text style={styles.emoji}>{emoji}</Text>
          </View>

          {reactionList.map((reaction, i) => (
            <View key={reaction.id} style={styles.userRow}>
              <Avatar
                name={mockUsernames[reaction.userId] || 'friend'}
                size="small"
              />
              <Text style={styles.username}>
                @{mockUsernames[reaction.userId] || 'friend'}
              </Text>
            </View>
          ))}
        </GlassCard>
      </Animated.View>
    );
  };

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
});

export default ReactionsDetailScreen;
