import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '../ui/Button';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { spacing } from '../../constants/config';

type EmptyStateType = 'no-posts' | 'no-friends' | 'no-requests' | 'error';

interface EmptyStateProps {
  type: EmptyStateType;
  onAction?: () => void;
  actionLabel?: string;
}

const emptyStateContent: Record<
  EmptyStateType,
  { icon: string; title: string; subtitle: string; defaultAction?: string }
> = {
  'no-posts': {
    icon: '📷',
    title: 'No Posts Yet',
    subtitle: "Your friends haven't posted anything in the last hour. Be the first to share what you're doing tonight!",
    defaultAction: 'Take a Photo',
  },
  'no-friends': {
    icon: '👥',
    title: 'Find Your Friends',
    subtitle: 'Add friends to see what they\'re up to right now.',
    defaultAction: 'Add Friends',
  },
  'no-requests': {
    icon: '📬',
    title: 'No Pending Requests',
    subtitle: 'You don\'t have any friend requests at the moment.',
  },
  error: {
    icon: '😕',
    title: 'Something Went Wrong',
    subtitle: 'We couldn\'t load the content. Please try again.',
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
      <Text style={styles.icon}>{content.icon}</Text>
      <Text style={styles.title}>{content.title}</Text>
      <Text style={styles.subtitle}>{content.subtitle}</Text>
      {showButton && (
        <Button
          title={actionLabel || content.defaultAction || ''}
          onPress={onAction}
          variant="primary"
          style={styles.button}
        />
      )}
    </View>
  );
}

// Loading placeholder for posts
export function PostLoadingPlaceholder() {
  return (
    <View style={styles.loadingContainer}>
      <View style={styles.loadingHeader}>
        <View style={styles.loadingAvatar} />
        <View style={styles.loadingTextContainer}>
          <View style={styles.loadingTextShort} />
          <View style={styles.loadingTextLong} />
        </View>
      </View>
      <View style={styles.loadingMedia} />
      <View style={styles.loadingFooter}>
        <View style={styles.loadingTextLong} />
        <View style={styles.loadingBar} />
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
  icon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.lineHeights.lg,
    marginBottom: spacing.lg,
    maxWidth: 280,
  },
  button: {
    minWidth: 160,
  },

  // Loading styles
  loadingContainer: {
    backgroundColor: colors.white,
    marginBottom: spacing.md,
    borderRadius: 12,
    padding: spacing.md,
    overflow: 'hidden',
  },
  loadingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  loadingAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
  loadingTextContainer: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  loadingTextShort: {
    width: 80,
    height: 14,
    borderRadius: 4,
    backgroundColor: colors.surface,
    marginBottom: 6,
  },
  loadingTextLong: {
    width: 140,
    height: 12,
    borderRadius: 4,
    backgroundColor: colors.surface,
  },
  loadingMedia: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  loadingFooter: {
    gap: spacing.sm,
  },
  loadingBar: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surface,
  },
});
