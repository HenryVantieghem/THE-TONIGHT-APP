/**
 * Scena - Confirm Sheet Component
 * Gentle confirmation dialog - never aggressive
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import { GlassButton } from './GlassButton';
import { colors, typography, spacing, borderRadius } from '../theme';

interface ConfirmSheetProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmSheet: React.FC<ConfirmSheetProps> = ({
  visible,
  title,
  message,
  confirmLabel = 'confirm',
  cancelLabel = 'cancel',
  isDestructive = false,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(150)}
        style={styles.overlay}
      >
        <Pressable style={styles.backdrop} onPress={onCancel} />

        <Animated.View
          entering={SlideInDown.springify().damping(20).stiffness(150)}
          exiting={SlideOutDown.duration(200)}
          style={styles.sheet}
        >
          {Platform.OS === 'ios' && (
            <BlurView
              intensity={80}
              tint="light"
              style={StyleSheet.absoluteFill}
            />
          )}

          <View style={styles.sheetBackground} />

          {/* Handle */}
          <View style={styles.handle} />

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <GlassButton
              title={cancelLabel}
              onPress={onCancel}
              variant="secondary"
              size="large"
              style={styles.button}
            />
            <GlassButton
              title={confirmLabel}
              onPress={onConfirm}
              variant="primary"
              size="large"
              style={styles.button}
              textStyle={isDestructive ? styles.destructiveText : undefined}
            />
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background.overlay,
  },
  sheet: {
    backgroundColor: Platform.OS === 'ios' ? 'transparent' : colors.glass.light,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingBottom: 40,
    overflow: 'hidden',
  },
  sheetBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.glass.light,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: colors.text.tertiary,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  content: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    textAlign: 'center',
    textTransform: 'lowercase',
    marginBottom: spacing.sm,
  },
  message: {
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
    textAlign: 'center',
    textTransform: 'lowercase',
    lineHeight: typography.sizes.base * 1.5,
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  button: {
    flex: 1,
  },
  destructiveText: {
    color: colors.timer.urgent,
  },
});

export default ConfirmSheet;
