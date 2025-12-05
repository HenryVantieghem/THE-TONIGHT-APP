/**
 * Scena - Authentication Service
 * Handle user auth with Supabase
 */

import { supabase } from './supabase';
import { profileService } from './profile.service';
import { AuthError, logError } from '../utils/errors';
import { validators } from '../utils/validators';

export interface SignUpData {
  email: string;
  password: string;
  username: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export const authService = {
  /**
   * Sign up new user
   */
  signUp: async (data: SignUpData) => {
    const { email, password, username } = data;

    // Validate inputs
    if (!validators.email(email)) {
      throw new AuthError('invalid email');
    }

    const usernameCheck = validators.username(username);
    if (!usernameCheck.valid) {
      throw new AuthError(usernameCheck.message);
    }

    const passwordCheck = validators.password(password);
    if (!passwordCheck.valid) {
      throw new AuthError(passwordCheck.message);
    }

    try {
      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: validators.sanitizeText(username),
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new AuthError('signup failed');

      // Ensure profile is created/updated with username
      // The trigger should create it, but we'll update it to ensure username is set
      try {
        await profileService.updateProfile({ username });
      } catch (profileError) {
        // Profile might not exist yet, try creating it
        logError(profileError, 'authService.signUp - profile update');
      }

      return authData.user;
    } catch (error) {
      logError(error, 'authService.signUp');
      throw error;
    }
  },

  /**
   * Sign in existing user
   */
  signIn: async (data: SignInData) => {
    const { email, password } = data;

    if (!validators.email(email)) {
      throw new AuthError('invalid email');
    }

    if (!password) {
      throw new AuthError('password required');
    }

    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (!authData.user) throw new AuthError('sign in failed');

      return authData.user;
    } catch (error) {
      logError(error, 'authService.signIn');
      throw error;
    }
  },

  /**
   * Sign out current user
   */
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      logError(error, 'authService.signOut');
      throw error;
    }
  },

  /**
   * Send password reset email
   */
  resetPassword: async (email: string) => {
    if (!validators.email(email)) {
      throw new AuthError('invalid email');
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'scena://reset-password',
      });

      if (error) throw error;
    } catch (error) {
      logError(error, 'authService.resetPassword');
      throw error;
    }
  },

  /**
   * Get current authenticated user
   */
  getCurrentUser: async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    } catch (error) {
      logError(error, 'authService.getCurrentUser');
      return null;
    }
  },

  /**
   * Get current session
   */
  getSession: async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    } catch (error) {
      logError(error, 'authService.getSession');
      return null;
    }
  },

  /**
   * Listen to auth state changes
   */
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    const { data } = supabase.auth.onAuthStateChange(callback);
    return data.subscription;
  },
};

export default authService;

