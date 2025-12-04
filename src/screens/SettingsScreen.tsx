/**
 * Scena - Settings Screen
 * Simple, clear options - no dark patterns
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Switch,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../types';
import { GlassCard } from '../components';
import { colors, typography, spacing, gradients, hitSlop } from '../theme';

type SettingsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Settings'>;
};

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  navigation,
}) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [cameraPermissionInfo] = useCameraPermissions();
  const [locationPermission, setLocationPermission] = useState(false);
  const [photosPermission, setPhotosPermission] = useState(false);

  const cameraPermission = cameraPermissionInfo?.granted ?? false;

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    const location = await Location.getForegroundPermissionsAsync();
    const photos = await ImagePicker.getMediaLibraryPermissionsAsync();

    setLocationPermission(location.granted);
    setPhotosPermission(photos.granted);
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleNotificationsToggle = (value: boolean) => {
    setNotificationsEnabled(value);
    // Would actually manage notification permissions
  };

  const handleOpenSettings = () => {
    Linking.openSettings();
  };

  const handleChangePassword = () => {
    // Would navigate to change password flow
  };

  const handleDeleteAccount = () => {
    // Would show confirmation and delete account
  };

  const handlePrivacy = () => {
    Linking.openURL('https://example.com/privacy');
  };

  const handleTerms = () => {
    Linking.openURL('https://example.com/terms');
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
          <Text style={styles.title}>settings</Text>
          <View style={{ width: 24 }} />
        </Animated.View>

        <View style={styles.content}>
          {/* Notifications */}
          <Animated.View entering={FadeInUp.duration(400)}>
            <Text style={styles.sectionTitle}>notifications</Text>
            <GlassCard style={styles.section}>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>enabled</Text>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={handleNotificationsToggle}
                  trackColor={{
                    false: colors.input.border,
                    true: colors.accent.primary,
                  }}
                  thumbColor={colors.white}
                />
              </View>
            </GlassCard>
          </Animated.View>

          {/* Permissions */}
          <Animated.View entering={FadeInUp.duration(400).delay(100)}>
            <Text style={styles.sectionTitle}>permissions</Text>
            <GlassCard style={styles.section}>
              <PermissionRow
                label="camera"
                granted={cameraPermission}
                onPress={handleOpenSettings}
              />
              <PermissionRow
                label="location"
                granted={locationPermission}
                onPress={handleOpenSettings}
              />
              <PermissionRow
                label="photos"
                granted={photosPermission}
                onPress={handleOpenSettings}
                isLast
              />
            </GlassCard>
          </Animated.View>

          {/* Account */}
          <Animated.View entering={FadeInUp.duration(400).delay(200)}>
            <Text style={styles.sectionTitle}>account</Text>
            <GlassCard style={styles.section}>
              <Pressable onPress={handleChangePassword} style={styles.settingRow}>
                <Text style={styles.settingLabel}>change password</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.text.tertiary} />
              </Pressable>
              <Pressable onPress={handleDeleteAccount} style={[styles.settingRow, styles.lastRow]}>
                <Text style={[styles.settingLabel, styles.destructive]}>delete account</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.timer.urgent} />
              </Pressable>
            </GlassCard>
          </Animated.View>

          {/* About */}
          <Animated.View entering={FadeInUp.duration(400).delay(300)}>
            <Text style={styles.sectionTitle}>about</Text>
            <GlassCard style={styles.section}>
              <Pressable onPress={handlePrivacy} style={styles.settingRow}>
                <Text style={styles.settingLabel}>privacy</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.text.tertiary} />
              </Pressable>
              <Pressable onPress={handleTerms} style={[styles.settingRow, styles.lastRow]}>
                <Text style={styles.settingLabel}>terms</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.text.tertiary} />
              </Pressable>
            </GlassCard>
          </Animated.View>

          {/* Version */}
          <Animated.View entering={FadeIn.duration(400).delay(400)} style={styles.versionContainer}>
            <Text style={styles.version}>scena v1.0.0</Text>
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
};

interface PermissionRowProps {
  label: string;
  granted: boolean;
  onPress: () => void;
  isLast?: boolean;
}

const PermissionRow: React.FC<PermissionRowProps> = ({
  label,
  granted,
  onPress,
  isLast = false,
}) => (
  <Pressable
    onPress={onPress}
    style={[styles.settingRow, isLast && styles.lastRow]}
  >
    <Text style={styles.settingLabel}>{label}</Text>
    {granted ? (
      <Ionicons name="checkmark" size={20} color={colors.accent.success} />
    ) : (
      <Ionicons name="close" size={20} color={colors.text.tertiary} />
    )}
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
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenHorizontal,
    paddingVertical: spacing.md,
  },
  title: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    textTransform: 'lowercase',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: spacing.md,
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
  section: {
    paddingVertical: 0,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.cardPadding,
    borderBottomWidth: 1,
    borderBottomColor: colors.glass.border,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  settingLabel: {
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    textTransform: 'lowercase',
  },
  destructive: {
    color: colors.timer.urgent,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: spacing.xxl,
  },
  version: {
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
    textTransform: 'lowercase',
  },
});

export default SettingsScreen;
