/**
 * Scena - Sign Up Screen
 * Minimal friction, no pressure - just join
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

type SignUpScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'SignUp'>;
};

export const SignUpScreen: React.FC<SignUpScreenProps> = ({ navigation }) => {
  const { refreshUser } = useApp();
  const { signUp, loading, error: authError } = useAuth();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleJoin = async () => {
    setError('');
    
    const success = await signUp({ email, password, username });
    
    if (success) {
      await refreshUser();
      navigation.replace('Permissions');
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSignIn = () => {
    navigation.navigate('SignIn');
  };

  const isValid = email.length > 0 && username.length > 0 && password.length > 0;

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
            {/* Form */}
            <Animated.View
              entering={FadeInUp.duration(500).delay(100)}
              style={styles.form}
            >
              <GlassInput
                value={email}
                onChangeText={setEmail}
                label="your email"
                placeholder="you@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <GlassInput
                value={username}
                onChangeText={setUsername}
                label="choose a username"
                placeholder="@username"
                autoCapitalize="none"
              />

              <GlassInput
                value={password}
                onChangeText={setPassword}
                label="password"
                placeholder="something memorable"
                secureTextEntry
              />

              {(error || authError) && (
                <Text style={styles.errorText}>{error || authError}</Text>
              )}
            </Animated.View>

            {/* Submit */}
            <Animated.View
              entering={FadeInUp.duration(500).delay(400)}
              style={styles.actions}
            >
              <GlassButton
                title={loading ? "creating account..." : "join"}
                onPress={handleJoin}
                variant="primary"
                size="large"
                fullWidth
                disabled={!isValid || loading}
              />

              <View style={styles.signInContainer}>
                <Text style={styles.signInText}>already have one? </Text>
                <Pressable onPress={handleSignIn}>
                  <Text style={styles.signInLink}>sign in</Text>
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
    paddingTop: spacing.xxl,
  },
  form: {
    flex: 1,
  },
  actions: {
    paddingBottom: spacing.xxl,
    paddingTop: spacing.xl,
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  signInText: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
    textTransform: 'lowercase',
  },
  signInLink: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    textTransform: 'lowercase',
    textDecorationLine: 'underline',
  },
  errorText: {
    fontSize: typography.sizes.sm,
    color: colors.timer.urgent,
    textTransform: 'lowercase',
    marginTop: spacing.md,
  },
});

export default SignUpScreen;
