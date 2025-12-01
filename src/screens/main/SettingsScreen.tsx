import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../hooks/useAuth';
import { useLocation } from '../../hooks/useLocation';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { spacing, config } from '../../constants/config';
import type { LocationPrecision, MainStackParamList } from '../../types';

type SettingsNavigationProp = NativeStackNavigationProp<MainStackParamList, 'Settings'>;

const locationPrecisionOptions: { value: LocationPrecision; label: string; description: string }[] = [
  { value: 'exact', label: 'Exact', description: 'Show specific location name' },
  { value: 'neighborhood', label: 'Neighborhood', description: 'Show city and state' },
  { value: 'city', label: 'City Only', description: 'Show only the city' },
];

export function SettingsScreen() {
  const navigation = useNavigation<SettingsNavigationProp>();
  const insets = useSafeAreaInsets();
  const { user, signOut, deleteAccount } = useAuth();
  const { locationPrecision, updateLocationPrecision } = useLocation();

  const handleClose = () => {
    navigation.goBack();
  };

  const handleLogout = useCallback(() => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: signOut,
        },
      ]
    );
  }, [signOut]);

  const handleDeleteAccount = useCallback(() => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all your data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const { error } = await deleteAccount();
            if (error) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  }, [deleteAccount]);

  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity onPress={handleClose}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Settings</Text>

        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacing.lg },
        ]}
      >
        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <Card style={styles.card}>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Email</Text>
              <Text style={styles.settingValue}>{user?.username || 'Not set'}@</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Username</Text>
              <Text style={styles.settingValue}>@{user?.username || 'Not set'}</Text>
            </View>
          </Card>
        </View>

        {/* Privacy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy</Text>
          <Card style={styles.card}>
            <Text style={styles.settingLabel}>Location Precision</Text>
            <Text style={styles.settingDescription}>
              Choose how your location appears on posts
            </Text>

            <View style={styles.radioGroup}>
              {locationPrecisionOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={styles.radioOption}
                  onPress={() => updateLocationPrecision(option.value)}
                >
                  <View style={styles.radioButton}>
                    {locationPrecision === option.value && (
                      <View style={styles.radioButtonSelected} />
                    )}
                  </View>
                  <View style={styles.radioText}>
                    <Text style={styles.radioLabel}>{option.label}</Text>
                    <Text style={styles.radioDescription}>{option.description}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Card style={styles.card}>
            <TouchableOpacity
              style={styles.linkRow}
              onPress={() => openLink('https://tonight.app/terms')}
            >
              <Text style={styles.linkText}>Terms of Service</Text>
              <Text style={styles.linkArrow}>→</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.linkRow}
              onPress={() => openLink('https://tonight.app/privacy')}
            >
              <Text style={styles.linkText}>Privacy Policy</Text>
              <Text style={styles.linkArrow}>→</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Version</Text>
              <Text style={styles.settingValue}>{config.APP_VERSION}</Text>
            </View>
          </Card>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, styles.dangerTitle]}>Danger Zone</Text>
          <Card style={styles.card}>
            <TouchableOpacity style={styles.dangerRow} onPress={handleLogout}>
              <Text style={styles.dangerText}>Log Out</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.dangerRow} onPress={handleDeleteAccount}>
              <Text style={[styles.dangerText, styles.deleteText]}>
                Delete Account
              </Text>
            </TouchableOpacity>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backText: {
    fontSize: typography.sizes.md,
    color: colors.primary,
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginLeft: spacing.sm,
    textTransform: 'uppercase',
  },
  card: {
    padding: spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  settingLabel: {
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  settingValue: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  settingDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  radioGroup: {
    gap: spacing.sm,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  radioButtonSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  radioText: {
    flex: 1,
  },
  radioLabel: {
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  radioDescription: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  linkText: {
    fontSize: typography.sizes.md,
    color: colors.primary,
  },
  linkArrow: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  dangerTitle: {
    color: colors.error,
  },
  dangerRow: {
    paddingVertical: spacing.xs,
  },
  dangerText: {
    fontSize: typography.sizes.md,
    color: colors.error,
  },
  deleteText: {
    fontWeight: typography.weights.semibold,
  },
});
