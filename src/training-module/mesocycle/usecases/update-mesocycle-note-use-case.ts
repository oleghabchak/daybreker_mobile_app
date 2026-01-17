import { Logger } from '../../../services/logger';
import { IProfileNote } from '../data/interfaces/profile-note';
import { IUpdateMesocycleNoteParams } from '../data/params/update-mesocycle-note-params';
import { MesocycleNoteService } from '../services/mesocycle-note-service';

/**
 * Use Case: Update Mesocycle Note
 *
 * @responsibility Updates a note
 */
export class UpdateMesocycleNoteUseCase {
  /**
   * Executes the use case to update a note
   *
   * @param params Update note parameters
   * @returns Updated note
   * @throws Error if update fails
   */
  static async execute(
    params: IUpdateMesocycleNoteParams
  ): Promise<IProfileNote> {
    Logger.debug('UpdateMesocycleNoteUseCase: Starting', {
      profileNoteId: params.profile_note_id,
    });

    const response = await MesocycleNoteService.updateNote(params);

    if (response.status === 'error') {
      Logger.error('UpdateMesocycleNoteUseCase: Failed', response.error);
      throw response.error;
    }

    Logger.debug('UpdateMesocycleNoteUseCase: Completed', {
      noteId: response.data.id,
    });

    return response.data;
  }
}
