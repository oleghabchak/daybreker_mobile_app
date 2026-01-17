import { useCallback, useEffect, useState } from 'react';

import { supabase } from '../lib/supabase';
import { Logger } from '../services/logger';
import { TrainingConfigRepository } from '../training-module/personalization-hub/repositories/personalization-hub-repository';
import {
  CreateTrainingConfigData,
  TrainingProfileConfiguration,
  UpdateTrainingConfigData,
} from '../types/personalization-hub';

export const useTrainingConfig = () => {
  const [config, setConfig] = useState<TrainingProfileConfiguration | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConfig = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const result = await TrainingConfigRepository.getByUserId(user.id);

      if (result.status === 'error') {
        throw result.error;
      }

      setConfig(result.data);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to load personalization hub';
      setError(errorMessage);
      Logger.error('Error loading personalization hub:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveConfig = useCallback(
    async (configData: UpdateTrainingConfigData) => {
      try {
        setSaving(true);
        setError(null);

        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('User not authenticated');
        }

        let result;
        if (config) {
          // Update existing config
          result = await TrainingConfigRepository.update(user.id, configData);
        } else {
          // Create new config
          result = await TrainingConfigRepository.create({
            user_id: user.id,
            ...configData,
          });
        }

        if (result.status === 'error') {
          throw result.error;
        }

        setConfig(result.data);
        Logger.debug('Personalization hub saved:', result.data.id);
        return result.data;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to save personalization hub';
        setError(errorMessage);
        Logger.error('Error saving personalization hub:', err);
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [config]
  );

  const createDefaultConfig = useCallback(async () => {
    try {
      setSaving(true);
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const defaultConfig: CreateTrainingConfigData = {
        user_id: user.id,
        desired_body_type: 'masculine',
        years_of_exercise_experience: '<6_months',
        equipment_access: [],
        warmup_sets_preference: true,
        coaching_style: 5,
        injury_flags: { tags: [], notes: '' },
        exercise_blacklist: [],
        exercise_favorites: [],
      };

      const result = await TrainingConfigRepository.create(defaultConfig);

      if (result.status === 'error') {
        throw result.error;
      }

      setConfig(result.data);
      return result.data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to create default config';
      setError(errorMessage);
      Logger.error('Error creating default personalization hub:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load config on mount
  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  return {
    config,
    loading,
    saving,
    error,
    loadConfig,
    saveConfig,
    createDefaultConfig,
    clearError,
  };
};
