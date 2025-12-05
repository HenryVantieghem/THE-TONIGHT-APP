/**
 * Scena - Error Handling
 * User-friendly error messages and custom error classes
 */

// Custom error classes
export class NetworkError extends Error {
  constructor(message: string = 'network issue, check connection') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class AuthError extends Error {
  constructor(message: string = 'authentication failed') {
    super(message);
    this.name = 'AuthError';
  }
}

export class StorageError extends Error {
  constructor(message: string = 'upload failed') {
    super(message);
    this.name = 'StorageError';
  }
}

export class ValidationError extends Error {
  constructor(message: string = 'invalid input') {
    super(message);
    this.name = 'ValidationError';
  }
}

// Map technical errors to user-friendly messages
export const getErrorMessage = (error: any): string => {
  // Handle custom errors
  if (error instanceof NetworkError || 
      error instanceof AuthError || 
      error instanceof StorageError ||
      error instanceof ValidationError) {
    return error.message;
  }

  // Handle Supabase auth errors
  if (error?.message?.includes('Invalid login credentials')) {
    return 'incorrect email or password';
  }
  
  if (error?.message?.includes('User already registered')) {
    return 'email already registered';
  }
  
  if (error?.message?.includes('Email not confirmed')) {
    return 'please verify your email';
  }

  if (error?.message?.includes('duplicate key')) {
    return 'username already taken';
  }

  // Handle network errors
  if (error?.message?.includes('fetch') || 
      error?.message?.includes('network') ||
      error?.message?.includes('Failed to fetch')) {
    return 'network issue, check connection';
  }

  // Storage errors
  if (error?.message?.includes('storage') || 
      error?.message?.includes('upload')) {
    return 'upload failed, try again';
  }

  // Generic fallback
  if (error?.message) {
    return error.message.toLowerCase();
  }

  return 'something went wrong, try again';
};

// Log errors (in dev mode)
export const logError = (error: any, context?: string) => {
  if (__DEV__) {
    console.error(`[${context || 'Error'}]:`, error);
  }
};

