import { Logger } from '../../../services/logger';
import { IRepository } from '../../../shared-module/data/interfaces/repository';
import { AsyncResponse } from '../../../shared-module/data/types/async-response';
import { IWorkoutSet } from '../data/interfaces/workout-set';
import { ICreateWorkoutSetParams } from '../data/params/set/create-workout-set-params';
import { IUpdateWorkoutSetParams } from '../data/params/set/update-workout-set-params';

export class WorkoutSetRepository extends IRepository {
  static tableName: string = 'workout_sets';

  static async create(
    params: ICreateWorkoutSetParams
  ): Promise<AsyncResponse<IWorkoutSet>> {
    return this.errorHandlingWrapper(async () => {
      const workoutSetData: ICreateWorkoutSetParams & {
        created_at: string;
        last_modified: string;
      } = {
        ...params,
        created_at: new Date().toISOString(),
        last_modified: new Date().toISOString(),
      };

      const { data, error } = await this.table
        .insert([workoutSetData])
        .select()
        .single<IWorkoutSet>();

      if (error) {
        throw error;
      }

      return data;
    });
  }

  static async update({
    id,
    data: updateData,
  }: IUpdateWorkoutSetParams): Promise<AsyncResponse<IWorkoutSet>> {
    return this.errorHandlingWrapper(async () => {
      // First, check if the workout set exists
      const { error: checkError } = await this.table
        .select<'id', IWorkoutSet>('id')
        .eq('id', id)
        .single();

      if (checkError) {
        Logger.error('[API] Workout set not found:', { id, checkError });

        throw checkError;
      }

      const { data, error } = await this.table
        .update({
          ...updateData,
          last_modified: new Date().toISOString(),
        })
        .eq('id', id)
        .select<'*', IWorkoutSet>()
        .single();

      if (error) {
        Logger.error('Error updating workout set:', error);
        Logger.error('[API] Failed update details:', {
          id,
          updateData,
          error,
        });

        throw error;
      }

      return data;
    });
  }

  static async getById(id: string): Promise<AsyncResponse<IWorkoutSet>> {
    return this.errorHandlingWrapper(async () => {
      const { data, error } = await this.table
        .select<'*', IWorkoutSet>('*')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      return data;
    });
  }

  static async getByExerciseId(
    exerciseId: string
  ): Promise<AsyncResponse<IWorkoutSet>> {
    return this.errorHandlingWrapper(async () => {
      const { data, error } = await this.table
        .select<'*', IWorkoutSet>('*')
        .eq('workout_exercise_id', exerciseId)
        .order('set_number', { ascending: true });

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
}
