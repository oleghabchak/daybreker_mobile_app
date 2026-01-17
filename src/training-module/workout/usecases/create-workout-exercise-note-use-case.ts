import { Logger } from '../../../services/logger';
import { IWorkoutExerciseNoteWithDetails } from '../data/interfaces/workout-exercise-note';
import { ICreateWorkoutExerciseNoteParams } from '../data/params/create-workout-exercise-note-params';
import { WorkoutExerciseNoteService } from '../services/workout-exercise-note-service';

/**
 * Use Case: Create Workout Exercise Note
 *
 * @responsibility Creates a note for a workout exercise
 */
export class CreateWorkoutExerciseNoteUseCase {
  /**
   * Executes the use case to create a note for a workout exercise
   *
   * @param params Create note parameters
   * @returns Created note with details
   * @throws Error if creation fails
   */
  static async execute(
    params: ICreateWorkoutExerciseNoteParams
  ): Promise<IWorkoutExerciseNoteWithDetails> {
    Logger.debug('CreateWorkoutExerciseNoteUseCase: Starting', {
      workoutExerciseId: params.workout_exercise_id,
    });

    const response = await WorkoutExerciseNoteService.createNote(params);

    if (response.status === 'error') {
      Logger.error('CreateWorkoutExerciseNoteUseCase: Failed', response.error);
      throw response.error;
    }

    Logger.debug('CreateWorkoutExerciseNoteUseCase: Completed', {
      noteId: response.data.profile_note_id,
    });

    return response.data;
  }
}
