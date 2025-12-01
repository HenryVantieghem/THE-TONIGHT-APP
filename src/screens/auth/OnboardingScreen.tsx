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
import { typography } from '../../constants/typography';
import type { AuthStackParamList } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// iOS auth color palette
const authColors = {
  background: '#FFFFFF',
  textPrimary: '#000000',
  textSecondary: '#8E8E93',
  primary: '#007AFF',
  primaryGradient: ['#007AFF', '#5AC8FA'] as const,
  dotActive: '#007AFF',
  dotInactive: '#E5E5EA',
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
    iconColor: '#007AFF',
    title: 'Share What You\'re Doing Now',
    subtitle: 'Post a photo with your location',
  },
  {
    id: '2',
    icon: 'people',
    iconColor: '#007AFF',
    title: 'See Where Your Friends Are',
    subtitle: 'Discover what your friends are up to right now',
  },
  {
    id: '3',
    icon: 'time',
    iconColor: '#007AFF',
    title: 'Posts Vanish After 1 Hour',
    subtitle: 'Live in the now. No pressure, just authentic moments.',
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
        const isActive = index === currentIndex;
        return (
          <View
            key={index}
            style={[
              styles.dot,
              isActive && styles.dotActive,
            ]}
          />
        );
      })}
    </View>
  );

  const isLastSlide = currentIndex === slides.length - 1;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
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
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.bold,
    color: authColors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
    paddingHorizontal: 16,
  },
  slideSubtitle: {
    fontSize: typography.sizes.md,
    color: authColors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 24,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: authColors.dotInactive,
    marginHorizontal: 4,
  },
  dotActive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: authColors.dotActive,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  skipButton: {
    marginTop: 8,
  },
});
