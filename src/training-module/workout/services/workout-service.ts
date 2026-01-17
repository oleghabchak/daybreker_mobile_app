import { supabase } from '../../../lib/supabase';
import { AsyncResponse } from '../../../shared-module/data/types/async-response';
import { IWorkout } from '../data/interfaces/workout';
import { IGetWorkoutsByWeekParams } from '../data/params/get-workouts-by-week-params';

export class WorkoutService {
  protected static async errorHandlingWrapper<T>(
    wrapper: () => Promise<any>
  ): Promise<AsyncResponse<T>> {
    try {
      const response = await wrapper();

      return {
        status: 'ok',
        data: response,
      };
    } catch (error) {
      return {
        status: 'error',
        error: error as Error,
      };
    }
  }

  static async getWorkoutsWithExercisesAndSetsByWeek(
    params: IGetWorkoutsByWeekParams
  ): Promise<AsyncResponse<IWorkout[]>> {
    return this.errorHandlingWrapper(async () => {
      const { data, error } = await supabase.rpc(
        'get_workouts_with_exercises_and_sets_by_week',
        {
          mesocycle_id_param: params.mesocycleId,
          workout_week_param: params.workoutWeek,
        }
      );

      if (error) {
        throw error;
      }

      return Array.isArray(data) ? data : [];
    });
  }
}
