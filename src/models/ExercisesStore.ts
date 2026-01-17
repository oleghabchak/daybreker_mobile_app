import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';

import { supabase } from '../lib/supabase';

// Define the actual exercise library interface based on Supabase schema
interface ExercisesLibraryData {
  exercise_uid: string;
  exercise_canonical_id: string;
  exercise_slug_id: string;
  exercise_display_name_en: string;
  exercise_name_aliases: string;
  exercise_status: string;
  exercise_keywords: string;
  exercise_tags: string;
  exercise_i18n_translations: any;
  exercise_primary_movement_pattern: string;
  exercise_mechanics_type: string;
  exercise_kinematic_context: string;
  exercise_dominant_plane_of_motion: string;
  exercise_functional_vector_modifiers: string;
  exercise_movement_drivers: any;
  exercise_primary_joint_actions: string;
  exercise_joint_rom_degrees: any;
  exercise_joint_moment_profiles: string;
  exercise_length_bias_by_muscle: any;
  exercise_execution_laterality: string;
  exercise_range_of_motion_variant: string;
  exercise_implement_primary: string;
  exercise_implement_secondary: string;
  exercise_cable_attachment: string;
  exercise_external_line_of_action: string;
  exercise_machine_brand: string;
  exercise_machine_brand_custom_name: string;
  exercise_machine_model: string;
  exercise_body_orientation: string;
  exercise_bench_angle_degrees: boolean;
  exercise_back_support_required: string;
  exercise_stance_type: string;
  exercise_stance_width_category: string;
  exercise_foot_rotation_category: string;
  exercise_stance_code_by_plane: string;
  exercise_grip_orientation: string;
  exercise_grip_width_category: string;
  exercise_thumb_style: string;
  exercise_grip_code_by_plane: any;
  exercise_foot_orientation_degrees: string;
  exercise_muscles_ta2: string;
  exercise_muscle_groups_simple: any;
  exercise_muscle_roles: string;
  exercise_contraindications: any;
  exercise_joint_stress_profile: string;
  exercise_icf_tags_optional: string;
  exercise_impact_rating: string;
  exercise_stability_demand: string;
  exercise_coordination_complexity: string;
  exercise_variant_of: string;
  exercise_progressions: string;
  exercise_regressions: string;
  exercise_prerequisites: string;
  exercise_equipment_alternatives: string;
  exercise_similarity_fingerprint: string;
  exercise_review_status: string;
  exercise_reviewed_by: string;
  exercise_review_date: string;
  exercise_version: string;
  coaching_cues: string;
  created_at?: string;
  updated_at?: string;
}

interface ExercisesStore {
  exercises: ExercisesLibraryData[];
  isLoading: boolean;
  error: string | null;
  hasLoaded: boolean;
  searchQuery: string;
  selectedFilters: {
    movementPattern?: string;
    equipment?: string;
    muscleGroup?: string;
  };

  // Actions
  fetchAllExercises: (muscleGroup?: string[]) => Promise<void>;
  searchExercises: (query: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setFilter: (
    filterType: keyof ExercisesStore['selectedFilters'],
    value: string | undefined
  ) => void;
  clearFilters: () => void;
  getExerciseById: (exerciseId: string) => ExercisesLibraryData | undefined;
  fetchExerciseDataById: (exerciseId: string) => Promise<{
    exercise_display_name_en: string;
    exercise_muscle_groups_simple: any;
  } | null>;
  clearError: () => void;
}

export const useExercisesStore = create<ExercisesStore>((set, get) => ({
  exercises: [],
  isLoading: false,
  error: null,
  hasLoaded: false,
  searchQuery: '',
  selectedFilters: {},

  fetchAllExercises: async (muscleGroups?: string[]) => {
    set({ isLoading: true, error: null });

    try {
      // Always fetch all active exercises first
      const { data, error } = await supabase
        .from('exercise_library')
        .select('*')
        .eq('exercise_status', 'active')
        .order('exercise_display_name_en');

      if (error) {
        throw error;
      }

      let filteredExercises = data || [];

      // If muscle groups are provided, filter them in JavaScript
      if (muscleGroups && muscleGroups.length > 0) {
        filteredExercises = filteredExercises.filter(exercise => {
          try {
            const muscleGroupsData = exercise.exercise_muscle_groups_simple;
            if (!muscleGroupsData || typeof muscleGroupsData !== 'object') {
              return false;
            }

            // Check if any of the selected muscle groups exist in the primary array
            const primaryMuscles = muscleGroupsData.primary || [];
            return muscleGroups.some(group => primaryMuscles.includes(group));
          } catch (e) {
            console.warn(
              'Error parsing muscle groups for exercise:',
              exercise.exercise_uid
            );
            return false;
          }
        });
      }

      set({
        exercises: filteredExercises,
        isLoading: false,
        hasLoaded: true,
        error: null,
      });
    } catch (error) {
      console.error('Error fetching exercises:', error);
      set({
        isLoading: false,
        error:
          error instanceof Error ? error.message : 'Failed to fetch exercises',
      });
    }
  },

  searchExercises: async (query: string) => {
    if (!query.trim()) {
      await get().fetchAllExercises();
      return;
    }

    set({ isLoading: true, error: null, searchQuery: query });

    try {
      const { data, error } = await supabase
        .from('exercise_library')
        .select('*')
        .eq('exercise_status', 'active')
        .or(`exercise_display_name_en.ilike.%${query}%`)
        .order('exercise_display_name_en');

      if (error) {
        throw error;
      }

      set({
        exercises: data || [],
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error searching exercises:', error);
      set({
        isLoading: false,
        error:
          error instanceof Error ? error.message : 'Failed to search exercises',
      });
    }
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  setFilter: (
    filterType: keyof ExercisesStore['selectedFilters'],
    value: string | undefined
  ) => {
    set(state => ({
      selectedFilters: {
        ...state.selectedFilters,
        [filterType]: value,
      },
    }));
  },

  clearFilters: () => {
    set({ selectedFilters: {} });
  },

  getExerciseById: (exerciseId: string) => {
    const { exercises } = get();
    return exercises.find(exercise => exercise.exercise_uid === exerciseId);
  },

  fetchExerciseDataById: async (exerciseId: string) => {
    try {
      const { data, error } = await supabase
        .from('exercise_library')
        .select('exercise_display_name_en, exercise_muscle_groups_simple')
        .eq('exercise_uid', exerciseId)
        .eq('exercise_status', 'active')
        .single();

      if (error) {
        console.error('Error fetching exercise data:', error);
        return null;
      }

      return {
        exercise_display_name_en: data.exercise_display_name_en,
        exercise_muscle_groups_simple: data.exercise_muscle_groups_simple,
      };
    } catch (error) {
      console.error('Error fetching exercise data:', error);
      return null;
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));

// Hook for using the store with shallow comparison
export const useExercises = () => {
  return useExercisesStore(
    useShallow(state => ({
      exercises: state.exercises,
      isLoading: state.isLoading,
      error: state.error,
      hasLoaded: state.hasLoaded,
      searchQuery: state.searchQuery,
      selectedFilters: state.selectedFilters,
      fetchAllExercises: state.fetchAllExercises,
      searchExercises: state.searchExercises,
      setSearchQuery: state.setSearchQuery,
      setFilter: state.setFilter,
      clearFilters: state.clearFilters,
      getExerciseById: state.getExerciseById,
      fetchExerciseDataById: state.fetchExerciseDataById,
      clearError: state.clearError,
    }))
  );
};
