import { IRepository } from '../../../shared-module/data/interfaces/repository';
import { AsyncResponse } from '../../../shared-module/data/types/async-response';
import {
  IExerciseLibraryData,
  IExerciseLibraryResponse,
  IExerciseLibrarySearchParams,
} from '../data/interfaces/exercise-library';

export class ExerciseLibraryRepository extends IRepository {
  static tableName: string = 'exercise_library';

  /**
   * Fetch exercise data by exercise ID
   */
  static async getExerciseById(
    exerciseId: string
  ): Promise<AsyncResponse<IExerciseLibraryData | null>> {
    return this.errorHandlingWrapper(async () => {
      const { data, error } = await this.table
        .select(
          'exercise_uid, exercise_display_name_en, exercise_muscle_groups_simple'
        )
        .eq('exercise_uid', exerciseId)
        .eq('exercise_status', 'active')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        throw error;
      }

      return {
        exercise_uid: data.exercise_uid,
        exercise_display_name_en: data.exercise_display_name_en,
        exercise_muscle_groups_simple: data.exercise_muscle_groups_simple,
      };
    });
  }

  /**
   * Fetch multiple exercises by their IDs
   */
  static async getExercisesByIds(
    exerciseIds: string[]
  ): Promise<AsyncResponse<IExerciseLibraryData[]>> {
    return this.errorHandlingWrapper(async () => {
      const { data, error } = await this.table
        .select(
          'exercise_uid, exercise_display_name_en, exercise_muscle_groups_simple'
        )
        .in('exercise_uid', exerciseIds)
        .eq('exercise_status', 'active')
        .order('exercise_display_name_en');

      if (error) {
        throw error;
      }

      return data.map(exercise => ({
        exercise_uid: exercise.exercise_uid,
        exercise_display_name_en: exercise.exercise_display_name_en,
        exercise_muscle_groups_simple: exercise.exercise_muscle_groups_simple,
      }));
    });
  }

  /**
   * Search exercises with filters and pagination
   */
  static async searchExercises(
    params: IExerciseLibrarySearchParams
  ): Promise<AsyncResponse<IExerciseLibraryResponse>> {
    return this.errorHandlingWrapper(async () => {
      let query = this.table
        .select(
          'exercise_uid, exercise_display_name_en, exercise_muscle_groups_simple',
          { count: 'exact' }
        )
        .eq('exercise_status', 'active');

      // Apply search query
      if (params.filters?.searchQuery) {
        query = query.ilike(
          'exercise_display_name_en',
          `%${params.filters.searchQuery}%`
        );
      }

      // Apply muscle group filter
      if (
        params.filters?.muscleGroups &&
        params.filters.muscleGroups.length > 0
      ) {
        // This would need to be handled in JavaScript after fetching
        // as muscle groups are stored as JSON
      }

      // Apply pagination
      if (params.limit) {
        query = query.limit(params.limit);
      }
      if (params.offset) {
        query = query.range(
          params.offset,
          params.offset + (params.limit || 50) - 1
        );
      }

      const { data, error, count } = await query.order(
        'exercise_display_name_en'
      );

      if (error) {
        throw error;
      }

      let filteredData = data || [];

      // Apply muscle group filter in JavaScript
      if (
        params.filters?.muscleGroups &&
        params.filters.muscleGroups.length > 0
      ) {
        filteredData = filteredData.filter(exercise => {
          try {
            const muscleGroupsData = exercise.exercise_muscle_groups_simple;
            if (!muscleGroupsData || typeof muscleGroupsData !== 'object') {
              return false;
            }

            const primaryMuscles = muscleGroupsData.primary || [];
            return params.filters!.muscleGroups!.some(group =>
              primaryMuscles.includes(group)
            );
          } catch (e) {
            console.warn(
              'Error parsing muscle groups for exercise:',
              exercise.exercise_uid
            );
            return false;
          }
        });
      }

      return {
        exercises: filteredData.map(exercise => ({
          exercise_uid: exercise.exercise_uid,
          exercise_display_name_en: exercise.exercise_display_name_en,
          exercise_muscle_groups_simple: exercise.exercise_muscle_groups_simple,
        })),
        total: count || 0,
        hasMore: params.offset
          ? params.offset + (params.limit || 50) < (count || 0)
          : false,
      };
    });
  }

  /**
   * Get all active exercises
   */
  static async getAllActiveExercises(): Promise<
    AsyncResponse<IExerciseLibraryData[]>
  > {
    return this.errorHandlingWrapper(async () => {
      const { data, error } = await this.table
        .select(
          'exercise_uid, exercise_display_name_en, exercise_muscle_groups_simple'
        )
        .eq('exercise_status', 'active')
        .order('exercise_display_name_en');

      if (error) {
        throw error;
      }

      return data.map(exercise => ({
        exercise_uid: exercise.exercise_uid,
        exercise_display_name_en: exercise.exercise_display_name_en,
        exercise_muscle_groups_simple: exercise.exercise_muscle_groups_simple,
      }));
    });
  }
}
