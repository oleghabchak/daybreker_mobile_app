import { IRepository } from '../../../shared-module/data/interfaces/repository';
import { AsyncResponse } from '../../../shared-module/data/types/async-response';
import { IWorkout } from '../data/interfaces/workout';
import { ICreateWorkoutParams } from '../data/params/create-workout-params';
import { IGetFirstIncompleteWorkoutParams } from '../data/params/get-first-incomplete-workout-params';
import { IGetWorkoutsByWeekParams } from '../data/params/get-workouts-by-week-params';

export class WorkoutRepository extends IRepository {
  static tableName: string = 'workouts';

  static create(
    params: ICreateWorkoutParams
  ): Promise<AsyncResponse<IWorkout>> {
    return this.errorHandlingWrapper(async () => {
      const workoutData: ICreateWorkoutParams = {
        ...params,
        started_at: params.started_at || new Date().toISOString(),
        is_public: params.is_public ?? false,
        created_at: new Date().toISOString(),
        last_modified: new Date().toISOString(),
      };

      const { data, error } = await this.table
        .insert([workoutData])
        .select()
        .single<IWorkout>();

      if (error) {
        throw error;
      }

      return data;
    });
  }

  static async complete(id: string): Promise<AsyncResponse<IWorkout>> {
    return this.errorHandlingWrapper(async () => {
      const { data, error } = await this.table
        .update({ completed_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single<IWorkout>();

      if (error) {
        throw error;
      }

      return data;
    });
  }

  static async getByMesocycleId(
    mesocycleId: string
  ): Promise<AsyncResponse<IWorkout[]>> {
    return this.errorHandlingWrapper(async () => {
      const { data, error } = await this.table
        .select<'*', IWorkout[]>()
        .eq('mesocycle_block_id', mesocycleId);

      if (error) {
        throw error;
      }

      return data || [];
    });
  }

  static async getFirstIncompleteWorkout(
    params: IGetFirstIncompleteWorkoutParams
  ): Promise<
    AsyncResponse<{ workout_week: number; workout_day: number } | null>
  > {
    return this.errorHandlingWrapper(async () => {
      const { data, error } = await this.table
        .select('workout_week, workout_day')
        .eq('mesocycle_block_id', params.mesocycleId)
        .eq('user_id', params.userId)
        .is('completed_at', null)
        .order('workout_week', { ascending: true })
        .order('workout_day', { ascending: true })
        .limit(1)
        .single();

      if (error) {
        // If no incomplete workout found, return null
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data;
    });
  }

  static async getWorkoutsByWeek(
    params: IGetWorkoutsByWeekParams
  ): Promise<AsyncResponse<IWorkout[]>> {
    return this.errorHandlingWrapper(async () => {
      const { data, error } = await this.table
        .select('*')
        .eq('mesocycle_block_id', params.mesocycleId)
        .eq('workout_week', params.workoutWeek)
        .order('workout_day', { ascending: true });

      if (error) {
        throw error;
      }

      return data || [];
    });
  }

  static async getById(id: string): Promise<AsyncResponse<IWorkout>> {
    return this.errorHandlingWrapper(async () => {
      const { data, error } = await this.table
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      return data;
    });
  }
}
