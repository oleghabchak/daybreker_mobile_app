import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import 'react-native-url-polyfill/auto';

import { environment } from '../config/environment';

// SecureStore has a 2048 byte limit, so we need to chunk large values
const CHUNK_SIZE = 2000; // Leave some buffer

const ExpoSecureStoreAdapter = {
  getItem: async (key: string) => {
    if (Platform.OS === 'web') {
      return AsyncStorage.getItem(key);
    }

    try {
      // First try to get the value directly
      const value = await SecureStore.getItemAsync(key);
      if (value && !value.startsWith('chunked:')) {
        return value;
      }

      // If it's chunked, reassemble
      if (value && value.startsWith('chunked:')) {
        const chunkCount = parseInt(value.split(':')[1]);
        let assembledValue = '';

        for (let i = 0; i < chunkCount; i++) {
          const chunk = await SecureStore.getItemAsync(`${key}_chunk_${i}`);
          if (chunk) {
            assembledValue += chunk;
          }
        }

        return assembledValue;
      }

      return null;
    } catch (error) {
      console.warn(
        'SecureStore getItem error, falling back to AsyncStorage:',
        error
      );
      return AsyncStorage.getItem(key);
    }
  },

  setItem: async (key: string, value: string) => {
    if (Platform.OS === 'web') {
      return AsyncStorage.setItem(key, value);
    }

    try {
      // If value is small enough, store directly
      if (value.length < CHUNK_SIZE) {
        return SecureStore.setItemAsync(key, value);
      }

      // Otherwise, chunk it
      const chunks = Math.ceil(value.length / CHUNK_SIZE);

      // Store the chunk count
      await SecureStore.setItemAsync(key, `chunked:${chunks}`);

      // Store each chunk
      for (let i = 0; i < chunks; i++) {
        const chunk = value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
        await SecureStore.setItemAsync(`${key}_chunk_${i}`, chunk);
      }
    } catch (error) {
      console.warn(
        'SecureStore setItem error, falling back to AsyncStorage:',
        error
      );
      return AsyncStorage.setItem(key, value);
    }
  },

  removeItem: async (key: string) => {
    if (Platform.OS === 'web') {
      return AsyncStorage.removeItem(key);
    }

    try {
      // Check if it's chunked
      const value = await SecureStore.getItemAsync(key);
      if (value && value.startsWith('chunked:')) {
        const chunkCount = parseInt(value.split(':')[1]);

        // Remove all chunks
        for (let i = 0; i < chunkCount; i++) {
          await SecureStore.deleteItemAsync(`${key}_chunk_${i}`);
        }
      }

      // Remove the main key
      return SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.warn(
        'SecureStore removeItem error, falling back to AsyncStorage:',
        error
      );
      return AsyncStorage.removeItem(key);
    }
  },
};

export const supabase = createClient(
  environment.supabase.url,
  environment.supabase.anonKey,
  {
    auth: {
      storage: ExpoSecureStoreAdapter as any,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
