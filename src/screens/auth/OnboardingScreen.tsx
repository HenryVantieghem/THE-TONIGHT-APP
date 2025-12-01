import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/ui/Button';
import type { AuthStackParamList } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Premium auth color palette
const authColors = {
  background: '#FFFFFF',
  textPrimary: '#1A1A2E',
  textSecondary: '#64748B',
  primary: '#FF6B6B',
  primaryGradient: ['#FF6B6B', '#FF8E53'] as const,
  dotActive: '#FF6B6B',
  dotInactive: '#E2E8F0',
};

type OnboardingNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Onboarding'>;

interface OnboardingSlide {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  title: string;
  subtitle: string;
}

const slides: OnboardingSlide[] = [
  {
    id: '1',
    icon: 'camera',
    iconColor: '#FF6B6B',
    title: 'Share What You\'re Doing',
    subtitle: 'Capture moments and share them with your friends instantly.',
  },
  {
    id: '2',
    icon: 'people',
    iconColor: '#6366F1',
    title: 'See Your Friends',
    subtitle: 'Discover what your friends are up to right now, in real-time.',
  },
  {
    id: '3',
    icon: 'time',
    iconColor: '#22C55E',
    title: 'Posts Vanish in 1 Hour',
    subtitle: 'No pressure, no permanence. Just live in the moment.',
  },
];

export function OnboardingScreen() {
  const navigation = useNavigation<OnboardingNavigationProp>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  const handleMomentumScrollEnd = (event: {
    nativeEvent: { contentOffset: { x: number } };
  }) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  const handleComplete = () => {
    navigation.replace('SignUp');
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      handleComplete();
    }
  };

  const renderSlide = ({ item }: { item: OnboardingSlide }) => (
    <View style={styles.slide}>
      {/* Icon Container with gradient background */}
      <View style={styles.iconWrapper}>
        <LinearGradient
          colors={[`${item.iconColor}20`, `${item.iconColor}10`]}
          style={styles.iconGradient}
        >
          <View style={[styles.iconCircle, { backgroundColor: `${item.iconColor}15` }]}>
            <Ionicons name={item.icon} size={48} color={item.iconColor} />
          </View>
        </LinearGradient>
      </View>

      <Text style={styles.slideTitle}>{item.title}</Text>
      <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
    </View>
  );

  const renderPagination = () => (
    <View style={styles.pagination}>
      {slides.map((_, index) => {
        const inputRange = [
          (index - 1) * SCREEN_WIDTH,
          index * SCREEN_WIDTH,
          (index + 1) * SCREEN_WIDTH,
        ];

        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [8, 24, 8],
          extrapolate: 'clamp',
        });

        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.3, 1, 0.3],
          extrapolate: 'clamp',
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                width: dotWidth,
                opacity,
              },
            ]}
          />
        );
      })}
    </View>
  );

  const isLastSlide = currentIndex === slides.length - 1;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Logo/Brand Header */}
      <View style={styles.brandHeader}>
        <LinearGradient
          colors={authColors.primaryGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.brandGradient}
        >
          <Text style={styles.brandText}>Tonight</Text>
        </LinearGradient>
      </View>

      {/* Slides */}
      <View style={styles.slideContainer}>
        <FlatList
          ref={flatListRef}
          data={slides}
          renderItem={renderSlide}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          scrollEventThrottle={16}
          bounces={false}
          contentContainerStyle={styles.flatListContent}
        />
      </View>

      {/* Pagination Dots */}
      {renderPagination()}

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <Button
          title={isLastSlide ? 'Get Started' : 'Next'}
          onPress={handleNext}
          variant="primary"
          size="lg"
          fullWidth
        />

        {!isLastSlide && (
          <Button
            title="Skip"
            onPress={handleComplete}
            variant="ghost"
            size="md"
            style={styles.skipButton}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: authColors.background,
  },
  brandHeader: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 8,
  },
  brandGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  brandText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  slideContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  flatListContent: {
    alignItems: 'center',
  },
  slide: {
    width: SCREEN_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 24,
  },
  iconWrapper: {
    marginBottom: 32,
  },
  iconGradient: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: authColors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
    paddingHorizontal: 16,
  },
  slideSubtitle: {
    fontSize: 16,
    color: authColors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 24,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: authColors.dotActive,
    marginHorizontal: 4,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  skipButton: {
    marginTop: 8,
  },
});
