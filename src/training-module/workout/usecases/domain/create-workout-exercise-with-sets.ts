import { Logger } from '../../../../services/logger';
import { AsyncResponse } from '../../../../shared-module/data/types/async-response';
import { WorkoutExerciseRepository } from '../../repositories/workout-exercise-repository';
import { WorkoutRepository } from '../../repositories/workout-repository';
import { WorkoutSetRepository } from '../../repositories/workout-set-repository';
import { CalibrationService } from '../../services/calibration-service';

export class CreateWorkoutExerciseWithSetsUseCase {
  static async execute({
    workoutId,
    exerciseId,
    defaultSets,
    workoutWeek,
  }: {
    workoutId: string;
    exerciseId: string;
    defaultSets: number;
    workoutWeek?: number;
  }): Promise<AsyncResponse<boolean>> {
    try {
      Logger.debug('Creating workout exercise with sets', {
        workoutId,
        exerciseId,
        defaultSets,
        workoutWeek,
      });

      // Get workout data to access workout_day
      const workoutRequest = await WorkoutRepository.getById(workoutId);
      if (workoutRequest.status === 'error') {
        Logger.error('Failed to get workout by ID', workoutRequest.error);
        return workoutRequest;
      }

      const workout = workoutRequest.data;
      const actualWorkoutWeek = workoutWeek || workout.workout_week;
      const workoutDay = workout.workout_day;

      Logger.debug('Workout data retrieved', {
        workoutWeek: actualWorkoutWeek,
        workoutDay,
      });

      const workoutLatestExerciseIndexRequest =
        await WorkoutExerciseRepository.getLastExerciseIndex(workoutId);

      if (workoutLatestExerciseIndexRequest.status === 'error') {
        Logger.error(
          'Failed to get last exercise index',
          workoutLatestExerciseIndexRequest.error
        );
        return workoutLatestExerciseIndexRequest;
      }

      const orderIndex = workoutLatestExerciseIndexRequest.data;
      Logger.debug('Last exercise index', { orderIndex });

      const createWorkoutExerciseRequest =
        await WorkoutExerciseRepository.create({
          workout_id: workoutId,
          exercise_id: exerciseId,
          order_index: orderIndex + 1,
          soreness_from_last: 1,
        });

      if (createWorkoutExerciseRequest.status === 'error') {
        Logger.error(
          'Failed to create workout exercise',
          createWorkoutExerciseRequest.error
        );
        return createWorkoutExerciseRequest;
      }

      const workoutExercise = createWorkoutExerciseRequest.data;
      Logger.debug('Workout exercise created', {
        exerciseId: workoutExercise.id,
      });

      const workoutSetsPromises = [];
      for (let i = 0; i < defaultSets; i++) {
        const setNumber = i + 1;

        // Determine set type using new logic
        const setType = CalibrationService.getSetType(
          actualWorkoutWeek,
          workoutDay,
          setNumber,
          'not_started'
        );

        Logger.debug('Creating set', {
          setNumber,
          setType,
          workoutExerciseId: workoutExercise.id,
        });

        const createWorkoutSetRequest = this.createSetWithRetry({
          workout_exercise_id: workoutExercise.id,
          set_number: setNumber,
          target_reps: 10,
          weight_kg: 0,
          target_rir_raw: 2,
          status: 'not_started',
          set_type: setType,
        });

        workoutSetsPromises.push(createWorkoutSetRequest);
      }

      const workoutSets = await Promise.all(workoutSetsPromises);
      for (const set of workoutSets) {
        if (set.status === 'error') {
          Logger.error('Failed to create workout set', set.error);

          // If it's a network error, try to clean up the created exercise
          if (set.error?.message?.includes('Network request failed')) {
            Logger.warn(
              'Network error detected, attempting to clean up created exercise'
            );
            try {
              await WorkoutExerciseRepository.delete(workoutExercise.id);
            } catch (cleanupError) {
              Logger.error(
                'Failed to clean up exercise after network error',
                cleanupError
              );
            }
          }

          return { status: 'error', error: set.error };
        }
      }

      Logger.debug('All sets created successfully', {
        setCount: workoutSets.length,
      });
      return { status: 'ok', data: true };
    } catch (error) {
      Logger.error(
        'Unexpected error in CreateWorkoutExerciseWithSetsUseCase',
        error
      );
      return {
        status: 'error',
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  }

  private static async createSetWithRetry(
    setData: {
      workout_exercise_id: string;
      set_number: number;
      target_reps: number;
      weight_kg: number;
      target_rir_raw: number;
      status: string;
      set_type: string;
    },
    maxRetries: number = 3
  ): Promise<AsyncResponse<any>> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        Logger.debug(`Creating set (attempt ${attempt}/${maxRetries})`, {
          setNumber: setData.set_number,
          setType: setData.set_type,
        });

        const result = await WorkoutSetRepository.create(setData);

        if (result.status === 'ok') {
          if (attempt > 1) {
            Logger.debug(`Set created successfully on attempt ${attempt}`);
          }
          return result;
        }

        lastError = result.error;

        // If it's a network error and we have retries left, wait and try again
        if (
          attempt < maxRetries &&
          result.error?.message?.includes('Network request failed')
        ) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Exponential backoff, max 5s
          Logger.warn(
            `Network error on attempt ${attempt}, retrying in ${delay}ms`
          );
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');

        if (
          attempt < maxRetries &&
          lastError.message.includes('Network request failed')
        ) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          Logger.warn(
            `Network error on attempt ${attempt}, retrying in ${delay}ms`
          );
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        return {
          status: 'error',
          error: lastError,
        };
      }
    }

    return {
      status: 'error',
      error: lastError || new Error('Max retries exceeded'),
    };
  }
}
