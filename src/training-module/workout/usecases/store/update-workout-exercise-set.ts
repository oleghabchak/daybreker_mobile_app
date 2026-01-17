import { useAuthStore } from '../../../../models/AuthenticationStore';
import { Logger } from '../../../../services/logger';
import { AsyncResponse } from '../../../../shared-module/data/types/async-response';
import { useMesocycleStore } from '../../../mesocycle/stores/mesocycle-store';
import { IWorkoutSet } from '../../data/interfaces/workout-set';
import { IUpdateWorkoutSetData } from '../../data/params/set/update-workout-set-params';
import { WorkoutSetRepository } from '../../repositories/workout-set-repository';
import { CalibrationService } from '../../services/calibration-service';
import { useWorkoutStore } from '../../stores/workout-store';

export class UpdateWorkoutExerciseSetStoreUseCase {
  static async execute(
    workoutExerciseId: string,
    data: IUpdateWorkoutSetData
  ): Promise<AsyncResponse<IWorkoutSet>> {
    try {
      const mesocycleState = useMesocycleStore.getState();

      useWorkoutStore.setState({ isLoading: true, error: null });

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
        useWorkoutStore.setState({
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

      useWorkoutStore.setState({ isLoading: false });

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
  }
}
