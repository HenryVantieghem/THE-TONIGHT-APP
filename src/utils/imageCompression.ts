/**
 * Scena - Image Compression
 * Compress and resize images before upload
 */

import * as ImageManipulator from 'expo-image-manipulator';

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

/**
 * Compress and resize an image
 */
export const compressImage = async (
  uri: string,
  options: CompressionOptions = {}
): Promise<string> => {
  const {
    maxWidth = 2048,
    maxHeight = 2048,
    quality = 0.8,
  } = options;

  try {
    const manipulatedImage = await ImageManipulator.manipulateAsync(
      uri,
      [
        {
          resize: {
            width: maxWidth,
            height: maxHeight,
          },
        },
      ],
      {
        compress: quality,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    return manipulatedImage.uri;
  } catch (error) {
    if (__DEV__) {
      console.error('Image compression error:', error);
    }
    // Return original URI if compression fails
    return uri;
  }
};

/**
 * Generate thumbnail for avatar (small, square)
 */
export const generateThumbnail = async (uri: string): Promise<string> => {
  try {
    const manipulatedImage = await ImageManipulator.manipulateAsync(
      uri,
      [
        {
          resize: {
            width: 256,
            height: 256,
          },
        },
      ],
      {
        compress: 0.7,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    return manipulatedImage.uri;
  } catch (error) {
    if (__DEV__) {
      console.error('Thumbnail generation error:', error);
    }
    return uri;
  }
};

/**
 * Get image dimensions without loading full image
 */
export const getImageDimensions = (uri: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    if (typeof Image !== 'undefined') {
      // Web
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = reject;
      img.src = uri;
    } else {
      // Native - use Image.getSize from react-native
      const { Image } = require('react-native');
      Image.getSize(
        uri,
        (width: number, height: number) => resolve({ width, height }),
        reject
      );
    }
  });
};

