import { useMemo, Dispatch, SetStateAction } from 'react';

import { PrimaryMuscleGroup } from '../../../../../../../enums/databas.enums';
import { IExercise } from '../../../../../../../training-module/exercise/data/interfaces/exercise';

import {
  DayColumn,
  UseBodyPartSelectionProps,
  UseExerciseSelectionProps,
} from './types';

export const useIsDaysColumnsValid = (daysColumns: DayColumn[]): boolean => {
  return useMemo(() => {
    return (
      daysColumns.length > 0 &&
      daysColumns.every(col => {
        if (!col.selectedDay) return false;
        if (!col.exercises.length) return false;

        return col.exercises.every(exercise => {
          return !!exercise.selectedExercise;
        });
      })
    );
  }, [daysColumns]);
};

export const useDayColumn = (
  setDaysColumns: Dispatch<SetStateAction<DayColumn[]>>
) => {
  const addDayColumn = () => {
    const newDayColumn: DayColumn = {
      id: `day-col-${Date.now()}`,
      selectedDay: null,
      exercises: [],
    };

    setDaysColumns(prev => [...prev, newDayColumn]);
  };

  const deleteDayColumn = (dayId: string) => {
    setDaysColumns(prev => prev.filter(day => day.id !== dayId));
  };

  return {
    addDayColumn,
    deleteDayColumn,
  };
};

export const useExerciseSelection = ({
  currentExerciseContext,
  setCurrentExerciseContext,
  setDaysColumns,
}: UseExerciseSelectionProps) => {
  const handleOnCloseExerciseSelection = () => setCurrentExerciseContext(null);
  const handleOnSelectedExercise = (selectedExercise: IExercise) => {
    if (!currentExerciseContext) return;

    setDaysColumns(prev =>
      prev.map(dayColumn => {
        if (dayColumn.id === currentExerciseContext.dayId) {
          return {
            ...dayColumn,
            exercises: dayColumn.exercises.map(exercise =>
              exercise.id === currentExerciseContext.exercise.id
                ? { ...exercise, selectedExercise }
                : exercise
            ),
          };
        }

        return dayColumn;
      })
    );

    setCurrentExerciseContext(null);
  };
  return {
    handleOnCloseExerciseSelection,
    handleOnSelectedExercise,
  };
};

export const useBodyPartSelection = ({
  pendingDayId,
  setPendingDayId,
  setDaysColumns,
}: UseBodyPartSelectionProps) => {
  const handleOnCloseBodyPartSelection = () => setPendingDayId(null);
  const handleOnSelectedBodyPart = (bodyPart: PrimaryMuscleGroup) => {
    if (!pendingDayId) return;

    setDaysColumns(prev =>
      prev.map(dayColumn => {
        if (dayColumn.id === pendingDayId && dayColumn.exercises.length < 15) {
          return {
            ...dayColumn,
            exercises: [
              ...dayColumn.exercises,
              {
                id: `${pendingDayId}-exercise-${dayColumn.exercises.length + 1}`,
                bodyPart,
                selectedExercise: null,
              },
            ],
          };
        }

        return dayColumn;
      })
    );

    setPendingDayId(null);
  };

  const handleOnShowBodyPartSelectionModal = (dayId: string) => {
    setPendingDayId(dayId);
  };

  return {
    handleOnCloseBodyPartSelection,
    handleOnSelectedBodyPart,
    handleOnShowBodyPartSelectionModal,
  };
};
