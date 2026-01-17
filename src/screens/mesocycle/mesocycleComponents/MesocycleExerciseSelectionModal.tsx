import { FilterIcon } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { ExerciseFilterTooltip } from '../../../components';
import { Button, Input } from '../../../components/ui';
import { Tag } from '../../../components/ui/Tag';
import {
  BorderRadius,
  Colors,
  Space,
  Typography,
} from '../../../constants/theme';
import { PrimaryMuscleGroup } from '../../../enums/databas.enums';
import { useExercisesStore } from '../../../models/ExercisesStore';
import { removeUnderscores } from '../../../utils/helpers';
import { useDebounce } from '../../../utils/useDebounce';

export interface MesocycleExerciseSelectionModalProps {
  isVisible: boolean;
  bodyPart: PrimaryMuscleGroup | null;
  onClose: () => void;
  onSelectedExercise: (exercise: any) => void;
}

const AnimatedExerciseItem: React.FC<{
  exercise: any;
  index: number;
  isSelected: boolean;
  onPress: () => void;
}> = ({ exercise, index, isSelected, onPress }) => {
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.8))[0];

  useEffect(() => {
    const delay = index * 25;

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim, index]);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }],
      }}
    >
      <TouchableOpacity
        style={[styles.exerciseItem, isSelected && styles.selectedExerciseItem]}
        onPress={onPress}
      >
        <View style={styles.exerciseHeader}>
          <Text style={styles.exerciseName}>
            {exercise.exercise_display_name_en}
          </Text>
        </View>

        <View style={styles.exerciseDetails}>
          {exercise?.exercise_muscle_groups_simple?.primary?.[0] && (
            <Tag
              text={removeUnderscores(
                exercise.exercise_muscle_groups_simple.primary[0]
              )}
              variant='lightBlue'
              size='small'
            />
          )}
          {exercise?.exercise_primary_movement_pattern && (
            <Tag
              text={removeUnderscores(
                exercise.exercise_primary_movement_pattern
              )}
              variant='lightBlue'
              size='small'
            />
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export const MesocycleExerciseSelectionModal: React.FC<
  MesocycleExerciseSelectionModalProps
> = ({ isVisible, bodyPart, onClose, onSelectedExercise }) => {
  const [searchText, setSearchText] = useState('');
  const [isFilterTooltipVisible, setIsFilterTooltipVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    muscleGroups: [],
  });

  const { exercises, isLoading, error, searchExercises, fetchAllExercises } =
    useExercisesStore();

  const debouncedSearchText = useDebounce(searchText, 300);
  const isSearchValid = searchText.length >= 3 || searchText.length === 0;

  useEffect(() => {
    fetchAllExercises(bodyPart ? [bodyPart] : []);
  }, [bodyPart, fetchAllExercises]);

  useEffect(() => {
    if (debouncedSearchText.length >= 3) {
      searchExercises(debouncedSearchText);
    } else if (debouncedSearchText.length === 0) {
      fetchAllExercises();
    }
  }, [debouncedSearchText, searchExercises, fetchAllExercises]);

  const handleSelectExercise = (exercise: any) => {
    onSelectedExercise(exercise);
  };

  const handleFilterByMuscleGroup = (muscleGroups: string[]) => {
    if (muscleGroups.length > 0) {
      fetchAllExercises(muscleGroups);
    } else {
      fetchAllExercises();
    }
  };

  const handleFilterByEquipment = () => {
    // Filter by equipment
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
    });
    fetchAllExercises();
  };

  const handleClose = () => {
    setSearchText('');
    setActiveFilters({
      muscleGroups: [],
    });
    onClose();
  };

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
          <ScrollView style={styles.modalContent}>
            <View style={styles.libraryContent}>
              <Text style={styles.sectionTitle}>Select Exercise</Text>

              <View style={styles.searchContainer}>
                <Input
                  placeholder='Search exercise...'
                  value={searchText}
                  onChangeText={setSearchText}
                  placeholderTextColor={Colors.textDisabled}
                  icon={
                    <ExerciseFilterTooltip
                      isVisible={isFilterTooltipVisible}
                      onFilterByMuscleGroup={handleFilterByMuscleGroup}
                      onFilterByEquipment={handleFilterByEquipment}
                      onFilterByMovementPattern={handleFilterByMovementPattern}
                      onFilterByMechanics={handleFilterByMechanics}
                      onClearFilters={handleClearFilters}
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

              <View style={styles.exerciseList}>
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading exercises...</Text>
                    <ActivityIndicator
                      size='small'
                      color={Colors.textDisabled}
                    />
                  </View>
                ) : error ? (
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
                ) : exercises.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                      {searchText
                        ? 'No exercises found'
                        : 'No exercises available'}
                    </Text>
                  </View>
                ) : (
                  exercises.map((exercise, index) => (
                    <AnimatedExerciseItem
                      key={exercise.exercise_uid}
                      exercise={exercise}
                      index={index}
                      isSelected={false}
                      onPress={() => handleSelectExercise(exercise)}
                    />
                  ))
                )}
              </View>
            </View>
          </ScrollView>
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
    paddingHorizontal: Space[4],
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Space[8],
    paddingTop: Space[3],
    paddingBottom: Space[4],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerContent: {
    flex: 1,
  },
  modalTitle: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Space[1],
  },
  closeButton: {
    position: 'absolute',
    right: Space[6],
    top: Space[6],
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: Space[4],
    paddingVertical: Space[2],
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Space[3],
    paddingHorizontal: Space[3],
    paddingVertical: Space[2],
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  secondaryButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  disabledButton: {
    backgroundColor: Colors.textDisabled,
    borderColor: Colors.textDisabled,
  },
  primaryButtonText: {
    ...Typography.bodyBold,
    color: Colors.background,
    fontWeight: '600',
  },
  secondaryButtonText: {
    ...Typography.bodyBold,
    color: Colors.background,
    fontWeight: '600',
  },
  disabledButtonText: {
    color: Colors.border,
  },
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
  exerciseItem: {
    borderRadius: BorderRadius.md,
    padding: Space[2],
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedExerciseItem: {
    borderColor: Colors.lightBlue,
    backgroundColor: Colors.textLink + '10',
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Space[1],
  },
  exerciseName: {
    ...Typography.h3,
    color: Colors.text,
    flex: 1,
  },
  exerciseDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Space[2],
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
