import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { validateUsername } from '../../utils/validation';
import { config , spacing } from '../../constants/config';
import { colors } from '../../constants/colors';
import { textStyles } from '../../constants/typography';
import type { AuthStackParamList } from '../../types';

type UsernameSetupNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'UsernameSetup'>;

export function UsernameSetupScreen() {
  const navigation = useNavigation<UsernameSetupNavigationProp>();
  const { updateUsername, checkUsernameAvailable } = useAuth();

  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setError(undefined);

      try {
        const { data, error: checkError } = await checkUsernameAvailable(usernameToCheck);

        if (checkError) {
          setError(checkError.message);
          setIsAvailable(null);
          return;
        }

        setIsAvailable(data ?? null);

        if (data === false) {
          setError('Username already taken');
        }
      } catch (err) {
        console.error('Username check error:', err);
        setError('Failed to check username');
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
        setError(validation.error || 'Must start with a letter');
        return;
      }

      // Debounce availability check
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      if (validation.isValid && sanitized.length >= config.USERNAME.MIN_LENGTH) {
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
      setError(validation.error || 'Must start with a letter');
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
        setError(updateError.message);
        return;
      }

      // Navigation will be handled by RootNavigator when user state updates
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const canSubmit =
    !isChecking &&
    !isSubmitting &&
    isAvailable === true &&
    validateUsername(username).isValid;

  // Status indicator per spec
  const renderStatusIndicator = () => {
    if (isChecking) {
      return (
        <View style={styles.statusContainer}>
          <ActivityIndicator size="small" color={colors.textSecondary} />
          <Text style={[textStyles.caption1, styles.statusText]}>
            Checking availability...
          </Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.statusContainer}>
          <Ionicons name="close-circle" size={16} color={colors.error} />
          <Text style={[textStyles.caption1, styles.statusText, styles.statusError]}>
            {error}
          </Text>
        </View>
      );
    }

    if (isAvailable === true) {
      return (
        <View style={styles.statusContainer}>
          <Ionicons name="checkmark-circle" size={16} color={colors.success} />
          <Text style={[textStyles.caption1, styles.statusText, styles.statusSuccess]}>
            Available
          </Text>
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
            hitSlop={spacing.sm}
          >
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <Text style={[textStyles.title1, styles.title]}>Choose Your Username</Text>
            <Text style={[textStyles.body, styles.subtitle]}>
              This is how friends will find you
            </Text>
          </View>

          {/* Username Input with @ prefix */}
          <View style={styles.form}>
            <Input
              label="Username"
              value={username}
              onChangeText={handleUsernameChange}
              placeholder="username"
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={config.USERNAME.MAX_LENGTH}
              leftIcon="at"
              error={error && !isChecking ? error : undefined}
              success={isAvailable === true}
            />

            {/* Status Indicator */}
            {renderStatusIndicator()}
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
    backgroundColor: colors.backgroundPrimary,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing['2xl'],
  },
  backButton: {
    marginBottom: spacing.xl,
  },
  header: {
    marginBottom: spacing['2xl'],
  },
  title: {
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.textSecondary,
  },
  form: {
    flex: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  statusText: {
    color: colors.textSecondary,
  },
  statusError: {
    color: colors.error,
  },
  statusSuccess: {
    color: colors.success,
  },
  buttonContainer: {
    paddingVertical: spacing.xl,
  },
});
