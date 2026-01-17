import { Logger } from '../../../../services/logger';
import { AsyncResponse } from '../../../../shared-module/data/types/async-response';
import { useMesocycleStore } from '../../../mesocycle/stores/mesocycle-store';
import { IWorkoutExercise } from '../../data/interfaces/workout-exercise';
import { WorkoutExerciseRepository } from '../../repositories/workout-exercise-repository';

export class UpdateMesocycleExerciseOrderStoreUseCase {
  static async execute(
    userId: string,
    mesocycleId: string,
    exercises: {
      workout_exercise_id: string;
      order_index: number;
    }[]
  ): Promise<AsyncResponse<boolean>> {
    try {
      // Get all exercises in the mesocycle to understand the pattern
      const allMesocycleExercises =
        await WorkoutExerciseRepository.getByMesocycleId(mesocycleId);

      if (allMesocycleExercises.status === 'error') {
        Logger.error(
          'Failed to get mesocycle exercises:',
          allMesocycleExercises.error
        );
        return {
          status: 'error',
          error: new Error('Failed to get mesocycle exercises'),
        };
      }

      // Create a mapping from exercise_id to new order_index based on the reordered exercises
      const reorderMap = new Map<string, number>();
      exercises.forEach(exercise => {
        console.log(
          '++++ Looking for workout_exercise_id:',
          exercise.workout_exercise_id
        );
        // Find the exercise_id for this workout_exercise_id
        const foundExercise = allMesocycleExercises.data.find(
          e => e.id === exercise.workout_exercise_id
        );

        if (foundExercise) {
          reorderMap.set(foundExercise.exercise_id, exercise.order_index);
        }
      });

      // Update all exercises with the same exercise_id across all workouts
      const updatePromises: Promise<AsyncResponse<IWorkoutExercise>>[] = [];

      Logger.debug('Reorder map:', Object.fromEntries(reorderMap));

      // For each exercise_id in the reorder map, update ALL instances of that exercise_id
      reorderMap.forEach((newOrderIndex, exerciseId) => {
        // Find all exercises with this exercise_id across all workouts
        const exercisesWithSameId = allMesocycleExercises.data.filter(
          e => e.exercise_id === exerciseId
        );

        Logger.debug(
          `Updating exercise_id ${exerciseId} to order ${newOrderIndex} for ${exercisesWithSameId.length} instances`
        );

        exercisesWithSameId.forEach(exercise => {
          Logger.debug(
            `Updating workout_exercise_id ${exercise.id} to order ${newOrderIndex}`
          );
          updatePromises.push(
            WorkoutExerciseRepository.updateOrderIndex(
              exercise.id!,
              newOrderIndex
            )
          );
        });
      });

      const results = await Promise.all(updatePromises);

      const hasErrors = results.some(result => result.status === 'error');
      if (hasErrors) {
        const errors = results.filter(result => result.status === 'error');
        Logger.error('Some mesocycle exercise order updates failed:', errors);
        return {
          status: 'error',
          error: new Error('Failed to update some mesocycle exercise orders'),
        };
      }

      // Reload the mesocycle data to reflect the changes
      const mesocycleState = useMesocycleStore.getState();
      await mesocycleState.loadComplexMesocycleData(userId);

      Logger.debug('Mesocycle exercise order updated successfully');
      return {
        status: 'ok',
        data: true,
      };
    } catch (error) {
      Logger.error('Error in UpdateMesocycleExerciseOrderStoreUseCase:', error);
      return {
        status: 'error',
        error: error as Error,
      };
    }
  }
}
