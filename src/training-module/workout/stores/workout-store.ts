import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';

import { ExerciseStatus } from '../../../enums/exercise.enum';
import { useAuthStore } from '../../../models/AuthenticationStore';
import { Logger } from '../../../services/logger';
import { AsyncResponse } from '../../../shared-module/data/types/async-response';
import { getExerciseCompletionStats } from '../../../utils/helpers';
import { useMesocycleStore } from '../../mesocycle/stores/mesocycle-store';
import { IWorkout } from '../data/interfaces/workout';
import { IWorkoutExercise } from '../data/interfaces/workout-exercise';
import { IWorkoutExerciseNoteWithDetails } from '../data/interfaces/workout-exercise-note';
import { IWorkoutSet } from '../data/interfaces/workout-set';
import { IWorkoutStats } from '../data/interfaces/workout-stats';
import { IUpdateWorkoutSetData } from '../data/params/set/update-workout-set-params';
import { SetStatusManager } from '../managers/set-status-manager';
import { WorkoutExerciseRepository } from '../repositories/workout-exercise-repository';
import { WorkoutSetRepository } from '../repositories/workout-set-repository';
import { CalibrationService } from '../services/calibration-service';
import { CreateWorkoutExerciseNoteUseCase } from '../usecases/create-workout-exercise-note-use-case';
import { DeleteWorkoutExerciseNoteUseCase } from '../usecases/delete-workout-exercise-note-use-case';
import { CreateWorkoutExerciseWithSetsUseCase } from '../usecases/domain/create-workout-exercise-with-sets';
import { GetWorkoutExerciseNotesUseCase } from '../usecases/get-workout-exercise-notes-use-case';
import { UpdateWorkoutExerciseNoteUseCase } from '../usecases/update-workout-exercise-note-use-case';

interface WorkoutStore {
  // State
  workouts: IWorkout[];
  isLoading: boolean;
  error: string | null;
  workoutStats: IWorkoutStats;

  currentWorkout: IWorkout | null;
  currentExercise: IWorkoutExercise | null;
  currentExerciseSet: IWorkoutSet | null;
  isWorkoutCompleted: boolean;

  notesByExerciseId: Record<string, IWorkoutExerciseNoteWithDetails[]>;
  notesLoading: boolean;
  notesError: string | null;

  // Actions

  setWorkouts: (workouts: IWorkout[]) => void;
  setCurrentWorkout: (workout: IWorkout) => void;

  setIsWorkoutCompleted: (isCompleted: boolean) => void;

  completeWorkout: (userId: string) => Promise<AsyncResponse<boolean>>;

  addExerciseToCurrentWorkout: (
    userId: string,
    exerciseId: string
  ) => Promise<AsyncResponse<boolean>>;

  removeWorkoutExercise: (
    userId: string,
    workoutExerciseId?: string
  ) => Promise<AsyncResponse<boolean>>;

  deleteExerciseOnWholeMesocycle: (
    userId: string,
    exerciseId: string
  ) => Promise<AsyncResponse<boolean>>;

  swapExerciseOfCurrentWorkout: (
    userId: string,
    oldExerciseId: string,
    newExerciseId: string
  ) => Promise<AsyncResponse<boolean>>;

  swapAllExercisesOnWholeMesocycle: (
    userId: string,
    oldExerciseId: string,
    newExerciseId: string
  ) => Promise<AsyncResponse<boolean>>;

  updateExerciseOrder: (
    userId: string,
    workoutExerciseId: string,
    newOrder: number
  ) => Promise<AsyncResponse<boolean>>;

  updateMesocycleExerciseOrder: (
    userId: string,
    mesocycleExerciseId: string,
    newOrder: number
  ) => Promise<AsyncResponse<boolean>>;

  createExerciseSet: (
    workoutExerciseId: string,
    setData: any
  ) => Promise<AsyncResponse<IWorkoutSet>>;

