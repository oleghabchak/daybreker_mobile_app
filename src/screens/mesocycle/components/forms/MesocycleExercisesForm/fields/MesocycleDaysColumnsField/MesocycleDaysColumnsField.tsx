import { Plus, Trash2 } from 'lucide-react-native';
import { Dispatch, FC, SetStateAction, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { AnimatedGHScrollView } from '../../../../../../../components/AnimatedGHScrollView';
import { Dropdown } from '../../../../../../../components/ui';
import { Colors } from '../../../../../../../constants/theme';
import { MesocycleBodyPartSelectionModal } from '../../../../../mesocycleComponents/MesocycleBodyPartSelectionModal';
import { MesocycleExercise } from '../../../../../mesocycleComponents/MesocycleExercise';
import { MesocycleExerciseSelectionModal } from '../../../../../mesocycleComponents/MesocycleExerciseSelectionModal';

import { WEEKDAYS } from './constants';
import {
  useBodyPartSelection,
  useDayColumn,
  useExerciseSelection,
} from './hooks';
import { styles } from './styles';
import type { DayColumn, ExerciseContext } from './types';

export type MesocycleDaysColumnsFieldProps = {
  value: DayColumn[];
  name: string;
  onChange: (name: string, value: DayColumn[]) => void;
};

export const MesocycleDaysColumnsField: FC<MesocycleDaysColumnsFieldProps> = ({
  name,
  value,
  onChange,
}) => {
  const [pendingDayId, setPendingDayId] = useState<string | null>(null);
  const [currentExerciseContext, setCurrentExerciseContext] =
    useState<ExerciseContext | null>(null);
  const [daysColumns, setDaysColumns] = useState(value);

  const overwriteSetDaysColumns: Dispatch<
    SetStateAction<DayColumn[]>
  > = value => {
    setDaysColumns(prev => {
      const newValue = typeof value === 'function' ? value(prev) : value;

      onChange(name, newValue as DayColumn[]);

      return newValue;
    });
  };

  const { addDayColumn, deleteDayColumn } = useDayColumn(
    overwriteSetDaysColumns
  );

  const {
    handleOnShowBodyPartSelectionModal,
    handleOnCloseBodyPartSelection,
    handleOnSelectedBodyPart,
  } = useBodyPartSelection({
    pendingDayId,
    setPendingDayId,
    setDaysColumns: overwriteSetDaysColumns,
  });

  const { handleOnCloseExerciseSelection, handleOnSelectedExercise } =
    useExerciseSelection({
      currentExerciseContext,
      setCurrentExerciseContext,
      setDaysColumns: overwriteSetDaysColumns,
    });

  const updateDaySelection = (dayId: string, selectedDay: string) => {
    setDaysColumns(prev =>
      prev.map(dayColumn =>
        dayColumn.id === dayId ? { ...dayColumn, selectedDay } : dayColumn
      )
    );
  };

  const moveExercise = (
    columnId: string,
    exerciseId: string,
    direction: 'up' | 'down'
  ) => {
    setDaysColumns(prev =>
      prev.map(dayColumn => {
        if (dayColumn.id === columnId) {
          const exercises = [...dayColumn.exercises];
          const currentIndex = exercises.findIndex(ex => ex.id === exerciseId);

          if (currentIndex === -1) return dayColumn;

          const targetIndex =
            direction === 'up' ? currentIndex - 1 : currentIndex + 1;

          if (targetIndex < 0 || targetIndex >= exercises.length) {
            return dayColumn;
          }

          [exercises[currentIndex], exercises[targetIndex]] = [
            exercises[targetIndex],
            exercises[currentIndex],
          ];

          return {
            ...dayColumn,
            exercises,
          };
        }

        return dayColumn;
      })
    );
  };

  const removeExercise = (columnId: string, exerciseId: string) => {
    setDaysColumns(prev =>
      prev.map(dayColumn => {
        if (dayColumn.id === columnId) {
          return {
            ...dayColumn,
            exercises: dayColumn.exercises.filter(
              exercise => exercise.id !== exerciseId
            ),
          };
        }

        return dayColumn;
      })
    );
  };

  return (
    <>
      <AnimatedGHScrollView
        horizontal
        nestedScrollEnabled
        directionalLockEnabled
        removeClippedSubviews={false}
        contentContainerStyle={styles.weekdaysScrollContent}
      >
        {daysColumns.map(dayColumn => (
          <View key={dayColumn.id} style={[styles.weekdayColumn]}>
            {/* Day Selection Header */}
            <View style={styles.weekdayHeader}>
              <Dropdown
                style={styles.dayDropdown}
                containerStyle={styles.dayDropdownContainer}
                data={WEEKDAYS.filter(
                  day => !daysColumns.map(col => col.selectedDay).includes(day)
                ).map(day => ({ value: day, label: day }))}
                onChange={item => {
                  updateDaySelection(dayColumn.id, item.value);
                }}
                placeholder={'Select a day'}
                selectedValue={
                  dayColumn.selectedDay
                    ? {
                        value: dayColumn.selectedDay,
                        label: dayColumn.selectedDay,
                      }
                    : null
                }
              />
              <TouchableOpacity
                onPress={() => deleteDayColumn(dayColumn.id)}
                style={styles.deleteWeekdayButton}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                activeOpacity={0.7}
              >
                <Trash2 size={14} color={Colors.error} />
              </TouchableOpacity>
            </View>

            <View style={styles.exercisesContainer}>
              {dayColumn.exercises.map((exercise, index) => (
                <MesocycleExercise
                  key={exercise.id}
                  exercise={exercise}
                  index={index}
                  isFirst={index === 0}
                  isLast={index === dayColumn.exercises.length - 1}
                  onRemove={() => removeExercise(dayColumn.id, exercise.id)}
                  onMoveUp={() => moveExercise(dayColumn.id, exercise.id, 'up')}
                  onMoveDown={() =>
                    moveExercise(dayColumn.id, exercise.id, 'down')
                  }
                  onExerciseSelect={() => {
                    setCurrentExerciseContext({
                      dayId: dayColumn.id,
                      exercise: exercise,
                    });
                  }}
                />
              ))}

              {dayColumn.exercises.length < 15 && (
                <TouchableOpacity
                  style={styles.addColumnButton}
                  onPress={handleOnShowBodyPartSelectionModal.bind(
                    null,
                    dayColumn.id
                  )}
                  activeOpacity={0.7}
                >
                  <Plus size={16} color={Colors.primary} />
                  <Text style={styles.addColumnText}>Add Exercise</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}

        {/* Add Day Column Button */}
        <TouchableOpacity
          style={styles.addDayColumnButton}
          onPress={addDayColumn}
          activeOpacity={0.7}
        >
          <Plus size={20} color={Colors.primary} />
          <Text style={styles.addDayColumnText}>Add Day</Text>
        </TouchableOpacity>
      </AnimatedGHScrollView>

      {/* Exercise Selection Modal */}
      <MesocycleExerciseSelectionModal
        isVisible={!!currentExerciseContext}
        bodyPart={
          currentExerciseContext
            ? currentExerciseContext.exercise.bodyPart
            : null
        }
        onClose={handleOnCloseExerciseSelection}
        onSelectedExercise={handleOnSelectedExercise}
      />

      {/* Body Part Selection Modal */}
      <MesocycleBodyPartSelectionModal
        isVisible={!!pendingDayId}
        onClose={handleOnCloseBodyPartSelection}
        onSelectedBodyPart={handleOnSelectedBodyPart}
      />
    </>
  );
};
