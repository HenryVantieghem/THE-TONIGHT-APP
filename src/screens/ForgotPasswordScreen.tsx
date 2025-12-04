/**
 * Scena - Forgot Password Screen
 * Gentle password reset flow
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { GlassButton, GlassInput, Header, Toast } from '../components';
import { colors, typography, spacing, gradients } from '../theme';

export const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation();

  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleSend = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSent(true);
    setShowToast(true);
  };

  const handleBackToSignIn = () => {
    navigation.goBack();
  };

  if (sent) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={gradients.ambient}
          style={StyleSheet.absoluteFill}
        />

        <SafeAreaView style={styles.safeArea}>
          <Header showBack={false} />

          <View style={styles.sentContent}>
            <Animated.View entering={FadeInUp.duration(400)} style={styles.iconContainer}>
              <Ionicons
                name="mail-outline"
                size={64}
                color={colors.accent.primary}
              />
            </Animated.View>

            <Animated.Text entering={FadeInUp.duration(400).delay(100)} style={styles.sentTitle}>
              check your email
            </Animated.Text>

            <Animated.Text entering={FadeInUp.duration(400).delay(200)} style={styles.sentMessage}>
              we sent a link to reset your password.{'\n'}
              it might take a minute to arrive.
            </Animated.Text>

            <Animated.View entering={FadeInUp.duration(400).delay(300)} style={styles.sentAction}>
              <GlassButton
                title="back to sign in"
                onPress={handleBackToSignIn}
                variant="primary"
                size="large"
              />
            </Animated.View>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradients.ambient}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        <Header />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Title */}
            <Animated.View entering={FadeIn.duration(400)} style={styles.titleContainer}>
              <Text style={styles.title}>forgot password</Text>
              <Text style={styles.subtitle}>
                no worries. enter your email and we'll send you a reset link.
              </Text>
            </Animated.View>

            {/* Form */}
            <Animated.View entering={FadeInUp.duration(400).delay(100)}>
              <GlassInput
                value={email}
                onChangeText={setEmail}
                label="email"
                placeholder="you@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </Animated.View>
          </ScrollView>

          {/* Send button */}
          <Animated.View entering={FadeInUp.duration(400).delay(200)} style={styles.sendContainer}>
            <GlassButton
              title="send reset link"
              onPress={handleSend}
              variant="primary"
              size="large"
              fullWidth
              disabled={!email.includes('@')}
            />
          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <Toast
        message="email sent"
        type="success"
        visible={showToast}
        onHide={() => setShowToast(false)}
      />
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
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
    textTransform: 'lowercase',
    lineHeight: typography.sizes.base * 1.5,
  },
  sendContainer: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingBottom: spacing.xl,
  },
  sentContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.screenHorizontal,
  },
  iconContainer: {
    marginBottom: spacing.lg,
    opacity: 0.8,
  },
  sentTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.light,
    color: colors.text.primary,
    textTransform: 'lowercase',
    marginBottom: spacing.sm,
  },
  sentMessage: {
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
    textTransform: 'lowercase',
    textAlign: 'center',
    lineHeight: typography.sizes.base * 1.5,
    marginBottom: spacing.xxl,
  },
  sentAction: {
    marginTop: spacing.lg,
  },
});

export default ForgotPasswordScreen;
