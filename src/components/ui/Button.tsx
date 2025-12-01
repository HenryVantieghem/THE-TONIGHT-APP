import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

// Premium auth color palette
const authColors = {
  primary: '#FF6B6B',
  primaryGradient: ['#FF6B6B', '#FF8E53'] as const,
  disabledGradient: ['#CBD5E1', '#94A3B8'] as const,
  secondary: '#FFF1F0',
  secondaryBorder: '#FF6B6B',
  textPrimary: '#1A1A2E',
  textWhite: '#FFFFFF',
};

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  fullWidth = false,
  size = 'md',
}: ButtonProps) {
  const handlePress = () => {
    if (!disabled && !loading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onPress();
    }
  };

  const isDisabled = disabled || loading;

  // Size configurations
  const sizeStyles = {
    sm: { height: 44, fontSize: 14 },
    md: { height: 52, fontSize: 16 },
    lg: { height: 56, fontSize: 16 },
  };

  const { height, fontSize } = sizeStyles[size];

  // Primary button with gradient
  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={isDisabled}
        activeOpacity={0.8}
        style={[fullWidth && styles.fullWidth, style]}
      >
        <LinearGradient
          colors={isDisabled ? authColors.disabledGradient : authColors.primaryGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.primaryButton,
            { height },
            !isDisabled && styles.primaryShadow,
          ]}
        >
          {loading ? (
            <ActivityIndicator color={authColors.textWhite} size="small" />
          ) : (
            <Text style={[styles.primaryText, { fontSize }]}>{title}</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  // Secondary button with border
  if (variant === 'secondary') {
    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={isDisabled}
        activeOpacity={0.7}
        style={[
          styles.secondaryButton,
          { height },
          fullWidth && styles.fullWidth,
          isDisabled && styles.disabledOpacity,
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={authColors.primary} size="small" />
        ) : (
          <Text style={[styles.secondaryText, { fontSize }]}>{title}</Text>
        )}
      </TouchableOpacity>
    );
  }

  // Ghost button (text only)
  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={0.7}
      style={[
        styles.ghostButton,
        { height: height - 8 },
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabledOpacity,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={authColors.primary} size="small" />
      ) : (
        <Text style={[styles.ghostText, { fontSize: fontSize - 2 }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  primaryButton: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryShadow: {
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryText: {
    fontWeight: '600',
    color: authColors.textWhite,
    letterSpacing: 0.3,
  },
  secondaryButton: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: authColors.secondary,
    borderWidth: 1.5,
    borderColor: authColors.secondaryBorder,
  },
  secondaryText: {
    fontWeight: '600',
    color: authColors.primary,
    letterSpacing: 0.3,
  },
  ghostButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostText: {
    fontWeight: '500',
    color: authColors.primary,
  },
  fullWidth: {
    width: '100%',
  },
  disabledOpacity: {
    opacity: 0.5,
  },
});
