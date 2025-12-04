/**
 * Scena - Permissions Screen
 * Gentle ask, never demanding - always "maybe later" option
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
import Animated, { FadeInUp } from 'react-native-reanimated';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { RootStackParamList } from '../types';
import { useApp } from '../context/AppContext';
import { GlassButton, GlassCard } from '../components';
import { colors, typography, spacing, gradients } from '../theme';

type PermissionsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Permissions'>;
};

interface PermissionItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  delay: number;
}

const PermissionItem: React.FC<PermissionItemProps> = ({
  icon,
  title,
  description,
  delay,
}) => (
  <Animated.View
    entering={FadeInUp.duration(500).delay(delay)}
    style={styles.permissionItem}
  >
    <View style={styles.permissionIcon}>
      <Ionicons name={icon} size={24} color={colors.accent.primary} />
    </View>
    <View style={styles.permissionText}>
      <Text style={styles.permissionTitle}>{title}</Text>
      <Text style={styles.permissionDescription}>{description}</Text>
    </View>
  </Animated.View>
);

export const PermissionsScreen: React.FC<PermissionsScreenProps> = ({
  navigation,
}) => {
  const { setOnboardingComplete } = useApp();
  const [, requestCameraPermission] = useCameraPermissions();

  const handleOkay = async () => {
    // Request all permissions gently
    try {
      const cameraResult = await requestCameraPermission();
      const locationResult = await Location.requestForegroundPermissionsAsync();
      const mediaResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      // Log results for debugging (graceful - we proceed either way)
      if (__DEV__) {
        console.log('Permissions:', {
          camera: cameraResult?.granted,
          location: locationResult?.granted,
          media: mediaResult?.granted,
        });
      }
    } catch (e) {
      // It's okay if they deny - we'll handle it gracefully
      if (__DEV__) {
        console.log('Permission request error:', e);
      }
    }

    setOnboardingComplete(true);
    navigation.replace('MainTabs');
  };

  const handleMaybeLater = () => {
    // Skip permissions for now - that's totally fine
    setOnboardingComplete(true);
    navigation.replace('MainTabs');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradients.ambient}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Title */}
          <Animated.View
            entering={FadeInUp.duration(500)}
            style={styles.titleContainer}
          >
            <Text style={styles.title}>to share moments,</Text>
            <Text style={styles.title}>scena needs:</Text>
          </Animated.View>

          {/* Permission items */}
          <GlassCard style={styles.permissionsCard}>
            <PermissionItem
              icon="camera-outline"
              title="camera"
              description="to take photos"
              delay={200}
            />

            <PermissionItem
              icon="location-outline"
              title="location"
              description="to tag where you are"
              delay={300}
            />

            <PermissionItem
              icon="images-outline"
              title="photos"
              description="to share from your library"
              delay={400}
            />
          </GlassCard>

          {/* Spacer */}
          <View style={styles.spacer} />

          {/* Actions */}
          <Animated.View
            entering={FadeInUp.duration(500).delay(600)}
            style={styles.actions}
          >
            <GlassButton
              title="okay"
              onPress={handleOkay}
              variant="primary"
              size="large"
              fullWidth
            />

            <Pressable onPress={handleMaybeLater} style={styles.maybeLater}>
              <Text style={styles.maybeLaterText}>maybe later</Text>
            </Pressable>
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
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
  content: {
    flex: 1,
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: spacing.xxxl,
  },
  titleContainer: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.light,
    color: colors.text.primary,
    textTransform: 'lowercase',
    letterSpacing: typography.letterSpacing.wide,
    lineHeight: typography.sizes.xl * 1.3,
  },
  permissionsCard: {
    marginTop: spacing.lg,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  permissionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.reaction.highlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  permissionText: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    textTransform: 'lowercase',
    marginBottom: 2,
  },
  permissionDescription: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    textTransform: 'lowercase',
  },
  spacer: {
    flex: 1,
  },
  actions: {
    paddingBottom: spacing.xxl,
  },
  maybeLater: {
    alignSelf: 'center',
    marginTop: spacing.lg,
    padding: spacing.md,
  },
  maybeLaterText: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
    textTransform: 'lowercase',
  },
});

export default PermissionsScreen;
