import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../ui/Button';
import { colors, shadows } from '../../constants/colors';
import { textStyles } from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/config';

type EmptyStateType = 'no-posts' | 'no-friends' | 'no-requests' | 'error';

interface EmptyStateProps {
  type: EmptyStateType;
  onAction?: () => void;
  actionLabel?: string;
}

const emptyStateContent: Record<
  EmptyStateType,
  { icon: keyof typeof Ionicons.glyphMap; title: string; subtitle: string; defaultAction?: string }
> = {
  'no-posts': {
    icon: 'camera',
    title: 'No Posts Yet',
    subtitle: "Be the first to share what you're up to!",
    defaultAction: 'Take a Photo',
  },
  'no-friends': {
    icon: 'people',
    title: 'Find Your Friends',
    subtitle: 'Add friends to see their posts here',
    defaultAction: 'Add Friends',
  },
  'no-requests': {
    icon: 'mail-open',
    title: 'No Pending Requests',
    subtitle: "You don't have any friend requests at the moment.",
  },
  error: {
    icon: 'alert-circle',
    title: "Couldn't Load Posts",
    subtitle: 'Pull down to retry',
    defaultAction: 'Try Again',
  },
};

export function EmptyState({
  type,
  onAction,
  actionLabel,
}: EmptyStateProps) {
  const content = emptyStateContent[type];
  const showButton = onAction && (actionLabel || content.defaultAction);

  return (
    <View style={styles.container}>
      {/* Icon */}
      <View style={styles.iconContainer}>
        <Ionicons
          name={content.icon}
          size={48}
          color={colors.textSecondary}
        />
      </View>

      {/* Title - Title 2 style per spec */}
      <Text style={styles.title}>{content.title}</Text>

      {/* Description - Body, secondary color per spec */}
      <Text style={styles.subtitle}>{content.subtitle}</Text>

      {/* CTA button - Secondary variant per spec */}
      {showButton && (
        <Button
          title={actionLabel || content.defaultAction || ''}
          onPress={onAction!}
          variant="secondary"
          style={styles.button}
        />
      )}
    </View>
  );
}

// Simple loading placeholder with shimmer
export function PostLoadingPlaceholder() {
  return (
    <View style={loadingStyles.container}>
      <View style={loadingStyles.header}>
        <View style={loadingStyles.avatar} />
        <View style={loadingStyles.textContainer}>
          <View style={loadingStyles.textShort} />
          <View style={loadingStyles.textLong} />
        </View>
      </View>
      <View style={loadingStyles.media} />
      <View style={loadingStyles.footer}>
        <View style={loadingStyles.textLong} />
        <View style={loadingStyles.bar} />
      </View>
    </View>
  );
}

// Multiple loading placeholders
export function PostsLoadingPlaceholder({ count = 3 }: { count?: number }) {
  return (
    <View>
      {Array.from({ length: count }).map((_, index) => (
        <PostLoadingPlaceholder key={index} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  iconContainer: {
    marginBottom: spacing.lg,
  },
  title: {
    ...textStyles.title2,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...textStyles.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  button: {
    minWidth: 160,
  },
});

const loadingStyles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    ...shadows.level2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundTertiary,
  },
  textContainer: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  textShort: {
    width: 100,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.backgroundTertiary,
    marginBottom: 6,
  },
  textLong: {
    width: 150,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.backgroundTertiary,
  },
  media: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundTertiary,
    marginBottom: spacing.md,
  },
  footer: {
    gap: spacing.sm,
  },
  bar: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.backgroundTertiary,
  },
});
