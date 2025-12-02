import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../../constants/colors';

// Avatar sizes per spec
type AvatarSize = 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

interface AvatarProps {
  uri?: string | null;
  name?: string | null;
  size?: AvatarSize;
  onPress?: () => void;
  style?: ViewStyle;
  showEditBadge?: boolean;
  showBorder?: boolean; // 2px white border when on images
}

// Per spec sizes
const sizeMap: Record<AvatarSize, number> = {
  sm: 32,     // Friend list compact
  md: 40,     // Post cards (default)
  lg: 56,     // Friend cards
  xl: 80,     // Profile header
  xxl: 120,   // Own profile
};

const fontSizeMap: Record<AvatarSize, number> = {
  sm: 12,
  md: 14,
  lg: 20,
  xl: 28,
  xxl: 40,
};

const editBadgeSizeMap: Record<AvatarSize, { size: number; iconSize: number }> = {
  sm: { size: 16, iconSize: 10 },
  md: { size: 20, iconSize: 12 },
  lg: { size: 24, iconSize: 14 },
  xl: { size: 28, iconSize: 16 },
  xxl: { size: 32, iconSize: 18 },
};

export function Avatar({
  uri,
  name,
  size = 'md',
  onPress,
  style,
  showEditBadge = false,
  showBorder = false,
}: AvatarProps) {
  const dimension = sizeMap[size];
  const fontSize = fontSizeMap[size];
  const badgeConfig = editBadgeSizeMap[size];

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
    showBorder ? styles.withBorder : undefined,
    style,
  ].filter(Boolean) as ViewStyle[];

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
        <View
          style={[
            styles.editBadge,
            {
              width: badgeConfig.size,
              height: badgeConfig.size,
              borderRadius: badgeConfig.size / 2,
              bottom: 0,
              right: 0,
            },
          ]}
        >
          <View
            style={[
              styles.editBadgeInner,
              {
                width: badgeConfig.size - 4,
                height: badgeConfig.size - 4,
                borderRadius: (badgeConfig.size - 4) / 2,
              },
            ]}
          >
            <Ionicons
              name="camera"
              size={badgeConfig.iconSize}
              color={colors.textInverse}
            />
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
    overflow: 'visible',
    position: 'relative',
  },
  withBorder: {
    borderWidth: 2,
    borderColor: colors.white,
    ...shadows.level1,
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
    backgroundColor: colors.backgroundPrimary,
    borderWidth: 2,
    borderColor: colors.backgroundPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.level2,
  },
  editBadgeInner: {
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
