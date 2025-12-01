import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { validateUsername } from '../../utils/validation';
import { config } from '../../constants/config';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { spacing } from '../../constants/config';
import type { AuthStackParamList } from '../../types';

type UsernameSetupNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'UsernameSetup'>;

export function UsernameSetupScreen() {
  const navigation = useNavigation<UsernameSetupNavigationProp>();
  const insets = useSafeAreaInsets();
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
          setError('This username is already taken.');
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

      // Clear previous error
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
      setError('Please choose an available username.');
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

  const getStatusText = () => {
    if (isChecking) return 'Checking availability...';
    if (error) return error;
    if (isAvailable === true) return '✓ Username available';
    return config.USERNAME.RULES;
  };

  const getStatusColor = () => {
    if (error) return colors.error;
    if (isAvailable === true) return colors.success;
    return colors.textSecondary;
  };

  const canSubmit =
    !isChecking &&
    !isSubmitting &&
    isAvailable === true &&
    validateUsername(username).isValid;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + spacing.xxl,
            paddingBottom: insets.bottom + spacing.xl,
          },
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.icon}>👤</Text>
          <Text style={styles.title}>Choose Your Username</Text>
          <Text style={styles.subtitle}>
            This is how your friends will find you on Tonight
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputWrapper}>
            <View style={styles.atSymbolContainer}>
              <Text style={styles.atSymbol}>@</Text>
            </View>
            <View style={styles.inputContainer}>
              <Input
                placeholder="username"
                value={username}
                onChangeText={handleUsernameChange}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="username"
                maxLength={config.USERNAME.MAX_LENGTH}
              />
            </View>
          </View>

          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {getStatusText()}
          </Text>

          <View style={styles.characterCount}>
            <Text style={styles.characterCountText}>
              {username.length}/{config.USERNAME.MAX_LENGTH}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  icon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.display,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.sizes.lg,
    color: colors.textSecondary,
    lineHeight: typography.lineHeights.lg,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  atSymbolContainer: {
    height: 56,
    justifyContent: 'center',
    paddingRight: spacing.xs,
  },
  atSymbol: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  inputContainer: {
    flex: 1,
  },
  statusText: {
    fontSize: typography.sizes.sm,
    marginTop: spacing.xs,
    lineHeight: typography.lineHeights.md,
    textAlign: 'center',
  },
  characterCount: {
    alignItems: 'flex-end',
    marginTop: spacing.xs,
  },
  characterCountText: {
    fontSize: typography.sizes.xs,
    color: colors.textTertiary,
  },
  footer: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
});
