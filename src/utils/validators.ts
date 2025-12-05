/**
 * Scena - Input Validators
 * Clean, simple validation helpers
 */

export const validators = {
  // Email validation (basic but effective)
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  },

  // Username validation (3-20 chars, alphanumeric + underscore)
  username: (username: string): { valid: boolean; message?: string } => {
    const cleaned = username.trim();
    
    if (cleaned.length < 3) {
      return { valid: false, message: 'too short (min 3 chars)' };
    }
    
    if (cleaned.length > 20) {
      return { valid: false, message: 'too long (max 20 chars)' };
    }
    
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(cleaned)) {
      return { valid: false, message: 'letters, numbers, underscore only' };
    }
    
    return { valid: true };
  },

  // Password strength (min 8 chars)
  password: (password: string): { valid: boolean; message?: string } => {
    if (password.length < 8) {
      return { valid: false, message: 'too short (min 8 chars)' };
    }
    
    return { valid: true };
  },

  // Caption length (max 200 chars)
  caption: (caption: string): boolean => {
    return caption.length <= 200;
  },

  // Sanitize text input (remove extra whitespace, trim)
  sanitizeText: (text: string): string => {
    return text.trim().replace(/\s+/g, ' ');
  },
};

export default validators;

