import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import {
  liquidGlass,
  glassShadows,
} from '../../constants/liquidGlass';

type AvatarSize = 'small' | 'medium' | 'large' | 'xlarge';

interface AvatarProps {
  uri?: string | null;
  name?: string | null;
  size?: AvatarSize;
  onPress?: () => void;
  style?: ViewStyle;
  // Liquid Glass options
  withGlassRing?: boolean;
  ringColor?: 'gradient' | 'glass' | 'none';
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

const ringWidthMap: Record<AvatarSize, number> = {
  small: 2,
  medium: 2,
  large: 3,
  xlarge: 4,
};

export function Avatar({
  uri,
  name,
  size = 'medium',
  onPress,
  style,
  withGlassRing = false,
  ringColor = 'none',
}: AvatarProps) {
  const dimension = sizeMap[size];
  const fontSize = fontSizeMap[size];
  const ringWidth = ringWidthMap[size];
  const ringPadding = withGlassRing || ringColor !== 'none' ? ringWidth + 2 : 0;
  const totalDimension = dimension + ringPadding * 2;

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
      width: totalDimension,
      height: totalDimension,
      borderRadius: totalDimension / 2,
    },
    style,
  ];

  const renderRing = () => {
    if (ringColor === 'gradient') {
      return (
        <View style={[styles.ringContainer, { borderRadius: totalDimension / 2 }]}>
          <LinearGradient
            colors={colors.primaryGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </View>
      );
    }
    
    if (ringColor === 'glass' || withGlassRing) {
      return (
        <View style={[styles.ringContainer, { borderRadius: totalDimension / 2 }]}>
          {Platform.OS === 'ios' && (
            <BlurView
              intensity={liquidGlass.blur.light}
              tint="light"
              style={StyleSheet.absoluteFill}
            />
          )}
          <View style={styles.glassRingBg} />
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.4)', 'rgba(255, 255, 255, 0.1)']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </View>
      );
    }

    return null;
  };

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
        },
      ]}
    >
      {/* Gradient background for placeholder */}
      <LinearGradient
        colors={colors.primaryGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Glass highlight */}
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.3)', 'transparent']}
        style={styles.placeholderHighlight}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.6 }}
      />
      <Text style={[styles.initials, { fontSize }]}>{getInitials()}</Text>
    </View>
  );

  const content = (
    <>
      {renderRing()}
      <View
        style={[
          styles.avatarWrapper,
          {
            width: dimension,
            height: dimension,
            borderRadius: dimension / 2,
            top: ringPadding,
            left: ringPadding,
          },
        ]}
      >
        {avatarContent}
      </View>
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

// Avatar with glass ring convenience component
export function GlassAvatar(props: Omit<AvatarProps, 'ringColor'>) {
  return <Avatar {...props} ringColor="glass" />;
}

// Avatar with gradient ring convenience component
export function GradientAvatar(props: Omit<AvatarProps, 'ringColor'>) {
  return <Avatar {...props} ringColor="gradient" />;
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
  ringContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  glassRingBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: liquidGlass.material.subtle.backgroundColor,
    borderWidth: liquidGlass.border.width,
    borderColor: liquidGlass.border.colorStrong,
  },
  avatarWrapper: {
    position: 'absolute',
    overflow: 'hidden',
  },
  image: {
    backgroundColor: colors.surface,
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  placeholderHighlight: {
    ...StyleSheet.absoluteFillObject,
    height: '60%',
  },
  initials: {
    color: colors.white,
    fontWeight: typography.weights.semibold,
    zIndex: 1,
  },
});
