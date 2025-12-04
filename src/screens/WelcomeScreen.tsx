/**
 * Scena - Welcome Screen
 * Calm, humble, inviting - like exhaling
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  FadeInUp,
} from 'react-native-reanimated';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { GlassButton } from '../components';
import { colors, typography, spacing, gradients } from '../theme';

type WelcomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Welcome'>;
};

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const handleBegin = () => {
    navigation.navigate('SignUp');
  };

  const handleSignIn = () => {
    navigation.navigate('SignIn');
  };

  return (
    <View style={styles.container}>
      {/* Ambient gradient background */}
      <LinearGradient
        colors={gradients.ambient}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Spacer to push content to vertical center */}
          <View style={styles.topSpacer} />

          {/* App name and tagline */}
          <Animated.View
            entering={FadeIn.duration(800).delay(200)}
            style={styles.branding}
          >
            <Text style={styles.appName}>scena</Text>

            <Animated.Text
              entering={FadeInUp.duration(600).delay(600)}
              style={styles.tagline}
            >
              share moments
            </Animated.Text>

            <Animated.Text
              entering={FadeInUp.duration(600).delay(800)}
              style={styles.taglineSecondary}
            >
              they'll disappear
            </Animated.Text>
          </Animated.View>

          {/* Spacer */}
          <View style={styles.middleSpacer} />

          {/* CTA buttons */}
          <Animated.View
            entering={FadeInUp.duration(600).delay(1200)}
            style={styles.actions}
          >
            <GlassButton
              title="begin"
              onPress={handleBegin}
              variant="primary"
              size="large"
              fullWidth
            />

            <Animated.View
              entering={FadeIn.duration(400).delay(1600)}
              style={styles.signInContainer}
            >
              <Text style={styles.signInText}>already have one? </Text>
              <Text onPress={handleSignIn} style={styles.signInLink}>
                sign in
              </Text>
            </Animated.View>
          </Animated.View>
        </View>
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
  content: {
    flex: 1,
    paddingHorizontal: spacing.screenHorizontal,
  },
  topSpacer: {
    flex: 0.35,
  },
  branding: {
    alignItems: 'center',
  },
  appName: {
    fontSize: 48,
    fontWeight: typography.weights.light,
    color: colors.text.primary,
    letterSpacing: typography.letterSpacing.veryWide,
    textTransform: 'lowercase',
    marginBottom: spacing.xl,
  },
  tagline: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.light,
    color: colors.text.secondary,
    textTransform: 'lowercase',
    letterSpacing: typography.letterSpacing.wide,
  },
  taglineSecondary: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.light,
    color: colors.text.tertiary,
    textTransform: 'lowercase',
    letterSpacing: typography.letterSpacing.wide,
    marginTop: spacing.xs,
  },
  middleSpacer: {
    flex: 0.4,
  },
  actions: {
    alignItems: 'center',
    paddingBottom: spacing.xxl,
  },
  signInContainer: {
    flexDirection: 'row',
    marginTop: spacing.xl,
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
});

export default WelcomeScreen;
