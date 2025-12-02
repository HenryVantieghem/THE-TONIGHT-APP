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
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../../constants/colors';
import { textStyles } from '../../constants/typography';
import { borderRadius, spacing, animations } from '../../constants/config';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  hint?: string;
  success?: boolean;
  isPassword?: boolean;
  isSearch?: boolean;
  containerStyle?: ViewStyle;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  showClearButton?: boolean;
  onClear?: () => void;
}

export function Input({
  label,
  error,
  hint,
  success = false,
  isPassword = false,
  isSearch = false,
  containerStyle,
  leftIcon,
  showClearButton = false,
  onClear,
  value,
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const focusProgress = useSharedValue(0);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    focusProgress.value = withSpring(1, {
      damping: 15,
      stiffness: 150,
    });
    Haptics.selectionAsync();
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    focusProgress.value = withSpring(0, {
      damping: 15,
      stiffness: 150,
    });
    onBlur?.(e);
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const hasError = !!error;
  const displayLeftIcon = leftIcon || (isSearch ? 'search' : undefined);

  // Animated border style
  const animatedBorderStyle = useAnimatedStyle(() => {
    const borderWidth = focusProgress.value > 0 || hasError ? 2 : 0;
    const borderColor = hasError
      ? colors.error
      : focusProgress.value > 0
      ? colors.accent
      : 'transparent';

    return {
      borderWidth: withTiming(borderWidth, { duration: animations.fast }),
      borderColor: withTiming(borderColor, { duration: animations.fast }),
    };
  });

  // Background color based on state
  const getBackgroundColor = () => {
    if (hasError) return `${colors.error}0D`; // 5% opacity
    if (isFocused) return colors.backgroundTertiary;
    return colors.backgroundTertiary;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Label */}
      {label && (
        <Text style={[
          textStyles.footnote,
          styles.label,
          hasError && styles.labelError,
          isFocused && !hasError && styles.labelFocused,
        ]}>
          {label}
        </Text>
      )}

      {/* Input Container */}
      <Animated.View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: getBackgroundColor(),
          },
          animatedBorderStyle,
        ]}
      >
        {/* Left Icon */}
        {displayLeftIcon && (
          <View style={styles.leftIconContainer}>
            <Ionicons
              name={displayLeftIcon}
              size={20}
              color={hasError ? colors.error : colors.textSecondary}
            />
          </View>
        )}

        {/* Text Input */}
        <TextInput
          style={[
            styles.input,
            displayLeftIcon && styles.inputWithLeftIcon,
            (isPassword || showClearButton) && styles.inputWithRightIcon,
          ]}
          placeholderTextColor={colors.textTertiary}
          secureTextEntry={isPassword && !showPassword}
          value={value}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoCapitalize="none"
          autoCorrect={false}
          {...props}
        />

        {/* Clear Button */}
        {showClearButton && value && value.length > 0 && (
          <TouchableOpacity
            onPress={onClear}
            style={styles.rightIconContainer}
            hitSlop={spacing.xs}
          >
            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}

        {/* Password Toggle */}
        {isPassword && (
          <TouchableOpacity
            onPress={togglePassword}
            style={styles.rightIconContainer}
            hitSlop={spacing.xs}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </Animated.View>

      {/* Hint Text */}
      {hint && !hasError && (
        <Text style={[textStyles.caption1, styles.hint]}>{hint}</Text>
      )}

      {/* Error Text */}
      {hasError && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={14} color={colors.error} />
          <Text style={[textStyles.caption1, styles.error]}>{error}</Text>
        </View>
      )}
    </View>
  );
}

// Search Input convenience component
export function SearchInput(props: Omit<InputProps, 'isSearch'>) {
  return <Input {...props} isSearch={true} />;
}

// Password Input convenience component
export function PasswordInput(props: Omit<InputProps, 'isPassword'>) {
  return <Input {...props} isPassword={true} />;
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    marginBottom: spacing.xs,
    color: colors.textSecondary,
  },
  labelError: {
    color: colors.error,
  },
  labelFocused: {
    color: colors.accent,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
  },
  leftIconContainer: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    ...textStyles.body,
    color: colors.textPrimary,
    height: '100%',
    paddingVertical: 0,
  },
  inputWithLeftIcon: {
    marginLeft: 0,
  },
  inputWithRightIcon: {
    paddingRight: spacing.xs,
  },
  rightIconContainer: {
    marginLeft: spacing.sm,
    padding: spacing['2xs'],
  },
  hint: {
    marginTop: spacing.xs,
    color: colors.textTertiary,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  error: {
    color: colors.error,
    flex: 1,
  },
});
