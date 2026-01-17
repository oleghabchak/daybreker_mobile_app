import { IProfileNote } from './profile-note';

export interface IMesocycleNote {
  mesocycle_id: string;
  profile_note_id: string;
}

export interface IMesocycleNoteWithDetails extends IMesocycleNote {
  profile_note: IProfileNote;
}

