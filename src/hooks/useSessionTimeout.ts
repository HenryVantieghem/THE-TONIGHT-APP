import { useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { supabase } from '../services/supabase';
import { signOut } from '../services/auth';
import { useStore } from '../stores/useStore';

// Session timeout in milliseconds (30 minutes of inactivity)
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
// Check interval (every 5 minutes)
const CHECK_INTERVAL_MS = 5 * 60 * 1000;

/**
 * Hook to manage session timeout and automatic logout
 * - Checks session validity on app foreground
 * - Logs out after 30 minutes of inactivity
 * - Validates session token periodically
 */
export function useSessionTimeout() {
  const { isAuthenticated, reset } = useStore();
  const lastActivityRef = useRef<number>(Date.now());
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Update last activity timestamp
  const updateActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  // Check if session is valid
  const checkSession = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      // Check if session has timed out due to inactivity
      const timeSinceLastActivity = Date.now() - lastActivityRef.current;
      if (timeSinceLastActivity > SESSION_TIMEOUT_MS) {
        console.log('Session timed out due to inactivity');
        await signOut();
        reset();
        return;
      }

      // Verify session is still valid with Supabase
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        console.log('Session invalid or expired');
        await signOut();
        reset();
        return;
      }

      // Check if token is about to expire (within 5 minutes)
      const expiresAt = session.expires_at;
      if (expiresAt) {
        const expiresAtMs = expiresAt * 1000;
        const timeUntilExpiry = expiresAtMs - Date.now();

        if (timeUntilExpiry < CHECK_INTERVAL_MS) {
          // Attempt to refresh the session
          const { error: refreshError } = await supabase.auth.refreshSession();
          if (refreshError) {
            console.log('Failed to refresh session:', refreshError);
            await signOut();
            reset();
          }
        }
      }
    } catch (err) {
      console.error('Session check error:', err);
    }
  }, [isAuthenticated, reset]);

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // App came to foreground - check session and update activity
        updateActivity();
        await checkSession();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [checkSession, updateActivity]);

  // Periodic session check
  useEffect(() => {
    if (!isAuthenticated) {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
      return;
    }

    // Initial check
    checkSession();

    // Set up periodic check
    checkIntervalRef.current = setInterval(checkSession, CHECK_INTERVAL_MS);

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
    };
  }, [isAuthenticated, checkSession]);

  return { updateActivity };
}
