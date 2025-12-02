import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Image } from 'expo-image';
import { colors } from '../../constants/colors';
import { textStyles } from '../../constants/typography';
import { borderRadius } from '../../constants/config';

// Avatar sizes per spec
type AvatarSize = 'small' | 'default' | 'medium' | 'large' | 'xlarge';

interface AvatarProps {
  uri?: string | null;
  name?: string | null;
  size?: AvatarSize;
  onPress?: () => void;
  style?: ViewStyle;
  showEditBadge?: boolean;
}

const sizeMap: Record<AvatarSize, number> = {
  small: 32,      // Friend list compact
  default: 40,    // Post cards
  medium: 56,     // Friend cards
  large: 80,      // Profile header
  xlarge: 120,    // Own profile
};

const fontSizeMap: Record<AvatarSize, number> = {
  small: 12,
  default: 14,
  medium: 18,
  large: 24,
  xlarge: 32,
};

export function Avatar({
  uri,
  name,
  size = 'default',
  onPress,
  style,
  showEditBadge = false,
}: AvatarProps) {
  const dimension = sizeMap[size];
  const fontSize = fontSizeMap[size];

  // Get initials from name
  const getInitials = () => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const containerStyles = [
    styles.container,
    {
      width: dimension,
      height: dimension,
      borderRadius: dimension / 2,
    },
    style,
  ];

  const avatarContent = uri ? (
    <Image
      source={{ uri }}
      style={[
        styles.image,
        {
          width: dimension,
          height: dimension,
          borderRadius: dimension / 2,
        },
      ]}
      contentFit="cover"
      transition={200}
    />
  ) : (
    <View
      style={[
        styles.placeholder,
        {
          width: dimension,
          height: dimension,
          borderRadius: dimension / 2,
          backgroundColor: colors.accent,
        },
      ]}
    >
      <Text style={[styles.initials, { fontSize }]}>{getInitials()}</Text>
    </View>
  );

  const content = (
    <>
      {avatarContent}
      {showEditBadge && (
        <View style={[styles.editBadge, { bottom: size === 'xlarge' ? 4 : 0, right: size === 'xlarge' ? 4 : 0 }]}>
          <View style={styles.editBadgeInner}>
            <Text style={styles.editIcon}>📷</Text>
          </View>
        </View>
      )}
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={containerStyles}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={containerStyles}>{content}</View>;
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    backgroundColor: colors.backgroundSecondary,
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: colors.textInverse,
    fontWeight: '600',
  },
  editBadge: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.backgroundPrimary,
    borderWidth: 2,
    borderColor: colors.backgroundPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    ...colors.shadowColor ? {
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    } : {},
  },
  editBadgeInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIcon: {
    fontSize: 10,
  },
});
