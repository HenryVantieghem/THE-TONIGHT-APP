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
import { typography } from '../../constants/typography';

// iOS auth color palette
const authColors = {
  background: '#FFFFFF',
  textPrimary: '#000000',
  textSecondary: '#8E8E93',
  primary: '#007AFF',
  cardBackground: '#F2F2F7',
  cardBorder: '#E5E5EA',
  success: '#34C759',
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
    iconColor: '#007AFF',
    title: 'CAMERA',
    description: 'Take photos and videos to share with friends',
    required: true,
  },
  {
    key: 'location',
    icon: 'location',
    iconColor: '#007AFF',
    title: 'LOCATION',
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
      <View key={item.key} style={styles.permissionCard}>
        <View style={styles.cardContent}>
          {/* Icon */}
          <Text style={styles.iconEmoji}>
            {item.key === 'camera' ? '📷' : '📍'}
          </Text>

          {/* Text */}
          <View style={styles.textContainer}>
            <Text style={styles.permissionTitle}>{item.title}</Text>
            <Text style={styles.permissionDescription}>{item.description}</Text>
          </View>

          {/* Status/Button */}
          {isGranted ? (
            <View style={styles.grantedContainer}>
              <Text style={styles.checkmark}>✓</Text>
            </View>
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
        {isGranted && (
          <Text style={styles.grantedText}>Access granted</Text>
        )}
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
          <Text style={styles.title}>Enable Features</Text>
          <Text style={styles.subtitle}>
            To use Tonight, we need access to a few things
          </Text>
        </View>

        {/* Permission Cards */}
        <View style={styles.permissionsList}>
          {permissions.map(renderPermissionCard)}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={() => {}} activeOpacity={0.7}>
            <Text style={styles.skipLink}>Skip for now</Text>
          </TouchableOpacity>
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
    marginTop: 32,
    marginBottom: 32,
  },
  title: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.bold,
    color: authColors.textPrimary,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: authColors.textSecondary,
    lineHeight: 22,
    textAlign: 'center',
  },
  permissionsList: {
    flex: 1,
    gap: 12,
  },
  permissionCard: {
    backgroundColor: authColors.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: authColors.cardBorder,
    padding: 16,
    marginBottom: 16,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: authColors.textPrimary,
    marginBottom: 4,
  },
  permissionDescription: {
    fontSize: 14,
    color: authColors.textSecondary,
    lineHeight: 20,
  },
  grantedContainer: {
    marginLeft: 12,
  },
  checkmark: {
    fontSize: 20,
    color: authColors.success,
  },
  grantedText: {
    fontSize: 13,
    color: authColors.textSecondary,
    marginTop: 8,
    marginLeft: 36,
  },
  enableButton: {
    backgroundColor: authColors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginLeft: 12,
  },
  enableButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  footer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  skipLink: {
    fontSize: 15,
    color: authColors.textSecondary,
    fontWeight: '400',
  },
});
