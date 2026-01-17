import { AsyncResponse } from '../../../shared-module/data/types/async-response';
import { IMesocycleNoteWithDetails } from '../data/interfaces/mesocycle-note';
import { IProfileNote } from '../data/interfaces/profile-note';
import { ICreateMesocycleNoteParams } from '../data/params/create-mesocycle-note-params';
import { IDeleteMesocycleNoteParams } from '../data/params/delete-mesocycle-note-params';
import { IUpdateMesocycleNoteParams } from '../data/params/update-mesocycle-note-params';
import { MesocycleNoteRepository } from '../repositories/mesocycle-note-repository';

export class MesocycleNoteService {
  /**
   * Create a note for a mesocycle
   */
  static async createNote(
    params: ICreateMesocycleNoteParams
  ): Promise<AsyncResponse<IMesocycleNoteWithDetails>> {
    return await MesocycleNoteRepository.create(params);
  }

  /**
   * Get all notes for a mesocycle
   */
  static async getNotesByMesocycleId(
    mesocycleId: string
  ): Promise<AsyncResponse<IMesocycleNoteWithDetails[]>> {
    return await MesocycleNoteRepository.getByMesocycleId(mesocycleId);
  }

  /**
   * Update a note
   */
  static async updateNote(
    params: IUpdateMesocycleNoteParams
  ): Promise<AsyncResponse<IProfileNote>> {
    return await MesocycleNoteRepository.update(params);
  }

  /**
   * Delete a note from a mesocycle
   */
  static async deleteNote(
    params: IDeleteMesocycleNoteParams
  ): Promise<AsyncResponse<void>> {
    return await MesocycleNoteRepository.delete(params);
  }

  /**
   * Delete a profile note completely
   */
  static async deleteProfileNote(
    profileNoteId: string
  ): Promise<AsyncResponse<void>> {
    return await MesocycleNoteRepository.deleteProfileNote(profileNoteId);
  }
}
