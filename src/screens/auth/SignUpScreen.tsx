import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Input, PasswordInput } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { validateSignUpForm } from '../../utils/validation';
import { colors } from '../../constants/colors';
import { textStyles } from '../../constants/typography';
import { spacing } from '../../constants/config';
import type { AuthStackParamList } from '../../types';

type SignUpNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'SignUp'>;

export function SignUpScreen() {
  const navigation = useNavigation<SignUpNavigationProp>();
  const { signUp } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async () => {
    // Validate form
    const validation = validateSignUpForm(email, password, confirmPassword);

    if (!validation.isValid) {
      setErrors(validation.errors || {});
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const { data, error } = await signUp(email, password);

      if (error) {
        setErrors({ email: error.message });
        return;
      }

      if (data) {
        navigation.replace('UsernameSetup');
      }
    } catch (err) {
      setErrors({ email: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.replace('Login');
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
          <Text style={[textStyles.title1, styles.title]}>Create Account</Text>
          <Text style={[textStyles.body, styles.subtitle]}>
            Join Experiences and share moments with friends
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
              placeholder="Create a password"
              error={errors.password}
            />

            <PasswordInput
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm your password"
              error={errors.confirmPassword}
            />

            <Button
              title="Create Account"
              onPress={handleSignUp}
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
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={[textStyles.body, styles.footerLink]}>Log In</Text>
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
