/**
 * Scena - Avatar Component
 * Gentle, circular avatar with initials fallback
 */

import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, borderRadius } from '../theme';

interface AvatarProps {
  uri?: string;
  name?: string;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  style?: ViewStyle;
}

const sizes = {
  small: 32,
  medium: 44,
  large: 64,
  xlarge: 100,
};

const fontSizes = {
  small: 12,
  medium: 16,
  large: 24,
  xlarge: 36,
};

export const Avatar: React.FC<AvatarProps> = ({
  uri,
  name = '',
  size = 'medium',
  style,
}) => {
  const dimension = sizes[size];
  const fontSize = fontSizes[size];

  // Get initials from name (max 2 characters)
  const getInitials = (name: string): string => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const initials = getInitials(name);

  const containerStyle = {
    width: dimension,
    height: dimension,
    borderRadius: dimension / 2,
  };

  if (uri) {
    return (
      <View style={[styles.container, containerStyle, style]}>
        <Image
          source={{ uri }}
          style={[styles.image, containerStyle]}
          resizeMode="cover"
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, containerStyle, style]}>
      <LinearGradient
        colors={['rgba(139, 164, 184, 0.3)', 'rgba(139, 164, 184, 0.15)'] as const}
        style={[styles.gradient, containerStyle]}
      >
        <Text style={[styles.initials, { fontSize }]}>
          {initials || '?'}
        </Text>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
    textTransform: 'lowercase',
  },
});

export default Avatar;
