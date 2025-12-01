import { config } from '../constants/config';

// Email validation
export function validateEmail(email: string): {
  isValid: boolean;
  error?: string;
} {
  const trimmedEmail = email.trim();

  if (!trimmedEmail) {
    return { isValid: false, error: 'Email is required.' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    return { isValid: false, error: 'Please enter a valid email address.' };
  }

  return { isValid: true };
}

// Password validation
export function validatePassword(password: string): {
  isValid: boolean;
  error?: string;
} {
  if (!password) {
    return { isValid: false, error: 'Password is required.' };
  }

  if (password.length < config.PASSWORD.MIN_LENGTH) {
    return {
      isValid: false,
      error: `Password must be at least ${config.PASSWORD.MIN_LENGTH} characters.`,
    };
  }

  return { isValid: true };
}

// Confirm password validation
export function validateConfirmPassword(
  password: string,
  confirmPassword: string
): {
  isValid: boolean;
  error?: string;
} {
  if (!confirmPassword) {
    return { isValid: false, error: 'Please confirm your password.' };
  }

  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match.' };
  }

  return { isValid: true };
}

// Username validation
export function validateUsername(username: string): {
  isValid: boolean;
  error?: string;
} {
  const trimmedUsername = username.trim().toLowerCase();

  if (!trimmedUsername) {
    return { isValid: false, error: 'Username is required.' };
  }

  if (trimmedUsername.length < config.USERNAME.MIN_LENGTH) {
    return {
      isValid: false,
      error: `Username must be at least ${config.USERNAME.MIN_LENGTH} characters.`,
    };
  }

  if (trimmedUsername.length > config.USERNAME.MAX_LENGTH) {
    return {
      isValid: false,
      error: `Username must be no more than ${config.USERNAME.MAX_LENGTH} characters.`,
    };
  }

  if (!config.USERNAME.PATTERN.test(trimmedUsername)) {
    return {
      isValid: false,
      error: config.USERNAME.RULES,
    };
  }

  return { isValid: true };
}

// Caption validation
export function validateCaption(caption: string): {
  isValid: boolean;
  error?: string;
  length: number;
} {
  const length = caption.length;

  if (length > config.MAX_CAPTION_LENGTH) {
    return {
      isValid: false,
      error: `Caption must be no more than ${config.MAX_CAPTION_LENGTH} characters.`,
      length,
    };
  }

  return { isValid: true, length };
}

// Sign up form validation
export function validateSignUpForm(
  email: string,
  password: string,
  confirmPassword: string
): {
  isValid: boolean;
  errors: {
    email?: string;
    password?: string;
    confirmPassword?: string;
  };
} {
  const emailResult = validateEmail(email);
  const passwordResult = validatePassword(password);
  const confirmResult = validateConfirmPassword(password, confirmPassword);

  const errors: {
    email?: string;
    password?: string;
    confirmPassword?: string;
  } = {};

  if (!emailResult.isValid) {
    errors.email = emailResult.error;
  }

  if (!passwordResult.isValid) {
    errors.password = passwordResult.error;
  }

  if (!confirmResult.isValid) {
    errors.confirmPassword = confirmResult.error;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// Login form validation
export function validateLoginForm(
  email: string,
  password: string
): {
  isValid: boolean;
  errors: {
    email?: string;
    password?: string;
  };
} {
  const emailResult = validateEmail(email);

  const errors: {
    email?: string;
    password?: string;
  } = {};

  if (!emailResult.isValid) {
    errors.email = emailResult.error;
  }

  if (!password) {
    errors.password = 'Password is required.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// File size validation (in bytes)
export function validateFileSize(
  sizeInBytes: number,
  maxSizeMB: number = config.MAX_MEDIA_SIZE_MB
): {
  isValid: boolean;
  error?: string;
} {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (sizeInBytes > maxSizeBytes) {
    return {
      isValid: false,
      error: `File size must be less than ${maxSizeMB}MB.`,
    };
  }

  return { isValid: true };
}

// Debounce helper
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
    }, wait);
  };
}
