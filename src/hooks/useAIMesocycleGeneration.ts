import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Logger } from '../services/logger';
import { PrimaryMuscleGroup } from '../enums/databas.enums';
import { MesocycleGoal } from '../enums/databas.enums';
import { IExercise } from '../training-module/exercise/data/interfaces/exercise';

export interface MesocycleFormData {
  trainingDaysPerWeek: number;
  avgSessionMinutes: number;
  selectedWeeks: number;
  selectedGoal: MesocycleGoal;
  selectedEmphasis: string[];
  splitPreference: string;
  daysColumns: Array<{
    id: string;
    selectedDay: string | null;
    exercises: Array<{
      id: string;
      bodyPart: PrimaryMuscleGroup | null;
      selectedExercise: IExercise | null;
    }>;
  }>;
}

export interface AIProfileResponse {
  person: {
    date_of_birth?: string;
    height_cm?: number;
    weight_kg?: number;
    biological_sex?: string;
    desired_body_type?: string;
    years_of_exercise_experience?: number;
    equipment_access?: string[];
    warmup_sets_preference?: boolean;
    coaching_style?: string;
    injury_flags?: string[];
    exercise_blacklist?: string[];
    exercise_favorites?: string[];
  };
  exercises: Array<{
    exercise_uid: string;
    exercise_display_name_en: string;
    exercise_muscle_groups_simple: {
      primary: string[];
      secondary?: string[];
    };
  }>;
}

export interface UseAIMesocycleGenerationResult {
  isLoading: boolean;
  error: string | null;
  generateAIMesocycle: (formData: MesocycleFormData) => Promise<{
    person: AIProfileResponse['person'];
    exercises: AIProfileResponse['exercises'];
    days_columns: MesocycleFormData['daysColumns'];
    mesocycle_data: Omit<MesocycleFormData, 'daysColumns'>;
  }>;
  clearError: () => void;
}

export const useAIMesocycleGeneration = (): UseAIMesocycleGenerationResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateAIMesocycle = async (formData: MesocycleFormData): Promise<{
    person: AIProfileResponse['person'];
    exercises: AIProfileResponse['exercises'];
    days_columns: MesocycleFormData['daysColumns'];
    mesocycle_data: Omit<MesocycleFormData, 'daysColumns'>;
  }> => {
    setIsLoading(true);
    setError(null);

    try {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      const missingBodyParts = formData.daysColumns.flatMap(day => 
        day.exercises
          .filter(exercise => exercise.bodyPart && exercise.selectedExercise === null)
          .map(exercise => exercise.bodyPart!)
      );

      Logger.info('Calling get_user_profile_for_ai with:', {
        userId: user.id,
        missingBodyParts
      });

      // Call the supabase function
      const { data, error: functionError } = await supabase.rpc(
        'get_user_profile_for_ai',
        {
          p_user_id: user.id,
          p_muscle_groups: missingBodyParts.length > 0 ? missingBodyParts : null
        }
      );

      if (functionError) {
        Logger.error('Error calling get_user_profile_for_ai:', functionError);
        throw new Error(`Failed to get AI profile data: ${functionError.message}`);
      }

      if (!data) {
        throw new Error('No data returned from AI function');
      }

      // Check if there's an error in the response
      if (data.error) {
        throw new Error(data.error);
      }

      Logger.info('AI profile data received, preparing for LLM:', data);

      // Return both user profile and form data for LLM processing
      return {
        mesocycle_data: {
          trainingDaysPerWeek: formData.trainingDaysPerWeek,
          avgSessionMinutes: formData.avgSessionMinutes,
          selectedWeeks: formData.selectedWeeks,
          selectedGoal: formData.selectedGoal,
          selectedEmphasis: formData.selectedEmphasis,
          splitPreference: formData.splitPreference,
        },
        days_columns: formData.daysColumns,
        person: data.person,
        exercises: data.exercises as AIProfileResponse['exercises'],
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      Logger.error('Error in generateAIMesocycle:', err);
      setError(errorMessage);
      throw err; // Re-throw to let the calling component handle the error
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    isLoading,
    error,
    generateAIMesocycle,
    clearError,
  };
};
