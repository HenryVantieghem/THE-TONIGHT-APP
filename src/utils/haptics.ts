/**
 * Scena - Haptics Utility
 * Wrapper for haptic feedback with proper error handling
 */

import * as Haptics from 'expo-haptics';

/**
 * Trigger haptic feedback with error handling
 * Logs errors in development mode but fails gracefully in production
 */
export const triggerHaptic = async (
  type: 'selection' | 'light' | 'medium' | 'success'
): Promise<void> => {
  try {
    switch (type) {
      case 'selection':
        await Haptics.selectionAsync();
        break;
      case 'light':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'success':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
    }
  } catch (error) {
    // Log in development only
    if (__DEV__) {
      console.warn('Haptic feedback failed:', error);
    }
    // Fail silently in production
  }
};

export default {
  triggerHaptic,
};

