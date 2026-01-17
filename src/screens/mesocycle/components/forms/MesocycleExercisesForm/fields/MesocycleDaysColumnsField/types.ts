import { Dispatch, SetStateAction } from 'react';

import { PrimaryMuscleGroup } from '../../../../../../../enums/databas.enums';
import { IExercise } from '../../../../../../../training-module/exercise/data/interfaces/exercise';

export type ExerciseColumn = {
  id: string;
  bodyPart: PrimaryMuscleGroup | null;
  selectedExercise: IExercise | null;
};

export type DayColumn = {
  id: string;
  selectedDay: string | null;
  exercises: ExerciseColumn[];
};

export type ExerciseContext = {
  dayId: string;
  exercise: ExerciseColumn;
};

export type UseBodyPartSelectionProps = {
  pendingDayId: string | null;
  setPendingDayId: Dispatch<SetStateAction<string | null>>;
  setDaysColumns: Dispatch<SetStateAction<DayColumn[]>>;
};

export type UseExerciseSelectionProps = {
  currentExerciseContext: ExerciseContext | null;
  setCurrentExerciseContext: Dispatch<SetStateAction<ExerciseContext | null>>;
  setDaysColumns: Dispatch<SetStateAction<DayColumn[]>>;
};
