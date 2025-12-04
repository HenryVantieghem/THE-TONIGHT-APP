/**
 * Scena - Emoji Picker Component
 * Gentle, non-pressuring reaction selector
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
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  interpolate,
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, typography, borderRadius, spacing, springConfigs, durations } from '../theme';

interface EmojiPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (emoji: string) => void;
}

// Curated emojis - peaceful, positive, no aggressive ones
const quickEmojis = ['❤️', '☺️', '🔥', '✨', '👋'];
const moreEmojis = ['🌟', '💫', '🎉', '💙', '🌊', '☀️', '🌸', '💜', '🌈', '🍃'];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const EmojiPicker: React.FC<EmojiPickerProps> = ({
  visible,
  onClose,
  onSelect,
}) => {
  const handleSelect = (emoji: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(emoji);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(150)}
        style={styles.overlay}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />

        <Animated.View
          entering={SlideInDown.springify().damping(20).stiffness(150)}
          exiting={SlideOutDown.duration(200)}
          style={styles.sheet}
        >
          {/* Blur background */}
          {Platform.OS === 'ios' && (
            <BlurView
              intensity={80}
              tint="light"
              style={StyleSheet.absoluteFill}
            />
          )}

          {/* Content background */}
          <View style={styles.sheetBackground} />

          {/* Handle */}
          <View style={styles.handle} />

          {/* Title */}
          <Text style={styles.title}>react</Text>

          {/* Quick emojis */}
          <View style={styles.quickRow}>
            {quickEmojis.map((emoji) => (
              <EmojiButton
                key={emoji}
                emoji={emoji}
                onPress={() => handleSelect(emoji)}
                size="large"
              />
            ))}
          </View>

          {/* More emojis */}
          <View style={styles.moreRow}>
            {moreEmojis.map((emoji) => (
              <EmojiButton
                key={emoji}
                emoji={emoji}
                onPress={() => handleSelect(emoji)}
                size="medium"
              />
            ))}
          </View>

          {/* Close button */}
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>close</Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

interface EmojiButtonProps {
  emoji: string;
  onPress: () => void;
  size: 'medium' | 'large';
}

const EmojiButton: React.FC<EmojiButtonProps> = ({ emoji, onPress, size }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.85, springConfigs.responsive);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springConfigs.gentle);
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.emojiButton,
        size === 'large' ? styles.emojiLarge : styles.emojiMedium,
        animatedStyle,
      ]}
    >
      <Text style={size === 'large' ? styles.emojiTextLarge : styles.emojiTextMedium}>
        {emoji}
      </Text>
    </AnimatedPressable>
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
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    textTransform: 'lowercase',
    letterSpacing: typography.letterSpacing.wide,
  },
  quickRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  moreRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  emojiButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.reaction.highlight,
    borderRadius: borderRadius.full,
  },
  emojiLarge: {
    width: 56,
    height: 56,
  },
  emojiMedium: {
    width: 44,
    height: 44,
  },
  emojiTextLarge: {
    fontSize: 28,
  },
  emojiTextMedium: {
    fontSize: 22,
  },
  closeButton: {
    marginTop: spacing.xl,
    alignSelf: 'center',
    padding: spacing.md,
  },
  closeText: {
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
    textTransform: 'lowercase',
  },
});

export default EmojiPicker;
