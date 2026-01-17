import { ChevronUp, EllipsisVertical, Plus } from 'lucide-react-native';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  LayoutAnimation,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useShallow } from 'zustand/react/shallow';

import { AddNotesModal, Modal as AppModal, Divider } from '../../../components';
import { Slider } from '../../../components/slider/Slider';
import { ExerciseActionTooltip } from '../../../components/tooltips/ExerciseActionTooltip';
import { ConfirmationAlert } from '../../../components/ui/ConfirmationAlert';
import { Tag } from '../../../components/ui/Tag';
import {
  BorderRadius,
  Colors,
  ScreenWidth,
  Space,
  Typography,
} from '../../../constants';
import { ExerciseStatus } from '../../../enums/exercise.enum';
import { FeedbackOptions } from '../../../enums/feedback_options.emun';
import { supabase } from '../../../lib/supabase';
import { useAuthStore } from '../../../models/AuthenticationStore';
import { Logger } from '../../../services/logger';
import { AsyncResponse } from '../../../shared-module/data/types/async-response';
import { useMesocycleStore } from '../../../training-module/mesocycle/stores/mesocycle-store';
import { IWorkoutExercise } from '../../../training-module/workout/data/interfaces/workout-exercise';
import { IWorkoutExerciseNoteWithDetails } from '../../../training-module/workout/data/interfaces/workout-exercise-note';
import { IWorkoutSet } from '../../../training-module/workout/data/interfaces/workout-set';
import { useWorkoutStore } from '../../../training-module/workout/stores/workout-store';
import { addOpacity, removeUnderscores } from '../../../utils/helpers';

import { FeedbackRow } from './FeedbackRow';
import { SetRow } from './setRow/SetRow';
export interface ExerciseCardProps {
  exercise: IWorkoutExercise;
  exercisesLength: number;
  index: number;
  drag?: () => void;
  isActive?: boolean;
  onMenuPress?: (exercise: IWorkoutExercise) => void;
  refreshWorkouts?: () => void;
}

/**
 * Calculates whether a set's inputs should be disabled based on Week 1 progression logic
 * @param set - The current set object
 * @param currentWeek - The current workout week (1, 2, 3, etc.)
 * @param validSets - Array of all sets for this exercise
 * @returns boolean - true if inputs should be disabled
 */
