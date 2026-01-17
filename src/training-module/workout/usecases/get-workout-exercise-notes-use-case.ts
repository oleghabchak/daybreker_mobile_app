import { Logger } from '../../../services/logger';
import { IWorkoutExerciseNoteWithDetails } from '../data/interfaces/workout-exercise-note';
import { IGetWorkoutExerciseNotesParams } from '../data/params/get-workout-exercise-notes-params';
import { WorkoutExerciseNoteService } from '../services/workout-exercise-note-service';

/**
 * Use Case: Get Workout Exercise Notes
 *
 * @responsibility Retrieves all notes for a workout exercise
 */
export class GetWorkoutExerciseNotesUseCase {
  /**
   * Executes the use case to get all notes for a workout exercise
   *
   * @param params Get notes parameters
   * @returns Array of notes with details
   * @throws Error if retrieval fails
   */
  static async execute(
    params: IGetWorkoutExerciseNotesParams
  ): Promise<IWorkoutExerciseNoteWithDetails[]> {
    Logger.debug('GetWorkoutExerciseNotesUseCase: Starting', {
      workoutExerciseId: params.workout_exercise_id,
    });

    const response =
      await WorkoutExerciseNoteService.getNotesByWorkoutExerciseId(
        params.workout_exercise_id
      );

    if (response.status === 'error') {
      Logger.error('GetWorkoutExerciseNotesUseCase: Failed', response.error);
      throw response.error;
    }

    Logger.debug('GetWorkoutExerciseNotesUseCase: Completed', {
      count: response.data.length,
    });

    return response.data;
  }
}
