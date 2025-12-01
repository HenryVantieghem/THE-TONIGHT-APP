import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import {
  liquidGlass,
  glassMotion,
  glassColors,
} from '../../constants/liquidGlass';
import { colors } from '../../constants/colors';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label: string;
  error?: string;
  hint?: string;
  isPassword?: boolean;
  containerStyle?: ViewStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  success?: boolean;
  // Liquid Glass options
  variant?: 'default' | 'glass' | 'glassDark';
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
  variant = 'glass',
  value,
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Animation values
  const focusProgress = useSharedValue(0);
  const labelScale = useSharedValue(1);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    focusProgress.value = withSpring(1, glassMotion.spring.snappy);
    Haptics.selectionAsync();
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    focusProgress.value = withSpring(0, glassMotion.spring.smooth);
    onBlur?.(e);
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const hasError = !!error;
  const hasSuccess = success && !hasError;

  // Animated border style
  const animatedBorderStyle = useAnimatedStyle(() => {
    const borderOpacity = interpolate(
      focusProgress.value,
      [0, 1],
      [0.25, 0.6],
      Extrapolation.CLAMP
    );

    return {
      borderColor: hasError
        ? colors.error
        : hasSuccess
        ? colors.success
        : isFocused
        ? colors.primary
        : `rgba(255, 255, 255, ${borderOpacity})`,
      borderWidth: isFocused || hasError || hasSuccess ? 1.5 : liquidGlass.border.width,
    };
  });

  // Glass background color based on state
  const getGlassBackground = () => {
    if (variant === 'glassDark') {
      return liquidGlass.material.dark.backgroundColor;
    }
    if (hasError) return 'rgba(239, 68, 68, 0.08)';
    if (isFocused) return liquidGlass.material.elevated.backgroundColor;
    return liquidGlass.material.primary.backgroundColor;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Label */}
      <Text style={[
        styles.label,
        hasError && styles.labelError,
        hasSuccess && styles.labelSuccess,
        isFocused && styles.labelFocused,
      ]}>
        {label}
      </Text>

      {/* Input Container with Glass Effect */}
      <Animated.View style={[styles.inputWrapper, animatedBorderStyle]}>
        {/* Glass Background */}
        <View style={styles.glassBackground}>
          {Platform.OS === 'ios' && (
            <BlurView
              intensity={isFocused ? liquidGlass.blur.regular : liquidGlass.blur.light}
              tint={variant === 'glassDark' ? 'dark' : 'light'}
              style={StyleSheet.absoluteFill}
            />
          )}
          <View
            style={[
              styles.glassBg,
              { backgroundColor: getGlassBackground() },
            ]}
          />
          {/* Top highlight */}
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.3)', 'transparent']}
            style={styles.glassHighlight}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 0.5 }}
          />
        </View>

        <View style={styles.inputContainer}>
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
              variant === 'glassDark' && styles.inputDark,
              leftIcon ? styles.inputWithLeftIcon : null,
              (isPassword || rightIcon) ? styles.inputWithRightIcon : null,
            ]}
            placeholderTextColor={
              variant === 'glassDark'
                ? glassColors.text.inverseSecondary
                : glassColors.text.tertiary
            }
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
                color={
                  variant === 'glassDark'
                    ? glassColors.text.inverseSecondary
                    : glassColors.text.secondary
                }
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
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            </View>
          )}
        </View>
      </Animated.View>

      {/* Hint Text */}
      {hint && !hasError && (
        <Text style={styles.hint}>{hint}</Text>
      )}

      {/* Error Text */}
      {hasError && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={14} color={colors.error} />
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
    color: glassColors.text.secondary,
    marginBottom: 8,
  },
  labelError: {
    color: colors.error,
  },
  labelSuccess: {
    color: colors.success,
  },
  labelFocused: {
    color: colors.primary,
  },
  inputWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  glassBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    overflow: 'hidden',
  },
  glassBg: {
    ...StyleSheet.absoluteFillObject,
  },
  glassHighlight: {
    ...StyleSheet.absoluteFillObject,
    height: '50%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: glassColors.text.primary,
    height: '100%',
    paddingVertical: 0,
  },
  inputDark: {
    color: glassColors.text.inverse,
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
    color: glassColors.text.tertiary,
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
    color: colors.error,
    lineHeight: 16,
    flex: 1,
  },
});
