# Zustand Authentication Store Setup

This document explains how to use the new Zustand-based authentication store that replaces the previous MobX State Tree authentication system.

## Overview

The new authentication store provides:

- **Email/Password Authentication**: Sign up, sign in, password reset
- **Social Authentication**: Google, Apple, Facebook sign-in
- **Session Management**: Automatic session refresh and user state persistence
- **TypeScript Support**: Full type safety with Supabase types
- **Persistence**: Automatic state persistence using AsyncStorage
- **Error Handling**: Comprehensive error handling and user feedback

## Features

### Core Authentication

- `signInWithEmail(email, password)` - Email/password sign in
- `signUpWithEmail(email, password, fullName)` - Email/password sign up
- `signOut()` - Sign out and clear session
- `resetPassword(email)` - Send password reset email
- `updatePassword(newPassword)` - Update user password

### Social Authentication

- `signInWithGoogle()` - Google OAuth sign in
- `signInWithApple()` - Apple OAuth sign in
- `signInWithFacebook()` - Facebook OAuth sign in

### Session Management

- `refreshSession()` - Refresh authentication session
- `getCurrentUser()` - Get current authenticated user
- `updateProfile(updates)` - Update user profile data

### State Management

- `setLoading(loading)` - Set loading state
- `setError(error)` - Set error message
- `clearError()` - Clear error message
- `setOnboarding(isOnboarding)` - Set onboarding state

## Installation

The Zustand authentication store is already installed and configured. It uses:

- `zustand` - State management library
- `@supabase/supabase-js` - Supabase client
- `@react-native-async-storage/async-storage` - Storage persistence

## Basic Usage

### 1. Import the Store

```typescript
import { useAuthStore } from '../models/AuthenticationStore';
```

### 2. Use Selector Hooks

```typescript
import {
  useAuthUser,
  useIsAuthenticated,
  useIsLoading,
  useAuthError,
} from '../models/AuthenticationStore';

const MyComponent = () => {
  const user = useAuthUser();
  const isAuthenticated = useIsAuthenticated();
  const isLoading = useIsLoading();
  const error = useAuthError();

  // Component logic...
};
```

### 3. Use Action Hooks

```typescript
import { useAuthActions } from '../models/AuthenticationStore';

const MyComponent = () => {
  const { signInWithEmail, signOut, signInWithGoogle } = useAuthActions();

  const handleSignIn = async () => {
    const result = await signInWithEmail('user@example.com', 'password');
    if (result.success) {
      // Navigate to main app
    } else {
      // Handle error
      console.error(result.error);
    }
  };
};
```

### 4. Complete Example

```typescript
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useAuthStore, useAuthUser, useIsAuthenticated } from '../models/AuthenticationStore';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const user = useAuthUser();
  const isAuthenticated = useIsAuthenticated();
  const { signInWithEmail, isLoading, error } = useAuthStore();

  const handleLogin = async () => {
    const result = await signInWithEmail(email, password);
    if (result.success) {
      // Navigate to main app
    }
  };

  if (isAuthenticated) {
    return (
      <View>
        <Text>Welcome, {user?.email}!</Text>
      </View>
    );
  }

  return (
    <View>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity onPress={handleLogin} disabled={isLoading}>
        <Text>{isLoading ? 'Loading...' : 'Sign In'}</Text>
      </TouchableOpacity>
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
    </View>
  );
};
```

## Advanced Usage

### Custom Selectors

```typescript
import { useAuthStore } from '../models/AuthenticationStore';

const MyComponent = () => {
  // Custom selector for specific user data
  const userEmail = useAuthStore(state => state.user?.email);
  const isPremium = useAuthStore(state => state.user?.user_metadata?.isPremium);

  // Multiple values in one selector
  const authState = useAuthStore(state => ({
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    hasError: !!state.error,
  }));
};
```

### Side Effects

```typescript
import { useEffect } from 'react';
import { useAuthStore } from '../models/AuthenticationStore';

const MyComponent = () => {
  const { getCurrentUser, refreshSession } = useAuthStore();

  useEffect(() => {
    // Check current user on mount
    getCurrentUser();

    // Set up session refresh interval
    const interval = setInterval(refreshSession, 1000 * 60 * 60); // 1 hour

    return () => clearInterval(interval);
  }, [getCurrentUser, refreshSession]);
};
```

### Error Handling

```typescript
import { useAuthStore } from '../models/AuthenticationStore';

const MyComponent = () => {
  const { error, clearError } = useAuthStore();

  useEffect(() => {
    if (error) {
      // Show error toast/alert
      Alert.alert('Authentication Error', error);
      // Clear error after showing
      clearError();
    }
  }, [error, clearError]);
};
```

## State Structure

```typescript
interface AuthState {
  // User data
  user: User | null;
  session: Session | null;

  // Authentication state
  isAuthenticated: boolean;
  isLoading: boolean;
  isOnboarding: boolean;

  // Error handling
  error: string | null;

  // Social auth state
  isSocialAuthLoading: boolean;
  socialAuthProvider: 'google' | 'apple' | 'facebook' | null;
}
```

## Persistence

The store automatically persists:

