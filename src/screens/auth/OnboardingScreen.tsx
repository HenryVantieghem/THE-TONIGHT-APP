import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../components/ui/Button';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { spacing } from '../../constants/config';
import type { AuthStackParamList } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type OnboardingNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Onboarding'>;

interface OnboardingSlide {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
}

const slides: OnboardingSlide[] = [
  {
    id: '1',
    icon: '📸',
    title: 'Share What You\'re Doing',
    subtitle: 'Capture moments and share them with your friends instantly.',
  },
  {
    id: '2',
    icon: '👥',
    title: 'See Your Friends',
    subtitle: 'Discover what your friends are up to right now, in real-time.',
  },
  {
    id: '3',
    icon: '⏰',
    title: 'Posts Vanish in 1 Hour',
    subtitle: 'No pressure, no permanence. Just live in the moment.',
  },
];

export function OnboardingScreen() {
  const navigation = useNavigation<OnboardingNavigationProp>();
  const insets = useSafeAreaInsets();
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
      <Text style={styles.slideIcon}>{item.icon}</Text>
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
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
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
      />

      {renderPagination()}

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  slide: {
    width: SCREEN_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  slideIcon: {
    fontSize: 80,
    marginBottom: spacing.lg,
  },
  slideTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  slideSubtitle: {
    fontSize: typography.sizes.lg,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.lineHeights.xl,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginHorizontal: 4,
  },
  buttonContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  skipButton: {
    marginTop: spacing.sm,
  },
});
