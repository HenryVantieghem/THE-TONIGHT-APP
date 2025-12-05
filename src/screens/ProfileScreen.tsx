/**
 * Scena - Profile Screen
 * Minimal - no follower counts, no pressure, just basic info
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { RootStackParamList } from '../types';
import { useApp } from '../context/AppContext';
import { useAuth } from '../hooks/useAuth';
import { profileService } from '../services/profile.service';
import { GlassCard, Avatar } from '../components';
import { colors, typography, spacing, gradients, hitSlop } from '../theme';

type ProfileScreenProps = {
  navigation?: NativeStackNavigationProp<RootStackParamList, 'Profile'>;
  route?: any;
};

export const ProfileScreen: React.FC<ProfileScreenProps> = (props) => {
  const navigation = props.navigation || useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { state, setAuthenticated, setUser, refreshUser } = useApp();
  const { signOut } = useAuth();
  const user = state.user;
  const [momentCount, setMomentCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch profile with stats
  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      
      try {
        const profileWithStats = await profileService.getProfileWithStats(user.id);
        if (profileWithStats) {
          setMomentCount(profileWithStats.momentCount || 0);
        }
      } catch (error) {
        if (__DEV__) {
          console.error('Failed to fetch profile stats:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSettings = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    navigation.navigate('Settings');
  };

  const handleHelp = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    navigation.navigate('Help');
  };

  const handleFriends = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    navigation.navigate('Friends');
  };

  const handleSignOut = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    await signOut();
    setUser(null);
    setAuthenticated(false);
    navigation.reset({
      index: 0,
      routes: [{ name: 'Welcome' }],
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradients.ambient}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
          <Pressable onPress={handleBack} hitSlop={hitSlop.large}>
            <Ionicons name="chevron-back" size={24} color={colors.text.secondary} />
          </Pressable>
        </Animated.View>

        <View style={styles.content}>
          {/* Profile info */}
          <Animated.View entering={FadeInUp.duration(400)} style={styles.profileInfo}>
            {/* Avatar */}
            <Avatar
              uri={user?.avatarUrl}
              username={user?.username}
              size={100}
            />

            {/* Username */}
            <Text style={styles.username}>{user?.username || 'you'}</Text>
            {user?.bio && (
              <Text style={styles.bio}>{user.bio}</Text>
            )}
          </Animated.View>

          {/* Today's moments */}
          <Animated.View entering={FadeInUp.duration(400).delay(100)}>
            <GlassCard style={styles.statsCard}>
              <Text style={styles.statsLabel}>today</Text>
              <Text style={styles.statsValue}>
                {loading ? '...' : `${momentCount} ${momentCount === 1 ? 'moment' : 'moments'} shared`}
              </Text>
            </GlassCard>
          </Animated.View>

          {/* Menu items */}
          <Animated.View entering={FadeInUp.duration(400).delay(200)} style={styles.menu}>
            <MenuItem
              icon="people-outline"
              label="friends"
              onPress={handleFriends}
            />
            <MenuItem
              icon="settings-outline"
              label="settings"
              onPress={handleSettings}
            />
            <MenuItem
              icon="help-circle-outline"
              label="help"
              onPress={handleHelp}
            />
            <MenuItem
              icon="log-out-outline"
              label="sign out"
              onPress={handleSignOut}
              isDestructive
            />
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
};

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  isDestructive?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  label,
  onPress,
  isDestructive = false,
}) => (
  <Pressable onPress={onPress} style={styles.menuItem}>
    <Ionicons
      name={icon}
      size={22}
      color={isDestructive ? colors.timer.urgent : colors.text.secondary}
    />
    <Text style={[
      styles.menuLabel,
      isDestructive && styles.menuLabelDestructive,
    ]}>
      {label}
    </Text>
  </Pressable>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screenHorizontal,
    paddingVertical: spacing.md,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: spacing.xl,
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.glass.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  username: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    textTransform: 'lowercase',
    marginTop: spacing.md,
  },
  bio: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    textTransform: 'lowercase',
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  statsCard: {
    marginBottom: spacing.xl,
  },
  statsLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    textTransform: 'lowercase',
    marginBottom: spacing.xs,
  },
  statsValue: {
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    textTransform: 'lowercase',
  },
  menu: {
    marginTop: spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.glass.border,
  },
  menuLabel: {
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    textTransform: 'lowercase',
    marginLeft: spacing.md,
  },
  menuLabelDestructive: {
    color: colors.timer.urgent,
  },
});

export default ProfileScreen;
