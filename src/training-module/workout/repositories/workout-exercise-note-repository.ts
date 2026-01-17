import { supabase } from '../../../lib/supabase';
import { AsyncResponse } from '../../../shared-module/data/types/async-response';
import { IProfileNote } from '../../mesocycle/data/interfaces/profile-note';
import { IWorkoutExerciseNoteWithDetails } from '../data/interfaces/workout-exercise-note';
import { ICreateWorkoutExerciseNoteParams } from '../data/params/create-workout-exercise-note-params';
import { IDeleteWorkoutExerciseNoteParams } from '../data/params/delete-workout-exercise-note-params';
import { IUpdateWorkoutExerciseNoteParams } from '../data/params/update-workout-exercise-note-params';

export class WorkoutExerciseNoteRepository {
  private static profileNotesTable = supabase.from('profile_notes');
  private static workoutExerciseNotesTable = supabase.from(
    'workout_exercise_notes'
  );

  /**
   * Create a note for a workout exercise
   * Creates both profile_notes entry and workout_exercise_notes junction entry
   */
  static async create(
    params: ICreateWorkoutExerciseNoteParams
  ): Promise<AsyncResponse<IWorkoutExerciseNoteWithDetails>> {
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
      const { data: workoutExerciseNote, error: junctionError } =
        await this.workoutExerciseNotesTable
          .insert({
            workout_exercise_id: params.workout_exercise_id,
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
          ...workoutExerciseNote,
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
   * Get all notes for a workout exercise
   */
  static async getByWorkoutExerciseId(
    workoutExerciseId: string
  ): Promise<AsyncResponse<IWorkoutExerciseNoteWithDetails[]>> {
    try {
      const { data, error } = await this.workoutExerciseNotesTable
        .select(
          `
          workout_exercise_id,
          profile_note_id,
          profile_note:profile_notes (*)
        `
        )
        .eq('workout_exercise_id', workoutExerciseId);

      if (error) {
        throw error;
      }

      const notesWithDetails: IWorkoutExerciseNoteWithDetails[] = data.map(
        (item: any) => ({
          workout_exercise_id: item.workout_exercise_id,
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
   * Get all notes for all exercises in a workout (using workout_id)
   */
  static async getByWorkoutId(
    workoutId: string
  ): Promise<AsyncResponse<IWorkoutExerciseNoteWithDetails[]>> {
    try {
      // Use a nested select to get all notes for all exercises in the workout
      const { data, error } = await supabase
        .from('workout_exercises')
        .select(`
          id,
          workout_exercise_notes (
            workout_exercise_id,
            profile_note_id,
            profile_note:profile_notes (*)
          )
        `)
        .eq('workout_id', workoutId);

      if (error) {
        throw error;
      }

      // Flatten the nested structure to get all notes
      const allNotes: IWorkoutExerciseNoteWithDetails[] = [];
      
      (data || []).forEach((exercise: any) => {
        if (exercise.workout_exercise_notes && exercise.workout_exercise_notes.length > 0) {
          exercise.workout_exercise_notes.forEach((note: any) => {
            allNotes.push({
              workout_exercise_id: note.workout_exercise_id,
              profile_note_id: note.profile_note_id,
              profile_note: note.profile_note,
            });
          });
        }
      });

      return {
        status: 'ok',
        data: allNotes,
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
    params: IUpdateWorkoutExerciseNoteParams
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
   * Delete a note (removes from workout exercise only, not from profile_notes)
   */
  static async delete(
    params: IDeleteWorkoutExerciseNoteParams
  ): Promise<AsyncResponse<void>> {
    try {
      const { error } = await this.workoutExerciseNotesTable
        .delete()
        .eq('workout_exercise_id', params.workout_exercise_id)
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
   * Delete a profile note completely (removes from all workout exercises)
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
