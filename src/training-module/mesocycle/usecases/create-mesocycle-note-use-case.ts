import { Logger } from '../../../services/logger';
import { IMesocycleNoteWithDetails } from '../data/interfaces/mesocycle-note';
import { ICreateMesocycleNoteParams } from '../data/params/create-mesocycle-note-params';
import { MesocycleNoteService } from '../services/mesocycle-note-service';

/**
 * Use Case: Create Mesocycle Note
 *
 * @responsibility Creates a note for a mesocycle
 */
export class CreateMesocycleNoteUseCase {
  /**
   * Executes the use case to create a note for a mesocycle
   *
   * @param params Create note parameters
   * @returns Created note with details
   * @throws Error if creation fails
   */
  static async execute(
    params: ICreateMesocycleNoteParams
  ): Promise<IMesocycleNoteWithDetails> {
    Logger.debug('CreateMesocycleNoteUseCase: Starting', {
      mesocycleId: params.mesocycle_id,
    });

    const response = await MesocycleNoteService.createNote(params);

    if (response.status === 'error') {
      Logger.error('CreateMesocycleNoteUseCase: Failed', response.error);
      throw response.error;
    }

    Logger.debug('CreateMesocycleNoteUseCase: Completed', {
      noteId: response.data.profile_note_id,
    });

    return response.data;
  }
}
