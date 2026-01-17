import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors, Spacing, Typography } from '../constants/theme';

import { Button } from './ui';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Check if it's a Supabase-related error
    const isSupabaseError = this.isSupabaseError(error);

    this.setState({
      hasError: true,
      error,
      errorInfo,
    });

    // Log additional context for Supabase errors
    if (isSupabaseError) {
      console.error('Supabase Error Details:', {
        message: error.message,
        stack: error.stack,
        errorInfo,
        timestamp: new Date().toISOString(),
      });
    }
  }

  private isSupabaseError(error: unknown): boolean {
    const message =
      typeof error === 'object' && error && 'message' in error
        ? String((error as any).message)
        : '';
    const stack =
      typeof error === 'object' && error && 'stack' in error
        ? String((error as any).stack)
        : '';
    const errorMessage = message.toLowerCase();
    const errorStack = stack.toLowerCase();

    return (
      errorMessage.includes('supabase') ||
      errorMessage.includes('auth') ||
      errorMessage.includes('database') ||
      errorMessage.includes('postgres') ||
      errorMessage.includes('network') ||
      errorMessage.includes('fetch') ||
      errorStack.includes('supabase') ||
      errorStack.includes('auth') ||
      errorStack.includes('database')
    );
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            We apologize for the inconvenience. Please try restarting the app.
          </Text>
          <Button onPress={() => this.setState({ hasError: false })}>
            <Text style={styles.buttonText}>Restart App</Text>
          </Button>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.background,
  },
  title: {
    ...Typography.h2,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  message: {
    ...Typography.body,
    color: Colors.textDisabled,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },

  buttonText: {
    ...Typography.bodyMedium,
    color: Colors.background,
  },
});
