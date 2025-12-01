import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DiscoBallLogo } from '../../components/ui/DiscoBallLogo';
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

    // Auto-advance after 1 second
    const timer = setTimeout(() => {
      navigation.replace('Onboarding');
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
          <DiscoBallLogo size={80} animated={false} />
        </View>
        <Text style={styles.title}>Tonight</Text>
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
  },
  title: {
    fontSize: typography.sizes.display,
    fontWeight: typography.weights.bold,
    color: colors.text,
    letterSpacing: -0.5,
  },
});
