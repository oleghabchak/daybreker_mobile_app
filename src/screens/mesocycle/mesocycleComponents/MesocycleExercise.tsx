import { ChevronUp, ChevronDown, CircleX } from 'lucide-react-native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { BorderRadius, Colors, Space, Typography } from '../../../constants';
import { PrimaryMuscleGroup } from '../../../enums/databas.enums';
import { IExercise } from '../../../training-module/exercise/data/interfaces/exercise';

type ExerciseColumn = {
  id: string;
  bodyPart: string | null;
  selectedExercise: IExercise | null;
};

export interface MesocycleExerciseProps {
  exercise: ExerciseColumn;
  index: number;
  onRemove: () => void;
  onExerciseSelect: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}

const MuscleGroups: Record<PrimaryMuscleGroup, string> = {
  [PrimaryMuscleGroup.QUADS]: 'Quads',
  [PrimaryMuscleGroup.GLUTES]: 'Glutes',
  [PrimaryMuscleGroup.CHEST]: 'Chest',
  [PrimaryMuscleGroup.BACK]: 'Back',
  [PrimaryMuscleGroup.SHOULDERS]: 'Shoulders',
  [PrimaryMuscleGroup.ABS]: 'Abs',
  [PrimaryMuscleGroup.HAMSTRINGS]: 'Hamstrings',
  [PrimaryMuscleGroup.LOW_BACK]: 'Low back',
  [PrimaryMuscleGroup.CALVES]: 'Calves',
  [PrimaryMuscleGroup.BICEPS]: 'Biceps',
  [PrimaryMuscleGroup.TRICEPS]: 'Triceps',
  [PrimaryMuscleGroup.FOREARMS]: 'Forearms',
  [PrimaryMuscleGroup.TRAPS]: 'Traps',
  [PrimaryMuscleGroup.FULL_BODY]: 'Full body',
};

export const MesocycleExercise: React.FC<MesocycleExerciseProps> = ({
  exercise,
  index,
  onRemove,
  onExerciseSelect,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}) => {
  return (
    <View style={[styles.columnContainer]}>
      <View style={styles.columnHeader}>
        <View style={styles.columnHeaderLeft}>
          <Text style={styles.columnNumber}>{index + 1}</Text>
          <View style={styles.reorderButtons}>
            {!isFirst && (
              <TouchableOpacity
                onPress={onMoveUp}
                disabled={isFirst}
                style={[styles.reorderButton, isFirst && styles.disabledButton]}
                hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
              >
                <ChevronUp
                  size={14}
                  color={isFirst ? Colors.textDisabled : Colors.secondary}
                />
              </TouchableOpacity>
            )}

            {!isLast && (
              <TouchableOpacity
                onPress={onMoveDown}
                disabled={isLast}
                style={[styles.reorderButton, isLast && styles.disabledButton]}
                hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
              >
                <ChevronDown
                  size={14}
                  color={isLast ? Colors.textDisabled : Colors.secondary}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
        <TouchableOpacity
          onPress={onRemove}
          style={styles.removeColumnButton}
          hitSlop={{ top: 3, bottom: 3, left: 3, right: 3 }}
          activeOpacity={0.7}
        >
          <CircleX size={12} color={Colors.text} />
        </TouchableOpacity>
      </View>
      {/* Body Part Display */}
      <View style={styles.bodyPartContainer}>
        <Text style={styles.bodyPartLabel}>
          {MuscleGroups[exercise.bodyPart as PrimaryMuscleGroup]}
        </Text>
      </View>

      {/* Exercise Selection */}
      <TouchableOpacity
        style={styles.exerciseSelector}
        onPress={onExerciseSelect}
      >
        <Text
          style={[
            styles.exerciseSelectorText,
            !exercise.selectedExercise && styles.placeholderText,
          ]}
        >
          {exercise.selectedExercise?.exercise_display_name_en ||
            'Select exercise...'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  columnContainer: {
    marginBottom: Space[3],
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.primary,
    padding: Space[2],
    minHeight: 80,
    justifyContent: 'center',
    position: 'relative',
  },
  columnHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Space[1],
  },
  columnHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reorderButtons: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  reorderButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(71, 159, 199, 0.15)',
    minWidth: 24,
    minHeight: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: 'rgba(107, 107, 107, 0.1)',
  },
  columnNumber: {
    ...Typography.caption,
    color: Colors.text,
    fontWeight: '600',
  },
  removeColumnButton: {
    padding: 2,
  },

  bodyPartContainer: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Space[2],
    paddingVertical: Space[1],
    borderRadius: BorderRadius.xs,
    marginBottom: Space[2],
  },
  bodyPartLabel: {
    ...Typography.bodyBold,
    color: Colors.background,
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
  exerciseSelector: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Space[2],
    minHeight: 40,
    justifyContent: 'center',
  },
  exerciseSelectorText: {
    ...Typography.body,
    color: Colors.text,
    fontSize: 13,
  },
  placeholderText: {
    color: Colors.text,
    fontStyle: 'italic',
  },
});
