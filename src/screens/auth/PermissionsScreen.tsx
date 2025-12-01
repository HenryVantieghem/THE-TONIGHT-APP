import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera } from 'expo-camera';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/ui/Button';
import { useStore } from '../../stores/useStore';

// Premium auth color palette
const authColors = {
  background: '#FFFFFF',
  textPrimary: '#1A1A2E',
  textSecondary: '#64748B',
  primary: '#FF6B6B',
  cardBackground: '#F8F9FA',
  cardBorder: '#E2E8F0',
  success: '#22C55E',
  successLight: '#DCFCE7',
};

type PermissionStatus = 'granted' | 'denied' | 'undetermined';

interface PermissionItem {
  key: 'camera' | 'location';
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  title: string;
  description: string;
  required: boolean;
}

const permissions: PermissionItem[] = [
  {
    key: 'camera',
    icon: 'camera',
    iconColor: '#FF6B6B',
    title: 'Camera',
    description: 'Take photos and videos to share with friends',
    required: true,
  },
  {
    key: 'location',
    icon: 'location',
    iconColor: '#6366F1',
    title: 'Location',
    description: 'Show where you are when you post',
    required: true,
  },
];

export function PermissionsScreen() {
  const { setPermissions } = useStore();

  const [permissionStates, setPermissionStates] = useState<
    Record<'camera' | 'location', PermissionStatus>
  >({
    camera: 'undetermined',
    location: 'undetermined',
  });

  const [isLoading, setIsLoading] = useState<string | null>(null);

  // Check initial permission states
  useEffect(() => {
    const checkPermissions = async () => {
      const [cameraStatus, locationStatus] = await Promise.all([
        Camera.getCameraPermissionsAsync(),
        Location.getForegroundPermissionsAsync(),
      ]);

      const newStates = {
        camera: cameraStatus.granted ? 'granted' : 'undetermined',
        location: locationStatus.granted ? 'granted' : 'undetermined',
      } as const;

      setPermissionStates(newStates);
      setPermissions(newStates);
    };

    checkPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const requestPermission = async (key: 'camera' | 'location') => {
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

  const renderPermissionCard = (item: PermissionItem) => {
    const status = permissionStates[item.key];
    const loading = isLoading === item.key;
    const isGranted = status === 'granted';
    const isDenied = status === 'denied';

    return (
      <View key={item.key} style={[
        styles.permissionCard,
        isGranted && styles.permissionCardGranted,
      ]}>
        <View style={styles.cardContent}>
          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: `${item.iconColor}15` }]}>
            <Ionicons name={item.icon} size={24} color={item.iconColor} />
          </View>

          {/* Text */}
          <View style={styles.textContainer}>
            <View style={styles.titleRow}>
              <Text style={styles.permissionTitle}>{item.title}</Text>
              {item.required && !isGranted && (
                <View style={styles.requiredBadge}>
                  <Text style={styles.requiredText}>Required</Text>
                </View>
              )}
            </View>
            <Text style={styles.permissionDescription}>{item.description}</Text>
          </View>

          {/* Status/Button */}
          <View style={styles.actionContainer}>
            {isGranted ? (
              <View style={styles.grantedContainer}>
                <Ionicons name="checkmark-circle" size={24} color={authColors.success} />
              </View>
            ) : isDenied ? (
              <TouchableOpacity
                onPress={openSettings}
                style={styles.settingsButton}
                activeOpacity={0.7}
              >
                <Text style={styles.settingsButtonText}>Settings</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => requestPermission(item.key)}
                style={styles.enableButton}
                activeOpacity={0.7}
                disabled={loading}
              >
                <Text style={styles.enableButtonText}>
                  {loading ? '...' : 'Enable'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  // Check if required permissions are granted
  const requiredGranted =
    permissionStates.camera === 'granted' &&
    permissionStates.location === 'granted';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconWrapper}>
            <View style={styles.headerIconBg}>
              <Ionicons name="shield-checkmark" size={32} color={authColors.primary} />
            </View>
          </View>
          <Text style={styles.title}>Before We Start</Text>
          <Text style={styles.subtitle}>
            Tonight needs a few permissions to work its magic
          </Text>
        </View>

        {/* Permission Cards */}
        <View style={styles.permissionsList}>
          {permissions.map(renderPermissionCard)}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          {requiredGranted ? (
            <View style={styles.readyContainer}>
              <Ionicons name="checkmark-circle" size={20} color={authColors.success} />
              <Text style={styles.readyText}>You're all set!</Text>
            </View>
          ) : (
            <Text style={styles.footerNote}>
              Enable camera and location to continue
            </Text>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: authColors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  iconWrapper: {
    marginBottom: 16,
  },
  headerIconBg: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: `${authColors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: authColors.textPrimary,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: authColors.textSecondary,
    lineHeight: 24,
    textAlign: 'center',
  },
  permissionsList: {
    flex: 1,
    gap: 12,
  },
  permissionCard: {
    backgroundColor: authColors.cardBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: authColors.cardBorder,
    padding: 16,
  },
  permissionCardGranted: {
    backgroundColor: authColors.successLight,
    borderColor: authColors.success,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
    marginRight: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: authColors.textPrimary,
  },
  requiredBadge: {
    backgroundColor: `${authColors.primary}20`,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  requiredText: {
    fontSize: 11,
    fontWeight: '600',
    color: authColors.primary,
  },
  permissionDescription: {
    fontSize: 13,
    color: authColors.textSecondary,
    lineHeight: 18,
  },
  actionContainer: {
    minWidth: 80,
    alignItems: 'flex-end',
  },
  grantedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  enableButton: {
    backgroundColor: authColors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  enableButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  settingsButton: {
    backgroundColor: authColors.cardBorder,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  settingsButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: authColors.textSecondary,
  },
  footer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  readyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: authColors.successLight,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  readyText: {
    fontSize: 14,
    fontWeight: '600',
    color: authColors.success,
  },
  footerNote: {
    fontSize: 14,
    color: authColors.textSecondary,
    textAlign: 'center',
  },
});
