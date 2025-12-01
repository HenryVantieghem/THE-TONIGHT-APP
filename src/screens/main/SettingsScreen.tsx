import React, { useCallback, useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Animated,
  Switch,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Card } from '../../components/ui/Card';
import { DiscoBallLogo } from '../../components/ui/DiscoBallLogo';
import { useAuth } from '../../hooks/useAuth';
import { useLocation } from '../../hooks/useLocation';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { spacing, borderRadius, config } from '../../constants/config';
import type { LocationPrecision, MainStackParamList } from '../../types';

type SettingsNavigationProp = NativeStackNavigationProp<MainStackParamList, 'Settings'>;

const locationPrecisionOptions: { value: LocationPrecision; label: string; description: string }[] = [
  { value: 'exact', label: 'Exact', description: 'Show specific location name' },
  { value: 'neighborhood', label: 'Neighborhood', description: 'Show city and state' },
  { value: 'city', label: 'City Only', description: 'Show only the city' },
];

// Animated settings section component
function AnimatedSection({
  title,
  children,
  index,
  isDanger = false,
}: {
  title: string;
  children: React.ReactNode;
  index: number;
  isDanger?: boolean;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    const delay = index * 100;

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index, fadeAnim, slideAnim]);

  return (
    <Animated.View
      style={[
        styles.section,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Text style={[styles.sectionTitle, isDanger && styles.dangerTitle]}>
        {title}
      </Text>
      {children}
    </Animated.View>
  );
}

// Toggle setting row component
function ToggleRow({
  icon,
  label,
  description,
  value,
  onValueChange,
}: {
  icon: string;
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  const handleChange = (newValue: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onValueChange(newValue);
  };

  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleIconContainer}>
        <Text style={styles.toggleIcon}>{icon}</Text>
      </View>
      <View style={styles.toggleContent}>
        <Text style={styles.toggleLabel}>{label}</Text>
        {description && (
          <Text style={styles.toggleDescription}>{description}</Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={handleChange}
        trackColor={{ false: colors.border, true: colors.primaryLight }}
        thumbColor={value ? colors.primary : colors.white}
        ios_backgroundColor={colors.border}
      />
    </View>
  );
}

// Tappable row component with icon
function TappableRow({
  icon,
  label,
  value,
  onPress,
  isLink = false,
  isDanger = false,
}: {
  icon?: string;
  label: string;
  value?: string;
  onPress?: () => void;
  isLink?: boolean;
  isDanger?: boolean;
}) {
  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const content = (
    <View style={styles.tappableRow}>
      {icon && (
        <View style={[styles.toggleIconContainer, isDanger && styles.dangerIconContainer]}>
          <Text style={styles.toggleIcon}>{icon}</Text>
        </View>
      )}
      <View style={styles.tappableContent}>
        <Text
          style={[
            styles.tappableLabel,
            isLink && styles.linkText,
            isDanger && styles.dangerText,
          ]}
        >
          {label}
        </Text>
      </View>
      {value && <Text style={styles.tappableValue}>{value}</Text>}
      {(isLink || onPress) && !value && (
        <Text style={[styles.tappableArrow, isDanger && styles.dangerText]}>→</Text>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

export function SettingsScreen() {
  const navigation = useNavigation<SettingsNavigationProp>();
  const insets = useSafeAreaInsets();
  const { user, signOut, deleteAccount } = useAuth();
  const { locationPrecision, updateLocationPrecision } = useLocation();


  // Header animation
  const headerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [headerOpacity]);

  const handleClose = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [navigation]);

  const handleLogout = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            signOut();
          },
        },
      ]
    );
  }, [signOut]);

  const handleDeleteAccount = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all your data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            const { error } = await deleteAccount();
            if (error) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  }, [deleteAccount]);

  const openLink = useCallback((url: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(url);
  }, []);

  const handleLocationPrecisionChange = useCallback((value: LocationPrecision) => {
    Haptics.selectionAsync();
    updateLocationPrecision(value);
  }, [updateLocationPrecision]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.header,
          { paddingTop: insets.top + spacing.sm, opacity: headerOpacity },
        ]}
      >
        <TouchableOpacity
          onPress={handleClose}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>←</Text>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Settings</Text>

        <View style={{ width: 60 }} />
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacing.lg },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Account Section */}
        <AnimatedSection title="Account" index={0}>
          <Card style={styles.card}>
            <TappableRow
              icon="👤"
              label="Username"
              value={`@${user?.username || 'Not set'}`}
            />
            <View style={styles.divider} />
            <TappableRow
              icon="🆔"
              label="User ID"
              value={user?.id?.slice(0, 8) || 'Unknown'}
            />
          </Card>
        </AnimatedSection>

        {/* Privacy Section */}
        <AnimatedSection title="Privacy" index={1}>
          <Card style={styles.card}>
            <View style={styles.privacyHeader}>
              <View style={styles.toggleIconContainer}>
                <Text style={styles.toggleIcon}>📍</Text>
              </View>
              <View style={styles.privacyHeaderText}>
                <Text style={styles.settingLabel}>Location Precision</Text>
                <Text style={styles.settingDescription}>
                  How your location appears on posts
                </Text>
              </View>
            </View>

            <View style={styles.radioGroup}>
              {locationPrecisionOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.radioOption,
                    locationPrecision === option.value && styles.radioOptionSelected,
                  ]}
                  onPress={() => handleLocationPrecisionChange(option.value)}
                  activeOpacity={0.7}
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
        </AnimatedSection>


        {/* About Section */}
        <AnimatedSection title="About" index={3}>
          <Card style={styles.card}>
            <TappableRow
              icon="📜"
              label="Terms of Service"
              onPress={() => openLink('https://tonight.app/terms')}
              isLink
            />
            <View style={styles.divider} />
            <TappableRow
              icon="🔒"
              label="Privacy Policy"
              onPress={() => openLink('https://tonight.app/privacy')}
              isLink
            />
            <View style={styles.divider} />
            <TappableRow
              icon="💬"
              label="Send Feedback"
              onPress={() => openLink('mailto:support@tonight.app')}
              isLink
            />
            <View style={styles.divider} />
            <TappableRow
              icon="ℹ️"
              label="Version"
              value={config.APP_VERSION}
            />
          </Card>
        </AnimatedSection>

        {/* Danger Zone */}
        <AnimatedSection title="Danger Zone" index={3} isDanger>
          <Card style={styles.dangerCard}>
            <TappableRow
              icon="🚪"
              label="Log Out"
              onPress={handleLogout}
              isDanger
            />
            <View style={styles.divider} />
            <TappableRow
              icon="⚠️"
              label="Delete Account"
              onPress={handleDeleteAccount}
              isDanger
            />
          </Card>
        </AnimatedSection>

        {/* Footer */}
        <View style={styles.footer}>
          <DiscoBallLogo size={32} animated={true} />
          <Text style={styles.footerText}>Tonight</Text>
          <Text style={styles.footerSubtext}>
            Share moments that matter, right now.
          </Text>
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
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  backIcon: {
    fontSize: typography.sizes.lg,
    color: colors.primary,
  },
  backText: {
    fontSize: typography.sizes.md,
    color: colors.primary,
    fontWeight: typography.weights.medium,
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
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginLeft: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    padding: spacing.md,
  },
  dangerCard: {
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.error + '30',
  },
  // Toggle row styles
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  toggleIconContainer: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  toggleIcon: {
    fontSize: 18,
  },
  toggleContent: {
    flex: 1,
    marginRight: spacing.sm,
  },
  toggleLabel: {
    fontSize: typography.sizes.md,
    color: colors.text,
    fontWeight: typography.weights.medium,
  },
  toggleDescription: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  // Tappable row styles
  tappableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  tappableContent: {
    flex: 1,
  },
  tappableLabel: {
    fontSize: typography.sizes.md,
    color: colors.text,
    fontWeight: typography.weights.medium,
  },
  tappableValue: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  tappableArrow: {
    fontSize: typography.sizes.md,
    color: colors.textTertiary,
    marginLeft: spacing.sm,
  },
  // Privacy section styles
  privacyHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  privacyHeaderText: {
    flex: 1,
  },
  settingLabel: {
    fontSize: typography.sizes.md,
    color: colors.text,
    fontWeight: typography.weights.medium,
  },
  settingDescription: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  radioGroup: {
    gap: spacing.xs,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    marginHorizontal: -spacing.xs,
  },
  radioOptionSelected: {
    backgroundColor: colors.primaryLight + '15',
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
    fontWeight: typography.weights.medium,
  },
  radioDescription: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  // Link styles
  linkText: {
    color: colors.primary,
  },
  // Danger zone styles
  dangerTitle: {
    color: colors.error,
  },
  dangerIconContainer: {
    backgroundColor: colors.error + '15',
  },
  dangerText: {
    color: colors.error,
  },
  // Footer styles
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginTop: spacing.md,
  },
  footerText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  footerSubtext: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
