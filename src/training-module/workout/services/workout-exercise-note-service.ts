import { AsyncResponse } from '../../../shared-module/data/types/async-response';
import { IProfileNote } from '../../mesocycle/data/interfaces/profile-note';
import { IWorkoutExerciseNoteWithDetails } from '../data/interfaces/workout-exercise-note';
import { ICreateWorkoutExerciseNoteParams } from '../data/params/create-workout-exercise-note-params';
import { IDeleteWorkoutExerciseNoteParams } from '../data/params/delete-workout-exercise-note-params';
import { IUpdateWorkoutExerciseNoteParams } from '../data/params/update-workout-exercise-note-params';
import { WorkoutExerciseNoteRepository } from '../repositories/workout-exercise-note-repository';

export class WorkoutExerciseNoteService {
  /**
   * Create a note for a workout exercise
   */
  static async createNote(
    params: ICreateWorkoutExerciseNoteParams
  ): Promise<AsyncResponse<IWorkoutExerciseNoteWithDetails>> {
    return await WorkoutExerciseNoteRepository.create(params);
  }

  /**
   * Get all notes for a workout exercise
   */
  static async getNotesByWorkoutExerciseId(
    workoutExerciseId: string
  ): Promise<AsyncResponse<IWorkoutExerciseNoteWithDetails[]>> {
    return await WorkoutExerciseNoteRepository.getByWorkoutExerciseId(
      workoutExerciseId
    );
  }

  /**
   * Get all notes for all exercises in a workout
   */
  static async getNotesByWorkoutId(
    workoutId: string
  ): Promise<AsyncResponse<IWorkoutExerciseNoteWithDetails[]>> {
    return await WorkoutExerciseNoteRepository.getByWorkoutId(workoutId);
  }

  /**
   * Update a note
   */
  static async updateNote(
    params: IUpdateWorkoutExerciseNoteParams
  ): Promise<AsyncResponse<IProfileNote>> {
    return await WorkoutExerciseNoteRepository.update(params);
  }

  /**
   * Delete a note from a workout exercise
   */
  static async deleteNote(
    params: IDeleteWorkoutExerciseNoteParams
  ): Promise<AsyncResponse<void>> {
    return await WorkoutExerciseNoteRepository.delete(params);
  }

  /**
   * Delete a profile note completely
   */
  static async deleteProfileNote(
    profileNoteId: string
  ): Promise<AsyncResponse<void>> {
    return await WorkoutExerciseNoteRepository.deleteProfileNote(profileNoteId);
  }
}
