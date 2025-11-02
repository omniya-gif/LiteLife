type ValidationResult = string | undefined;

export class Validators {
  static validateUsername(username: string): ValidationResult {
    // Remove whitespace from both ends
    const trimmedUsername = username.trim();
    
    // Check for minimum length
    if (trimmedUsername.length < 3) {
      return 'Username must be at least 3 characters long';
    }

    // Check for maximum length
    if (trimmedUsername.length > 30) {
      return 'Username must be less than 30 characters';
    }

    // Check if it looks like an email
    if (trimmedUsername.includes('@')) {
      return 'Username cannot be an email address';
    }

    // Check for valid characters (letters, numbers, underscores, and hyphens only)
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmedUsername)) {
      return 'Username can only contain letters, numbers, underscores, and hyphens';
    }

    // Check if username starts with a number
    if (/^[0-9]/.test(trimmedUsername)) {
      return 'Username cannot start with a number';
    }

    return undefined;
  }
}

export const { validateUsername } = Validators;
