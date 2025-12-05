/**
 * Scena - useAuth Hook
 * Authentication state and operations
 */

import { useState } from 'react';
import { authService, SignUpData, SignInData } from '../services/auth.service';
import { profileService } from '../services/profile.service';
import { getErrorMessage } from '../utils/errors';
import { toast } from '../utils/toast';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signUp = async (data: SignUpData) => {
    setLoading(true);
    setError(null);

    try {
      await authService.signUp(data);
      toast.success('account created');
      return true;
    } catch (err: any) {
      const message = getErrorMessage(err);
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (data: SignInData) => {
    setLoading(true);
    setError(null);

    try {
      await authService.signIn(data);
      toast.success('welcome back');
      return true;
    } catch (err: any) {
      const message = getErrorMessage(err);
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    setError(null);

    try {
      await authService.signOut();
      toast.info('signed out');
      return true;
    } catch (err: any) {
      const message = getErrorMessage(err);
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    setError(null);

    try {
      await authService.resetPassword(email);
      toast.success('reset email sent');
      return true;
    } catch (err: any) {
      const message = getErrorMessage(err);
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const checkUsernameAvailability = async (username: string): Promise<boolean> => {
    try {
      return await profileService.checkUsernameAvailable(username);
    } catch (err) {
      return false;
    }
  };

  return {
    loading,
    error,
    signUp,
    signIn,
    signOut,
    resetPassword,
    checkUsernameAvailability,
  };
};