  deleteExerciseSet: (
    userId: string,
    workoutExerciseId: string
  ) => Promise<AsyncResponse<boolean>>;

  updateExerciseSet: (
    workoutExerciseId: string,
    data: IUpdateWorkoutSetData
  ) => Promise<AsyncResponse<IWorkoutSet>>;

  // Utility actions
  updateReps: (
    id: string,
    actualReps: number
  ) => Promise<AsyncResponse<IWorkoutSet>>;
  updateWeight: (
    id: string,
    weightKg: number
  ) => Promise<AsyncResponse<IWorkoutSet>>;
  updateRIR: (
    id: string,
    achievedRIR: number
  ) => Promise<AsyncResponse<IWorkoutSet>>;

  updateSetStatus: (
    id: string,
    status: ExerciseStatus,
    isFirstWeek?: boolean
  ) => Promise<AsyncResponse<IWorkoutSet>>;
  markAsSkipped: (id: string) => Promise<AsyncResponse<IWorkoutSet>>;
  // Local state management
  clearError: () => void;

  // WorkoutStats updates
  setWorkoutStats: (stats: IWorkoutStats) => void;
  setCompletedSets: (completedSets: number) => void;
  setTotalSets: (totalSets: number) => void;
  setCompletedExercises: (completedExercises: number) => void;
  setTotalExercises: (totalExercises: number) => void;

  loadNotesForExercise: (workoutExerciseId: string) => Promise<void>;
  createNote: (workoutExerciseId: string, note: string) => Promise<void>;
  updateNote: (profileNoteId: string, note: string) => Promise<void>;
  deleteNote: (
    workoutExerciseId: string,
    profileNoteId: string
  ) => Promise<void>;
  getNotesForExercise: (
    workoutExerciseId: string
  ) => IWorkoutExerciseNoteWithDetails[];
  clearNotesForExercise: (workoutExerciseId: string) => void;
  clearAllNotes: () => void;
  setNotesLoading: (loading: boolean) => void;
  setNotesError: (error: string | null) => void;
  clearNotesError: () => void;
}

