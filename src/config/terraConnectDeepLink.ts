import * as Linking from 'expo-linking';
import Toast from 'react-native-toast-message';

/**
 * Handle Terra connect deep link: daybreaker://device-connected
 * Optional query: ?status=success|error&provider=...&message=...
 */
export function registerTerraDeepLinkHandler() {
  const subscription = Linking.addEventListener('url', ({ url }) => {
    try {
      const parsed = Linking.parse(url);
      if (parsed.scheme === 'daybreaker' && parsed.path === 'device-connected') {
        const status = (parsed.queryParams?.status as string) || 'success';
        const provider = (parsed.queryParams?.provider as string) || 'device';
        const message = (parsed.queryParams?.message as string) || undefined;
        if (status === 'success') {
          Toast.show({ type: 'success', text1: `${provider} connected`, text2: 'Sync will start shortly.' });
        } else {
          Toast.show({ type: 'error', text1: `Failed to connect ${provider}`, text2: message || 'Please try again.' });
        }
      }
    } catch (_) {
      // no-op
    }
  });
  return () => subscription.remove();
}
