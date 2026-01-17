import { Logger } from '../../../services/logger';
import { IDeleteWorkoutExerciseNoteParams } from '../data/params/delete-workout-exercise-note-params';
import { WorkoutExerciseNoteService } from '../services/workout-exercise-note-service';

/**
 * Use Case: Delete Workout Exercise Note
 *
 * @responsibility Deletes a note from a workout exercise
 */
export class DeleteWorkoutExerciseNoteUseCase {
  /**
   * Executes the use case to delete a note from a workout exercise
   *
   * @param params Delete note parameters
   * @throws Error if deletion fails
   */
  static async execute(
    params: IDeleteWorkoutExerciseNoteParams
  ): Promise<void> {
    Logger.debug('DeleteWorkoutExerciseNoteUseCase: Starting', {
      workoutExerciseId: params.workout_exercise_id,
      profileNoteId: params.profile_note_id,
    });

    const response = await WorkoutExerciseNoteService.deleteProfileNote(
      params.profile_note_id
    );

    if (response.status === 'error') {
      Logger.error('DeleteWorkoutExerciseNoteUseCase: Failed', response.error);
      throw response.error;
    }

    Logger.debug('DeleteWorkoutExerciseNoteUseCase: Completed');
  }
}
