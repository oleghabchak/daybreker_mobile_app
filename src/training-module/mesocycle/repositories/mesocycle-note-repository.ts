import { supabase } from '../../../lib/supabase';
import { AsyncResponse } from '../../../shared-module/data/types/async-response';
import { IMesocycleNoteWithDetails } from '../data/interfaces/mesocycle-note';
import { IProfileNote } from '../data/interfaces/profile-note';
import { ICreateMesocycleNoteParams } from '../data/params/create-mesocycle-note-params';
import { IDeleteMesocycleNoteParams } from '../data/params/delete-mesocycle-note-params';
import { IUpdateMesocycleNoteParams } from '../data/params/update-mesocycle-note-params';

export class MesocycleNoteRepository {
  private static profileNotesTable = supabase.from('profile_notes');
  private static mesocycleNotesTable = supabase.from('mesocycle_notes');

  /**
   * Create a note for a mesocycle
   * Creates both profile_notes entry and mesocycle_notes junction entry
   */
  static async create(
    params: ICreateMesocycleNoteParams
  ): Promise<AsyncResponse<IMesocycleNoteWithDetails>> {
    try {
      // First, create the profile note
      const now = new Date().toISOString();

      const { data: profileNote, error: profileError } =
        await this.profileNotesTable
          .insert({
            note: params.note,
            created_at: now,
            last_modified: now,
          })
          .select()
          .single<IProfileNote>();

      if (profileError) {
        throw profileError;
      }

      // Then, create the junction entry
      const { data: mesocycleNote, error: junctionError } =
        await this.mesocycleNotesTable
          .insert({
            mesocycle_id: params.mesocycle_id,
            profile_note_id: profileNote.id,
          })
          .select()
          .single();

      if (junctionError) {
        throw junctionError;
      }

      // Return the combined data
      return {
        status: 'ok',
        data: {
          ...mesocycleNote,
          profile_note: profileNote,
        },
      };
    } catch (error) {
      return {
        status: 'error',
        error: error as Error,
      };
    }
  }

  /**
   * Get all notes for a mesocycle
   */
  static async getByMesocycleId(
    mesocycleId: string
  ): Promise<AsyncResponse<IMesocycleNoteWithDetails[]>> {
    try {
      const { data, error } = await this.mesocycleNotesTable
        .select(
          `
          mesocycle_id,
          profile_note_id,
          profile_note:profile_notes (*)
        `
        )
        .eq('mesocycle_id', mesocycleId);

      if (error) {
        throw error;
      }

      const notesWithDetails: IMesocycleNoteWithDetails[] = data.map(
        (item: any) => ({
          mesocycle_id: item.mesocycle_id,
          profile_note_id: item.profile_note_id,
          profile_note: item.profile_note,
        })
      );

      return {
        status: 'ok',
        data: notesWithDetails,
      };
    } catch (error) {
      return {
        status: 'error',
        error: error as Error,
      };
    }
  }

  /**
   * Update a note
   */
  static async update(
    params: IUpdateMesocycleNoteParams
  ): Promise<AsyncResponse<IProfileNote>> {
    try {
      const { data, error } = await this.profileNotesTable
        .update({
          note: params.note,
          last_modified: new Date().toISOString(),
        })
        .eq('id', params.profile_note_id)
        .select()
        .single<IProfileNote>();

      if (error) {
        throw error;
      }

      return {
        status: 'ok',
        data,
      };
    } catch (error) {
      return {
        status: 'error',
        error: error as Error,
      };
    }
  }

  /**
   * Delete a note (removes from mesocycle only, not from profile_notes)
   */
  static async delete(
    params: IDeleteMesocycleNoteParams
  ): Promise<AsyncResponse<void>> {
    try {
      const { error } = await this.mesocycleNotesTable
        .delete()
        .eq('mesocycle_id', params.mesocycle_id)
        .eq('profile_note_id', params.profile_note_id);

      if (error) {
        throw error;
      }

      return {
        status: 'ok',
        data: undefined,
      };
    } catch (error) {
      return {
        status: 'error',
        error: error as Error,
      };
    }
  }

  /**
   * Delete a profile note completely (removes from all mesocycles)
   */
  static async deleteProfileNote(
    profileNoteId: string
  ): Promise<AsyncResponse<void>> {
    try {
      const { error } = await this.profileNotesTable
        .delete()
        .eq('id', profileNoteId);

      if (error) {
        throw error;
      }

      return {
        status: 'ok',
        data: undefined,
      };
    } catch (error) {
      return {
        status: 'error',
        error: error as Error,
      };
    }
  }
}
