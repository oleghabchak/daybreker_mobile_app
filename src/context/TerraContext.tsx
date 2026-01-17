import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Alert, Linking } from 'react-native';

import {
  generateTerraAuthUrl,
  TERRA_CONFIG,
  SUPPORTED_PROVIDERS,
} from '../config/terraApi';
import { supabase } from '../lib/supabase';

export interface ConnectedDevice {
  provider: string;
  connected_at: string;
  last_sync?: string;
  sync_status: string;
}

interface TerraContextValue {
  providers: typeof SUPPORTED_PROVIDERS;
  connectedDevices: ConnectedDevice[];
  loading: boolean;
  connectDevice: (provider: string) => Promise<void>;
  disconnectDevice: (provider: string) => Promise<void>;
  reload: () => Promise<void>;
}

const TerraContext = createContext<TerraContextValue | undefined>(undefined);

export const TerraProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [connectedDevices, setConnectedDevices] = useState<ConnectedDevice[]>(
    []
  );
  const [loading, setLoading] = useState(false);

  const loadConnectedDevices = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: connections } = await supabase
          .from('device_connections')
          .select('provider, connected_at, last_sync, sync_status')
          .eq('user_id', user.id)
          .eq('is_active', true);
        if (connections) setConnectedDevices(connections as ConnectedDevice[]);
      }
    } catch (err) {
      // Non-fatal
    }
  }, []);

  useEffect(() => {
    loadConnectedDevices();
  }, [loadConnectedDevices]);

  const connectDevice = useCallback(
    async (provider: string) => {
      if (
        !TERRA_CONFIG.DEV_ID ||
        TERRA_CONFIG.DEV_ID === 'daybreakerhealth-prod-s7DuKDUy5C'
      ) {
        Alert.alert(
          'Setup Required',
          'Terra API configuration is needed. Please contact support to enable device connections.'
        );
        return;
      }
      setLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;
        const redirectUrl = 'daybreaker://device-connected';
        const authUrl = generateTerraAuthUrl(user.id, provider, redirectUrl);
        const canOpen = await Linking.canOpenURL(authUrl);
        if (!canOpen) throw new Error('Cannot open Terra connect URL');
        await Linking.openURL(authUrl);
        await supabase.from('device_connections').upsert({
          user_id: user.id,
          provider,
          sync_status: 'connecting',
          version: 1,
        });
        setTimeout(loadConnectedDevices, 3000);
      } catch (err) {
        Alert.alert(
          'Connection Error',
          'Failed to connect device. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    },
    [loadConnectedDevices]
  );

  const disconnectDevice = useCallback(
    async (provider: string) => {
      Alert.alert('Disconnect Device', `Disconnect ${provider}?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            try {
              const {
                data: { user },
              } = await supabase.auth.getUser();
              if (!user) return;
              await supabase
                .from('device_connections')
                .update({
                  is_active: false,
                  sync_status: 'disconnected',
                  updated_at: new Date().toISOString(),
                })
                .eq('user_id', user.id)
                .eq('provider', provider);
              await loadConnectedDevices();
            } catch (_) {}
          },
        },
      ]);
    },
    [loadConnectedDevices]
  );

  const value = useMemo<TerraContextValue>(
    () => ({
      providers: SUPPORTED_PROVIDERS,
      connectedDevices,
      loading,
      connectDevice,
      disconnectDevice,
      reload: loadConnectedDevices,
    }),
    [
      connectedDevices,
      loading,
      connectDevice,
      disconnectDevice,
      loadConnectedDevices,
    ]
  );

  return (
    <TerraContext.Provider value={value}>{children}</TerraContext.Provider>
  );
};

export function useTerra() {
  const ctx = useContext(TerraContext);
  if (!ctx) throw new Error('useTerra must be used within TerraProvider');
  return ctx;
}
