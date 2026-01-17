import { FilterIcon } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { ExerciseFilterTooltip } from '../../../../components';
import { Button, Input } from '../../../../components/ui';
import { Colors, Space, Typography } from '../../../../constants/theme';

import { AnimatedExerciseItem } from './AnimatedExerciseItem';

interface LibraryContentProps {
  searchText: string;
  setSearchText: (text: string) => void;
  exercises: any[];
  isLoading: boolean;
  error: string | null;
  fetchAllExercises: () => void;
  activeFilters: {
    muscleGroups: string[];
    equipment: string[];
  };
  exerciseName: string;
  onSelectExercise: (exercise: any) => void;
  onFilterByMuscleGroup: (muscleGroups: string[]) => void;
  onFilterByEquipment: (equipment: string[]) => void;
  onFilterByMovementPattern: () => void;
  onFilterByMechanics: () => void;
  onClearFilters: () => void;
}

export const LibraryContent: React.FC<LibraryContentProps> = ({
  searchText,
  setSearchText,
  exercises,
  isLoading,
  error,
  fetchAllExercises,
  activeFilters,
  exerciseName,
  onSelectExercise,
  onFilterByMuscleGroup,
  onFilterByEquipment,
  onFilterByMovementPattern,
  onFilterByMechanics,
  onClearFilters,
}) => {
  const [isFilterTooltipVisible, setIsFilterTooltipVisible] = useState(false);

  const isSearchValid = searchText.length >= 3 || searchText.length === 0;

  const filteredExercises = exercises.filter(ex => {
    const equipmentFilters = Array.isArray(activeFilters?.equipment)
      ? activeFilters.equipment
      : [];
    if (equipmentFilters.length === 0) return true;
    const implement =
      (ex as any).exercise_implement_primary?.toLowerCase?.() ?? '';
    return equipmentFilters.includes(implement);
  });

  const renderExerciseList = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading exercises...</Text>
          <ActivityIndicator size='small' color={Colors.textDisabled} />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button
            variant='secondary'
            onPress={() => fetchAllExercises()}
            style={styles.retryButton}
          >
            Retry
          </Button>
        </View>
      );
    }

    if (filteredExercises.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {searchText ? 'No exercises found' : 'No exercises available'}
          </Text>
        </View>
      );
    }

    return filteredExercises.map((exercise, index) => (
      <AnimatedExerciseItem
        key={exercise.exercise_uid}
        exercise={exercise}
        index={index}
        isSelected={exerciseName === exercise.exercise_display_name_en}
        onPress={() => onSelectExercise(exercise)}
      />
    ));
  };

  return (
    <View style={styles.libraryContent}>
      <Text style={styles.sectionTitle}>Select from Library</Text>

      <View style={styles.searchContainer}>
        <Input
          placeholder='Search exercise...'
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor={Colors.textDisabled}
          icon={
            <ExerciseFilterTooltip
              isVisible={isFilterTooltipVisible}
              onFilterByMuscleGroup={onFilterByMuscleGroup}
              onFilterByEquipment={onFilterByEquipment}
              onFilterByMovementPattern={onFilterByMovementPattern}
              onFilterByMechanics={onFilterByMechanics}
              onClearFilters={onClearFilters}
              onShow={() => setIsFilterTooltipVisible(true)}
              onHide={() => setIsFilterTooltipVisible(false)}
              activeFilters={activeFilters}
              position='bottom'
            >
              <FilterIcon
                size={20}
                color={Colors.textDisabled}
                style={{ marginBottom: Space[1] }}
              />
            </ExerciseFilterTooltip>
          }
          onIconPress={() => setIsFilterTooltipVisible(true)}
        />
        {!isSearchValid && searchText.length > 0 && (
          <Text style={styles.validationText}>
            Please enter at least 3 characters to start search
          </Text>
        )}
      </View>

      <View style={styles.exerciseList}>{renderExerciseList()}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  libraryContent: {
    paddingVertical: Space[1],
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Space[1],
  },
  searchContainer: {
    marginBottom: Space[2],
  },
  validationText: {
    ...Typography.caption,
    color: Colors.error,
    marginLeft: Space[1],
    position: 'absolute',
    bottom: -17,
    left: 0,
  },
  exerciseList: {
    gap: Space[2],
    marginTop: 10,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Space[8],
  },
  loadingText: {
    ...Typography.body,
    color: Colors.textDisabled,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Space[8],
  },
  errorText: {
    ...Typography.body,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: Space[4],
  },
  retryButton: {
    marginTop: Space[2],
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Space[8],
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textDisabled,
    textAlign: 'center',
  },
});
