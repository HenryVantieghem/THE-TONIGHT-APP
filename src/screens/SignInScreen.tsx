/**
 * Scena - Sign In Screen
 * Welcome back - simple, easy
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../types';
import { useApp } from '../context/AppContext';
import { GlassButton, GlassInput } from '../components';
import { colors, typography, spacing, gradients, hitSlop } from '../theme';
import { useAuth } from '../hooks/useAuth';

type SignInScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'SignIn'>;
};

export const SignInScreen: React.FC<SignInScreenProps> = ({ navigation }) => {
  const { refreshUser } = useApp();
  const { signIn, loading, error: authError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignIn = async () => {
    setError('');
    
    const success = await signIn({ email, password });
    
    if (success) {
      await refreshUser();
      navigation.replace('MainTabs');
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSignUp = () => {
    navigation.navigate('SignUp');
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const isValid = email.length > 0 && password.length > 0;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradients.ambient}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={handleBack} hitSlop={hitSlop.large}>
              <Ionicons name="chevron-back" size={24} color={colors.text.secondary} />
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Title */}
            <Animated.View
              entering={FadeInUp.duration(500)}
              style={styles.titleContainer}
            >
              <Text style={styles.title}>welcome back</Text>
            </Animated.View>

            {/* Form */}
            <Animated.View
              entering={FadeInUp.duration(500).delay(100)}
              style={styles.form}
            >
              <GlassInput
                value={email}
                onChangeText={setEmail}
                label="email"
                placeholder="you@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <GlassInput
                value={password}
                onChangeText={setPassword}
                label="password"
                placeholder="your password"
                secureTextEntry
              />

              {(error || authError) && (
                <Text style={styles.errorText}>{error || authError}</Text>
              )}
            </Animated.View>

            {/* Submit */}
            <Animated.View
              entering={FadeInUp.duration(500).delay(300)}
              style={styles.actions}
            >
              <GlassButton
                title={loading ? "signing in..." : "sign in"}
                onPress={handleSignIn}
                variant="primary"
                size="large"
                fullWidth
                disabled={!isValid || loading}
              />

              <Pressable onPress={handleForgotPassword} style={styles.forgotPasswordButton}>
                <Text style={styles.forgotPasswordText}>forgot password?</Text>
              </Pressable>

              <View style={styles.signUpContainer}>
                <Text style={styles.signUpText}>need an account? </Text>
                <Pressable onPress={handleSignUp}>
                  <Text style={styles.signUpLink}>sign up</Text>
                </Pressable>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screenHorizontal,
    paddingVertical: spacing.md,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: spacing.xl,
  },
  titleContainer: {
    marginBottom: spacing.xxl,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.light,
    color: colors.text.primary,
    textTransform: 'lowercase',
    letterSpacing: typography.letterSpacing.wide,
  },
  form: {
    flex: 1,
  },
  actions: {
    paddingBottom: spacing.xxl,
    paddingTop: spacing.xl,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  signUpText: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
    textTransform: 'lowercase',
  },
  signUpLink: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    textTransform: 'lowercase',
    textDecorationLine: 'underline',
  },
  forgotPasswordButton: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  forgotPasswordText: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
    textTransform: 'lowercase',
  },
  errorText: {
    fontSize: typography.sizes.sm,
    color: colors.timer.urgent,
    textTransform: 'lowercase',
    marginTop: spacing.md,
  },
});

export default SignInScreen;
