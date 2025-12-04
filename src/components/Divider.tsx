/**
 * Scena - Divider Component
 * Subtle separator
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing } from '../theme';

interface DividerProps {
  style?: ViewStyle;
  spacing?: 'none' | 'small' | 'medium' | 'large';
}

const spacingValues = {
  none: 0,
  small: spacing.sm,
  medium: spacing.md,
  large: spacing.lg,
};

export const Divider: React.FC<DividerProps> = ({
  style,
  spacing: spacingProp = 'medium',
}) => {
  const marginValue = spacingValues[spacingProp];

  return (
    <View
      style={[
        styles.divider,
        { marginVertical: marginValue },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: colors.glass.border,
  },
});

export default Divider;
