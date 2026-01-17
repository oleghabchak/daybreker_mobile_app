import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  IExerciseLibraryData,
  IExerciseLibraryFilters,
} from '../data/interfaces/exercise-library';
import { ExerciseLibraryService } from '../services/exercise-library-service';

export interface ExerciseLibraryStore {
  // State
  isLoading: boolean;
  error: string | null;
  exercises: IExerciseLibraryData[];
  searchResults: IExerciseLibraryData[];
  currentSearchQuery: string;
  currentFilters: IExerciseLibraryFilters;
  hasMore: boolean;
  totalCount: number;

  // Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // Exercise data actions
  getExerciseById: (exerciseId: string) => Promise<IExerciseLibraryData | null>;
  getExercisesByIds: (exerciseIds: string[]) => Promise<IExerciseLibraryData[]>;
  loadAllExercises: () => Promise<void>;

  // Search actions
  searchExercises: (query: string, limit?: number) => Promise<void>;
  searchExercisesByMuscleGroups: (muscleGroups: string[]) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: IExerciseLibraryFilters) => void;
  clearSearch: () => void;

  // Cache management
  clearCache: () => void;
}

export const useExerciseLibraryStore = create<ExerciseLibraryStore>()(
  persist(
    (set, get) => ({
      // Initial state
      isLoading: false,
      error: null,
      exercises: [],
      searchResults: [],
      currentSearchQuery: '',
      currentFilters: {},
      hasMore: false,
      totalCount: 0,

      // Basic state setters
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },

      // Exercise data actions
      getExerciseById: async (exerciseId: string) => {
        set({ isLoading: true, error: null });

        try {
          const result =
            await ExerciseLibraryService.getExerciseById(exerciseId);

          if (result.status === 'ok') {
            set({ isLoading: false });
            return result.data;
          } else {
            set({
              error: result.error.message || 'Failed to fetch exercise',
              isLoading: false,
            });
            return null;
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to fetch exercise';
          set({
            error: errorMessage,
            isLoading: false,
          });
          return null;
        }
      },

      getExercisesByIds: async (exerciseIds: string[]) => {
        set({ isLoading: true, error: null });

        try {
          const result =
            await ExerciseLibraryService.getExercisesByIds(exerciseIds);

          if (result.status === 'ok') {
            set({ isLoading: false });
            return result.data;
          } else {
            set({
              error: result.error.message || 'Failed to fetch exercises',
              isLoading: false,
            });
            return [];
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to fetch exercises';
          set({
            error: errorMessage,
            isLoading: false,
          });
          return [];
        }
      },

      loadAllExercises: async () => {
        set({ isLoading: true, error: null });

        try {
          const result = await ExerciseLibraryService.getAllActiveExercises();

          if (result.status === 'ok') {
            set({
              exercises: result.data,
              isLoading: false,
            });
          } else {
            set({
              error: result.error.message || 'Failed to load exercises',
              isLoading: false,
            });
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to load exercises';
          set({
            error: errorMessage,
            isLoading: false,
          });
        }
      },

      // Search actions
      searchExercises: async (query: string, limit?: number) => {
        set({ isLoading: true, error: null, currentSearchQuery: query });

        try {
          const result = await ExerciseLibraryService.searchExercisesByName(
            query,
            limit
          );

          if (result.status === 'ok') {
            set({
              searchResults: result.data,
              isLoading: false,
            });
          } else {
            set({
              error: result.error.message || 'Failed to search exercises',
              isLoading: false,
            });
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to search exercises';
          set({
            error: errorMessage,
            isLoading: false,
          });
        }
      },

      searchExercisesByMuscleGroups: async (muscleGroups: string[]) => {
        set({ isLoading: true, error: null });

        try {
          const result =
            await ExerciseLibraryService.getExercisesByMuscleGroups(
              muscleGroups
            );

          if (result.status === 'ok') {
            set({
              searchResults: result.data,
              isLoading: false,
            });
          } else {
            set({
              error:
                result.error.message ||
                'Failed to filter exercises by muscle groups',
              isLoading: false,
            });
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to filter exercises by muscle groups';
          set({
            error: errorMessage,
            isLoading: false,
          });
        }
      },

      setSearchQuery: (query: string) => {
        set({ currentSearchQuery: query });
      },

      setFilters: (filters: IExerciseLibraryFilters) => {
        set({ currentFilters: filters });
      },

      clearSearch: () => {
        set({
          searchResults: [],
          currentSearchQuery: '',
          currentFilters: {},
        });
      },

      // Cache management
      clearCache: () => {
        set({
          exercises: [],
          searchResults: [],
          currentSearchQuery: '',
          currentFilters: {},
          error: null,
        });
      },
    }),
    {
      name: 'exercise-library-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        exercises: state.exercises,
        currentFilters: state.currentFilters,
      }),
    }
  )
);
