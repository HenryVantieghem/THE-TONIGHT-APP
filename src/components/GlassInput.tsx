/**
 * Scena - Glass Input Component
 * Gentle, non-pressuring input field
 */

import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { colors, typography, borderRadius, spacing, durations } from '../theme';

interface GlassInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  hint?: string;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address' | 'numeric';
  multiline?: boolean;
  style?: ViewStyle;
  maxLength?: number;
  onFocus?: () => void;
}

export const GlassInput: React.FC<GlassInputProps> = ({
  value,
  onChangeText,
  placeholder,
  label,
  hint,
  secureTextEntry = false,
  autoCapitalize = 'none',
  keyboardType = 'default',
  multiline = false,
  style,
  maxLength,
  onFocus,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const focusValue = useSharedValue(0);

  const handleFocus = () => {
    setIsFocused(true);
    focusValue.value = withTiming(1, { duration: durations.fast });
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    focusValue.value = withTiming(0, { duration: durations.normal });
  };

  const animatedBorderStyle = useAnimatedStyle(() => {
    return {
      borderColor: isFocused
        ? colors.input.borderFocus
        : colors.input.border,
    };
  });

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <Animated.View style={[styles.inputContainer, animatedBorderStyle]}>
        {/* Background blur */}
        {Platform.OS === 'ios' && (
          <BlurView
            intensity={30}
            tint="light"
            style={StyleSheet.absoluteFill}
          />
        )}

        {/* Background overlay */}
        <View style={styles.inputBackground} />

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.input.placeholder}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          multiline={multiline}
          maxLength={maxLength}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={[
            styles.input,
            multiline && styles.multilineInput,
          ]}
        />
      </Animated.View>

      {hint && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
    textTransform: 'lowercase',
    letterSpacing: typography.letterSpacing.wide,
  },
  inputContainer: {
    borderRadius: borderRadius.input,
    borderWidth: 1,
    overflow: 'hidden',
  },
  inputBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.input.background,
  },
  input: {
    paddingVertical: spacing.inputPadding,
    paddingHorizontal: spacing.inputPadding,
    fontSize: typography.sizes.base,
    color: colors.text.primary,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
    textTransform: 'lowercase',
  },
});

export default GlassInput;
