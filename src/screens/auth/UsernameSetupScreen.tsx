import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { validateUsername } from '../../utils/validation';
import { config } from '../../constants/config';
import type { AuthStackParamList } from '../../types';

// iOS auth color palette
const authColors = {
  background: '#FFFFFF',
  textPrimary: '#000000',
  textSecondary: '#8E8E93',
  textPlaceholder: '#C7C7CC',
  primary: '#007AFF',
  inputBackground: '#F2F2F7',
  inputBorder: '#E5E5EA',
  inputBorderFocused: '#007AFF',
  error: '#FF3B30',
  success: '#34C759',
  backButtonBg: '#F2F2F7',
};

type UsernameSetupNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'UsernameSetup'>;

export function UsernameSetupScreen() {
  const navigation = useNavigation<UsernameSetupNavigationProp>();
  const { updateUsername, checkUsernameAvailable } = useAuth();

  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const checkAvailability = useCallback(
    async (usernameToCheck: string) => {
      setIsChecking(true);
      setIsAvailable(null);

      try {
        const { data, error: checkError } = await checkUsernameAvailable(
          usernameToCheck
        );

        if (checkError) {
          setError(checkError.message);
          setIsAvailable(null);
          return;
        }

        setIsAvailable(data ?? null);

        if (data === false) {
          setError('Username taken');
        }
      } catch (err) {
        console.error('Username check error:', err);
      } finally {
        setIsChecking(false);
      }
    },
    [checkUsernameAvailable]
  );

  const handleUsernameChange = useCallback(
    (text: string) => {
      const sanitized = text.toLowerCase().replace(/[^a-z0-9_]/g, '');
      setUsername(sanitized);
      setIsAvailable(null);
      setError(undefined);

      // Validate format
      const validation = validateUsername(sanitized);
      if (!validation.isValid && sanitized.length > 0) {
        setError(validation.error);
        return;
      }

      // Debounce availability check
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      if (validation.isValid) {
        debounceRef.current = setTimeout(() => {
          checkAvailability(sanitized);
        }, config.DEBOUNCE.USERNAME_CHECK);
      }
    },
    [checkAvailability]
  );

  const handleSubmit = async () => {
    // Final validation
    const validation = validateUsername(username);
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    if (!isAvailable) {
      setError('Please choose an available username');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error: updateError } = await updateUsername(username);

      if (updateError) {
        Alert.alert('Error', updateError.message);
        return;
      }

      if (data) {
        navigation.replace('Permissions');
      }
    } catch (err) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.replace('Permissions');
    }
  };

  const canSubmit =
    !isChecking &&
    !isSubmitting &&
    isAvailable === true &&
    validateUsername(username).isValid;

  // Status indicator
  const renderStatusIndicator = () => {
    if (isChecking) {
      return (
        <View style={styles.statusContainer}>
          <ActivityIndicator size="small" color={authColors.textSecondary} />
          <Text style={styles.statusText}>Checking availability...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.statusContainer}>
          <Text style={styles.statusIcon}>✗</Text>
          <Text style={[styles.statusText, styles.statusError]}>{error}</Text>
        </View>
      );
    }

    if (isAvailable === true) {
      return (
        <View style={styles.statusContainer}>
          <Text style={styles.statusIconSuccess}>✓</Text>
          <Text style={[styles.statusText, styles.statusSuccess]}>Available</Text>
        </View>
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Back Button */}
          <TouchableOpacity
            onPress={handleGoBack}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={authColors.textPrimary} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Choose Your Username</Text>
            <Text style={styles.subtitle}>
              This is how friends will find you
            </Text>
          </View>

          {/* Username Input */}
          <View style={styles.form}>
            <Text style={styles.label}>Username</Text>
            <View style={[
              styles.inputContainer,
              isFocused && styles.inputContainerFocused,
              error && styles.inputContainerError,
              isAvailable === true && styles.inputContainerSuccess,
            ]}>
              <Text style={[
                styles.atSymbol,
                isFocused && styles.atSymbolFocused,
                error && styles.atSymbolError,
                isAvailable === true && styles.atSymbolSuccess,
              ]}>@</Text>
              <TextInput
                style={styles.input}
                placeholder="_"
                placeholderTextColor={authColors.textPlaceholder}
                value={username}
                onChangeText={handleUsernameChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="username"
                maxLength={config.USERNAME.MAX_LENGTH}
              />
              {/* Right side status icon */}
              {isChecking && (
                <ActivityIndicator size="small" color={authColors.textSecondary} />
              )}
              {!isChecking && isAvailable === true && (
                <Ionicons name="checkmark-circle" size={20} color={authColors.success} />
              )}
              {!isChecking && error && (
                <Ionicons name="close-circle" size={20} color={authColors.error} />
              )}
            </View>

            {/* Status Text */}
            {renderStatusIndicator()}

            {/* Rules hint */}
            {!error && !isAvailable && !isChecking && (
              <Text style={styles.hint}>
                3-20 characters, letters and numbers only
              </Text>
            )}

            {/* Character count */}
            <View style={styles.characterCountContainer}>
              <Text style={styles.characterCount}>
                {username.length}/{config.USERNAME.MAX_LENGTH}
              </Text>
            </View>
          </View>

          {/* Continue Button */}
          <View style={styles.buttonContainer}>
            <Button
              title="Continue"
              onPress={handleSubmit}
              loading={isSubmitting}
              disabled={!canSubmit}
              fullWidth
              size="lg"
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: authColors.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: authColors.backButtonBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  header: {
    marginTop: 32,
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: authColors.textPrimary,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: authColors.textSecondary,
    lineHeight: 24,
  },
  form: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: authColors.textSecondary,
    marginBottom: 8,
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
  },
  inputContainerSuccess: {
    borderColor: authColors.success,
  },
  atSymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: authColors.textSecondary,
    marginRight: 2,
  },
  atSymbolFocused: {
    color: authColors.primary,
  },
  atSymbolError: {
    color: authColors.error,
  },
  atSymbolSuccess: {
    color: authColors.success,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: authColors.textPrimary,
    height: '100%',
    paddingVertical: 0,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  statusText: {
    fontSize: 13,
    color: authColors.textSecondary,
  },
  statusError: {
    color: authColors.error,
  },
  statusSuccess: {
    color: authColors.success,
  },
  hint: {
    fontSize: 13,
    color: authColors.textPlaceholder,
    marginTop: 8,
  },
  characterCountContainer: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  characterCount: {
    fontSize: 12,
    color: authColors.textPlaceholder,
  },
  buttonContainer: {
    paddingVertical: 24,
  },
});
