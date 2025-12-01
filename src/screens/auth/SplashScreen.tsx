import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import type { AuthStackParamList } from '../../types';

type SplashNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Splash'>;

export function SplashScreen() {
  const navigation = useNavigation<SplashNavigationProp>();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Check auth state during splash
    // Animate logo appearance
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Check session and navigate accordingly after 1 second
    const timer = setTimeout(async () => {
      // Navigation will be handled by RootNavigator based on auth state
      // If no session, go to onboarding; otherwise RootNavigator will route to Main
      const { supabase } = await import('../../services/supabase');
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // User is authenticated, RootNavigator will handle navigation to Main
        // No need to navigate here as RootNavigator will switch stacks
        return;
      } else {
        // No session, go to onboarding
        navigation.replace('Onboarding');
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [fadeAnim, navigation]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <View style={styles.logoContainer}>
          <Text style={styles.logoEmoji}>✨</Text>
        </View>
        <Text style={styles.title}>Experiences</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 24,
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: {
    fontSize: 80,
  },
  title: {
    fontSize: 34,
    fontWeight: typography.weights.bold,
    color: colors.text,
    letterSpacing: -0.5,
  },
});
