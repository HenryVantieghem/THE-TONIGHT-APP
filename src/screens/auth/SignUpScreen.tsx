import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { validateSignUpForm, validateUsername } from '../../utils/validation';
import { config } from '../../constants/config';
import { typography } from '../../constants/typography';
import type { AuthStackParamList } from '../../types';

// iOS auth color palette
const authColors = {
  background: '#FFFFFF',
  textPrimary: '#000000',
  textSecondary: '#8E8E93',
  primary: '#007AFF',
  backButtonBg: '#F2F2F7',
};

type SignUpNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'SignUp'>;

export function SignUpScreen() {
  const navigation = useNavigation<SignUpNavigationProp>();
  const { signUp, checkUsernameAvailable } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    username?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleUsernameChange = async (text: string) => {
    const sanitized = text.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(sanitized);
    setIsUsernameAvailable(null);
    setErrors((prev) => ({ ...prev, username: undefined }));

    // Validate format
    const validation = validateUsername(sanitized);
    if (!validation.isValid && sanitized.length > 0) {
      setErrors((prev) => ({ ...prev, username: validation.error }));
      return;
    }

    // Check availability if valid
    if (validation.isValid && sanitized.length >= config.USERNAME.MIN_LENGTH) {
      setIsCheckingUsername(true);
      try {
        const { data } = await checkUsernameAvailable(sanitized);
        setIsUsernameAvailable(data ?? false);
        if (data === false) {
          setErrors((prev) => ({ ...prev, username: 'Username taken' }));
        }
      } catch (err) {
        console.error('Username check error:', err);
      } finally {
        setIsCheckingUsername(false);
      }
    }
  };

  const handleSignUp = async () => {
    // Validate form
    const validation = validateSignUpForm(email, password, confirmPassword, username);

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    // Check username availability if provided
    if (username && isUsernameAvailable !== true) {
      setErrors((prev) => ({ ...prev, username: 'Please choose an available username' }));
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const { data, error } = await signUp(email, password, username || undefined);

      if (error) {
        Alert.alert('Sign Up Failed', error.message);
        return;
      }

      if (data) {
        // If username was provided, skip username setup and go to permissions
        if (username) {
          navigation.replace('Permissions');
        } else {
          navigation.replace('UsernameSetup');
        }
      }
    } catch (err) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.replace('Onboarding');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Join Tonight and share moments with friends
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Email"
              placeholder="your@email.com"
              value={email}
              onChangeText={setEmail}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              leftIcon={<Text style={styles.icon}>✉️</Text>}
            />

            <Input
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              isPassword
              autoComplete="new-password"
            />

            <Input
              label="Confirm Password"
              placeholder="••••••••"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              error={errors.confirmPassword}
              isPassword
              autoComplete="new-password"
            />


            <Button
              title="Create Account"
              onPress={handleSignUp}
              loading={isLoading}
              disabled={isLoading}
              fullWidth
              size="lg"
              style={styles.button}
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={handleLogin} activeOpacity={0.7}>
              <Text style={styles.footerLink}> Log In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
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
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.bold,
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
  button: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 14,
    color: authColors.textSecondary,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '600',
    color: authColors.primary,
  },
  icon: {
    fontSize: 20,
  },
});
