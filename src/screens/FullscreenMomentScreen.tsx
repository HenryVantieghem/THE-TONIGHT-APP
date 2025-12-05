/**
 * Scena - Fullscreen Moment Screen
 * Immersive view - tap to toggle front camera if dual
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../types';
import { useApp } from '../context/AppContext';
import { momentsService } from '../services/moments.service';
import { reactionsService } from '../services/reactions.service';
import { TimerDots, EmojiPicker } from '../components';
import { colors, typography, spacing, hitSlop, durations } from '../theme';

type FullscreenMomentScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'FullscreenMoment'>;
  route: RouteProp<RootStackParamList, 'FullscreenMoment'>;
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const FullscreenMomentScreen: React.FC<FullscreenMomentScreenProps> = ({
  navigation,
  route,
}) => {
  const { momentId } = route.params;
  const { state } = useApp();
  const [moment, setMoment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [showFrontCamera, setShowFrontCamera] = useState(false);
  const [showInfo, setShowInfo] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const infoOpacity = useSharedValue(1);

  useEffect(() => {
    const fetchMoment = async () => {
      try {
        const data = await momentsService.getMoment(momentId);
        if (data) {
          // Convert MomentRow to Moment type
          const convertedMoment = {
            id: data.id,
            user: {
              id: data.profiles?.id || '',
              username: data.profiles?.username || 'user',
              avatarUrl: data.profiles?.avatar_url,
            },
            imageUri: data.image_url,
            frontCameraUri: data.front_camera_url,
            location: data.location,
            caption: data.caption,
            createdAt: new Date(data.created_at),
            expiresAt: new Date(data.expires_at),
            reactions: (data.reactions || []).map((r: any) => ({
              id: r.id,
              userId: r.user_id,
              emoji: r.emoji,
              createdAt: new Date(r.created_at),
            })),
          };
          setMoment(convertedMoment);
        } else {
          navigation.goBack();
        }
      } catch (error) {
        if (__DEV__) {
          console.error('Failed to fetch moment:', error);
        }
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    fetchMoment();
  }, [momentId, navigation]);

  if (loading || !moment) {
    return null;
  }

  const handleClose = () => {
    navigation.goBack();
  };

  const handleImageTap = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (moment.frontCameraUri) {
      setShowFrontCamera(!showFrontCamera);
    } else {
      // Toggle info visibility
      setShowInfo(!showInfo);
      infoOpacity.value = withTiming(showInfo ? 0 : 1, { duration: durations.normal });
    }
  };

  const handleReact = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowEmojiPicker(true);
  };

  const handleEmojiSelect = async (emoji: string) => {
    try {
      await reactionsService.addReaction(momentId, emoji);
      // Refresh moment to get updated reactions
      const data = await momentsService.getMoment(momentId);
      if (data) {
        const convertedMoment = {
          id: data.id,
          user: {
            id: data.profiles?.id || '',
            username: data.profiles?.username || 'user',
            avatarUrl: data.profiles?.avatar_url,
          },
          imageUri: data.image_url,
          frontCameraUri: data.front_camera_url,
          location: data.location,
          caption: data.caption,
          createdAt: new Date(data.created_at),
          expiresAt: new Date(data.expires_at),
          reactions: (data.reactions || []).map((r: any) => ({
            id: r.id,
            userId: r.user_id,
            emoji: r.emoji,
            createdAt: new Date(r.created_at),
          })),
        };
        setMoment(convertedMoment);
      }
    } catch (error) {
      if (__DEV__) {
        console.error('Failed to add reaction:', error);
      }
    }
  };

  const animatedInfoStyle = useAnimatedStyle(() => ({
    opacity: infoOpacity.value,
  }));

  const uniqueEmojis = [...new Set(moment.reactions.map((r: any) => r.emoji))].slice(0, 5);

  return (
    <View style={styles.container}>
      {/* Image */}
      <Pressable onPress={handleImageTap} style={styles.imageContainer}>
        <Image
          source={{ uri: showFrontCamera && moment.frontCameraUri ? moment.frontCameraUri : moment.imageUri }}
          style={styles.image}
          resizeMode="cover"
        />
      </Pressable>

      {/* Overlay */}
      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        {/* Close button */}
        <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
          <Pressable onPress={handleClose} hitSlop={hitSlop.large} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={colors.white} />
          </Pressable>
        </Animated.View>

        {/* Info at bottom */}
        <Animated.View style={[styles.infoContainer, animatedInfoStyle]}>
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.6)'] as const}
            style={StyleSheet.absoluteFill}
          />
          {/* User info */}
          <View style={styles.userInfo}>
            <Text style={styles.username}>@{moment.user.username}</Text>
            {moment.location && (
              <Text style={styles.location}> · {moment.location}</Text>
            )}
          </View>

          {/* Caption */}
          {moment.caption && (
            <Text style={styles.caption}>{moment.caption}</Text>
          )}

          {/* Reactions and timer */}
          <View style={styles.footer}>
            {/* Reaction emojis */}
            <Pressable onPress={handleReact} style={styles.reactions}>
              {uniqueEmojis.length > 0 ? (
                (uniqueEmojis as string[]).map((emoji: string, index: number) => (
                  <Text key={index} style={styles.emoji}>{emoji}</Text>
                ))
              ) : (
                <View style={styles.addReaction}>
                  <Ionicons name="heart-outline" size={24} color={colors.white} />
                </View>
              )}
            </Pressable>

            {/* Timer dots */}
            <View style={styles.timerContainer}>
              <TimerDots
                createdAt={moment.createdAt}
                expiresAt={moment.expiresAt}
                totalDots={6}
                size="medium"
              />
            </View>
          </View>

          {/* Dual camera hint */}
          {moment.frontCameraUri && (
            <Text style={styles.tapHint}>tap to switch view</Text>
          )}
        </Animated.View>
      </SafeAreaView>

      {/* Emoji picker */}
      <EmojiPicker
        visible={showEmojiPicker}
        onClose={() => setShowEmojiPicker(false)}
        onSelect={handleEmojiSelect}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  imageContainer: {
    flex: 1,
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: spacing.md,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContainer: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingBottom: spacing.xxl,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  username: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.white,
  },
  location: {
    fontSize: typography.sizes.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    textTransform: 'lowercase',
  },
  caption: {
    fontSize: typography.sizes.base,
    color: colors.white,
    marginBottom: spacing.md,
    lineHeight: typography.sizes.base * 1.4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  reactions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 24,
    marginRight: spacing.xs,
  },
  addReaction: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
  },
  tapHint: {
    fontSize: typography.sizes.xs,
    color: 'rgba(255, 255, 255, 0.6)',
    textTransform: 'lowercase',
    textAlign: 'center',
    marginTop: spacing.md,
  },
});

export default FullscreenMomentScreen;
