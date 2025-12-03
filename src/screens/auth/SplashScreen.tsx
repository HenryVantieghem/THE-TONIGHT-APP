import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../../constants/colors';
import { textStyles } from '../../constants/typography';
import type { AuthStackParamList } from '../../types';

type SplashNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Splash'>;

export function SplashScreen() {
  const navigation = useNavigation<SplashNavigationProp>();
  const logoScale = React.useRef(new Animated.Value(0.8)).current;
  const logoOpacity = React.useRef(new Animated.Value(0)).current;
  const wordmarkOpacity = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animated pulse: scale 0.8 → 1.0, opacity 0 → 1 (per spec)
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1.0,
        friction: 4,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Wordmark fade in after logo (per spec)
      Animated.timing(wordmarkOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });

    // Navigate to Onboarding after animation (auth is handled by RootNavigator)
    const timer = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 1500);

    return () => clearTimeout(timer);
  }, [logoScale, logoOpacity, wordmarkOpacity, navigation]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            transform: [{ scale: logoScale }],
            opacity: logoOpacity,
          },
        ]}
      >
        {/* Logo: Abstract pulse/heartbeat line forming camera aperture */}
        <View style={styles.logo}>
          <View style={styles.pulseLine} />
          <View style={styles.cameraAperture} />
        </View>
      </Animated.View>
      
      <Animated.Text
        style={[
          textStyles.largeTitle,
          styles.wordmark,
          { opacity: wordmarkOpacity },
        ]}
      >
        Experiences
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary, // #FFFFFF per spec
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 24,
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  pulseLine: {
    width: 60,
    height: 4,
    backgroundColor: colors.accent,
    borderRadius: 2,
    position: 'absolute',
    top: 20,
  },
  cameraAperture: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 4,
    borderColor: colors.accent,
    position: 'absolute',
    top: 15,
  },
  wordmark: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
});
