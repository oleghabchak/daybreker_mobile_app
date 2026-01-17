import React, { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

import { BorderRadius, Colors, Space } from '../../../../constants/theme';
import { useAuthStore } from '../../../../models/AuthenticationStore';
import { useExercisesStore } from '../../../../models/ExercisesStore';
import { Logger } from '../../../../services/logger';
import { useMesocycleStore } from '../../../../training-module/mesocycle/stores/mesocycle-store';
import { IWorkoutExercise } from '../../../../training-module/workout/data/interfaces/workout-exercise';
import { useWorkoutStore } from '../../../../training-module/workout/stores/workout-store';
import { useDebounce } from '../../../../utils/useDebounce';

import { CustomExerciseContent } from './CustomExerciseContent';
import { LibraryContent } from './LibraryContent';
import { ModalActions } from './ModalActions';
import { ModalHeader } from './ModalHeader';

export interface AddExerciseModalProps {
  isVisible: boolean;
  onClose: () => void;
  onAddExercise: (exercise: {
    name: string;
    sets: number;
    reps: number;
    weight: number;
    rir: number;
    exerciseData?: any;
  }) => void;
  selectedExercise?: any;
  workoutId?: string;
  swapExercise?: IWorkoutExercise;
}

export type SwitchSelectorOption = {
  label: string;
  value: string;
};

export const AddExerciseModal: React.FC<AddExerciseModalProps> = ({
  isVisible,
  onClose,
  onAddExercise,
  selectedExercise: initialSelectedExercise,
  swapExercise,
}) => {
  const [exerciseName, setExerciseName] = useState('');
  const [type, setType] = useState<SwitchSelectorOption>({
    label: 'Exercises Library',
    value: 'library',
  });
  const [searchText, setSearchText] = useState('');
  const [isConfirmationAlertVisible, setIsConfirmationAlertVisible] =
    useState(false);
  const [selectedExercise, setSelectedExercise] = useState<any>(null);
  const [activeFilters, setActiveFilters] = useState<{
    muscleGroups: string[];
    equipment: string[];
  }>({
    muscleGroups: [],
    equipment: [],
  });

  const { exercises, isLoading, error, searchExercises, fetchAllExercises } =
    useExercisesStore();

  const { user } = useAuthStore();
  const { isLoading: isMesocycleLoading, selectedWorkoutDay } =
    useMesocycleStore();
  const {
    addExerciseToCurrentWorkout,
    swapExerciseOfCurrentWorkout,
    swapAllExercisesOnWholeMesocycle,
  } = useWorkoutStore();

  const debouncedSearchText = useDebounce(searchText, 300);

  useEffect(() => {
    if (initialSelectedExercise) {
      setExerciseName(initialSelectedExercise.exercise_display_name_en || '');
      setSelectedExercise(initialSelectedExercise);
    }
  }, [initialSelectedExercise]);

  useEffect(() => {
    if (type.value === 'library') {
      fetchAllExercises();
    }
  }, [type.value, fetchAllExercises]);

  useEffect(() => {
    if (type.value === 'library' && debouncedSearchText.length >= 3) {
      searchExercises(debouncedSearchText);
    } else if (type.value === 'library' && debouncedSearchText.length === 0) {
      fetchAllExercises();
    }
  }, [debouncedSearchText, type.value, searchExercises, fetchAllExercises]);

  const handleSelectExercise = (exercise: any) => {
    setExerciseName(exercise.exercise_display_name_en || '');
    setSelectedExercise(exercise);
  };

  const handleFilterByMuscleGroup = (muscleGroups: string[]) => {
    if (muscleGroups.length > 0) {
      fetchAllExercises(muscleGroups);
    } else {
      fetchAllExercises();
    }
  };

  const handleFilterByEquipment = (equipment: string[]) => {
    setActiveFilters(prev => ({ ...prev, equipment }));
  };

  const handleFilterByMovementPattern = () => {
    // Filter by movement pattern
  };

  const handleFilterByMechanics = () => {
    // Filter by mechanics
  };

  const handleClearFilters = () => {
    setActiveFilters({
      muscleGroups: [],
      equipment: [],
    });
    fetchAllExercises();
  };

  const handleAddExercise = async () => {
    if (selectedExercise && user?.id) {
      try {
        const result = await addExerciseToCurrentWorkout(
          user?.id,
          selectedExercise.exercise_uid
        );
        if (result.status === 'error') {
          Logger.error('Error adding exercise:', result.error);

          if (result.error?.message === 'Workout id not found') {
            Logger.error(
              'Could not find workout - mesocycle data may not be loaded'
            );
          }

          return;
        }
        if (result.status === 'ok') {
          onAddExercise({
            name: exerciseName.trim(),
            sets: 3,
            reps: 10,
            weight: 0,
            rir: 2,
            exerciseData: selectedExercise,
          });

          handleClose();
        }
      } catch (error) {
        Logger.error('Error adding exercise:', error);
        // Error adding exercise
      }
    } else {
      onAddExercise({
        name: exerciseName.trim(),
        sets: 3,
        reps: 10,
        weight: 0,
        rir: 2,
        exerciseData: selectedExercise,
      });
      handleClose();
    }
  };

  const handleSwapExercise = async () => {
    // Use the correct field name - the database returns 'id' not 'workout_exercise_id'
    const workoutExerciseId =
      swapExercise?.workout_exercise_id || swapExercise?.id;

    if (
      swapExercise &&
      user?.id &&
      workoutExerciseId &&
      selectedExercise?.exercise_uid
    ) {
      const result = await swapExerciseOfCurrentWorkout(
        user.id,
        workoutExerciseId, // This is the workout exercise database ID
        selectedExercise.exercise_uid // This is the new exercise ID
      );
      if (result.status === 'error') {
        Logger.error('Error swapping exercise:', result.error);
        return;
      }
      if (result.status === 'ok') {
        handleClose();
      }
    } else {
      Logger.error('Cannot swap exercise: missing required data', {
        swapExercise: !!swapExercise,
        workoutExerciseId: workoutExerciseId,
        swapExerciseId: swapExercise?.exercise_id,
        selectedExerciseId: selectedExercise?.exercise_uid,
        userId: user?.id,
      });
    }
  };
  const handleSwapAllExercisesOnWholeMesocycle = async () => {
    if (
      swapExercise &&
      user?.id &&
      selectedExercise?.exercise_uid &&
      swapExercise.exercise_id
    ) {
      const result = await swapAllExercisesOnWholeMesocycle(
        user.id,
        swapExercise.exercise_id,
        selectedExercise.exercise_uid
      );
      if (result.status === 'error') {
        Logger.error('Error swapping exercise:', result.error);
        return;
      }
      if (result.status === 'ok') {
        handleClose();
        onAddExercise({
          name: exerciseName.trim(),
          sets: 3,
          reps: 10,
          weight: 0,
          rir: 2,
          exerciseData: selectedExercise,
        });
      }
    } else {
      Logger.error(
        'Cannot swap exercises on whole mesocycle: missing required data',
        {
          swapExercise: !!swapExercise,
          orderIndex: swapExercise?.order_index,
          selectedExerciseId: selectedExercise?.exercise_uid,
          selectedWorkoutDay,
          userId: user?.id,
        }
      );
    }
  };

  const handleClose = () => {
    setExerciseName('');
    setSearchText('');
    setSelectedExercise(null);
    setActiveFilters({
      muscleGroups: [],
      equipment: [],
    });
    onClose();
  };

  const isFormValid = exerciseName.trim().length > 0;

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType='fade'
      onRequestClose={handleClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={handleClose}
      >
        <TouchableOpacity
          style={styles.modalContainer}
          activeOpacity={1}
          onPress={e => e.stopPropagation()}
        >
          <ModalHeader
            title={swapExercise ? 'Swap Exercise' : 'Add New Exercise'}
            type={type}
            onTypeChange={setType}
            onClose={handleClose}
          />

          <ScrollView style={styles.modalContent}>
            {type.value === 'library' ? (
              <LibraryContent
                searchText={searchText}
                setSearchText={setSearchText}
                exercises={exercises}
                isLoading={isLoading}
                error={error}
                fetchAllExercises={fetchAllExercises}
                activeFilters={activeFilters}
                exerciseName={exerciseName}
                onSelectExercise={handleSelectExercise}
                onFilterByMuscleGroup={handleFilterByMuscleGroup}
                onFilterByEquipment={handleFilterByEquipment}
                onFilterByMovementPattern={handleFilterByMovementPattern}
                onFilterByMechanics={handleFilterByMechanics}
                onClearFilters={handleClearFilters}
              />
            ) : (
              <CustomExerciseContent />
            )}
          </ScrollView>

          <ModalActions
            isFormValid={isFormValid}
            isMesocycleLoading={isMesocycleLoading}
            swapExercise={swapExercise}
            onClose={handleClose}
            onAddExercise={handleAddExercise}
            isConfirmationAlertVisible={isConfirmationAlertVisible}
            onConfirmSwap={() => {
              setIsConfirmationAlertVisible(false);
              handleSwapAllExercisesOnWholeMesocycle();
            }}
            onCancelSwap={() => {
              setIsConfirmationAlertVisible(false);
              handleSwapExercise();
            }}
            onCloseConfirmation={() => {
              setIsConfirmationAlertVisible(false);
            }}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    width: '90%',
    maxHeight: '80%',
    shadowColor: Colors.shadowColor,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: Space[4],
    paddingVertical: Space[2],
  },
});
