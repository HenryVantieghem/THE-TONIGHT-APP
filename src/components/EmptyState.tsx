/**
 * Scena - Empty State Component
 * Gentle, non-pressuring empty states
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { GlassButton } from './GlassButton';
import { colors, typography, spacing } from '../theme';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'leaf-outline',
  title,
  message,
  actionLabel,
  onAction,
}) => {
  return (
    <Animated.View entering={FadeIn.duration(600)} style={styles.container}>
      {/* Icon */}
      <Animated.View entering={FadeInUp.duration(500).delay(100)} style={styles.iconContainer}>
        <Ionicons
          name={icon}
          size={48}
          color={colors.text.tertiary}
        />
      </Animated.View>

      {/* Title */}
      <Animated.Text
        entering={FadeInUp.duration(500).delay(200)}
        style={styles.title}
      >
        {title}
      </Animated.Text>

      {/* Message */}
      {message && (
        <Animated.Text
          entering={FadeInUp.duration(500).delay(300)}
          style={styles.message}
        >
          {message}
        </Animated.Text>
      )}

      {/* Action */}
      {actionLabel && onAction && (
        <Animated.View entering={FadeInUp.duration(500).delay(400)} style={styles.actionContainer}>
          <GlassButton
            title={actionLabel}
            onPress={onAction}
            variant="primary"
            size="medium"
          />
        </Animated.View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  iconContainer: {
    marginBottom: spacing.lg,
    opacity: 0.6,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.light,
    color: colors.text.tertiary,
    textTransform: 'lowercase',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  message: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
    textTransform: 'lowercase',
    textAlign: 'center',
    lineHeight: typography.sizes.sm * 1.5,
  },
  actionContainer: {
    marginTop: spacing.xl,
  },
});

export default EmptyState;
