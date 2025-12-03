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
import * as Haptics from 'expo-haptics';
import { Input, PasswordInput } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../services/supabase';
import { validateLoginForm, validateEmail } from '../../utils/validation';
import { colors } from '../../constants/colors';
import { textStyles } from '../../constants/typography';
import { spacing } from '../../constants/config';
import type { AuthStackParamList } from '../../types';

type LoginNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export function LoginScreen() {
  const navigation = useNavigation<LoginNavigationProp>();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    // Validate form
    const validation = validateLoginForm(email, password);

    if (!validation.isValid) {
      setErrors(validation.errors || {});
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const { data, error } = await signIn(email, password);

      if (error) {
        setErrors({ email: error.message });
        return;
      }

      if (data) {
        // Navigation will be handled by RootNavigator when user state changes
      }
    } catch (err) {
      setErrors({ email: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = () => {
    navigation.navigate('SignUp');
  };

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.replace('SignUp');
    }
  };

  const handleForgotPassword = async () => {
    // Prompt for email if not entered
    const emailToReset = email.trim();

    if (!emailToReset) {
      Alert.alert(
        'Enter Email',
        'Please enter your email address first, then tap "Forgot Password?"'
      );
      return;
    }

    // Validate email format
    const emailValidation = validateEmail(emailToReset);
    if (!emailValidation.isValid) {
      Alert.alert('Invalid Email', emailValidation.error || 'Please enter a valid email.');
      return;
    }

    Alert.alert(
      'Reset Password',
      `Send password reset email to ${emailToReset}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: async () => {
            setIsLoading(true);
            try {
              const { error } = await supabase.auth.resetPasswordForEmail(emailToReset, {
                redirectTo: 'tonight://reset-password',
              });

              if (error) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                Alert.alert('Error', error.message);
              } else {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                Alert.alert(
                  'Check Your Email',
                  'If an account exists with this email, you will receive a password reset link.',
                  [{ text: 'OK' }]
                );
              }
            } catch (err) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert('Error', 'Failed to send reset email. Please try again.');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
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
        >
          {/* Header: ← Back */}
          <TouchableOpacity
            onPress={handleGoBack}
            style={styles.backButton}
            hitSlop={spacing.sm}
          >
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>

          {/* Title */}
          <Text style={[textStyles.title1, styles.title]}>Welcome Back</Text>
          <Text style={[textStyles.body, styles.subtitle]}>
            Sign in to continue sharing moments
          </Text>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              leftIcon="mail"
              error={errors.email}
            />

            <PasswordInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              error={errors.password}
            />

            {/* Forgot Password */}
            <TouchableOpacity
              onPress={handleForgotPassword}
              style={styles.forgotPassword}
            >
              <Text style={[textStyles.callout, styles.forgotPasswordText]}>
                Forgot Password?
              </Text>
            </TouchableOpacity>

            <Button
              title="Log In"
              onPress={handleLogin}
              variant="primary"
              size="lg"
              loading={isLoading}
              fullWidth
              style={styles.button}
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[textStyles.body, styles.footerText]}>
              Don&apos;t have an account?{' '}
            </Text>
            <TouchableOpacity onPress={handleSignUp}>
              <Text style={[textStyles.body, styles.footerLink]}>Sign Up</Text>
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
    backgroundColor: colors.backgroundPrimary,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing['2xl'],
  },
  backButton: {
    marginBottom: spacing.xl,
  },
  title: {
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.textSecondary,
    marginBottom: spacing['2xl'],
  },
  form: {
    marginBottom: spacing.xl,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  forgotPasswordText: {
    color: colors.accent,
  },
  button: {
    marginTop: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing['2xl'],
  },
  footerText: {
    color: colors.textSecondary,
  },
  footerLink: {
    color: colors.accent,
    fontWeight: '600',
  },
});
