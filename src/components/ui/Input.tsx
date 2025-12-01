import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

// Premium auth color palette
const authColors = {
  primary: '#FF6B6B',
  background: '#FFFFFF',
  inputBackground: '#F8F9FA',
  inputBorder: '#E2E8F0',
  inputBorderFocused: '#FF6B6B',
  textPrimary: '#1A1A2E',
  textSecondary: '#64748B',
  textPlaceholder: '#94A3B8',
  error: '#EF4444',
  errorBackground: '#FEF2F2',
  success: '#22C55E',
};

interface InputProps extends Omit<TextInputProps, 'style'> {
  label: string;
  error?: string;
  hint?: string;
  isPassword?: boolean;
  containerStyle?: ViewStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  success?: boolean;
}

export function Input({
  label,
  error,
  hint,
  isPassword = false,
  containerStyle,
  leftIcon,
  rightIcon,
  success = false,
  value,
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    Haptics.selectionAsync();
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const hasError = !!error;
  const hasSuccess = success && !hasError;

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Label */}
      <Text style={[
        styles.label,
        hasError && styles.labelError,
        hasSuccess && styles.labelSuccess,
      ]}>
        {label}
      </Text>

      {/* Input Container */}
      <View style={[
        styles.inputContainer,
        isFocused && styles.inputContainerFocused,
        hasError && styles.inputContainerError,
        hasSuccess && styles.inputContainerSuccess,
      ]}>
        {/* Left Icon */}
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            {leftIcon}
          </View>
        )}

        {/* Text Input */}
        <TextInput
          style={[
            styles.input,
            leftIcon ? styles.inputWithLeftIcon : null,
            (isPassword || rightIcon) ? styles.inputWithRightIcon : null,
          ]}
          placeholderTextColor={authColors.textPlaceholder}
          secureTextEntry={isPassword && !showPassword}
          value={value}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoCapitalize="none"
          autoCorrect={false}
          {...props}
        />

        {/* Password Toggle */}
        {isPassword && (
          <TouchableOpacity
            onPress={togglePassword}
            style={styles.eyeButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={authColors.textSecondary}
            />
          </TouchableOpacity>
        )}

        {/* Right Icon */}
        {rightIcon && !isPassword && (
          <View style={styles.rightIconContainer}>
            {rightIcon}
          </View>
        )}

        {/* Success Checkmark */}
        {hasSuccess && !isPassword && !rightIcon && (
          <View style={styles.rightIconContainer}>
            <Ionicons name="checkmark-circle" size={20} color={authColors.success} />
          </View>
        )}
      </View>

      {/* Hint Text */}
      {hint && !hasError && (
        <Text style={styles.hint}>{hint}</Text>
      )}

      {/* Error Text */}
      {hasError && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={14} color={authColors.error} />
          <Text style={styles.error}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: authColors.textSecondary,
    marginBottom: 8,
  },
  labelError: {
    color: authColors.error,
  },
  labelSuccess: {
    color: authColors.success,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: authColors.inputBackground,
    borderWidth: 1.5,
    borderColor: authColors.inputBorder,
    borderRadius: 12,
    height: 52,
    paddingHorizontal: 16,
  },
  inputContainerFocused: {
    borderColor: authColors.inputBorderFocused,
    backgroundColor: authColors.background,
  },
  inputContainerError: {
    borderColor: authColors.error,
    backgroundColor: authColors.errorBackground,
  },
  inputContainerSuccess: {
    borderColor: authColors.success,
    backgroundColor: authColors.background,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: authColors.textPrimary,
    height: '100%',
    paddingVertical: 0,
  },
  inputWithLeftIcon: {
    marginLeft: 8,
  },
  inputWithRightIcon: {
    paddingRight: 8,
  },
  leftIconContainer: {
    marginRight: 4,
  },
  rightIconContainer: {
    marginLeft: 8,
  },
  eyeButton: {
    padding: 4,
    marginLeft: 8,
  },
  hint: {
    fontSize: 12,
    color: authColors.textPlaceholder,
    marginTop: 6,
    lineHeight: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  error: {
    fontSize: 12,
    color: authColors.error,
    lineHeight: 16,
    flex: 1,
  },
});
