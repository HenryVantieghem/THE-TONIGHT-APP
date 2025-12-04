/**
 * Scena - Help Screen
 * Gentle FAQ and support - no pressure
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Header, GlassCard, Divider } from '../components';
import { colors, typography, spacing, gradients, borderRadius, durations } from '../theme';

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: 'how long do moments last?',
    answer: 'moments disappear after one hour. this helps keep things light and in the present moment.',
  },
  {
    question: 'who can see my moments?',
    answer: 'only your friends can see what you share. we keep things simple and private.',
  },
  {
    question: 'can i save a moment before it disappears?',
    answer: 'no, and that\'s intentional. it helps us stay present and not worry about perfection.',
  },
  {
    question: 'what are reactions?',
    answer: 'reactions are a gentle way to respond to moments. just emojis, no counts or pressure.',
  },
  {
    question: 'how do i add friends?',
    answer: 'share your username with friends. they can find you and connect.',
  },
  {
    question: 'is my data private?',
    answer: 'yes. we don\'t sell your data or show ads. your moments are yours.',
  },
];

export const HelpScreen: React.FC = () => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleExpand = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleContact = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL('mailto:hello@scena.app?subject=help');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradients.ambient}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        <Header title="help" />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* FAQ Section */}
          <Animated.View entering={FadeIn.duration(400)}>
            <Text style={styles.sectionTitle}>frequently asked</Text>

            <GlassCard style={styles.faqCard}>
              {faqItems.map((item, index) => (
                <FAQItemComponent
                  key={index}
                  item={item}
                  isExpanded={expandedIndex === index}
                  onPress={() => handleExpand(index)}
                  isLast={index === faqItems.length - 1}
                  delay={index * 50}
                />
              ))}
            </GlassCard>
          </Animated.View>

          {/* Contact Section */}
          <Animated.View entering={FadeInUp.duration(400).delay(300)}>
            <Text style={styles.sectionTitle}>need more help?</Text>

            <GlassCard>
              <Text style={styles.contactText}>
                we're here if you need us. reach out anytime.
              </Text>
              <Pressable onPress={handleContact} style={styles.contactButton}>
                <Ionicons name="mail-outline" size={20} color={colors.accent.primary} />
                <Text style={styles.contactButtonText}>send us a message</Text>
              </Pressable>
            </GlassCard>
          </Animated.View>

          {/* Philosophy */}
          <Animated.View entering={FadeInUp.duration(400).delay(400)} style={styles.philosophy}>
            <Text style={styles.philosophyText}>
              scena is built on the idea that sharing moments should feel natural and light.
              no pressure, no performance, just presence.
            </Text>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

interface FAQItemComponentProps {
  item: FAQItem;
  isExpanded: boolean;
  onPress: () => void;
  isLast: boolean;
  delay: number;
}

const FAQItemComponent: React.FC<FAQItemComponentProps> = ({
  item,
  isExpanded,
  onPress,
  isLast,
  delay,
}) => {
  const height = useSharedValue(0);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    height.value = withTiming(isExpanded ? 1 : 0, { duration: durations.normal });
    opacity.value = withTiming(isExpanded ? 1 : 0, { duration: durations.normal });
  }, [isExpanded]);

  const answerStyle = useAnimatedStyle(() => ({
    maxHeight: height.value * 200,
    opacity: opacity.value,
  }));

  return (
    <Animated.View entering={FadeInUp.duration(300).delay(delay)}>
      <Pressable onPress={onPress} style={styles.faqItem}>
        <Text style={styles.question}>{item.question}</Text>
        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={colors.text.tertiary}
        />
      </Pressable>

      <Animated.View style={[styles.answerContainer, answerStyle]}>
        <Text style={styles.answer}>{item.answer}</Text>
      </Animated.View>

      {!isLast && <Divider spacing="none" />}
    </Animated.View>
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
  scrollContent: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingBottom: spacing.xxl,
  },
  sectionTitle: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    textTransform: 'lowercase',
    letterSpacing: typography.letterSpacing.wide,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  faqCard: {
    paddingVertical: 0,
  },
  faqItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.cardPadding,
  },
  question: {
    flex: 1,
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    textTransform: 'lowercase',
    marginRight: spacing.sm,
  },
  answerContainer: {
    overflow: 'hidden',
  },
  answer: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    textTransform: 'lowercase',
    lineHeight: typography.sizes.sm * 1.6,
    paddingHorizontal: spacing.cardPadding,
    paddingBottom: spacing.md,
  },
  contactText: {
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
    textTransform: 'lowercase',
    marginBottom: spacing.md,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactButtonText: {
    fontSize: typography.sizes.base,
    color: colors.accent.primary,
    textTransform: 'lowercase',
    marginLeft: spacing.sm,
  },
  philosophy: {
    marginTop: spacing.xxl,
    paddingHorizontal: spacing.md,
  },
  philosophyText: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
    textTransform: 'lowercase',
    textAlign: 'center',
    lineHeight: typography.sizes.sm * 1.6,
  },
});

export default HelpScreen;
