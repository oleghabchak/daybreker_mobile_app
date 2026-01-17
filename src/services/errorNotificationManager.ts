import Toast from 'react-native-toast-message';

class ErrorNotificationManager {
  private static instance: ErrorNotificationManager;

  private constructor() {}

  static getInstance(): ErrorNotificationManager {
    if (!ErrorNotificationManager.instance) {
      ErrorNotificationManager.instance = new ErrorNotificationManager();
    }
    return ErrorNotificationManager.instance;
  }

  // User-friendly error messages mapping
  private errorMessages: Record<string, string> = {
    // Google Sign-In errors
    'getTokens requires a user to be signed in':
      'Please sign in with Google first',
    'Google Sign-In Error': 'Unable to sign in with Google. Please try again.',
    SIGN_IN_CANCELLED: 'Sign in cancelled',
    IN_PROGRESS: 'Sign in already in progress',
    PLAY_SERVICES_NOT_AVAILABLE:
      'Google Play Services not available on this device',

    // Auth errors
    'Invalid login credentials':
      'Incorrect email or password. Please try again.',
    'User already registered': 'An account with this email already exists',
    'Email not confirmed': 'Please check your email to confirm your account',
    'This account has been deleted and cannot be accessed':
      'This account has been deleted and cannot be accessed',
    'Auth session missing!': 'Please sign in again',
    'Session expired': 'Your session has expired. Please sign in again',

    // Network errors
    NetworkError: 'No internet connection. Please check your network.',
    'Failed to fetch': 'Unable to connect to server. Please try again.',

    // Form errors
    'Password should be at least 6 characters':
      'Password must be at least 6 characters long',
    'Invalid email': 'Please enter a valid email address',

    // Default
    'Unknown error': 'Something went wrong. Please try again.',
  };

  showError(error: any, customMessage?: string) {
    let message = customMessage || this.getReadableError(error);

    // Ensure message is not too long
    if (message.length > 100) {
      message = message.substring(0, 97) + '...';
    }

    Toast.show({
      type: 'error',
      text1: 'Error',
      text2: message,
      visibilityTime: 4000,
      autoHide: true,
    });
  }

  showSuccess(message: string) {
    Toast.show({
      type: 'success',
      text1: 'Success',
      text2: message,
      visibilityTime: 3000,
      autoHide: true,
    });
  }

  showInfo(message: string) {
    Toast.show({
      type: 'info',
      text1: 'Info',
      text2: message,
      visibilityTime: 3000,
      autoHide: true,
    });
  }

  showWarning(message: string) {
    Toast.show({
      type: 'error', // Toast doesn't have a warning type, so we use error styling
      text1: 'Warning',
      text2: message,
      visibilityTime: 4000,
      autoHide: true,
    });
  }

  private getReadableError(error: any): string {
    // Extract error message from various error formats
    let errorKey = '';

    if (typeof error === 'string') {
      errorKey = error;
    } else if (error?.message) {
      errorKey = error.message;
    } else if (error?.error?.message) {
      errorKey = error.error.message;
    } else if (error?.code) {
      errorKey = error.code;
    }

    // Check if we have a user-friendly version
    for (const [key, friendlyMessage] of Object.entries(this.errorMessages)) {
      if (errorKey.includes(key)) {
        return friendlyMessage;
      }
    }

    // If no match found, try to clean up the technical message
    if (errorKey) {
      // Remove technical prefixes
      errorKey = errorKey.replace(/^Error:\s*/i, '');
      errorKey = errorKey.replace(/^Failed to\s*/i, 'Unable to ');

      // Capitalize first letter
      return errorKey.charAt(0).toUpperCase() + errorKey.slice(1);
    }

    return 'Something went wrong. Please try again.';
  }
}

export const errorManager = ErrorNotificationManager.getInstance();