const calculateSetInputDisabled = (
  set: { status: ExerciseStatus; set_number?: number },
  currentWeek: number | undefined,
  validSets: { status: ExerciseStatus }[]
): boolean => {
  if (set.status === ExerciseStatus.SKIPPED) {
    return true;
  }

  if (currentWeek === 1 && set?.set_number) {
    const calibrationSetCompleted =
      validSets.length > 0 && validSets[0]?.status === ExerciseStatus.DONE;
    const validationSetCompleted =
      validSets.length > 1 && validSets[1]?.status === ExerciseStatus.DONE;

    switch (set.set_number) {
      case 1:
        return false;

      case 2:
        return !calibrationSetCompleted;

      case 3:
        return !calibrationSetCompleted || !validationSetCompleted;

      default:
        return false;
    }
  }

  return false;
};

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  drag,
  isActive,
  onMenuPress,
  refreshWorkouts,
}) => {
  const { user } = useAuthStore();
  const INITIAL_OPEN = true;
  const [isOpen, setIsOpen] = useState(true);
  const [exerciseMenuVisible, setExerciseMenuVisible] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    pump: '',
    effort: '',
    jointPain: '',
  });
  const [showAddNotesModal, setShowAddNotesModal] = useState(false);
  const [selectedNote, setSelectedNote] =
    useState<IWorkoutExerciseNoteWithDetails | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [setsContentHeight, setSetsContentHeight] = useState<number>(0);
  const [coachingCues, setCoachingCues] = useState<string | null>(null);
  const [showDeleteConfirmationAlert, setShowDeleteConfirmationAlert] =
    useState(false);

  const {
    currentWorkout,
    createExerciseSet,
    deleteExerciseSet,
    updateReps,
    updateWeight,
    removeWorkoutExercise,
    deleteExerciseOnWholeMesocycle,
    getNotesForExercise,
    loadNotesForExercise,
  } = useWorkoutStore(
    useShallow(state => ({
      currentWorkout: state.currentWorkout,
      workoutStats: state.workoutStats,
      createExerciseSet: state.createExerciseSet,
      deleteExerciseSet: state.deleteExerciseSet,
      markAsSkipped: state.markAsSkipped,
      updateReps: state.updateReps,
      updateWeight: state.updateWeight,
      removeWorkoutExercise: state.removeWorkoutExercise,
      swapExerciseOfCurrentWorkout: state.swapExerciseOfCurrentWorkout,
      deleteExerciseOnWholeMesocycle: state.deleteExerciseOnWholeMesocycle,
      getNotesForExercise: state.getNotesForExercise,
      loadNotesForExercise: state.loadNotesForExercise,
    }))
  );

  const { complexMesocycleData } = useMesocycleStore();

  const exerciseId = exercise.workout_exercise_id || exercise.id;
  const notes = getNotesForExercise(exerciseId || '');

  const currentExercise = useMemo(() => {
    const currentExerciseId = exercise?.workout_exercise_id || exercise?.id;

    if (!currentWorkout?.exercises || !currentExerciseId) {
      return exercise;
    }

    return (
      currentWorkout.exercises.find((workoutExercise: IWorkoutExercise) => {
        const workoutExerciseId =
          workoutExercise.workout_exercise_id || workoutExercise.id;
        return workoutExerciseId === currentExerciseId;
      }) ?? exercise
    );
  }, [currentWorkout?.exercises, exercise, exerciseId]);

  const validSets = useMemo(() => {
    return currentExercise.sets?.filter(Boolean) ?? [];
  }, [currentExercise.sets]);

  useEffect(() => {
    const allSelected = Boolean(
      feedbackData.pump && feedbackData.effort && feedbackData.jointPain
    );
    if (allSelected && showFeedback) {
      try {
        Toast.show({ type: 'success', text1: 'Feedback saved' });
      } catch {}
      const timeout = setTimeout(handleCloseFeedbackAndToggleOpen, 600);
      return () => clearTimeout(timeout);
    }
  }, [feedbackData, showFeedback]);

  const handleCloseFeedbackAndToggleOpen = () => {
    setShowFeedback(false);
    toggleOpen();
  };

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const menuRef = useRef<View>(null);
  const handleWeightUpdate = useCallback(
    async (setId: string, weight: number): Promise<AsyncResponse<boolean>> => {
      try {
        await updateWeight(setId, weight);

        return { status: 'ok', data: true };
      } catch (error: any) {
        console.error('❌ Error updating weight:', error);
        return { status: 'error', error: error };
      }
    },
    [updateWeight]
  );

  const handleRepsUpdate = useCallback(
    async (setId: string, reps: number): Promise<AsyncResponse<boolean>> => {
      try {
        await updateReps(setId, reps);

        return { status: 'ok', data: true };
      } catch (error: any) {
        console.error('❌ Error updating reps:', error);
        return { status: 'error', error: error as Error };
      }
    },
    [updateReps, exercise.exercise_id, createExerciseSet, currentExercise]
  );

  const rotateAnimation = useRef(
    new Animated.Value(INITIAL_OPEN ? 1 : 0)
  ).current;
  const fadeAnimation = useRef(
    new Animated.Value(INITIAL_OPEN ? 1 : 0)
  ).current;
  const scaleAnimation = useRef(
    new Animated.Value(INITIAL_OPEN ? 1 : 0.8)
  ).current;
  const contentAnimations = useRef<Animated.Value[]>([]).current;

  const ensureContentAnimations = (count: number) => {
    while (contentAnimations.length < count) {
      contentAnimations.push(new Animated.Value(INITIAL_OPEN ? 1 : 0));
    }
  };

  const getExerciseName = () => {
    if (exercise?.exercise?.exercise_display_name_en) {
      return exercise.exercise.exercise_display_name_en;
    }
    return 'Exercise';
  };

  const getExerciseTags = () => {
    if (exercise?.exercise?.exercise_tags) {
      return exercise.exercise.exercise_tags;
    }
    return '';
  };

  const ensureSentence = (text: string) => {
    const trimmed = text.trim();
    if (trimmed === '') return 'N/A';
    return /[\.!?]$/.test(trimmed) ? trimmed : trimmed + '.';
  };

  const computeCuesFromExercise = () => {
    const cues: unknown =
      (exercise as any)?.exercise?.coaching_cues ??
      (exercise as any)?.exercise?.exercise_coaching_cues;

    if (Array.isArray(cues)) {
      const cleaned = cues.filter(Boolean).map(String).join('. ');
      return cleaned.length > 0 ? ensureSentence(cleaned) : 'N/A';
    }

    if (typeof cues === 'string') {
      const trimmed = cues.trim();
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) {
            const cleaned = parsed.filter(Boolean).map(String).join('. ');
            return cleaned.length > 0 ? ensureSentence(cleaned) : 'N/A';
          }
        } catch {}
      }
      return trimmed.length > 0 ? ensureSentence(trimmed) : 'N/A';
    }

    return 'N/A';
  };

  const getCoachingCues = () => {
    const fromState = coachingCues?.trim();
    if (fromState) return fromState;
    return computeCuesFromExercise();
  };

  useEffect(() => {
    const maybeFetchCues = async () => {
      const current = computeCuesFromExercise();
      if (current !== 'N/A') return; // already present
      if (!exercise?.exercise_id) return;
      try {
        const { data, error } = await supabase
          .from('exercise_library')
          .select('coaching_cues')
          .eq('exercise_uid', exercise.exercise_id)
          .single();
        if (!error && data?.coaching_cues) {
          setCoachingCues(String(data.coaching_cues));
        }
      } catch (e) {
        Logger.warn?.('Failed to fetch coaching cues', e as any);
      }
    };
    maybeFetchCues();
  }, [exercise?.exercise_id]);

  useEffect(() => {
    if (exerciseId) {
      loadNotesForExercise(exerciseId);
    }
  }, [exerciseId]);

  const handleNoteClick = (note: IWorkoutExerciseNoteWithDetails) => {
    setSelectedNote(note);
    setShowAddNotesModal(true);
  };

  const handleNotesChange = () => {
    if (exerciseId) {
      loadNotesForExercise(exerciseId);
    }
  };

  const getPrimaryJointActions = () => {
    return 'Compound movement pattern';
  };

  const getMuscleRoles = () => {
    return 'Primary and secondary muscle groups';
  };

  const toggleOpen = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.linear);
    setIsOpen(prev => {
      const toValue = prev ? 0 : 1;

      Animated.timing(rotateAnimation, {
        toValue,
        duration: 100,
        useNativeDriver: true,
      }).start();

      // Fade and scale animations
      if (!prev) {
        Animated.parallel([
          Animated.timing(fadeAnimation, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnimation, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
        ]).start(() => {
          const staggerDelay = 100;
          contentAnimations.forEach((anim, index) => {
            Animated.timing(anim, {
              toValue: 1,
              duration: 100,
              delay: index * staggerDelay,
              useNativeDriver: true,
            }).start();
          });
        });
      } else {
        Animated.parallel([
          Animated.timing(fadeAnimation, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnimation, {
            toValue: 0.8,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();

        contentAnimations.forEach(anim => {
          anim.setValue(0);
        });
      }

      return !prev;
    });
  };

  const handleAddSet = async () => {
    if (!user?.id) {
      Logger.error('User id not found');
      return;
    }
    const workoutExerciseId = exercise.workout_exercise_id || exercise.id;

    const maxSetNumber = validSets.reduce((max, set) => {
      return Math.max(max, set.set_number || 0);
    }, 0);
    const nextSetNumber = maxSetNumber + 1;

    createExerciseSet(user?.id, {
      workout_exercise_id: workoutExerciseId,
      set_number: nextSetNumber,
      target_reps: 10,
      weight_kg: null,
      target_rir_raw: 2,
      actual_reps: null,
      status: ExerciseStatus.NOT_STARTED,
    }).then(result => {
      if (result.status === 'error') {
        Logger.error('Error creating workout set', result.error);
        Toast.show({
          type: 'error',
          text1: "Couldn't save. Try again?",
        });
      } else {
        Logger.debug('Workout set created successfully', result.data);
      }
    });
  };

  const handleDeleteSet = async (setIndex: number) => {
    try {
      const set = currentExercise.sets?.[setIndex];
      const setId = set?.id;
      if (setId) {
        if (setId.startsWith('temp-')) {
          return;
        }

        const result = await deleteExerciseSet(user?.id!, setId);
        if (result.status === 'error') {
          console.error('❌ Failed to delete set:', result.error);
        }
      }
    } catch (error) {
      console.error('❌ Error deleting set:', error);
    }
  };

  const handleSetStatusChange = useCallback(
    (setIndex: number, newStatus: ExerciseStatus) => {
      const isLastSet = setIndex === validSets.length - 1;
      const allPreviousSetsComplete = validSets
        .slice(0, setIndex)
        .every((s: any) => s?.status === ExerciseStatus.DONE);

      if (
        newStatus === ExerciseStatus.DONE &&
        isLastSet &&
        allPreviousSetsComplete
      ) {
        setShowFeedback(true);
      }
    },
    [validSets]
  );

  const showExerciseMenu = () => {
    if (menuRef.current) {
      menuRef.current.measureInWindow((x, y, width, height) => {
        setExerciseMenuVisible(true);

        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }
  };

  const hideExerciseMenu = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setExerciseMenuVisible(false);
    });
    setExerciseMenuVisible(false);
  };

  const handleDeleteExerciseFromMenu = () => {
    setShowDeleteConfirmationAlert(true);
    hideExerciseMenu();
  };

  const handleDeleteFromWorkout = async (userId: string) => {
    const workoutExerciseId = exercise.workout_exercise_id || exercise.id;

    try {
      const result = await removeWorkoutExercise(userId, workoutExerciseId);
      if (result.status === 'ok') {
        refreshWorkouts?.();
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Exercise deleted from workout successfully',
        });
      }
    } catch (error) {
      Logger.error('❌ Error deleting exercise:', error);
    } finally {
      setShowDeleteConfirmationAlert(false);
    }
  };

  const handleDeleteFromMesocycle = async () => {
    if (!user?.id) {
      Logger.error('User ID not found - cannot delete exercise from mesocycle');
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'User not authenticated. Please sign in again.',
      });
      setShowDeleteConfirmationAlert(false);
      return;
    }

    setShowDeleteConfirmationAlert(false);

    try {
      const result = await deleteExerciseOnWholeMesocycle(
        user.id,
        exercise.exercise_id
      );

      if (result.status === 'ok') {
        refreshWorkouts?.();
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Exercise deleted from whole mesocycle successfully',
        });
      } else {
        console.error(
          '❌ Failed to delete exercise from mesocycle:',
          result.error
        );
      }
    } catch (error) {
      console.error('❌ Error deleting exercise from mesocycle:', error);
    }
  };

  const handleSwapExerciseFromMenu = async () => {
    onMenuPress?.(exercise);
    hideExerciseMenu();
  };

  const updateFeedback = (key: string, value: string) => {
    setFeedbackData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={toggleOpen}
        onLongPress={drag}
        delayLongPress={500}
        activeOpacity={0.8}
        style={[
          styles.headerWrapper,
          isOpen && { marginBottom: 14 },
          isActive && { opacity: 0.8, transform: [{ scale: 1.05 }] },
        ]}
        disabled={isActive}
      >
        <View style={styles.contentWrapper}>
          <TouchableOpacity
            hitSlop={25}
            onPress={toggleOpen}
            style={styles.chevronContainer}
          >
            <Animated.View
              style={{
                transform: [
                  {
                    rotate: rotateAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['180deg', '0deg'],
                    }),
                  },
                ],
              }}
            >
              <ChevronUp size={24} color={Colors.text} />
            </Animated.View>
          </TouchableOpacity>

          <Text style={[styles.title, { color: Colors.text }]}>
            {getExerciseName()}
          </Text>
        </View>
        <View style={styles.menuIconContainer}>
          <ExerciseActionTooltip
            visible={exerciseMenuVisible}
            onClose={hideExerciseMenu}
            onSwapExercise={handleSwapExerciseFromMenu}
            onDeleteExercise={handleDeleteExerciseFromMenu}
            onAddNotes={() => {
              hideExerciseMenu();
              setShowAddNotesModal(true);
            }}
            exercise={exercise}
            position='bottom-right'
          >
            <TouchableOpacity
              ref={menuRef}
              onPress={showExerciseMenu}
              hitSlop={10}
              style={styles.menuButton}
            >
              <EllipsisVertical size={24} color={Colors.text} />
            </TouchableOpacity>
          </ExerciseActionTooltip>
        </View>

        {getExerciseTags() && (
          <View style={styles.tagsContainer}>
            {exercise?.exercise?.exercise_muscle_groups_simple?.primary[0] && (
              <Tag
                key={1}
                text={
                  exercise?.exercise?.exercise_muscle_groups_simple?.primary[0]
                }
                variant={'secondary'}
              />
            )}
            {exercise?.exercise?.exercise_prerequisites && (
              <Tag
                key={2}
                text={removeUnderscores(
                  exercise?.exercise?.exercise_prerequisites
                )}
                variant={'secondary'}
              />
            )}
          </View>
        )}
      </TouchableOpacity>

      {isOpen && (
        <Animated.View
          style={[
            styles.exerciseContextWrapper,
            {
              opacity: fadeAnimation,
              transform: [{ scale: scaleAnimation }],
            },
          ]}
        >
          <Slider
            height={Math.max(setsContentHeight, 100)}
            showPagination={true}
            autoPlay={false}
            width={ScreenWidth - 36}
          >
            <Animated.View
              key='exercise-slide'
              style={styles.firstHorizontalContent}
            >
              {(currentExercise.sets?.length ?? 0) === 0 && (
                <TouchableOpacity
                  style={styles.addSetButton}
                  onPress={() => handleAddSet()}
                >
                  <Plus size={24} color={Colors.primary} />
                  <Text style={styles.addSetText}>Add new set</Text>
                </TouchableOpacity>
              )}
              <View
                onLayout={e =>
                  setSetsContentHeight(e.nativeEvent.layout.height)
                }
              >
                <Animated.View style={styles.exerciseColumn}>
                  <FlatList
                    data={validSets}
                    keyExtractor={(item, index) => `${item.id}-${index}`}
                    renderItem={({ item: set, index }) => {
                      const setId = set?.id;
                      ensureContentAnimations(index + 1);

                      return (
                        <Animated.View
                          style={{
                            opacity: contentAnimations[index],
                            transform: [
                              {
                                translateY: contentAnimations[
                                  index
                                ].interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [20, 0],
                                }),
                              },
                            ],
                          }}
                        >
                          <SetRow
                            set={set as IWorkoutSet}
                            setId={setId ?? ''}
                            blockLength={complexMesocycleData?.[0]?.num_weeks}
                            currentWeek={currentWorkout?.workout_week}
                            isKeySet={set?.set_number === 1} // First set is typically the key set
                            isDeloadWeek={false} // TODO: Determine deload week logic
                            onAddSet={() => handleAddSet()}
                            onWeightUpdate={handleWeightUpdate}
                            onRepsUpdate={handleRepsUpdate}
                            onDeleteSet={() => handleDeleteSet(index)}
                            onStatusChange={status =>
                              handleSetStatusChange(index, status)
                            }
                            showDivider={index < validSets.length - 1}
                            onMenuPress={onMenuPress}
                            isInputDisabled={calculateSetInputDisabled(
                              set,
                              currentWorkout?.workout_week,
                              validSets
                            )}
                          />
                        </Animated.View>
                      );
                    }}
                    scrollEnabled={false}
                    showsVerticalScrollIndicator={false}
                    ItemSeparatorComponent={() => (
                      <Divider
                        color={addOpacity(Colors.textDisabled, 40)}
                        marginVertical={Space[0]}
                      />
                    )}
                  />
                </Animated.View>
              </View>
              {false}
            </Animated.View>

            <ScrollView
              key='instructions-slide'
              style={styles.secondHorizontalContent}
            >
              {/* <Video
                source={{
                  uri: 'https://drive.google.com/uc?export=download&id=1rV2i1sWFhcw1PFAE_T6q_x8pjrOE5LTg',
                }}
                style={{ width: '100%', aspectRatio: 16 / 9 }}
                paused={true}
                controls
              /> */}
              {notes.length > 0 && (
                <Text style={styles.instructionsTitle}>Notes:</Text>
              )}
              {notes.length > 0 && (
                <View style={styles.instructionItem}>
                  {notes.map((note: IWorkoutExerciseNoteWithDetails) => (
                    <TouchableOpacity
                      key={note.profile_note_id}
                      onPress={() => handleNoteClick(note)}
                      style={styles.noteItem}
                    >
                      <Text style={styles.instructionText}>
                        • {note.profile_note.note}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              <Text style={styles.instructionsTitle}>Key Tips:</Text>
              <View style={styles.instructionItem}>
                <Text style={styles.instructionLabel}>Coaching Cues</Text>
                <Text style={styles.instructionText}>{getCoachingCues()}</Text>
              </View>
              <View style={styles.instructionItem}>
                <Text style={styles.instructionLabel}>
                  • Primary joint actions: {getPrimaryJointActions()}
                </Text>
              </View>
              <View style={styles.instructionItem}>
                <Text style={styles.instructionLabel}>
                  • Muscles roles:{' '}
                  {typeof getMuscleRoles() === 'string'
                    ? getMuscleRoles()
                    : getMuscleRoles()
                      ? Object.entries(getMuscleRoles())
                          .map(
                            ([role, muscles]) =>
                              `${role}: ${Array.isArray(muscles) ? muscles.join(', ') : muscles}`
                          )
                          .join('; ')
                      : 'N/A'}
                </Text>
              </View>
            </ScrollView>
          </Slider>

          <AppModal
            isVisible={showFeedback}
            onClose={handleCloseFeedbackAndToggleOpen}
            title={'Exercise feedback'}
            size={'large'}
          >
            <View style={{ gap: 16 }}>
              {Object.values(FeedbackOptions).map(({ key, title, options }) => (
                <FeedbackRow
                  key={key}
                  title={title}
                  selectedValue={feedbackData[key as keyof typeof feedbackData]}
                  options={[...options]}
                  onValueChange={value => updateFeedback(key, value)}
                  tooltipTitle={title}
                  tooltipContent={
                    key === 'pump'
                      ? 'How much muscle pump did you feel? Rate the tight, swollen feeling in the target muscle right after the set. None (0) to Max (3).'
                      : key === 'effort'
                        ? 'How much effort did that exercise require? Rate the overall difficulty. Easy (0) to Brutal (3).'
                        : key === 'jointPain'
                          ? 'Any joint pain during the set? Rate joint pain (not muscle burn). None (0) to Max (3).'
                          : undefined
                  }
                />
              ))}
            </View>
          </AppModal>
          <AddNotesModal
            isVisible={showAddNotesModal}
            selectedNote={selectedNote}
            onClose={() => {
              setShowAddNotesModal(false);
              setSelectedNote(null);
            }}
            exerciseItem={exercise}
            onNotesChange={handleNotesChange}
          />
        </Animated.View>
      )}

      {/* Delete Exercise Choice Alert */}
      <ConfirmationAlert
        isVisible={showDeleteConfirmationAlert}
        onConfirm={handleDeleteFromMesocycle}
        onClose={() => {
          setShowDeleteConfirmationAlert(false);
        }}
        onCancel={() => handleDeleteFromWorkout(user?.id!)}
        title='Delete Exercise'
        message={`Do you want to delete this exercise "${getExerciseName()}" only from the current workout or from the whole mesocycle?`}
        confirmText='Mesocycle'
        cancelText='Workout'
        variant='warning'
      />
    </View>
  );
};

const styles = StyleSheet.create({
  workoutDayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space[2],
  },
  chevronContainer: {
    marginRight: Space[2],
  },
  dragHandle: {
    marginRight: Space[2],
    paddingVertical: Space[1],
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIconContainer: {
    position: 'absolute',
    right: 8, // Tighten spacing toward card edge
    top: '50%',
    transform: [{ translateY: -12 }], // Half of icon height (24px) to center it
    zIndex: 1,
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: Colors.expandedExerciseCard,
    borderRadius: BorderRadius.lg,
    marginHorizontal: 10,
    marginBottom: 10,
    overflow: 'visible',
  },
  headerWrapper: {
    flexDirection: 'column',
    gap: 8,
    borderRadius: BorderRadius.lg,
    paddingVertical: 22,
    paddingTop: 12,
    backgroundColor: Colors.exerciseCard,
    shadowColor: Colors.text,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  contentWrapper: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
    // Reserve minimal space: ellipsis width (24px) + right offset (8px) = 32px
    // This moves the title ~15% closer again without overlap
    paddingRight: 32,
  },
  title: {
    flex: 1,
    ...Typography.h2,
    fontWeight: '700',
    flexWrap: 'wrap',
  },
  textWrapper: {},
  tagsContainer: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    gap: Space[2],
    paddingHorizontal: 20,
  },
  exerciseContextWrapper: {
    flexDirection: 'column',
    paddingHorizontal: 18,
  },
  exerciseColumn: {
    width: ScreenWidth - 56,
    flexDirection: 'column',
  },
  firstHorizontalContent: {
    flexDirection: 'column',
    paddingHorizontal: 9,
  },
  secondHorizontalContent: {
    flexDirection: 'column',
    paddingHorizontal: 9,
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Space[2],
    paddingHorizontal: Space[3],
    marginTop: Space[3],
    borderWidth: 1,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.transparent,
    marginBottom: Space[3],
    opacity: 0.7,
  },
  addSetText: {
    ...Typography.bodyMedium,
    color: Colors.primary,
    marginLeft: Space[1],
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Space[4],
    marginVertical: 14,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: BorderRadius.xs,
    backgroundColor: Colors.border,
    borderWidth: 1,
    borderColor: Colors.textDisabled,
  },
  paginationDotActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  instructionsContainer: {
    marginTop: Space[4],
  },
  instructionsTitle: {
    ...Typography.h3,
    fontWeight: '700',
    marginVertical: Space[2],
    color: Colors.text,
  },
  instructionItem: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  instructionLabel: {
    ...Typography.bodyMedium,
    fontWeight: '600',
    marginRight: Space[2],
    color: Colors.text,
  },
  instructionText: {
    ...Typography.bodyMedium,
    color: Colors.textDisabled,
    flex: 1,
    lineHeight: 20,
  },
  noteItem: {
    height: 30,
    paddingVertical: Space[1],
    paddingHorizontal: Space[2],
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surface,
    marginBottom: Space[1],
    borderWidth: 1,
    borderColor: Colors.border,
  },
  savingIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: Colors.primary,
    paddingHorizontal: Space[2],
    paddingVertical: Space[1],
    borderRadius: BorderRadius.sm,
    zIndex: 1000,
  },
  savingText: {
    ...Typography.caption,
    color: Colors.background,
    fontWeight: '600',
  },
  menuButton: {},
});