- `user` - User data
- `session` - Session information
- `isAuthenticated` - Authentication state
- `isOnboarding` - Onboarding status

Data is stored using AsyncStorage and automatically restored on app restart.

## Migration from MobX

### Before (MobX State Tree)

```typescript
import { observer } from 'mobx-react-lite';
import { useStores } from '../models/helpers/useStores';

const MyComponent = observer(() => {
  const { authenticationStore } = useStores();

  const handleLogin = () => {
    authenticationStore.signInWithEmail(email, password);
  };

  return (
    <View>
      {authenticationStore.isLoading && <Text>Loading...</Text>}
      {authenticationStore.user && <Text>Welcome {authenticationStore.user.email}</Text>}
    </View>
  );
});
```

### After (Zustand)

```typescript
import { useAuthStore, useAuthUser, useIsLoading } from '../models/AuthenticationStore';

const MyComponent = () => {
  const { signInWithEmail } = useAuthStore();
  const user = useAuthUser();
  const isLoading = useIsLoading();

  const handleLogin = async () => {
    const result = await signInWithEmail(email, password);
    if (result.success) {
      // Handle success
    }
  };

  return (
    <View>
      {isLoading && <Text>Loading...</Text>}
      {user && <Text>Welcome {user.email}</Text>}
    </View>
  );
};
```

## Best Practices

### 1. Use Selector Hooks for Performance

```typescript
// Good - Only re-renders when user changes
const user = useAuthUser();

// Avoid - Re-renders on any store change
const { user } = useAuthStore();
```

### 2. Handle Loading States

```typescript
const { signInWithEmail, isLoading } = useAuthStore();

const handleLogin = async () => {
  if (isLoading) return; // Prevent multiple submissions

  const result = await signInWithEmail(email, password);
  // Handle result...
};
```

### 3. Error Handling

```typescript
const { error, clearError } = useAuthStore();

useEffect(() => {
  if (error) {
    // Show error to user
    showErrorToast(error);
    // Clear error after showing
    clearError();
  }
}, [error, clearError]);
```

### 4. Type Safety

```typescript
import { User } from '@supabase/supabase-js';

const user: User | null = useAuthUser();
const userEmail = user?.email; // TypeScript knows this is string | undefined
```

## Troubleshooting

### Common Issues

1. **Store not persisting**: Check AsyncStorage permissions and storage limits
2. **Social auth not working**: Verify OAuth configuration in Supabase dashboard
3. **Type errors**: Ensure `@supabase/supabase-js` types are properly installed

### Debug Mode

```typescript
import { useAuthStore } from '../models/AuthenticationStore';

// Log store state changes
useEffect(() => {
  const unsubscribe = useAuthStore.subscribe(state => {
    console.log('Auth store updated:', state);
  });

  return unsubscribe;
}, []);
```

## API Reference

### Store Methods

| Method               | Parameters                                          | Returns                                       | Description                    |
| -------------------- | --------------------------------------------------- | --------------------------------------------- | ------------------------------ |
| `signInWithEmail`    | `email: string, password: string`                   | `Promise<{success: boolean, error?: string}>` | Sign in with email/password    |
| `signUpWithEmail`    | `email: string, password: string, fullName: string` | `Promise<{success: boolean, error?: string}>` | Sign up with email/password    |
| `signOut`            | None                                                | `Promise<void>`                               | Sign out and clear session     |
| `signInWithGoogle`   | None                                                | `Promise<{success: boolean, error?: string}>` | Sign in with Google            |
| `signInWithApple`    | None                                                | `Promise<{success: boolean, error?: string}>` | Sign in with Apple             |
| `signInWithFacebook` | None                                                | `Promise<{success: boolean, error?: string}>` | Sign in with Facebook          |
| `refreshSession`     | None                                                | `Promise<void>`                               | Refresh authentication session |
| `getCurrentUser`     | None                                                | `Promise<void>`                               | Get current authenticated user |
| `resetPassword`      | `email: string`                                     | `Promise<{success: boolean, error?: string}>` | Send password reset email      |
| `updatePassword`     | `newPassword: string`                               | `Promise<{success: boolean, error?: string}>` | Update user password           |
| `updateProfile`      | `updates: Partial<User>`                            | `Promise<{success: boolean, error?: string}>` | Update user profile            |

### Selector Hooks

| Hook                     | Returns                                     | Description                           |
| ------------------------ | ------------------------------------------- | ------------------------------------- |
| `useAuthUser`            | `User \| null`                              | Current authenticated user            |
| `useAuthSession`         | `Session \| null`                           | Current session                       |
| `useIsAuthenticated`     | `boolean`                                   | Whether user is authenticated         |
| `useIsLoading`           | `boolean`                                   | Whether auth operation is in progress |
| `useIsOnboarding`        | `boolean`                                   | Whether user is in onboarding         |
| `useAuthError`           | `string \| null`                            | Current error message                 |
| `useIsSocialAuthLoading` | `boolean`                                   | Whether social auth is in progress    |
| `useSocialAuthProvider`  | `'google' \| 'apple' \| 'facebook' \| null` | Current social auth provider          |

## Examples

See `src/components/AuthExample.tsx` for a complete working example of the authentication store in action.
