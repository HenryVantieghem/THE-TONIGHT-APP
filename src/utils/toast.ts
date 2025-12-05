/**
 * Scena - Toast Notifications
 * Simple toast helper (to be integrated with Toast component)
 */

// Toast state management (simple singleton)
type ToastListener = (message: string, type: 'success' | 'error' | 'info') => void;

let toastListener: ToastListener | null = null;

export const toast = {
  // Set the listener (called by Toast component)
  setListener: (listener: ToastListener) => {
    toastListener = listener;
  },

  // Clear the listener
  clearListener: () => {
    toastListener = null;
  },

  // Show success message
  success: (message: string) => {
    if (toastListener) {
      toastListener(message, 'success');
    } else if (__DEV__) {
      console.log('✅', message);
    }
  },

  // Show error message
  error: (message: string) => {
    if (toastListener) {
      toastListener(message, 'error');
    } else if (__DEV__) {
      console.error('❌', message);
    }
  },

  // Show info message
  info: (message: string) => {
    if (toastListener) {
      toastListener(message, 'info');
    } else if (__DEV__) {
      console.log('ℹ️', message);
    }
  },
};

export default toast;

