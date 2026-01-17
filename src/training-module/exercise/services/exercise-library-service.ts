import { AsyncResponse } from '../../../shared-module/data/types/async-response';
import {
  IExerciseLibraryData,
  IExerciseLibraryResponse,
  IExerciseLibrarySearchParams,
} from '../data/interfaces/exercise-library';
import { ExerciseLibraryRepository } from '../repositories/exercise-library-repository';

export class ExerciseLibraryService {
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

  /**
   * Get exercise data by ID
   */
  static async getExerciseById(
    exerciseId: string
  ): Promise<AsyncResponse<IExerciseLibraryData | null>> {
    return this.errorHandlingWrapper(async () => {
      const result =
        await ExerciseLibraryRepository.getExerciseById(exerciseId);

      if (result.status === 'error') {
        throw result.error;
      }

      return result.data;
    });
  }

  /**
   * Get multiple exercises by their IDs
   */
  static async getExercisesByIds(
    exerciseIds: string[]
  ): Promise<AsyncResponse<IExerciseLibraryData[]>> {
    return this.errorHandlingWrapper(async () => {
      const result =
        await ExerciseLibraryRepository.getExercisesByIds(exerciseIds);

      if (result.status === 'error') {
        throw result.error;
      }

      return result.data;
    });
  }

  /**
   * Search exercises with filters and pagination
   */
  static async searchExercises(
    params: IExerciseLibrarySearchParams
  ): Promise<AsyncResponse<IExerciseLibraryResponse>> {
    return this.errorHandlingWrapper(async () => {
      const result = await ExerciseLibraryRepository.searchExercises(params);

      if (result.status === 'error') {
        throw result.error;
      }

      return result.data;
    });
  }

  /**
   * Get all active exercises
   */
  static async getAllActiveExercises(): Promise<
    AsyncResponse<IExerciseLibraryData[]>
  > {
    return this.errorHandlingWrapper(async () => {
      const result = await ExerciseLibraryRepository.getAllActiveExercises();

      if (result.status === 'error') {
        throw result.error;
      }

      return result.data;
    });
  }

  /**
   * Get exercises filtered by muscle groups
   */
  static async getExercisesByMuscleGroups(
    muscleGroups: string[]
  ): Promise<AsyncResponse<IExerciseLibraryData[]>> {
    return this.errorHandlingWrapper(async () => {
      const result = await ExerciseLibraryRepository.searchExercises({
        filters: {
          muscleGroups,
        },
      });

      if (result.status === 'error') {
        throw result.error;
      }

      return result.data.exercises;
    });
  }

  /**
   * Search exercises by name
   */
  static async searchExercisesByName(
    searchQuery: string,
    limit?: number
  ): Promise<AsyncResponse<IExerciseLibraryData[]>> {
    return this.errorHandlingWrapper(async () => {
      const result = await ExerciseLibraryRepository.searchExercises({
        filters: {
          searchQuery,
        },
        limit,
      });

      if (result.status === 'error') {
        throw result.error;
      }

      return result.data.exercises;
    });
  }
}
