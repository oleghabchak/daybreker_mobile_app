import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import DraggableFlatList, {
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import { RefreshControl } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';

import { AddNotesModal, Button } from '../../components';
import {
  TooltipComponent,
  getTooltipMetrics,
} from '../../components/common/TooltipComponent';
import { ConfirmationAlert } from '../../components/ui/ConfirmationAlert';
import { Header } from '../../components/ui/Header';
import { BorderRadius, Colors, Space, Typography } from '../../constants/theme';
import { useAuthStore } from '../../models/AuthenticationStore';
import { Logger } from '../../services/logger';
import { MesocycleRepository } from '../../training-module/mesocycle/repositories/mesocycle-repository';
import { useMesocycleStore } from '../../training-module/mesocycle/stores/mesocycle-store';
import { IWorkoutExercise } from '../../training-module/workout/data/interfaces/workout-exercise';
import { WorkoutRepository } from '../../training-module/workout/repositories/workout-repository';
import { WorkoutService } from '../../training-module/workout/services/workout-service';
import { useWorkoutStore } from '../../training-module/workout/stores/workout-store';
import { useUserProfileStore } from '../../user-module/profile/stores/user-profile-store';
import { getExerciseCompletionStats } from '../../utils/helpers';

import { AddExerciseModal } from './exerciseComponents/addExercise/AddExerciseModal';
import { ExerciseCard } from './exerciseComponents/ExerciseCard';
import { WorkoutScheduleModal } from './exerciseComponents/WorkoutScheduleModal';
import { WorkoutStatsCard } from './exerciseComponents/WorkoutStatsCard';

export const ExerciseScreen = ({ navigation }: any) => {
  const {
    selectedWorkoutDay,
    selectedWorkoutWeek,
    selectedMesocycle,
    setSelectedMesocycle,
    currentMesocycleId,
    setCurrentMesocycleId,
    setSelectedWorkoutWeek,
    setSelectedWorkoutDay,
    loadComplexMesocycleData,
  } = useMesocycleStore();

  const [isWorkoutScheduleModalVisible, setIsWorkoutScheduleModalVisible] =
    useState(false);

  const { profile } = useUserProfileStore();

  const {
    workouts,
    currentWorkout,
    setCurrentWorkout,
    workoutStats,
    setWorkoutStats,
    isWorkoutCompleted,
    setIsWorkoutCompleted,
    completeWorkout,
    updateExerciseOrder,
    updateMesocycleExerciseOrder,
    setWorkouts,
  } = useWorkoutStore();

  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [swapExercise, setSwapExercise] = useState<IWorkoutExercise | null>(
    null
  );
  const [isAddExerciseModalVisible, setIsAddExerciseModalVisible] =
    useState(false);
  const [btnVariant, setBtnVariant] = useState('disabled');
  const [isReorderConfirmationVisible, setIsReorderConfirmationVisible] =
    useState(false);
  const [pendingReorderData, setPendingReorderData] = useState<any[]>([]);
  const [isAddNoteModalVisible, setIsAddNoteModalVisible] = useState(false);
  const metrics = getTooltipMetrics(Typography.body.fontSize);

  useEffect(() => {
    if (profile?.current_mesocycle_id && !currentMesocycleId) {
      setCurrentMesocycleId(profile.current_mesocycle_id);
    }
  }, [profile?.current_mesocycle_id, currentMesocycleId]);

  useEffect(() => {
    const loadCurrentWorkoutFirst = async () => {
      if (!currentMesocycleId || !user?.id) {
        return;
      }

      if (selectedMesocycle?.id === currentMesocycleId && currentWorkout) {
        return;
      }

      setIsLoading(true);
      try {
        const mesocycleResponse = await MesocycleRepository.getById({
          id: currentMesocycleId,
        });

        if (mesocycleResponse.status !== 'ok') {
          Logger.error('Failed to load mesocycle:', mesocycleResponse.error);
          return;
        }

        setSelectedMesocycle(mesocycleResponse.data);

        const firstIncompleteResponse =
          await WorkoutRepository.getFirstIncompleteWorkout({
            mesocycleId: currentMesocycleId,
            userId: user.id,
          });

        if (
          firstIncompleteResponse.status !== 'ok' ||
          !firstIncompleteResponse.data
        ) {
          Logger.warn('No incomplete workout found');
          setIsLoading(false);
          return;
        }

        const { workout_week, workout_day } = firstIncompleteResponse.data;

        if (selectedWorkoutWeek === 1 && selectedWorkoutDay === 1) {
          setSelectedWorkoutWeek(workout_week);
          setSelectedWorkoutDay(workout_day);
        }

        const weekWorkoutsResponse =
          await WorkoutService.getWorkoutsWithExercisesAndSetsByWeek({
            mesocycleId: currentMesocycleId,
            workoutWeek: selectedWorkoutWeek,
          });

        if (weekWorkoutsResponse.status === 'ok') {
          setWorkouts(weekWorkoutsResponse.data);
        }

        setIsLoading(false);

        loadComplexMesocycleData(user.id).catch(error => {
          Logger.warn('Background mesocycle data load failed:', error);
        });
      } catch (error) {
        Logger.error('Failed to load workout:', error);
        setIsLoading(false);
      }
    };

    loadCurrentWorkoutFirst();
  }, [currentMesocycleId, user?.id]);

  useEffect(() => {
    const loadSelectedWeekWorkouts = async () => {
      if (!selectedMesocycle?.id || !selectedWorkoutWeek || !workouts.length) {
        return;
      }

      const hasWeekData = workouts.some(
        w => w.workout_week === selectedWorkoutWeek
      );

      if (hasWeekData) {
        return;
      }

      setIsLoading(true);
      try {
        const weekWorkoutsResponse =
          await WorkoutService.getWorkoutsWithExercisesAndSetsByWeek({
            mesocycleId: selectedMesocycle.id,
            workoutWeek: selectedWorkoutWeek,
          });

        if (weekWorkoutsResponse.status === 'ok') {
          setWorkouts(weekWorkoutsResponse.data);
        }
      } catch (error) {
        Logger.error('Failed to load workouts for selected week:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSelectedWeekWorkouts();
  }, [selectedMesocycle?.id, selectedWorkoutWeek]);

  useEffect(() => {
    if (workouts?.length > 0 && selectedWorkoutWeek && selectedWorkoutDay) {
      const selectedWorkout = workouts.find(
        workout =>
          workout.workout_week === selectedWorkoutWeek &&
          workout.workout_day === selectedWorkoutDay
      );

      if (selectedWorkout) {
        setCurrentWorkout(selectedWorkout);

        const stats = getExerciseCompletionStats(selectedWorkout.exercises);
        setWorkoutStats(stats);
        setIsWorkoutCompleted(selectedWorkout.completed_at !== null);
      }
    }
  }, [workouts, selectedWorkoutDay, selectedWorkoutWeek]);

  const onRefresh = async () => {
    if (!user?.id) return;

    setRefreshing(true);
    try {
      if (currentMesocycleId) {
        const response = await MesocycleRepository.getById({
          id: currentMesocycleId,
        });

        if (response.status === 'ok') {
          setSelectedMesocycle(response.data);
        }
      }

      if (selectedMesocycle?.id && selectedWorkoutWeek) {
        const weekWorkoutsResponse =
          await WorkoutService.getWorkoutsWithExercisesAndSetsByWeek({
            mesocycleId: selectedMesocycle.id,
            workoutWeek: selectedWorkoutWeek,
          });

        if (weekWorkoutsResponse.status === 'ok') {
          setWorkouts(weekWorkoutsResponse.data);
        }
      }
    } catch (error) {
      Logger.error('Failed to refresh data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (currentWorkout?.completed_at != null) {
      setBtnVariant('secondary');
    } else if (
      workoutStats.totalExercises > 0 &&
      workoutStats.completedExercises === workoutStats.totalExercises
    ) {
      setBtnVariant('primary');
    } else {
      setBtnVariant('disabled');
      setIsWorkoutCompleted(false);
    }
  }, [workoutStats, currentWorkout?.completed_at]);

  const handleCompleteWorkout = async () => {
    if (!currentWorkout?.id) {
      Logger.error('Cannot complete workout: workout not found', {
        hasCurrentWorkout: !!currentWorkout,
        userId: user?.id,
      });
      Toast.show({
        type: 'error',
        text1: "Can't load workout. Pull to refresh.",
      });
      return;
    }

    if (isWorkoutCompleted || currentWorkout.completed_at != null) {
      Logger.warn('Workout already completed', {
        workoutId: currentWorkout.id,
        completedAt: currentWorkout.completed_at,
      });
      Toast.show({
        type: 'info',
        text1: 'Already done ✓',
      });
      return;
    }

    if (workoutStats.totalExercises === 0) {
      Logger.error('Cannot complete empty workout', {
        workoutId: currentWorkout.id,
        stats: workoutStats,
      });
      Toast.show({
        type: 'error',
        text1: 'Add exercises first',
      });
      return;
    }

    if (workoutStats.completedExercises !== workoutStats.totalExercises) {
      Logger.warn('Cannot complete workout: exercises incomplete', {
        workoutId: currentWorkout.id,
        completedExercises: workoutStats.completedExercises,
        totalExercises: workoutStats.totalExercises,
      });
      Toast.show({
        type: 'error',
        text1: 'Finish your sets first',
      });
      return;
    }

    try {
      await completeWorkout(user?.id!, currentWorkout.id);
      Toast.show({
        type: 'success',
        text1: 'Workout complete! 🎉',
      });
    } catch (error) {
      Logger.error('Failed to complete workout', {
        workoutId: currentWorkout.id,
        error,
      });
      Toast.show({
        type: 'error',
        text1: "Couldn't save. Try again?",
      });
    }
  };

  const handleAddExercise = async () => {
    if (selectedMesocycle?.id && selectedWorkoutWeek) {
      setIsLoading(true);
      try {
        const weekWorkoutsResponse =
          await WorkoutService.getWorkoutsWithExercisesAndSetsByWeek({
            mesocycleId: selectedMesocycle.id,
            workoutWeek: selectedWorkoutWeek,
          });

        if (weekWorkoutsResponse.status === 'ok') {
          setWorkouts(weekWorkoutsResponse.data);
        }
      } catch (error) {
        Logger.error(
          'Failed to refresh workouts after adding exercise:',
          error
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleAddMesocycle = () => {};

  const handleAddExercises = () => {
    setIsAddExerciseModalVisible(true);
    setSwapExercise(null);
  };

  const handleCopyMesocycle = () => {
    console.log('Copy mesocycle');
  };

  const handleAddNote = () => {
    setIsAddNoteModalVisible(true);
  };

  const handleDragEnd = async ({ data }: { data: any[] }) => {
    if (currentWorkout && user?.id) {
      setPendingReorderData(data);
      setIsReorderConfirmationVisible(true);
    }
  };

  const handleReorderCurrentWorkout = async () => {
    if (!currentWorkout || !user?.id || !pendingReorderData.length) return;

    try {
      const exercisesToUpdate: {
        workout_exercise_id: string;
        order_index: number;
      }[] = pendingReorderData.map((exercise, index) => {
        return {
          workout_exercise_id: exercise.workout_exercise_id,
          order_index: index + 1,
        };
      });

      const result = await updateExerciseOrder(user.id, exercisesToUpdate);
      if (result.status === 'error') {
        Logger.error('Failed to update exercise order', {
          error: result.error,
          exerciseCount: exercisesToUpdate.length,
        });
        Toast.show({
          type: 'error',
          text1: "Couldn't save. Try again?",
        });
      } else {
        Toast.show({
          type: 'success',
          text1: 'Exercise order updated!',
        });
      }
    } catch (error) {
      Logger.error('Error updating exercise order', { error });
      Toast.show({
        type: 'error',
        text1: "Couldn't save. Try again?",
      });
    } finally {
      setIsReorderConfirmationVisible(false);
      setPendingReorderData([]);
    }
  };

  const handleReorderWholeMesocycle = async () => {
    if (
      !currentWorkout ||
      !user?.id ||
      !pendingReorderData.length ||
      !currentMesocycleId
    ) {
      return;
    }

    try {
      const exercisesToUpdate: {
        workout_exercise_id: string;
        order_index: number;
      }[] = pendingReorderData.map((exercise, index) => {
        return {
          workout_exercise_id: exercise.workout_exercise_id,
          order_index: index + 1,
        };
      });

      const result = await updateMesocycleExerciseOrder(
        user.id,
        currentMesocycleId,
        exercisesToUpdate
      );
      if (result.status === 'error') {
        Logger.error('Failed to update mesocycle exercise order', {
          error: result.error,
          exerciseCount: exercisesToUpdate.length,
        });
        Toast.show({
          type: 'error',
          text1: "Couldn't save. Try again?",
        });
      } else {
        Toast.show({
          type: 'success',
          text1: 'Mesocycle exercise order updated!',
        });
      }
    } catch (error) {
      Logger.error('Error updating mesocycle exercise order', { error });
      Toast.show({
        type: 'error',
        text1: "Couldn't save. Try again?",
      });
    } finally {
      setIsReorderConfirmationVisible(false);
      setPendingReorderData([]);
    }
  };

  const handleMenuPress = (exercise: IWorkoutExercise) => {
    setTimeout(() => {
      setIsAddExerciseModalVisible(true);
      setSwapExercise(exercise);
    }, 500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title='Exercise'
        showCalendar={true}
        showLogo={true}
        onCalendarPress={() => {
          if (currentWorkout) {
            setIsWorkoutScheduleModalVisible(true);
          }
        }}
        onNotificationPress={() => console.log('Notifications pressed')}
      />
      <WorkoutStatsCard
        workoutDays={selectedMesocycle?.workout_days}
        weekTotal={selectedMesocycle?.num_weeks || 4}
        onAddMesocycle={handleAddMesocycle}
        onAddExercises={handleAddExercises}
        onCopyMesocycle={handleCopyMesocycle}
        onAddNote={handleAddNote}
        onStartWithTemplate={() => {}}
        onStartFromScratch={() => {}}
        workouts={[]}
        weekCurrent={selectedWorkoutWeek}
      />
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color={Colors.primary} />
        </View>
      )}
      <DraggableFlatList
        data={
          currentWorkout?.exercises?.sort(
            (a, b) => a.order_index - b.order_index
          ) || []
        }
        onDragEnd={handleDragEnd}
        keyExtractor={(item, index) => `${item.workout_exercise_id}-${index}`}
        renderItem={({
          item,
          getIndex,
          drag,
          isActive,
        }: RenderItemParams<any>) => (
          <ExerciseCard
            exercise={item}
            index={getIndex() || 0}
            exercisesLength={currentWorkout?.exercises?.length || 0}
            drag={drag}
            isActive={isActive}
            onMenuPress={() => handleMenuPress(item)}
            refreshWorkouts={() => handleAddExercise()}
          />
        )}
        ListFooterComponent={
          currentWorkout?.exercises && currentWorkout.exercises.length > 0 ? (
            <View
              style={{
                marginTop: Space[4],
                marginHorizontal: Space[0],
                marginBottom: 200,
              }}
            >
              {btnVariant === 'disabled' ? (
                <TooltipComponent
                  content={
                    <View>
                      <Text
                        style={{
                          ...Typography.h2,
                          color: Colors.text,
                          marginBottom: Space[3],
                          textAlign: 'center',
                        }}
                      >
                        Workout isn&apos;t complete
                      </Text>
                      <Text
                        style={{
                          ...Typography.caption,
                          color: Colors.textDisabled,
                          lineHeight: 18,
                        }}
                      >
                        Complete or skip all sets first
                      </Text>
                    </View>
                  }
                  titleFontSize={Typography.body.fontSize}
                  triggerSize={metrics.iconSize}
                >
                  <Text style={styles.completeWorkoutText}>
                    Complete Workout
                  </Text>
                </TooltipComponent>
              ) : (
                <Button
                  variant={btnVariant as any}
                  onPress={handleCompleteWorkout}
                >
                  {isWorkoutCompleted
                    ? 'Workout Completed!'
                    : 'Complete Workout'}
                </Button>
              )}
            </View>
          ) : null
        }
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{
          paddingTop: Space[4],
        }}
      />

      <AddExerciseModal
        isVisible={isAddExerciseModalVisible}
        onClose={() => {
          setIsAddExerciseModalVisible(false);
        }}
        onAddExercise={handleAddExercise}
        workoutId={currentWorkout?.id}
        swapExercise={swapExercise as IWorkoutExercise}
      />

      <WorkoutScheduleModal
        isVisible={isWorkoutScheduleModalVisible}
        onClose={() => {
          setIsWorkoutScheduleModalVisible(false);
        }}
        onWorkoutSelect={(
          workoutDay: number,
          workoutWeek: number,
          mesocycleId: string
        ) => {
          setSelectedWorkoutDay(workoutDay);
          setSelectedWorkoutWeek(workoutWeek);
          setCurrentMesocycleId(mesocycleId);
        }}
      />
      <ConfirmationAlert
        isVisible={isReorderConfirmationVisible}
        onConfirm={handleReorderWholeMesocycle}
        onClose={() => {
          setIsReorderConfirmationVisible(false);
          setPendingReorderData([]);
        }}
        onCancel={handleReorderCurrentWorkout}
        message='Do you want to reorder current workout or whole mesocycle?'
        confirmText='Mesocycle'
        cancelText='Workout'
        variant='warning'
      />

      <AddNotesModal
        isVisible={isAddNoteModalVisible}
        onClose={() => {
          setIsAddNoteModalVisible(false);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -25 }, { translateY: -25 }],
    zIndex: 1000,
  },
  sectionTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
    marginBottom: Space[4],
  },
  exercisesSection: {
    paddingHorizontal: Space[6],
    marginBottom: Space[8],
  },
  exerciseStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Space[4],
  },
  exerciseStat: {
    ...Typography.body,
    color: Colors.textDisabled,
  },
  refreshButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Space[3],
    paddingHorizontal: Space[6],
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshButtonText: {
    ...Typography.body,
    color: Colors.background,
  },
  disabledText: {
    ...Typography.bodyBold,
    color: Colors.background,
  },
  completeWorkoutText: {
    ...Typography.body,
    color: Colors.background,
    alignSelf: 'center',
    textAlign: 'center',
    paddingVertical: 10,
    paddingHorizontal: Space[6],
    backgroundColor: Colors.textDisabled,
    borderRadius: BorderRadius.full,
    marginHorizontal: Space[2],
    width: '94%',
  },
});