export const useWorkoutStore = create<WorkoutStore>()(
  persist(
    (set, get) => ({
      // Initial state

      workouts: [],
      isLoading: false,
      error: null,
      workoutStats: {
        completedSets: 0,
        totalSets: 0,
        completedExercises: 0,
        totalExercises: 0,
      },

      currentWorkout: null,
      currentExercise: null,
      currentExerciseSet: null,
      isWorkoutCompleted: false,

      notesByExerciseId: {},
      notesLoading: false,
      notesError: null,

      // Implementations
      addExerciseToCurrentWorkout: async (
        userId: string,
        exerciseId: string
      ): Promise<AsyncResponse<boolean>> => {
        try {
          const workoutState = get();
          const workoutId = workoutState.currentWorkout?.id;

          if (!workoutId) {
            return {
              status: 'error',
              error: new Error('Workout id not found'),
            };
          }

          const createExerciseRequest =
            await CreateWorkoutExerciseWithSetsUseCase.execute({
              workoutId,
              exerciseId,
              defaultSets: 3,
            });

          if (createExerciseRequest.status === 'error') {
            return createExerciseRequest;
          }
          Logger.debug('Exercise created', workoutId, exerciseId);

          return {
            status: 'ok',
            data: true,
          };
        } catch (error) {
          return {
            status: 'error',
            error: error as Error,
          };
        }
      },

      createExerciseSet: async (
        workoutExerciseId: string,
        setData: any
      ): Promise<AsyncResponse<IWorkoutSet>> => {
        try {
          const createSetRequest = await WorkoutSetRepository.create({
            workout_exercise_id: workoutExerciseId,
            ...setData,
          });

          if (createSetRequest.status === 'error') {
            return createSetRequest;
          }

          const { currentExercise, workoutStats } = get();

          if (currentExercise) {
            const newSet = createSetRequest.data;
            const updatedSets = [...(currentExercise.sets || []), newSet];

            currentExercise.sets = updatedSets;

            set({
              isLoading: false,
              workoutStats: {
                ...workoutStats,
                totalSets: workoutStats.totalSets + 1,
              },
            });
          }
          const mesocycleState = useMesocycleStore.getState();
          const userId = useAuthStore.getState().user?.id;
          if (userId) {
            await mesocycleState.loadComplexMesocycleData(userId);
          }

          return {
            status: 'ok',
            data: createSetRequest.data,
          };
        } catch (error) {
          return {
            status: 'error',
            error: error as Error,
          };
        }
      },

      deleteExerciseSet: async (
        userId: string,
        workoutExerciseId: string
      ): Promise<AsyncResponse<boolean>> => {
        try {
          const mesocycleState = useMesocycleStore.getState();

          const deleteWorkoutSetRequest =
            await WorkoutSetRepository.delete(workoutExerciseId);

          if (deleteWorkoutSetRequest.status === 'error') {
            return deleteWorkoutSetRequest;
          }

          const { currentExercise, workoutStats } = get();

          if (currentExercise) {
            const filteredSets = currentExercise?.sets.filter(
              set => set.workout_exercise_id !== workoutExerciseId
            );

            currentExercise.sets = filteredSets;

            set({
              isLoading: false,
              workoutStats: {
                ...workoutStats,
                completedSets: workoutStats.completedSets - 1,
              },
            });
          }

          await mesocycleState.loadComplexMesocycleData(userId);

          return {
            status: 'ok',
            data: true,
          };
        } catch (error) {
          return {
            status: 'error',
            error: error as Error,
          };
        }
      },

      removeWorkoutExercise: async (
        userId: string,
        workoutExerciseId?: string
      ): Promise<AsyncResponse<boolean>> => {
        try {
          const mesocycleState = useMesocycleStore.getState();
          const workoutState = get();

          const deleteWorkoutExerciseRequest =
            await WorkoutExerciseRepository.delete(workoutExerciseId!);

          if (deleteWorkoutExerciseRequest.status === 'error') {
            console.error(
              '❌ Error deleting workout exercise:',
              deleteWorkoutExerciseRequest.error
            );
            return {
              status: 'error',
              error: new Error(
                deleteWorkoutExerciseRequest.error.message ||
                  'Failed to delete workout exercise'
              ),
            };
          }

          // Optimistically remove exercise locally from current workout and workouts list
          const currentWorkout = workoutState.currentWorkout;
          if (currentWorkout) {
            const updatedExercises = (currentWorkout.exercises || [])
              .filter(ex => ex.workout_exercise_id !== workoutExerciseId)
              .sort((a, b) => a.order_index - b.order_index)
              .map((ex, index) => ({ ...ex, order_index: index + 1 }));

            const updatedWorkout = {
              ...currentWorkout,
              exercises: updatedExercises,
            };

            // Update current workout
            workoutState.setCurrentWorkout(updatedWorkout);

            // Update workouts array if present
            const existingWorkouts = workoutState.workouts || [];
            if (
              Array.isArray(existingWorkouts) &&
              existingWorkouts.length > 0
            ) {
              const updatedWorkouts = existingWorkouts.map(w =>
                w.id === updatedWorkout.id ? updatedWorkout : w
              );
              workoutState.setWorkouts(updatedWorkouts);
            }

            // Recompute and update workout stats
            const stats = getExerciseCompletionStats(updatedExercises);
            workoutState.setWorkoutStats(stats);
          }

          // Reload mesocycle in background to stay consistent with server state
          await mesocycleState.loadComplexMesocycleData(userId);

          return {
            status: 'ok',
            data: true,
          };
        } catch (error) {
          return {
            status: 'error',
            error: error as Error,
          };
        }
      },

      deleteExerciseOnWholeMesocycle: async (
        userId: string,
        exerciseId: string
      ): Promise<AsyncResponse<boolean>> => {
        // This would need to be implemented based on the original use case
        // For now, returning a placeholder
        return {
          status: 'ok',
          data: true,
        };
      },

      swapExerciseOfCurrentWorkout: async (
        userId: string,
        oldExerciseId: string,
        newExerciseId: string
      ): Promise<AsyncResponse<boolean>> => {
        // This would need to be implemented based on the original use case
        // For now, returning a placeholder
        return {
          status: 'ok',
          data: true,
        };
      },

      swapAllExercisesOnWholeMesocycle: async (
        userId: string,
        oldExerciseId: string,
        newExerciseId: string
      ): Promise<AsyncResponse<boolean>> => {
        // This would need to be implemented based on the original use case
        // For now, returning a placeholder
        return {
          status: 'ok',
          data: true,
        };
      },

      updateExerciseOrder: async (
        userId: string,
        workoutExerciseId: string,
        newOrder: number
      ): Promise<AsyncResponse<boolean>> => {
        // This would need to be implemented based on the original use case
        // For now, returning a placeholder
        return {
          status: 'ok',
          data: true,
        };
      },

      updateMesocycleExerciseOrder: async (
        userId: string,
        mesocycleExerciseId: string,
        newOrder: number
      ): Promise<AsyncResponse<boolean>> => {
        // This would need to be implemented based on the original use case
        // For now, returning a placeholder
        return {
          status: 'ok',
          data: true,
        };
      },

      completeWorkout: async (
        userId: string
      ): Promise<AsyncResponse<boolean>> => {
        // This would need to be implemented based on the original use case
        // For now, returning a placeholder
        return {
          status: 'ok',
          data: true,
        };
      },

      // sets
      setWorkouts: (workouts: IWorkout[]) => {
        set({ workouts: workouts });
      },

      setCurrentWorkout: (workout: IWorkout) => {
        set({ currentWorkout: workout });
      },

      setIsWorkoutCompleted: (isCompleted: boolean) => {
        set({ isWorkoutCompleted: isCompleted });
      },

      setWorkoutStats: (stats: IWorkoutStats) => {
        set({
          workoutStats: stats,
        });
      },

      // Update a workout set
      updateExerciseSet: async (
        workoutExerciseId: string,
        data: IUpdateWorkoutSetData
      ): Promise<AsyncResponse<IWorkoutSet>> => {
        try {
          const mesocycleState = useMesocycleStore.getState();

          set({ isLoading: true, error: null });

          // Fetch current set data to check for calibration processing
          const currentSetResponse =
            await WorkoutSetRepository.getById(workoutExerciseId);
          let enhancedData = { ...data };

          // Check if this is a calibration set being completed
          // Need to check both incoming data AND current set data
          if (currentSetResponse.status === 'ok') {
            const currentSet = currentSetResponse.data;
            const isCalibrationSet =
              currentSet.set_type === 'calibration' ||
              data.set_type === 'calibration';
            const isBeingCompleted = data.status === 'done';
            const weight = data.weight_kg ?? currentSet.weight_kg;
            const reps = data.actual_reps ?? currentSet.actual_reps;

            if (isCalibrationSet && isBeingCompleted && weight && reps) {
              try {
                const calibrationResult =
                  await CalibrationService.processCalibrationSet(
                    workoutExerciseId,
                    weight,
                    reps
                  );

                if (calibrationResult.status === 'ok') {
                  enhancedData.calibration_data = calibrationResult.data;
                }
              } catch (error) {
                console.warn('Calibration processing failed:', error);
              }
            }
          }

          const updateRequest = await WorkoutSetRepository.update({
            id: workoutExerciseId,
            data: enhancedData,
          });

          if (updateRequest.status === 'error') {
            set({
              error:
                updateRequest?.error?.message || 'Failed to update workout set',
              isLoading: false,
            });

            return {
              status: 'error',
              error: updateRequest.error,
            };
          }

          // Reload mesocycle data to sync state after successful update
          const authState = useAuthStore.getState();
          if (authState.user?.id) {
            await mesocycleState.loadComplexMesocycleData(authState.user.id);
          }

          set({ isLoading: false });

          return {
            status: 'ok',
            data: updateRequest.data,
          };
        } catch (error) {
          return {
            status: 'error',
            error: error as Error,
          };
        }
      },

      setCompletedSets: (completedSets: number) => {
        set({ workoutStats: { ...get().workoutStats, completedSets } });
      },
      setTotalSets: (totalSets: number) => {
        set({ workoutStats: { ...get().workoutStats, totalSets } });
      },
      setCompletedExercises: (completedExercises: number) => {
        set({ workoutStats: { ...get().workoutStats, completedExercises } });
      },
      setTotalExercises: (totalExercises: number) => {
        set({ workoutStats: { ...get().workoutStats, totalExercises } });
      },

      // Update reps for a workout set
      updateReps: async (id: string, actualReps: number) => {
        Logger.debug('[Store] updateReps called with:', { id, actualReps });
        return get().updateExerciseSet(id, {
          actual_reps: actualReps,
          is_user_value: true,
        });
      },

      // Update weight for a workout set
      updateWeight: async (id: string, weightKg: number) => {
        Logger.debug('[Store] updateWeight called with:', { id, weightKg });
        return get().updateExerciseSet(id, {
          weight_kg: weightKg,
          is_user_value: true,
        });
      },

      // Update RIR for a workout set
      updateRIR: async (id: string, achievedRIR: number) => {
        return get().updateExerciseSet(id, {
          achieved_rir_raw: achievedRIR,
          is_user_value: true,
        });
      },

      // Update status for a workout set
      updateSetStatus: async (
        id: string,
        status: ExerciseStatus,
        isFirstWeek?: boolean
      ) => {
        Logger.success('[Store] updateSetStatus called with:', {
          id,
          status,
          isFirstWeek,
        });

        const setStatusManager = SetStatusManager.getInstance();

        // Always reload mesocycle data when a set is completed to reflect progression changes
        // The progressive overload algorithm now works across all weeks
        return setStatusManager.updateSetStatus(id, status, {
          isFirstWeek,
          shouldReloadMesocycle: true, // Always reload to show progression updates
          retryAttempts: 3,
          debounceMs: 300,
        });
      },

      // Mark workout set as skipped
      markAsSkipped: async (id: string) => {
        Logger.success('[Store] markAsSkipped called with:', { id });
        return get().updateExerciseSet(id, { status: ExerciseStatus.SKIPPED });
      },

      loadNotesForExercise: async (workoutExerciseId: string) => {
        const currentState = get();
        if (currentState.notesLoading) {
          return;
        }

        if (currentState.notesByExerciseId[workoutExerciseId]?.length > 0) {
          return;
        }

        set({ notesLoading: true, notesError: null });

        try {
          const notes = await GetWorkoutExerciseNotesUseCase.execute({
            workout_exercise_id: workoutExerciseId,
          });

          set(state => ({
            notesByExerciseId: {
              ...state.notesByExerciseId,
              [workoutExerciseId]: notes,
            },
            notesLoading: false,
          }));
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to load notes';
          set({ notesError: errorMessage, notesLoading: false });
        }
      },

      createNote: async (workoutExerciseId: string, note: string) => {
        set({ notesLoading: true, notesError: null });

        try {
          const newNote = await CreateWorkoutExerciseNoteUseCase.execute({
            workout_exercise_id: workoutExerciseId,
            note: note.trim(),
          });

          set(state => ({
            notesByExerciseId: {
              ...state.notesByExerciseId,
              [workoutExerciseId]: [
                ...(state.notesByExerciseId[workoutExerciseId] || []),
                newNote,
              ],
            },
            notesLoading: false,
          }));
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to create note';
          set({ notesError: errorMessage, notesLoading: false });
          throw error; // Re-throw to allow UI to handle the error
        }
      },

      updateNote: async (profileNoteId: string, note: string) => {
        set({ notesLoading: true, notesError: null });

        try {
          const updatedNote = await UpdateWorkoutExerciseNoteUseCase.execute({
            profile_note_id: profileNoteId,
            note: note.trim(),
          });

          set(state => {
            const newNotesByExerciseId = { ...state.notesByExerciseId };

            // Find and update the note in all exercises
            Object.keys(newNotesByExerciseId).forEach(exerciseId => {
              const exerciseNotes = newNotesByExerciseId[exerciseId];
              const noteIndex = exerciseNotes.findIndex(
                n => n.profile_note_id === profileNoteId
              );

              if (noteIndex !== -1) {
                newNotesByExerciseId[exerciseId] = [...exerciseNotes];
                newNotesByExerciseId[exerciseId][noteIndex] = {
                  ...exerciseNotes[noteIndex],
                  profile_note: updatedNote,
                };
              }
            });

            return {
              notesByExerciseId: newNotesByExerciseId,
              notesLoading: false,
            };
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to update note';
          set({ notesError: errorMessage, notesLoading: false });
          throw error; // Re-throw to allow UI to handle the error
        }
      },

      deleteNote: async (workoutExerciseId: string, profileNoteId: string) => {
        set({ notesLoading: true, notesError: null });

        try {
          await DeleteWorkoutExerciseNoteUseCase.execute({
            workout_exercise_id: workoutExerciseId,
            profile_note_id: profileNoteId,
          });

          set(state => ({
            notesByExerciseId: {
              ...state.notesByExerciseId,
              [workoutExerciseId]: (
                state.notesByExerciseId[workoutExerciseId] || []
              ).filter(note => note.profile_note_id !== profileNoteId),
            },
            notesLoading: false,
          }));
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to delete note';
          set({ notesError: errorMessage, notesLoading: false });
          throw error; // Re-throw to allow UI to handle the error
        }
      },

      getNotesForExercise: (workoutExerciseId: string) => {
        return get().notesByExerciseId[workoutExerciseId] || [];
      },

      clearNotesForExercise: (workoutExerciseId: string) => {
        set(state => {
          const newNotesByExerciseId = { ...state.notesByExerciseId };
          delete newNotesByExerciseId[workoutExerciseId];
          return { notesByExerciseId: newNotesByExerciseId };
        });
      },

      clearAllNotes: () => {
        set({ notesByExerciseId: {} });
      },

      setNotesLoading: (loading: boolean) => {
        set({ notesLoading: loading });
      },

      setNotesError: (error: string | null) => {
        set({ notesError: error });
      },

      clearNotesError: () => {
        set({ notesError: null });
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'workout-set-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        notesByExerciseId: state.notesByExerciseId,
      }),
    }
  )
);

export const useWorkoutActions = () =>
  useWorkoutStore(
    useShallow(state => ({
      createExerciseSet: state.createExerciseSet,
      updateExerciseSet: state.updateExerciseSet,
      deleteExerciseSet: state.deleteExerciseSet,
      updateReps: state.updateReps,
      updateWeight: state.updateWeight,
      updateRIR: state.updateRIR,
      swapExerciseOfCurrentWorkout: state.swapExerciseOfCurrentWorkout,
      workouts: state.workouts,
      swapAllExercisesOnWholeMesocycle: state.swapAllExercisesOnWholeMesocycle,
      deleteExerciseOnWholeMesocycle: state.deleteExerciseOnWholeMesocycle,
      markAsSkipped: state.markAsSkipped,
      clearError: state.clearError,
      setWorkouts: state.setWorkouts,
      setWorkoutStats: state.setWorkoutStats,
      setCompletedSets: state.setCompletedSets,
      setTotalSets: state.setTotalSets,
      setCompletedExercises: state.setCompletedExercises,
      setTotalExercises: state.setTotalExercises,
    }))
  );
