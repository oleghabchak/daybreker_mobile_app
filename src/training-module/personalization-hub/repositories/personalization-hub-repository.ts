import { supabase } from '../../../lib/supabase';
import { Logger } from '../../../services/logger';
import { AsyncResponse } from '../../../shared-module/data/types/async-response';
import {
  CreateTrainingConfigData,
  TrainingProfileConfiguration,
  UpdateTrainingConfigData,
} from '../../../types';

export class TrainingConfigRepository {
  private static table = supabase.from('training_profile_configuration');

  static async getByUserId(
    userId: string
  ): Promise<AsyncResponse<TrainingProfileConfiguration | null>> {
    try {
      Logger.debug('TrainingConfigRepository.getByUserId', { userId });

      const { data, error } = await this.table
        .select('*')
        .eq('user_id', userId)
        .single<TrainingProfileConfiguration>();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned - user doesn't have config yet
          return { status: 'ok', data: null };
        }
        throw error;
      }

      return { status: 'ok', data };
    } catch (error) {
      Logger.error('Error fetching personalization hub:', error);
      return { status: 'error', error: error as Error };
    }
  }

  static async create(
    configData: CreateTrainingConfigData
  ): Promise<AsyncResponse<TrainingProfileConfiguration>> {
    try {
      Logger.debug('TrainingConfigRepository.create', {
        userId: configData.user_id,
      });

      const { data, error } = await this.table
        .insert({
          user_id: configData.user_id,
          desired_body_type: configData.desired_body_type || 'masculine',
          years_of_exercise_experience:
            configData.years_of_exercise_experience || '<6_months',
          equipment_access: configData.equipment_access || [],
          warmup_sets_preference: configData.warmup_sets_preference ?? true,
          coaching_style: configData.coaching_style ?? 5,
          injury_flags: configData.injury_flags || { tags: [], notes: '' },
          exercise_blacklist: configData.exercise_blacklist || [],
          exercise_favorites: configData.exercise_favorites || [],
        })
        .select()
        .single<TrainingProfileConfiguration>();

      if (error) {
        throw error;
      }

      Logger.debug('Personalization hub created successfully:', data.id);
      return { status: 'ok', data };
    } catch (error) {
      Logger.error('Error creating personalization hub:', error);
      return { status: 'error', error: error as Error };
    }
  }

  static async update(
    userId: string,
    updateData: UpdateTrainingConfigData
  ): Promise<AsyncResponse<TrainingProfileConfiguration>> {
    try {
      Logger.debug('TrainingConfigRepository.update', { userId, updateData });

      const { data, error } = await this.table
        .update({
          ...updateData,
          last_modified: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single<TrainingProfileConfiguration>();

      if (error) {
        throw error;
      }

      Logger.debug('Personalization hub updated successfully:', data.id);
      return { status: 'ok', data };
    } catch (error) {
      Logger.error('Error updating personalization hub:', error);
      return { status: 'error', error: error as Error };
    }
  }

  static async upsert(
    configData: CreateTrainingConfigData
  ): Promise<AsyncResponse<TrainingProfileConfiguration>> {
    try {
      Logger.debug('TrainingConfigRepository.upsert', {
        userId: configData.user_id,
      });

      const { data, error } = await this.table
        .upsert({
          user_id: configData.user_id,
          desired_body_type: configData.desired_body_type || 'masculine',
          years_of_exercise_experience:
            configData.years_of_exercise_experience || '<6_months',
          equipment_access: configData.equipment_access || [],
          warmup_sets_preference: configData.warmup_sets_preference ?? true,
          coaching_style: configData.coaching_style ?? 5,
          injury_flags: configData.injury_flags || { tags: [], notes: '' },
          exercise_blacklist: configData.exercise_blacklist || [],
          exercise_favorites: configData.exercise_favorites || [],
          last_modified: new Date().toISOString(),
        })
        .select()
        .single<TrainingProfileConfiguration>();

      if (error) {
        throw error;
      }

      Logger.debug('Personalization hub upserted successfully:', data.id);
      return { status: 'ok', data };
    } catch (error) {
      Logger.error('Error upserting personalization hub:', error);
      return { status: 'error', error: error as Error };
    }
  }

  static async delete(userId: string): Promise<AsyncResponse<void>> {
    try {
      Logger.debug('TrainingConfigRepository.delete', { userId });

      const { error } = await this.table.delete().eq('user_id', userId);

      if (error) {
        throw error;
      }

      Logger.debug('Personalization hub deleted successfully');
      return { status: 'ok', data: undefined };
    } catch (error) {
      Logger.error('Error deleting personalization hub:', error);
      return { status: 'error', error: error as Error };
    }
  }
}
