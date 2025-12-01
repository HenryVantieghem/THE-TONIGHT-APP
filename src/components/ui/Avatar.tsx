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
import { typography } from '../../constants/typography';

type AvatarSize = 'small' | 'medium' | 'large' | 'xlarge';

interface AvatarProps {
  uri?: string | null;
  name?: string | null;
  size?: AvatarSize;
  onPress?: () => void;
  style?: ViewStyle;
}

const sizeMap: Record<AvatarSize, number> = {
  small: 32,
  medium: 40,
  large: 56,
  xlarge: 80,
};

const fontSizeMap: Record<AvatarSize, number> = {
  small: 12,
  medium: 14,
  large: 20,
  xlarge: 28,
};

export function Avatar({
  uri,
  name,
  size = 'medium',
  onPress,
  style,
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

  const content = uri ? (
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
        },
      ]}
    >
      <Text style={[styles.initials, { fontSize }]}>{getInitials()}</Text>
    </View>
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
  },
  image: {
    backgroundColor: colors.surface,
  },
  placeholder: {
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: colors.white,
    fontWeight: typography.weights.semibold,
  },
});
