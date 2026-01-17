import { Logger } from '../../../services/logger';
import { IProfileNote } from '../../mesocycle/data/interfaces/profile-note';
import { IUpdateWorkoutExerciseNoteParams } from '../data/params/update-workout-exercise-note-params';
import { WorkoutExerciseNoteService } from '../services/workout-exercise-note-service';

/**
 * Use Case: Update Workout Exercise Note
 *
 * @responsibility Updates a note
 */
export class UpdateWorkoutExerciseNoteUseCase {
  /**
   * Executes the use case to update a note
   *
   * @param params Update note parameters
   * @returns Updated note
   * @throws Error if update fails
   */
  static async execute(
    params: IUpdateWorkoutExerciseNoteParams
  ): Promise<IProfileNote> {
    Logger.debug('UpdateWorkoutExerciseNoteUseCase: Starting', {
      profileNoteId: params.profile_note_id,
    });

    const response = await WorkoutExerciseNoteService.updateNote(params);

    if (response.status === 'error') {
      Logger.error('UpdateWorkoutExerciseNoteUseCase: Failed', response.error);
      throw response.error;
    }

    Logger.debug('UpdateWorkoutExerciseNoteUseCase: Completed', {
      noteId: response.data.id,
    });

    return response.data;
  }
}
