import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  interpolate,
  interpolateColor,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, shadows } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/config';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  helper?: string;
  success?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  maxLength?: number;
  showCharacterCount?: boolean;
}

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);
const AnimatedView = Animated.View;

export function Input({
  label,
  error,
  helper,
  success = false,
  leftIcon,
  rightIcon,
  containerStyle,
  secureTextEntry,
  maxLength,
  showCharacterCount = false,
  value,
  onChangeText,
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(secureTextEntry);
  const [internalValue, setInternalValue] = useState(value || '');

  // Animation values
  const focusAnim = useSharedValue(0);
  const labelAnim = useSharedValue(value ? 1 : 0);
  const shakeAnim = useSharedValue(0);
  const borderColorAnim = useSharedValue(0);
  const eyeRotation = useSharedValue(0);

  const hasError = !!error;
  const hasValue = !!(value || internalValue);

  // Update animations when focus/value changes
  useEffect(() => {
    focusAnim.value = withTiming(isFocused ? 1 : 0, {
      duration: 200,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    });

    const shouldFloat = isFocused || hasValue;
    labelAnim.value = withTiming(shouldFloat ? 1 : 0, {
      duration: 200,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    });
  }, [isFocused, hasValue, focusAnim, labelAnim]);

  // Border color animation
  useEffect(() => {
    if (hasError) {
      borderColorAnim.value = withTiming(2, { duration: 200 });
    } else if (success) {
      borderColorAnim.value = withTiming(3, { duration: 200 });
    } else if (isFocused) {
      borderColorAnim.value = withTiming(1, { duration: 200 });
    } else {
      borderColorAnim.value = withTiming(0, { duration: 200 });
    }
  }, [hasError, success, isFocused, borderColorAnim]);

  // Shake animation on error
  useEffect(() => {
    if (hasError) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      shakeAnim.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
    }
  }, [hasError, shakeAnim]);

  // Floating label animated style
  const labelStyle = useAnimatedStyle(() => {
    const translateY = interpolate(labelAnim.value, [0, 1], [0, -28]);
    const scale = interpolate(labelAnim.value, [0, 1], [1, 0.85]);
    const translateX = interpolate(labelAnim.value, [0, 1], [0, leftIcon ? -8 : 0]);

    return {
      transform: [
        { translateY },
        { scale },
        { translateX },
      ],
    };
  });

  // Label color animated style
  const labelColorStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      borderColorAnim.value,
      [0, 1, 2, 3],
      [colors.textSecondary, colors.primary, colors.error, colors.success]
    );

    return { color };
  });

  // Container animated style (shake + border)
  const containerAnimStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      borderColorAnim.value,
      [0, 1, 2, 3],
      [colors.border, colors.primary, colors.error, colors.success]
    );

    return {
      transform: [{ translateX: shakeAnim.value }],
      borderColor,
      borderWidth: isFocused || hasError || success ? 1.5 : 1,
    };
  });

  // Eye icon animated style
  const eyeStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${eyeRotation.value}deg` }],
  }));

  const handleFocus = useCallback((e: any) => {
    setIsFocused(true);
    Haptics.selectionAsync();
    onFocus?.(e);
  }, [onFocus]);

  const handleBlur = useCallback((e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  }, [onBlur]);

  const handleChangeText = useCallback((text: string) => {
    setInternalValue(text);
    onChangeText?.(text);
  }, [onChangeText]);

  const toggleSecure = useCallback(() => {
    setIsSecure(!isSecure);
    eyeRotation.value = withSpring(isSecure ? 0 : 180, {
      damping: 15,
      stiffness: 200,
    });
    Haptics.selectionAsync();
  }, [isSecure, eyeRotation]);

  const handleClear = useCallback(() => {
    setInternalValue('');
    onChangeText?.('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [onChangeText]);

  const currentValue = value !== undefined ? value : internalValue;
  const characterCount = currentValue?.length || 0;

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Input Container */}
      <AnimatedView style={[styles.inputContainer, containerAnimStyle, shadows.sm]}>
        {/* Left Icon */}
        {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}

        {/* Floating Label */}
        {label && (
          <Animated.Text
            style={[
              styles.label,
              labelStyle,
              labelColorStyle,
              leftIcon ? styles.labelWithIcon : undefined,
            ]}
            pointerEvents="none"
          >
            {label}
          </Animated.Text>
        )}

        {/* Input Field */}
        <TextInput
          style={[
            styles.input,
            leftIcon ? styles.inputWithLeftIcon : undefined,
            (rightIcon || secureTextEntry || (hasValue && !hasError)) ? styles.inputWithRightIcon : undefined,
            label ? styles.inputWithLabel : undefined,
          ]}
          value={currentValue}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor={colors.textTertiary}
          secureTextEntry={isSecure}
          autoCapitalize="none"
          autoCorrect={false}
          maxLength={maxLength}
          {...props}
        />

        {/* Right Side Icons */}
        <View style={styles.rightIcons}>
          {/* Success Checkmark */}
          {success && !hasError && (
            <View style={styles.iconContainer}>
              <Text style={styles.successIcon}>✓</Text>
            </View>
          )}

          {/* Clear Button */}
          {hasValue && !hasError && !success && !secureTextEntry && (
            <TouchableOpacity
              style={styles.iconContainer}
              onPress={handleClear}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <View style={styles.clearButton}>
                <Text style={styles.clearIcon}>×</Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Password Toggle */}
          {secureTextEntry && (
            <TouchableOpacity
              style={styles.iconContainer}
              onPress={toggleSecure}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Animated.Text style={[styles.eyeIcon, eyeStyle]}>
                {isSecure ? '👁️' : '🔒'}
              </Animated.Text>
            </TouchableOpacity>
          )}

          {/* Custom Right Icon */}
          {rightIcon && !secureTextEntry && !success && (
            <View style={styles.iconContainer}>{rightIcon}</View>
          )}
        </View>
      </AnimatedView>

      {/* Helper Text / Error / Character Count */}
      <View style={styles.bottomRow}>
        {(error || helper) && (
          <Text style={[styles.helperText, hasError && styles.errorText]}>
            {error || helper}
          </Text>
        )}

        {showCharacterCount && maxLength && (
          <Text style={[
            styles.characterCount,
            characterCount >= maxLength && styles.characterCountFull,
          ]}>
            {characterCount}/{maxLength}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 56,
    position: 'relative',
  },
  label: {
    position: 'absolute',
    left: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    backgroundColor: colors.surface,
    paddingHorizontal: 4,
    zIndex: 1,
  },
  labelWithIcon: {
    left: spacing.md + 32,
  },
  input: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.text,
    height: '100%',
  },
  inputWithLabel: {
    paddingTop: spacing.md + 4,
    paddingBottom: spacing.sm,
  },
  inputWithLeftIcon: {
    paddingLeft: spacing.xs,
  },
  inputWithRightIcon: {
    paddingRight: spacing.xs,
  },
  iconContainer: {
    paddingHorizontal: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.textTertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearIcon: {
    fontSize: 14,
    color: colors.white,
    fontWeight: '600',
    marginTop: -1,
  },
  eyeIcon: {
    fontSize: 18,
  },
  successIcon: {
    fontSize: 18,
    color: colors.success,
    fontWeight: '700',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
    minHeight: 18,
  },
  helperText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    flex: 1,
  },
  errorText: {
    color: colors.error,
  },
  characterCount: {
    fontSize: typography.sizes.xs,
    color: colors.textTertiary,
    marginLeft: spacing.sm,
  },
  characterCountFull: {
    color: colors.error,
  },
});
