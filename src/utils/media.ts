import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

export interface CompressedMedia {
  uri: string;
  width: number;
  height: number;
  size: number;
}

/**
 * Compress an image for upload
 * - Resize to max 1080px on longest side
 * - Compress quality to 0.7
 * - Convert to JPEG
 */
export async function compressImage(uri: string): Promise<CompressedMedia> {
  try {
    // Get original file info
    const originalInfo = await FileSystem.getInfoAsync(uri);
    const originalSize = originalInfo.exists ? (originalInfo.size || 0) : 0;

    // If already small enough (< 500KB), just return it
    if (originalSize < 500 * 1024) {
      return {
        uri,
        width: 0,
        height: 0,
        size: originalSize,
      };
    }

    // Compress the image
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1080 } }], // Resize to max 1080px width
      {
        compress: 0.7, // 70% quality
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    // Get compressed file info
    const compressedInfo = await FileSystem.getInfoAsync(result.uri);
    const compressedSize = compressedInfo.exists ? (compressedInfo.size || 0) : 0;

    console.log(
      `Image compressed: ${(originalSize / 1024).toFixed(0)}KB → ${(compressedSize / 1024).toFixed(0)}KB (${((1 - compressedSize / originalSize) * 100).toFixed(0)}% reduction)`
    );

    return {
      uri: result.uri,
      width: result.width,
      height: result.height,
      size: compressedSize,
    };
  } catch (error) {
    console.error('Image compression error:', error);
    // Return original if compression fails
    return {
      uri,
      width: 0,
      height: 0,
      size: 0,
    };
  }
}

/**
 * Prepare media for upload
 * - Images: compress and resize
 * - Videos: return as-is (compression happens at capture time)
 */
export async function prepareMediaForUpload(
  uri: string,
  type: 'image' | 'video'
): Promise<{ uri: string; size: number }> {
  if (type === 'image') {
    const compressed = await compressImage(uri);
    return { uri: compressed.uri, size: compressed.size };
  }

  // For videos, just return the URI
  // Video compression would require expo-video or ffmpeg which adds significant bundle size
  const info = await FileSystem.getInfoAsync(uri);
  return {
    uri,
    size: info.exists ? (info.size || 0) : 0,
  };
}

/**
 * Generate a thumbnail from a video
 * Note: Video thumbnails are not currently supported
 * Videos use the first frame captured by the camera as thumbnail
 */
export async function generateVideoThumbnail(
  _videoUri: string
): Promise<string | null> {
  // Video thumbnail generation would require expo-video-thumbnails
  // which adds significant bundle size. For now, we return null
  // and let the UI handle missing thumbnails gracefully.
  return null;
}

/**
 * Get file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Check if file is too large for upload
 */
export function isFileTooLarge(bytes: number, maxMB: number = 10): boolean {
  return bytes > maxMB * 1024 * 1024;
}
