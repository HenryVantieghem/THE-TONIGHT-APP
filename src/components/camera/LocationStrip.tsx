import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/config';
import type { LocationData } from '../../types';

interface LocationStripProps {
  location: LocationData | null;
  isLoading?: boolean;
  onPress?: () => void;
  editable?: boolean;
  style?: object;
}

export function LocationStrip({
  location,
  isLoading = false,
  onPress,
  editable = true,
  style,
}: LocationStripProps) {
  const content = (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>📍</Text>
      </View>

      <View style={styles.textContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.white} />
            <Text style={styles.loadingText}>Getting location...</Text>
          </View>
        ) : location ? (
          <>
            <Text style={styles.locationName} numberOfLines={1}>
              {location.name}
            </Text>
            {location.city && (
              <Text style={styles.locationCity} numberOfLines={1}>
                {location.city}
                {location.state ? `, ${location.state}` : ''}
              </Text>
            )}
          </>
        ) : (
          <Text style={styles.noLocation}>Location unavailable</Text>
        )}
      </View>

      {editable && onPress && !isLoading && (
        <TouchableOpacity style={styles.changeButton} onPress={onPress}>
          <Text style={styles.changeText}>Change</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (onPress && editable && !isLoading) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

// Compact version for post preview
export function LocationStripCompact({
  location,
  style,
}: {
  location: LocationData | null;
  style?: object;
}) {
  if (!location) return null;

  return (
    <View style={[styles.compactContainer, style]}>
      <Text style={styles.compactIcon}>📍</Text>
      <Text style={styles.compactText} numberOfLines={1}>
        {location.name}
        {location.city ? ` · ${location.city}` : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.overlay,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.md,
  },
  iconContainer: {
    marginRight: spacing.sm,
  },
  icon: {
    fontSize: 18,
  },
  textContainer: {
    flex: 1,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  loadingText: {
    color: colors.white,
    fontSize: typography.sizes.sm,
  },
  locationName: {
    color: colors.white,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  locationCity: {
    color: colors.white,
    fontSize: typography.sizes.sm,
    opacity: 0.8,
    marginTop: 2,
  },
  noLocation: {
    color: colors.white,
    fontSize: typography.sizes.sm,
    opacity: 0.8,
  },
  changeButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  changeText: {
    color: colors.white,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    opacity: 0.9,
  },

  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  compactText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    flex: 1,
  },
});
