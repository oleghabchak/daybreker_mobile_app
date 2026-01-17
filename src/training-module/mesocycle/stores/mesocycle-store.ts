import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { ComprehensiveMesocycleData } from '../../../types/mesocycle_types';
import { useWorkoutStore } from '../../workout/stores/workout-store';
import { IMesocycle } from '../data/interfaces/mesocycle';
import { IMesocycleTemplateExercise } from '../data/interfaces/mesocycle-templates';
import { MesocycleService } from '../services/mesocycle-service';

export interface MesocycleStore {
  isLoading: boolean;
  error: string | null;
  templates: IMesocycle[] | null;
  templateExercises: IMesocycleTemplateExercise[] | null;
  complexMesocycleData: ComprehensiveMesocycleData[] | null;

  selectedWorkoutDay: number;
  selectedWorkoutWeek: number;

  mesocycles: IMesocycle[];
  selectedMesocycle: IMesocycle | null;
  currentMesocycleId: string | null;

  setSelectedWorkoutDay: (day: number) => void;
  setSelectedWorkoutWeek: (week: number) => void;
  setCurrentMesocycleId: (id: string | null) => void;
  setSelectedMesocycle: (mesocycle: IMesocycle | null) => void;

  loadComplexMesocycleData: (userId: string) => Promise<void>;
  loadTemplates: () => Promise<void>;
  loadAppTemplates: () => Promise<void>;
  loadUserTemplates: (userId: string) => Promise<void>;
  loadTemplateExercises: (mesocycleBlockId: string) => Promise<void>;
  deleteTemplate: (templateId: string) => Promise<void>;
}

export const useMesocycleStore = create<MesocycleStore>()(
  persist(
    (set, get, _store) => ({
      // Initial state
      isLoading: false,
      error: null,
      complexMesocycleData: null,
      mesocycles: [],
      templates: [],
      templateExercises: [],
      selectedMesocycle: null,
      currentMesocycleId: null,

      selectedWorkoutDay: 1,
      selectedWorkoutWeek: 1,

      setSelectedWorkoutDay: (day: number) => {
        set({ selectedWorkoutDay: day });
      },

      setSelectedWorkoutWeek: (week: number) => {
        set({ selectedWorkoutWeek: week });
      },

      setCurrentMesocycleId: (id: string | null) => {
        set({ currentMesocycleId: id });
      },

      setSelectedMesocycle: (mesocycle: IMesocycle | null) => {
        set({ selectedMesocycle: mesocycle });
      },

      loadComplexMesocycleData: async (userId: string) => {
        set({ isLoading: true, error: null });
        try {
          let result = await MesocycleService.getMesocyclesWithSets(userId);

          if (result.status === 'ok') {
            // console.log('📊 Loaded mesocycle data:', {
            //   userId,
            //   mesocyclesFound: result.data?.length,
            //   firstMesocycleId: result.data?.[0]?.id,
            //   firstMesocycleWorkoutsCount: result.data?.[0]?.workouts?.length,
            //   workoutsPreview: result.data?.[0]?.workouts?.map(w => ({
            //     id: w.id,
            //     workout_week: w.workout_week,
            //     workout_day: w.workout_day,
            //   })),
            // });

            set({
              complexMesocycleData: result.data,
              isLoading: false,
            });

            const workoutStore = useWorkoutStore.getState();

            // Find the correct mesocycle to load workouts from
            const currentState = get();
            const selectedMeso = currentState.selectedMesocycle;
            const currentMesoId = currentState.currentMesocycleId;

            // Determine which mesocycle ID to use
            const targetMesocycleId = selectedMeso?.id || currentMesoId;

            if (targetMesocycleId && result.data) {
              // Find the specific mesocycle that matches our target
              const targetMesocycle = result.data.find(
                m => m.id === targetMesocycleId
              );

              if (targetMesocycle?.workouts) {
                workoutStore.setWorkouts(targetMesocycle.workouts);
              }
            } else if (result.data && result.data.length > 0) {
              // Fallback: use first mesocycle if no target specified
              workoutStore.setWorkouts(result.data[0]?.workouts);
            }
          } else {
            set({
              error:
                result.error.message ||
                'Failed to load comprehensive mesocycle data',
              isLoading: false,
            });
            console.error(
              '❌ Failed to load comprehensive mesocycle data:',
              result.error
            );
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to load comprehensive mesocycle data';
          set({
            error: errorMessage,
            isLoading: false,
          });
          console.error(
            '❌ Error loading comprehensive mesocycle data:',
            error
          );
        }
      },

      loadTemplates: async () => {
        const templates = await MesocycleService.getMesocycleTemplates();
        if (templates.status === 'ok') {
          set({ templates: templates.data });
        } else {
          set({ templates: null });
        }
      },

      loadAppTemplates: async () => {
        const templates = await MesocycleService.getMesocycleTemplates(true);
        if (templates.status === 'ok') {
          set({ templates: templates.data });
        } else {
          set({ templates: null });
        }
      },

      loadUserTemplates: async (userId: string) => {
        const templates = await MesocycleService.getMesocycleTemplates(
          false,
          userId
        );
        if (templates.status === 'ok') {
          set({ templates: templates.data });
        } else {
          set({ templates: null });
        }
      },

      loadTemplateExercises: async (mesocycleBlockId: string) => {
        const templateExercises =
          await MesocycleService.getTemplateExercises(mesocycleBlockId);
        if (templateExercises.status === 'ok') {
          set({ templateExercises: templateExercises.data });
        } else {
          set({ templateExercises: null });
        }
      },

      deleteTemplate: async (templateId: string) => {
        set({ isLoading: true, error: null });

        try {
          const result = await MesocycleService.deleteTemplate(templateId);

          if (result.status === 'ok') {
            // Remove the deleted template from the current templates list
            const currentTemplates = get().templates;
            if (currentTemplates) {
              const updatedTemplates = currentTemplates.filter(
                template => template.id !== templateId
              );
              set({ templates: updatedTemplates, isLoading: false });
            } else {
              set({ isLoading: false });
            }
          } else {
            set({
              error: result.error?.message || 'Failed to delete template',
              isLoading: false,
            });
            throw result.error;
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to delete template';
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },
    }),
    {
      name: 'mesocycle-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        selectedWorkoutDay: state.selectedWorkoutDay,
        selectedWorkoutWeek: state.selectedWorkoutWeek,
      }),
    }
  )
);
