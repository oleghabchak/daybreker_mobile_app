import { createNavigationContainerRef } from '@react-navigation/native';

import type { RootStackParamList } from '../types';

/**
 * Reference to the root App Navigator.
 *
 * This can be used to access the navigation object outside of a NavigationContainer context,
 * but it's recommended to use the useNavigation hook whenever possible.
 */
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

/**
 * Simple function to navigate without the navigation prop.
 * Use this only when you don't have access to the navigation prop.
 */
export function navigate(name: keyof RootStackParamList, params?: any) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}

/**
 * Simple function to go back in navigation.
 */
export function goBack() {
  if (navigationRef.isReady() && navigationRef.canGoBack()) {
    navigationRef.goBack();
  }
}
