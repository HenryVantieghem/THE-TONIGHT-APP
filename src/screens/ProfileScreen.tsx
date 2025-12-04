/**
 * Scena - Profile Screen
 * Minimal - no follower counts, no pressure, just basic info
 */

import React from 'react';
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
import { GlassCard } from '../components';
import { colors, typography, spacing, gradients, hitSlop } from '../theme';

type ProfileScreenProps = {
  navigation?: NativeStackNavigationProp<RootStackParamList, 'Profile'>;
  route?: any;
};

export const ProfileScreen: React.FC<ProfileScreenProps> = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { state, setAuthenticated, setUser } = useApp();
  const user = state.user;

  // Count today's moments (from current user)
  const todayMoments = state.moments.filter(m => {
    if (!user) return false;
    const today = new Date();
    const momentDate = new Date(m.createdAt);
    return (
      m.user.id === user.id &&
      momentDate.toDateString() === today.toDateString()
    );
  }).length;

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

  const handleSignOut = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
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
            {/* Avatar placeholder */}
            <View style={styles.avatar}>
              <Ionicons name="person" size={48} color={colors.text.tertiary} />
            </View>

            {/* Username */}
            <Text style={styles.username}>{user?.username || 'you'}</Text>
          </Animated.View>

          {/* Today's moments */}
          <Animated.View entering={FadeInUp.duration(400).delay(100)}>
            <GlassCard style={styles.statsCard}>
              <Text style={styles.statsLabel}>today</Text>
              <Text style={styles.statsValue}>
                {todayMoments} {todayMoments === 1 ? 'moment' : 'moments'} shared
              </Text>
            </GlassCard>
          </Animated.View>

          {/* Menu items */}
          <Animated.View entering={FadeInUp.duration(400).delay(200)} style={styles.menu}>
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
