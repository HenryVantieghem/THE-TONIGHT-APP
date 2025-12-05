/**
 * Scena - Moment Card Component
 * A single moment in the feed - peaceful, floating, unimportant
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
} from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Moment } from '../types';
import { GlassCard } from './GlassCard';
import { TimerDots } from './TimerDots';
import { storageService } from '../services/storage.service';
import { colors, typography, spacing, borderRadius, durations } from '../theme';

interface MomentCardProps {
  moment: Moment;
  onPress: () => void;
  onReact: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - spacing.screenHorizontal * 2;
const IMAGE_HEIGHT = CARD_WIDTH * 0.85;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const MomentCard: React.FC<MomentCardProps> = ({
  moment,
  onPress,
  onReact,
}) => {
  const pressed = useSharedValue(0);
  const [imageUrl, setImageUrl] = useState<string>(moment.imageUri);
  const [frontCameraUrl, setFrontCameraUrl] = useState<string | undefined>(moment.frontCameraUri);

  // Get signed URL for moment image (if it's a storage path)
  useEffect(() => {
    const loadImageUrl = async () => {
      // If imageUri is already a full URL, use it directly
      if (moment.imageUri.startsWith('http://') || moment.imageUri.startsWith('https://') || moment.imageUri.startsWith('file://')) {
        setImageUrl(moment.imageUri);
      } else {
        // It's a storage path, get signed URL
        try {
          const url = await storageService.getMomentUrl(moment.imageUri);
          setImageUrl(url);
        } catch (error) {
          if (__DEV__) {
            console.error('Failed to load moment image:', error);
          }
        }
      }

      if (moment.frontCameraUri) {
        if (moment.frontCameraUri.startsWith('http://') || moment.frontCameraUri.startsWith('https://') || moment.frontCameraUri.startsWith('file://')) {
          setFrontCameraUrl(moment.frontCameraUri);
        } else {
          try {
            const url = await storageService.getMomentUrl(moment.frontCameraUri);
            setFrontCameraUrl(url);
          } catch (error) {
            if (__DEV__) {
              console.error('Failed to load front camera image:', error);
            }
          }
        }
      }
    };

    loadImageUrl();
  }, [moment.imageUri, moment.frontCameraUri]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: interpolate(pressed.value, [0, 1], [1, 0.98]),
        },
      ],
    };
  });

  const handlePressIn = () => {
    pressed.value = withTiming(1, { duration: 100 });
  };

  const handlePressOut = () => {
    pressed.value = withTiming(0, { duration: durations.normal });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  // Get unique emojis from reactions (no counts!)
  const uniqueEmojis = [...new Set(moment.reactions.map(r => r.emoji))].slice(0, 4);

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={animatedStyle}
    >
      <GlassCard style={styles.card} noPadding>
        {/* Header - username and location */}
        <View style={styles.header}>
          <Text style={styles.username}>@{moment.user.username}</Text>
          {moment.location && (
            <Text style={styles.location}>{moment.location}</Text>
          )}
        </View>

        {/* Main image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            contentFit="cover"
            transition={200}
            placeholder={{ blurhash: 'LGF5]+Yk^6#M@-5c,1J5@[or[Q6.' }}
          />

          {/* Front camera overlay (small, corner) */}
          {frontCameraUrl && (
            <View style={styles.frontCameraContainer}>
              <Image
                source={{ uri: frontCameraUrl }}
                style={styles.frontCamera}
                contentFit="cover"
                transition={200}
              />
            </View>
          )}
        </View>

        {/* Caption */}
        {moment.caption && (
          <Text style={styles.caption}>{moment.caption}</Text>
        )}

        {/* Footer - reactions and timer */}
        <View style={styles.footer}>
          {/* Reactions - just emojis, no counts */}
          <Pressable onPress={onReact} style={styles.reactionsContainer}>
            {uniqueEmojis.length > 0 ? (
              <View style={styles.emojis}>
                {uniqueEmojis.map((emoji, index) => (
                  <Text key={index} style={styles.emoji}>
                    {emoji}
                  </Text>
                ))}
              </View>
            ) : (
              <Text style={styles.reactHint}>tap to react</Text>
            )}
          </Pressable>

          {/* Timer dots - peaceful progression */}
          <TimerDots
            createdAt={moment.createdAt}
            expiresAt={moment.expiresAt}
            totalDots={6}
            size="small"
          />
        </View>
      </GlassCard>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.cardMargin,
  },
  header: {
    padding: spacing.cardPadding,
    paddingBottom: spacing.sm,
  },
  username: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    marginBottom: 2,
  },
  location: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    textTransform: 'lowercase',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: IMAGE_HEIGHT,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  frontCameraContainer: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    width: 64,
    height: 80,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.glass.border,
  },
  frontCamera: {
    width: '100%',
    height: '100%',
  },
  caption: {
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    paddingHorizontal: spacing.cardPadding,
    paddingTop: spacing.sm,
    lineHeight: typography.sizes.base * 1.4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.cardPadding,
    paddingTop: spacing.md,
  },
  reactionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 24,
  },
  emojis: {
    flexDirection: 'row',
  },
  emoji: {
    fontSize: 18,
    marginRight: 4,
  },
  reactHint: {
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
    textTransform: 'lowercase',
  },
});

export default MomentCard;
