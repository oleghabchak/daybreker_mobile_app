import { Logger } from '../../../../services/logger';
import { AsyncResponse } from '../../../../shared-module/data/types/async-response';
import { useMesocycleStore } from '../../../mesocycle/stores/mesocycle-store';
import { IWorkoutSet } from '../../data/interfaces/workout-set';
import { ICreateWorkoutSetParams } from '../../data/params/set/create-workout-set-params';
import { WorkoutExerciseRepository } from '../../repositories/workout-exercise-repository';
import { WorkoutRepository } from '../../repositories/workout-repository';
import { WorkoutSetRepository } from '../../repositories/workout-set-repository';
import { CalibrationService } from '../../services/calibration-service';

export class CreateWorkoutExerciseSetStoreUseCase {
  static async execute(
    userId: string,
    setData: ICreateWorkoutSetParams
  ): Promise<AsyncResponse<IWorkoutSet>> {
    try {
      const mesocycleState = useMesocycleStore.getState();

      // Get workout exercise to access workout information
      const workoutExerciseRequest = await WorkoutExerciseRepository.getById(
        setData.workout_exercise_id
      );
      if (workoutExerciseRequest.status === 'error') {
        return workoutExerciseRequest;
      }

      const workoutExercise = workoutExerciseRequest.data;

      // Get workout to access workout_day
      const workoutRequest = await WorkoutRepository.getById(
        workoutExercise.workout_id!
      );
      if (workoutRequest.status === 'error') {
        return workoutRequest;
      }

      const workout = workoutRequest.data;

      // Determine set type using new logic
      const setType = CalibrationService.getSetType(
        workout.workout_week,
        workout.workout_day,
        setData.set_number,
        setData.status || 'not_started'
      );

      const { ...setDataWithoutWeek } = setData;
      const enhancedSetData = {
        ...setDataWithoutWeek,
        set_type: setType,
      };

      const createWorkoutSetRequest =
        await WorkoutSetRepository.create(enhancedSetData);

      if (createWorkoutSetRequest.status === 'error') {
        Logger.error(
          'Error creating workout set',
          createWorkoutSetRequest.error
        );
        return createWorkoutSetRequest;
      }

      await mesocycleState.loadComplexMesocycleData(userId);

      return {
        status: 'ok',
        data: createWorkoutSetRequest.data,
      };
    } catch (error) {
      return {
        status: 'error',
        error: error as Error,
      };
    }
  }
}
