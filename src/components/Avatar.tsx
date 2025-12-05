/**
 * Scena - Avatar Component
 * Gentle, circular avatar with initials fallback
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, borderRadius } from '../theme';
import { storageService } from '../services/storage.service';

interface AvatarProps {
  uri?: string | null;
  username?: string;
  name?: string;
  size?: 'small' | 'medium' | 'large' | 'xlarge' | number;
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
  username,
  name = '',
  size = 'medium',
  style,
}) => {
  const dimension = typeof size === 'number' ? size : sizes[size];
  const fontSize = typeof size === 'number' 
    ? size * 0.4 
    : fontSizes[size];
  
  // Use username if name not provided
  const displayName = name || username || '';

  // Get initials from name (max 2 characters)
  const getInitials = (name: string): string => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const initials = getInitials(displayName);

  const containerStyle = {
    width: dimension,
    height: dimension,
    borderRadius: dimension / 2,
  };

  // Get avatar URL (handle Supabase Storage URLs)
  const getAvatarUrl = () => {
    if (!uri) return null;
    
    // If it's already a full URL, use it
    if (uri.startsWith('http://') || uri.startsWith('https://')) {
      return uri;
    }
    
    // If it's a storage path, get public URL
    return storageService.getPublicUrl('avatars', uri);
  };

  const avatarUrl = getAvatarUrl();

  if (avatarUrl) {
    return (
      <View style={[styles.container, containerStyle, style]}>
        <Image
          source={{ uri: avatarUrl }}
          style={[styles.image, containerStyle]}
          contentFit="cover"
          transition={200}
          placeholder={{ blurhash: 'LGF5]+Yk^6#M@-5c,1J5@[or[Q6.' }}
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
