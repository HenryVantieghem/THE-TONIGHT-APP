import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { colors } from '../../constants/colors';
import { borderRadius, shadows, spacing } from '../../constants/config';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  padding?: 'none' | 'small' | 'medium' | 'large';
  shadow?: 'none' | 'small' | 'medium' | 'large';
}

const paddingStyles = {
  none: undefined,
  small: { padding: spacing.sm },
  medium: { padding: spacing.md },
  large: { padding: spacing.lg },
} as const;

export function Card({
  children,
  onPress,
  style,
  padding = 'medium',
  shadow = 'medium',
}: CardProps) {
  const cardStyles = [
    styles.card,
    paddingStyles[padding],
    shadow !== 'none' && shadows[shadow],
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyles}
        onPress={onPress}
        activeOpacity={0.9}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyles}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
});
