import { Logger } from '../../../services/logger';
import { IRepository } from '../../../shared-module/data/interfaces/repository';
import { AsyncResponse } from '../../../shared-module/data/types/async-response';
import { IWorkoutExercise } from '../data/interfaces/workout-exercise';
import { IWorkoutExerciseNoteWithDetails } from '../data/interfaces/workout-exercise-note';
import { ICreateWorkoutExerciseParams } from '../data/params/create-workout-exercise-params';

import { WorkoutRepository } from './workout-repository';
import { WorkoutExerciseNoteRepository } from './workout-exercise-note-repository';

export class WorkoutExerciseRepository extends IRepository {
  static tableName: string = 'workout_exercises';

  static async create(
    params: ICreateWorkoutExerciseParams
  ): Promise<AsyncResponse<IWorkoutExercise>> {
    return this.errorHandlingWrapper(async () => {
      const workoutExerciseData: ICreateWorkoutExerciseParams & {
        created_at: string;
        last_modified: string;
      } = {
        ...params,
        created_at: new Date().toISOString(),
        last_modified: new Date().toISOString(),
      };

      const { data, error } = await this.table
        .insert([workoutExerciseData])
        .select()
        .single<IWorkoutExercise>();

      if (error) {
        throw error;
      }

      return data;
    });
  }

  static async delete(id: string): Promise<AsyncResponse<boolean>> {
    return this.errorHandlingWrapper(async () => {
      const { error } = await this.table.delete().eq('id', id);

      if (error) {
        throw error;
      }

      return true;
    });
  }

  static async deleteByExerciseId(
    exerciseId: string
  ): Promise<AsyncResponse<boolean>> {
    return this.errorHandlingWrapper(async () => {
      const { error } = await this.table.delete().eq('exercise_id', exerciseId);

      if (error) {
        throw error;
      }

      return true;
    });
  }

  static async swapExerciseId(
    oldExerciseId: string,
    newExerciseId: string
  ): Promise<AsyncResponse<boolean>> {
    return this.errorHandlingWrapper(async () => {
      const { error } = await this.table
        .update({
          exercise_id: newExerciseId,
          last_modified: new Date().toISOString(),
        })
        .eq('exercise_id', oldExerciseId);

      if (error) {
        throw error;
      }

      return true;
    });
  }

  static async getLastExerciseIndex(
    workoutId: string
  ): Promise<AsyncResponse<number>> {
    return this.errorHandlingWrapper(async () => {
      const { data, error } = await this.table
        .select<'order_index', { order_index: number }>('order_index')
        .eq('workout_id', workoutId)
        .order('order_index', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return 0;
        }

        throw error;
      }

      return data.order_index;
    });
  }

  static async updateExerciseId(
    workoutExerciseId: string,
    newExerciseId: string
  ): Promise<AsyncResponse<IWorkoutExercise>> {
    Logger.debug('WorkoutExerciseRepository.updateExerciseId', {
      workoutExerciseId,
      newExerciseId,
    });
    return this.errorHandlingWrapper(async () => {
      const { data, error } = await this.table
        .update({
          exercise_id: newExerciseId,
          last_modified: new Date().toISOString(),
        })
        .eq('id', workoutExerciseId)
        .select()
        .single<IWorkoutExercise>();

      if (error) {
        throw error;
      }

      return data;
    });
  }

  static async updateOrderIndex(
    workoutExerciseId: string,
    newOrderIndex: number
  ): Promise<AsyncResponse<IWorkoutExercise>> {
    return this.errorHandlingWrapper(async () => {
      const { data, error } = await this.table
        .update({
          order_index: newOrderIndex,
          last_modified: new Date().toISOString(),
        })
        .eq('id', workoutExerciseId)
        .select()
        .single<IWorkoutExercise>();

      if (error) {
        throw error;
      }

      return data;
    });
  }

  static async getById(id: string): Promise<AsyncResponse<IWorkoutExercise>> {
    return this.errorHandlingWrapper(async () => {
      const { data, error } = await this.table
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      // Load notes for this exercise
      const notesResponse = await WorkoutExerciseNoteRepository.getByWorkoutExerciseId(id);
      return {
        ...data,
        notes: notesResponse.status === 'ok' ? notesResponse.data : [],
      };
    });
  }

  /**
   * Get all exercises for a workout with notes
   */
  static async getByWorkoutId(workoutId: string): Promise<AsyncResponse<IWorkoutExercise[]>> {
    return this.errorHandlingWrapper(async () => {
      // Get all exercises
      const { data, error } = await this.table
        .select('*')
        .eq('workout_id', workoutId)
        .order('order_index', { ascending: true });

      if (error) {
        throw error;
      }

      // Get all notes for all exercises in this workout in one query
      const notesResponse = await WorkoutExerciseNoteRepository.getByWorkoutId(workoutId);
      const notesByExerciseId = new Map<string, IWorkoutExerciseNoteWithDetails[]>();
      
      if (notesResponse.status === 'ok') {
        notesResponse.data.forEach(note => {
          if (!notesByExerciseId.has(note.workout_exercise_id)) {
            notesByExerciseId.set(note.workout_exercise_id, []);
          }
          notesByExerciseId.get(note.workout_exercise_id)!.push(note);
        });
      }

      // Combine exercises with their notes
      return (data || []).map(exercise => ({
        ...exercise,
        notes: notesByExerciseId.get(exercise.id) || [],
      }));
    });
  }

  static async getByMesocycleId(
    mesocycleId: string
  ): Promise<AsyncResponse<IWorkoutExercise[]>> {
    return this.errorHandlingWrapper(async () => {
      // First get all workouts in the mesocycle using WorkoutRepository
      const workoutsResponse =
        await WorkoutRepository.getByMesocycleId(mesocycleId);

      if (workoutsResponse.status === 'error') {
        Logger.error(
          'Error getting workouts for mesocycle:',
          workoutsResponse.error
        );
        throw workoutsResponse.error;
      }

      if (!workoutsResponse.data || workoutsResponse.data.length === 0) {
        Logger.debug('No workouts found for mesocycle:', mesocycleId);
        return [];
      }

      const workoutIds = workoutsResponse.data.map(w => w.id);

      // Then get all exercises for those workouts
      const { data, error } = await this.table
        .select('*')
        .in('workout_id', workoutIds)
        .order('order_index', { ascending: true });

      if (error) {
        Logger.error('Error in getByMesocycleId:', error);
        throw error;
      }

      return data || [];
    });
  }
}
