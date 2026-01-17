import { Alert, Platform } from 'react-native';

export interface SupabaseError {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
}

/**
 * Utility to handle Supabase errors consistently across the app
 */
export class SupabaseErrorHandler {
  /**
   * Check if an error is a Supabase error
   */
  static isSupabaseError(error: any): boolean {
    return (
      error?.message?.includes('supabase') ||
      error?.message?.includes('auth') ||
      error?.message?.includes('database') ||
      error?.message?.includes('postgres') ||
      error?.message?.includes('network') ||
      error?.message?.includes('fetch') ||
      error?.code?.startsWith('PGRST') ||
      error?.code?.startsWith('AUTH')
    );
  }

  /**
   * Extract error information from Supabase errors
   */
  static extractErrorInfo(error: any): SupabaseError {
    if (typeof error === 'string') {
      return { message: error };
    }

    if (error?.message) {
      return {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      };
    }

    return {
      message: 'An unexpected error occurred',
    };
  }

  /**
   * Get user-friendly error message
   */
  static getUserFriendlyMessage(error: any): string {
    const errorInfo = this.extractErrorInfo(error);

    // Handle common Supabase error codes
    if (errorInfo.code) {
      switch (errorInfo.code) {
        case 'PGRST301':
          return 'Database connection failed. Please try again.';
        case 'PGRST302':
          return 'Request timeout. Please check your connection and try again.';
        case 'AUTH_INVALID_CREDENTIALS':
          return 'Invalid email or password. Please check your credentials.';
        case 'AUTH_USER_NOT_FOUND':
          return 'Account not found. Please check your email address.';
        case 'AUTH_TOO_MANY_REQUESTS':
          return 'Too many login attempts. Please wait a moment and try again.';
        case 'AUTH_INVALID_EMAIL':
          return 'Please enter a valid email address.';
        case 'AUTH_WEAK_PASSWORD':
          return 'Password is too weak. Please choose a stronger password.';
        default:
          break;
      }
    }

    // Handle common error messages
    const message = errorInfo.message.toLowerCase();
    if (message.includes('network') || message.includes('fetch')) {
      return 'Network error. Please check your internet connection and try again.';
    }

    if (message.includes('timeout')) {
      return 'Request timeout. Please try again.';
    }

    if (message.includes('unauthorized') || message.includes('forbidden')) {
      return 'Access denied. Please check your permissions.';
    }

    // Return the original message if no specific handling
    return errorInfo.message;
  }

  /**
   * Log error for debugging
   */
  static logError(error: any, context: string = 'Supabase'): void {
    const errorInfo = this.extractErrorInfo(error);

    console.error(`${context} Error:`, {
      message: errorInfo.message,
      code: errorInfo.code,
      details: errorInfo.details,
      hint: errorInfo.hint,
      timestamp: new Date().toISOString(),
      context,
    });
  }

  /**
   * Show error as alert (fallback for when ErrorNotification is not available)
   */
  static showErrorAlert(error: any, title: string = 'Error'): void {
    if (Platform.OS === 'web') {
      console.error(title, error);
      return;
    }

    const message = this.getUserFriendlyMessage(error);

    Alert.alert(title, message, [
      {
        text: 'OK',
        style: 'default',
      },
    ]);
  }

  /**
   * Handle error gracefully - log it and optionally show to user
   */
  static handleError(
    error: any,
    context: string = 'Supabase',
    showToUser: boolean = false
  ): SupabaseError {
    const errorInfo = this.extractErrorInfo(error);

    // Always log the error
    this.logError(error, context);

    // Show to user if requested
    if (showToUser) {
      this.showErrorAlert(error, context);
    }

    return errorInfo;
  }

  /**
   * Check if error is recoverable (user can retry)
   */
  static isRecoverableError(error: any): boolean {
    const errorInfo = this.extractErrorInfo(error);

    // Network errors are usually recoverable
    if (errorInfo.message.toLowerCase().includes('network')) {
      return true;
    }

    // Timeout errors are usually recoverable
    if (errorInfo.message.toLowerCase().includes('timeout')) {
      return true;
    }

    // Database connection errors might be recoverable
    if (errorInfo.code?.startsWith('PGRST')) {
      return true;
    }

    // Auth errors are usually not recoverable without user action
    if (errorInfo.code?.startsWith('AUTH')) {
      return false;
    }

    // Default to not recoverable
    return false;
  }
}

// Export singleton instance for easy use
export const supabaseErrorHandler = SupabaseErrorHandler;

// Export convenience functions
export const isSupabaseError = SupabaseErrorHandler.isSupabaseError;
export const getUserFriendlyMessage =
  SupabaseErrorHandler.getUserFriendlyMessage;
export const handleSupabaseError = SupabaseErrorHandler.handleError;
