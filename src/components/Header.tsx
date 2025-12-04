/**
 * Scena - Header Component
 * Consistent navigation header
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, hitSlop } from '../theme';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
  transparent?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBack = true,
  rightIcon,
  onRightPress,
  transparent = false,
}) => {
  const navigation = useNavigation();

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  const handleRightPress = () => {
    if (onRightPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onRightPress();
    }
  };

  return (
    <View style={[styles.container, transparent && styles.transparent]}>
      {/* Left - Back button */}
      <View style={styles.left}>
        {showBack && (
          <Pressable onPress={handleBack} hitSlop={hitSlop.large} style={styles.button}>
            <Ionicons name="chevron-back" size={24} color={colors.text.secondary} />
          </Pressable>
        )}
      </View>

      {/* Center - Title */}
      <View style={styles.center}>
        {title && <Text style={styles.title}>{title}</Text>}
      </View>

      {/* Right - Optional action */}
      <View style={styles.right}>
        {rightIcon && onRightPress && (
          <Pressable onPress={handleRightPress} hitSlop={hitSlop.large} style={styles.button}>
            <Ionicons name={rightIcon} size={24} color={colors.text.secondary} />
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenHorizontal,
    paddingVertical: spacing.md,
    backgroundColor: 'transparent',
  },
  transparent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  left: {
    width: 44,
    alignItems: 'flex-start',
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  right: {
    width: 44,
    alignItems: 'flex-end',
  },
  button: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    textTransform: 'lowercase',
  },
});

export default Header;
