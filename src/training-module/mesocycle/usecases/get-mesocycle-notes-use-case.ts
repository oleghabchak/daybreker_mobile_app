import { Logger } from '../../../services/logger';
import { IGetMesocycleNotesParams } from '../data/params/get-mesocycle-notes-params';
import { IMesocycleNoteWithDetails } from '../data/interfaces/mesocycle-note';
import { MesocycleNoteService } from '../services/mesocycle-note-service';

/**
 * Use Case: Get Mesocycle Notes
 *
 * @responsibility Retrieves all notes for a mesocycle
 */
export class GetMesocycleNotesUseCase {
  /**
   * Executes the use case to get all notes for a mesocycle
   *
   * @param params Get notes parameters
   * @returns Array of notes with details
   * @throws Error if retrieval fails
   */
  static async execute(
    params: IGetMesocycleNotesParams
  ): Promise<IMesocycleNoteWithDetails[]> {
    Logger.debug('GetMesocycleNotesUseCase: Starting', {
      mesocycleId: params.mesocycle_id,
    });

    const response = await MesocycleNoteService.getNotesByMesocycleId(
      params.mesocycle_id
    );

    if (response.status === 'error') {
      Logger.error('GetMesocycleNotesUseCase: Failed', response.error);
      throw response.error;
    }

    Logger.debug('GetMesocycleNotesUseCase: Completed', {
      count: response.data.length,
    });

    return response.data;
  }
}

