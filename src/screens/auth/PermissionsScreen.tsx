import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import { Camera } from 'expo-camera';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { spacing } from '../../constants/config';
import { useStore } from '../../stores/useStore';

type PermissionStatus = 'granted' | 'denied' | 'undetermined';

interface PermissionItem {
  key: 'camera' | 'location' | 'notifications';
  icon: string;
  title: string;
  description: string;
  required: boolean;
}

const permissions: PermissionItem[] = [
  {
    key: 'camera',
    icon: '📷',
    title: 'Camera Access',
    description: 'Take photos and videos to share with friends',
    required: true,
  },
  {
    key: 'location',
    icon: '📍',
    title: 'Location Access',
    description: 'Show where you are when you post',
    required: true,
  },
  {
    key: 'notifications',
    icon: '🔔',
    title: 'Notifications',
    description: 'Get notified when friends post nearby',
    required: false,
  },
];

export function PermissionsScreen() {
  const insets = useSafeAreaInsets();
  const { setPermissions } = useStore();

  const [permissionStates, setPermissionStates] = useState<
    Record<'camera' | 'location' | 'notifications', PermissionStatus>
  >({
    camera: 'undetermined',
    location: 'undetermined',
    notifications: 'undetermined',
  });

  const [isLoading, setIsLoading] = useState<string | null>(null);

  // Check initial permission states
  useEffect(() => {
    const checkPermissions = async () => {
      const [cameraStatus, locationStatus, notificationStatus] =
        await Promise.all([
          Camera.getCameraPermissionsAsync(),
          Location.getForegroundPermissionsAsync(),
          Notifications.getPermissionsAsync(),
        ]);

      const newStates = {
        camera: cameraStatus.granted ? 'granted' : 'undetermined',
        location: locationStatus.granted ? 'granted' : 'undetermined',
        notifications: notificationStatus.granted ? 'granted' : 'undetermined',
      } as const;

      setPermissionStates(newStates);
      setPermissions(newStates);
    };

    checkPermissions();
  }, [setPermissions]);

  const requestPermission = async (key: 'camera' | 'location' | 'notifications') => {
    setIsLoading(key);

    try {
      let granted = false;

      switch (key) {
        case 'camera': {
          const result = await Camera.requestCameraPermissionsAsync();
          granted = result.granted;
          break;
        }
        case 'location': {
          const result = await Location.requestForegroundPermissionsAsync();
          granted = result.granted;
          break;
        }
        case 'notifications': {
          const result = await Notifications.requestPermissionsAsync();
          granted = result.granted;
          break;
        }
      }

      const newStatus: PermissionStatus = granted ? 'granted' : 'denied';

      setPermissionStates((prev) => ({
        ...prev,
        [key]: newStatus,
      }));

      setPermissions({ [key]: newStatus });
    } catch (error) {
      console.error(`Error requesting ${key} permission:`, error);
    } finally {
      setIsLoading(null);
    }
  };

  const openSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  // After permissions are granted, navigation will be handled by RootNavigator
  // since user state will be set

  const getButtonProps = (item: PermissionItem) => {
    const status = permissionStates[item.key];
    const loading = isLoading === item.key;

    if (status === 'granted') {
      return {
        title: 'Enabled',
        variant: 'secondary' as const,
        disabled: true,
      };
    }

    if (status === 'denied') {
      return {
        title: 'Open Settings',
        variant: 'secondary' as const,
        onPress: openSettings,
      };
    }

    return {
      title: 'Enable',
      variant: 'primary' as const,
      loading,
      onPress: () => requestPermission(item.key),
    };
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.lg },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Before We Start</Text>
        <Text style={styles.subtitle}>
          Tonight needs a few permissions to work its magic
        </Text>
      </View>

      <View style={styles.permissionsList}>
        {permissions.map((item) => {
          const status = permissionStates[item.key];
          const buttonProps = getButtonProps(item);

          return (
            <Card key={item.key} style={styles.permissionCard}>
              <View style={styles.permissionContent}>
                <Text style={styles.permissionIcon}>{item.icon}</Text>
                <View style={styles.permissionText}>
                  <View style={styles.permissionTitleRow}>
                    <Text style={styles.permissionTitle}>{item.title}</Text>
                    {item.required && (
                      <Text style={styles.requiredBadge}>Required</Text>
                    )}
                  </View>
                  <Text style={styles.permissionDescription}>
                    {item.description}
                  </Text>
                </View>
              </View>

              <View style={styles.permissionButton}>
                <Button
                  title={buttonProps.title}
                  variant={buttonProps.variant}
                  size="sm"
                  loading={buttonProps.loading}
                  disabled={buttonProps.disabled}
                  onPress={buttonProps.onPress || (() => {})}
                />
                {status === 'granted' && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>
            </Card>
          );
        })}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerNote}>
          You can change these permissions anytime in Settings
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    lineHeight: typography.lineHeights.lg,
  },
  permissionsList: {
    flex: 1,
    gap: spacing.md,
  },
  permissionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  permissionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  permissionIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  permissionText: {
    flex: 1,
  },
  permissionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 2,
  },
  permissionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  requiredBadge: {
    fontSize: typography.sizes.xs,
    color: colors.primary,
    fontWeight: typography.weights.medium,
  },
  permissionDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  permissionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginLeft: spacing.sm,
  },
  checkmark: {
    fontSize: 18,
    color: colors.success,
  },
  footer: {
    paddingTop: spacing.lg,
    alignItems: 'center',
  },
  footerNote: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
