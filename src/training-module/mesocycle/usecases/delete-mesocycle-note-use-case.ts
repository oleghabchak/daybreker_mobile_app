import { Logger } from '../../../services/logger';
import { IDeleteMesocycleNoteParams } from '../data/params/delete-mesocycle-note-params';
import { MesocycleNoteService } from '../services/mesocycle-note-service';

/**
 * Use Case: Delete Mesocycle Note
 *
 * @responsibility Deletes a note from a mesocycle
 */
export class DeleteMesocycleNoteUseCase {
  /**
   * Executes the use case to delete a note from a mesocycle
   *
   * @param params Delete note parameters
   * @throws Error if deletion fails
   */
  static async execute(params: IDeleteMesocycleNoteParams): Promise<void> {
    Logger.debug('DeleteMesocycleNoteUseCase: Starting', {
      mesocycleId: params.mesocycle_id,
      profileNoteId: params.profile_note_id,
    });

    const response = await MesocycleNoteService.deleteNote(params);

    if (response.status === 'error') {
      Logger.error('DeleteMesocycleNoteUseCase: Failed', response.error);
      throw response.error;
    }

    Logger.debug('DeleteMesocycleNoteUseCase: Completed');
  }
}

