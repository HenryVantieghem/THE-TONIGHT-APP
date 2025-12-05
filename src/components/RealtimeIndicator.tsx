/**
 * Scena - Realtime Indicator Component
 * Subtle connection status indicator
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { colors, typography, spacing } from '../theme';
import { ConnectionStatus } from '../context/RealtimeContext';

interface RealtimeIndicatorProps {
  status: ConnectionStatus;
}

export const RealtimeIndicator: React.FC<RealtimeIndicatorProps> = ({ status }) => {
  if (status === 'connected') return null;

  const getStatusColor = () => {
    switch (status) {
      case 'connecting':
        return colors.accent.warning;
      case 'disconnected':
        return colors.timer.urgent;
      default:
        return colors.text.tertiary;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connecting':
        return 'connecting...';
      case 'disconnected':
        return 'disconnected';
      default:
        return '';
    }
  };

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(300)}
      style={styles.container}
    >
      <View style={[styles.dot, { backgroundColor: getStatusColor() }]} />
      <Text style={styles.text}>{getStatusText()}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.glass.light,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  text: {
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
    textTransform: 'lowercase',
  },
});

