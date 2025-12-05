/**
 * Scena - Image Upload Progress Component
 * Beautiful circular progress indicator with liquid glass effect
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing } from '../theme';

interface ImageUploadProgressProps {
  progress: number; // 0-100
  visible: boolean;
}

export const ImageUploadProgress: React.FC<ImageUploadProgressProps> = ({
  progress,
  visible,
}) => {
  if (!visible) return null;

  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.overlay}>
      <View style={styles.container}>
        <LinearGradient
          colors={[colors.glass.light, colors.glass.medium]}
          style={styles.gradient}
        >
          <View style={styles.content}>
            <View style={styles.progressRing}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            
            <Text style={styles.progressText}>{Math.round(progress)}%</Text>
            <Text style={styles.label}>uploading...</Text>
          </View>
        </LinearGradient>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  container: {
    width: 160,
    height: 160,
    borderRadius: 80,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
  },
  progressRing: {
    width: 80,
    height: 8,
    backgroundColor: colors.glass.dark,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    textTransform: 'lowercase',
  },
});

