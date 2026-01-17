import { IProfileNote } from '../../mesocycle/data/interfaces/profile-note';

export interface IWorkoutExerciseNote {
  workout_exercise_id: string;
  profile_note_id: string;
}

export interface IWorkoutExerciseNoteWithDetails extends IWorkoutExerciseNote {
  profile_note: IProfileNote;
}

