import { useNavigation } from '@react-navigation/native';
import { User } from '@supabase/supabase-js';
import { Plus, Trash2 } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ScrollView as GHScrollView } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';

import { TitleWithTooltip } from '../../components/common/TitleWithTooltip';
import {
  Button,
  Dropdown,
  Input,
  Tag,
  RangeSlider,
  Header,
  Divider,
  StepIndicator,
  ConfirmationAlert,
} from '../../components/ui';
import { BorderRadius, Colors, Space, Typography } from '../../constants/theme';
import { MesocycleGoal, PrimaryMuscleGroup } from '../../enums/databas.enums';
import { muscleEmphasisOptions } from '../../enums/mesocycle.enums';
import { MesocycleStatus } from '../../training-module/mesocycle/data/enums/mesocycle-status';
import { MesocycleRepository } from '../../training-module/mesocycle/repositories/mesocycle-repository';
import { useAIMesocycleGeneration } from '../../hooks/useAIMesocycleGeneration';
import { useAuthStore } from '../../models/AuthenticationStore';
import { errorManager } from '../../services/errorNotificationManager';
import { Logger } from '../../services/logger';
import { IExercise } from '../../training-module/exercise/data/interfaces/exercise';
import { CreateMesocycleFromScratchUseCase } from '../../training-module/mesocycle/usecases/create-mesocycle-from-scratch-use-case';
import { CreateMesocycleTemplateUseCase } from '../../training-module/mesocycle/usecases/create-mesocycle-template-use-case';
import { useUserProfileStore } from '../../user-module/profile/stores/user-profile-store';

import { MesocycleBodyPartSelectionModal } from './mesocycleComponents/MesocycleBodyPartSelectionModal';
import { MesocycleExercise } from './mesocycleComponents/MesocycleExercise';
import { MesocycleExerciseSelectionModal } from './mesocycleComponents/MesocycleExerciseSelectionModal';

type ExerciseColumn = {
  id: string;
  bodyPart: PrimaryMuscleGroup | null;
  selectedExercise: IExercise | null;
};

type DayColumn = {
  id: string;
  selectedDay: string | null;
  exercises: ExerciseColumn[];
};

const WEEKDAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const AnimatedGHScrollView = Animated.createAnimatedComponent(GHScrollView);

export const MesocycleFromScratchScreen: React.FC = () => {
  const navigation = useNavigation();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [mesocycleName, setMesocycleName] = useState('');
  const [trainingDaysPerWeek, setTrainingDaysPerWeek] = useState<number>(4);
  const [avgSessionMinutes, setAvgSessionMinutes] = useState<number>(60);
  const [selectedWeeks, setSelectedWeeks] = useState<number>(6);
  const [selectedGoal, setSelectedGoal] = useState<MesocycleGoal>(
    MesocycleGoal.HYPERTROPHY
  );
  const [selectedDaysPerWeek, setSelectedDaysPerWeek] = useState<number>(3);
  const [selectedEmphasis, setSelectedEmphasis] = useState<string[]>([]);
  const [hasManuallyEditedName, setHasManuallyEditedName] =
    useState<boolean>(false);
  const [splitPreference, setSplitPreference] = useState<
    | 'upperLower'
    | 'lowerUpper'
    | 'pushPullLegs'
    | 'fullBody'
    | 'bodyPart'
    | 'auto'
  >('auto');

  const [daysColumns, setDaysColumns] = useState<DayColumn[]>([]);
  const [showBodyPartModal, setShowBodyPartModal] = useState(false);
  const [showExerciseSelectModal, setShowExerciseSelectModal] = useState(false);
  const [currentExerciseContext, setCurrentExerciseContext] = useState<{
    dayId: string;
    exercise: ExerciseColumn;
  } | null>(null);
  const [pendingDayId, setPendingDayId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateConfirmation, setShowCreateConfirmation] = useState(false);
  const [showTemplateConfirmation, setShowTemplateConfirmation] =
    useState(false);

  const { user } = useAuthStore();
  const { setCurrentMesocycleId } = useUserProfileStore();
  const { 
    isLoading: isAILoading, 
    error: aiError, 
    generateAIMesocycle, 
    clearError: clearAIError 
  } = useAIMesocycleGeneration();

  const generateAutoName = () => {
    if (selectedEmphasis.length < 3) return '';

    const goal = selectedGoal.charAt(0).toUpperCase() + selectedGoal.slice(1);
    const muscleGroups = selectedEmphasis
      .slice(0, 3)
      .map(
        group =>
          muscleEmphasisOptions.find(opt => opt.value === group)?.label || group
      );
    const muscleGroupString =
      muscleGroups.length === 3
        ? `${muscleGroups[0]}, ${muscleGroups[1]}, & ${muscleGroups[2]}`
        : muscleGroups.join(', ');

    const currentDate = new Date();
    const month = currentDate.toLocaleDateString('en-US', { month: 'short' });
    const year = currentDate.getFullYear().toString().slice(-2);

    return `${muscleGroupString} ${selectedDaysPerWeek}d ${selectedWeeks}w ${month} '${year} ${goal}`;
  };

  const isStep1Valid = selectedGoal;

  const isStep2Valid = selectedEmphasis.length === 3;

  const isStep3Valid =
    daysColumns.length > 0 &&
    daysColumns.every(col => {
      if (!col.selectedDay) return false;
      if (!col.exercises.length) return false;

      return col.exercises.every(exercise => {
        return !!exercise.selectedExercise;
      });
    });

  // Check if there are days with exercises but no selected exercises (AI can help fill these)
  const hasDaysNeedingExercises = daysColumns.some(col => {
    return col.selectedDay && col.exercises.length > 0 && 
           col.exercises.some(exercise => !exercise.selectedExercise);
  });

  useEffect(() => {
    if (currentStep === 3 && !hasManuallyEditedName) {
      const autoName = generateAutoName();
      if (autoName) {
        setMesocycleName(autoName);
      }
    }
  }, [
    currentStep,
    selectedGoal,
    selectedEmphasis,
    selectedDaysPerWeek,
    selectedWeeks,
    hasManuallyEditedName,
  ]);

  const handleClose = () => {
    navigation.goBack();
  };

  const handleNext = () => {
    if (currentStep === 1 && isStep1Valid) {
      setCurrentStep(2);
    } else if (currentStep === 2 && isStep2Valid) {
      setCurrentStep(3);
      if (daysColumns.length === 0) {
        const preferredCount = Math.max(
          2,
          Math.min(7, trainingDaysPerWeek || 2)
        );
        const candidateDays = WEEKDAYS;
        const selected = candidateDays.slice(0, preferredCount);
        const newColumns: DayColumn[] = selected.map(day => ({
          id: `day-col-${day}-${Date.now()}-${Math.random()}`,
          selectedDay: day,
          exercises: [],
        }));

        if (newColumns.length > 0) {
          setDaysColumns(newColumns);
          setSelectedDaysPerWeek(newColumns.length);
          setTrainingDaysPerWeek(newColumns.length);
        }
      }
    }
  };

  const handleBack = () => {
    if (currentStep === 1) {
      handleClose();
    } else {
      setCurrentStep((currentStep - 1) as 1 | 2 | 3);
    }
  };

  const handleStepSelect = (step: 1 | 2 | 3) => {
    if (step <= currentStep) {
      setCurrentStep(step);
    } else if (step === 2 && !isStep1Valid) {
      return;
    } else if (step === 3 && !isStep2Valid) {
      return;
    } else {
      setCurrentStep(step);
    }
  };

  const handleSubmit = () => {
    setShowCreateConfirmation(true);
  };

  const handleSaveAsTemplate = () => {
    setShowTemplateConfirmation(true);
  };

  const handleAIPress = async () => {
    try {
      // Check if there are days that need exercises
      if (!hasDaysNeedingExercises) {
        errorManager.showError('All exercises are already selected. AI can help when there are unselected exercises.');
        return;
      }

      // Collect all form data
      const formData = {
        trainingDaysPerWeek,
        avgSessionMinutes,
        selectedWeeks,
        selectedGoal,
        selectedEmphasis,
        splitPreference,
        daysColumns,
      };

      Logger.info('Collecting form data for AI LLM:', formData);
      
      // Call AI function with collected data - this will prepare data for LLM
      const aiData = await generateAIMesocycle(formData);
      
      Logger.info('AI data prepared for LLM:', aiData);
      
      // Detailed logging for debugging - copy this to editor
      console.log('=== AI DATA FOR COPYING TO EDITOR ===');
      console.log(JSON.stringify(aiData));
      console.log('=== END AI DATA ===');
      
      // TODO: Here we would integrate with AI LLM>service to generate recommendations
      // For now, just show success message
      errorManager.showError('AI data collected successfully! LLM integration coming soon.');
      
    } catch (error) {
      Logger.error('Error in handleAIPress:', error);
      errorManager.showError('Failed to collect AI data');
    }
  };

  const handleCreateSubmit = async () => {
    setIsLoading(true);

    if (!user) {
      handleClose();
      return;
    }

    try {
      const mesocycle = await CreateMesocycleFromScratchUseCase.execute({
        user,
        mesocycleName,
        selectedWeeks,
        selectedGoal,
        daysColumns,
        trainingDaysPerWeek,
        avgSessionMinutes,
      });

      // Complete all active mesocycles before setting this one as current
      const completeRequest =
        await MesocycleRepository.completeAllActiveMesocycles(
          user.id,
          mesocycle.id
        );
      if (completeRequest.status === 'error') {
        Logger.warn('Failed to complete active mesocycles:', completeRequest.error);
      }

      await setCurrentMesocycleId(user.id, mesocycle.id);

      handleClose();
    } catch (error) {
      Logger.error('Error creating mesocycle from scratch:', error);
      errorManager.showError('Failed to create mesocycle from scratch');
      handleClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToList = async () => {
    setIsLoading(true);

    if (!user) {
      handleClose();
      return;
    }

    try {
      await CreateMesocycleFromScratchUseCase.execute({
        user,
        mesocycleName,
        selectedWeeks,
        selectedGoal,
        daysColumns,
        trainingDaysPerWeek,
        avgSessionMinutes,
        status: MesocycleStatus.PLANNING,
      });

      // Don't set as current mesocycle - just save it to the list
      handleClose();
    } catch (error) {
      Logger.error('Error saving mesocycle to list:', error);
      errorManager.showError('Failed to save mesocycle to list');
      handleClose();
    } finally {
      setIsLoading(false);
    }
  };
  const handleSaveAsTemplateSubmit = async () => {
    setIsLoading(true);
    await CreateMesocycleTemplateUseCase.execute({
      user: user as User,
      name: mesocycleName,
      goal: selectedGoal,
      num_weeks: selectedWeeks,
      days_per_week: trainingDaysPerWeek,
      muscle_emphasis: selectedEmphasis,
      length_weeks: selectedWeeks,
      minutes_per_session: avgSessionMinutes,
      daysColumns,
    });
    handleClose();
  };

  const addDayColumn = () => {
    const newDayColumn: DayColumn = {
      id: `day-col-${Date.now()}`,
      selectedDay: null,
      exercises: [],
    };

    setDaysColumns(prev => {
      const newColumns = [...prev, newDayColumn];
      setSelectedDaysPerWeek(newColumns.length);
      setTrainingDaysPerWeek(newColumns.length);
      return newColumns;
    });
  };

  const deleteDayColumn = (dayId: string) => {
    setDaysColumns(prev => {
      const newColumns = prev.filter(day => day.id !== dayId);
      setSelectedDaysPerWeek(newColumns.length);
      setTrainingDaysPerWeek(newColumns.length);
      return newColumns;
    });
  };

  const updateDaySelection = (dayId: string, selectedDay: string) => {
    setDaysColumns(prev =>
      prev.map(dayColumn =>
        dayColumn.id === dayId ? { ...dayColumn, selectedDay } : dayColumn
      )
    );
  };

  const showAddExerciseModal = (dayId: string) => {
    setPendingDayId(dayId);
    setShowBodyPartModal(true);
  };

  const addExerciseWithBodyPart = (
    dayId: string,
    bodyPart: PrimaryMuscleGroup
  ) => {
    setDaysColumns(prev =>
      prev.map(dayColumn => {
        if (dayColumn.id === dayId && dayColumn.exercises.length < 15) {
          return {
            ...dayColumn,
            exercises: [
              ...dayColumn.exercises,
              {
                id: `${dayId}-exercise-${dayColumn.exercises.length + 1}`,
                bodyPart,
                selectedExercise: null,
              },
            ],
          };
        }
        return dayColumn;
      })
    );

    setShowBodyPartModal(false);
    setPendingDayId(null);
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

  const updateExerciseSelection = (selectedExercise: IExercise) => {
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
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Header
        title='Create New Mesocycle'
        showLogo={false}
        showBackButton={true}
        showAIButton={true}
        disabledAIButton={!hasDaysNeedingExercises}
        onAIPress={handleAIPress}
        onNotificationPress={() => console.log('Notifications pressed')}
        rightComponent={
          isAILoading ? (
            <View style={{ paddingRight: 8 }}>
              <ActivityIndicator size="small" color={Colors.primary} />
            </View>
          ) : undefined
        }
      />
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <StepIndicator
            steps={[
              {
                number: 1,
                title: 'Basic Info',
                isActive: currentStep === 1,
                isCompleted: currentStep > 1,
              },
              {
                number: 2,
                title: 'Muscle Focus',
                isActive: currentStep === 2,
                isCompleted: currentStep > 2,
              },
              {
                number: 3,
                title: 'Exercises',
                isActive: currentStep === 3,
                isCompleted: false,
              },
            ]}
            currentStep={currentStep}
            onStepSelect={handleStepSelect}
            progress={currentStep === 1 ? 33 : currentStep === 2 ? 66 : 100}
          />
        </View>
      </View>

      {/* Content */}
      <AnimatedGHScrollView
        nestedScrollEnabled
        directionalLockEnabled
        style={styles.content}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {currentStep === 1 ? (
          <>
            {/* Weeks Selection */}
            <View style={styles.weeksSelectionContainer}>
              <TitleWithTooltip
                title='How many weeks long will your next mesocycle be? 6 weeks works well for most users.'
                titleStyle={styles.weeksSelectionLabel}
                tooltipContent={
                  <View style={styles.tooltipContent}>
                    <View style={styles.tooltipSection}>
                      <Text style={styles.tooltipSectionText}>
                        Shorter mesocycles (4-5 weeks) let you switch goals more
                        often and see quick progress. Great for beginners or
                        when trying something new.
                      </Text>
                    </View>
                    <Divider />
                    <View style={styles.tooltipSection}>
                      <Text style={styles.tooltipSectionText}>
                        Longer mesocycles (6-8 weeks) give your body more time
                        to adapt and build deeper changes. Better for
                        experienced lifters working on specific goals.
                      </Text>
                    </View>
                    <View style={styles.tooltipCtas}>
                      <Text style={styles.tooltipCta}>
                        <Text style={styles.tooltipCtaEmphasis}>Not sure?</Text>{' '}
                        Start with 4 weeks. It&apos;s enough time to see results
                        but short enough to stay motivated and adjust if needed.
                      </Text>
                    </View>
                  </View>
                }
              />
              <View style={styles.weeksButtonsContainer}>
                {[4, 5, 6, 7, 8].map(weekNumber => (
                  <TouchableOpacity
                    key={weekNumber}
                    style={[
                      styles.weekButton,
                      selectedWeeks === weekNumber && styles.weekButtonSelected,
                    ]}
                    onPress={() => setSelectedWeeks(weekNumber)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.weekButtonText,
                        selectedWeeks === weekNumber &&
                          styles.weekButtonTextSelected,
                      ]}
                    >
                      {weekNumber}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Training Days Per Week */}
            <View style={styles.trainingDaysContainer}>
              <TitleWithTooltip
                title='How many days a week will you train?'
                titleStyle={styles.trainingDaysLabel}
                tooltipContent={
                  <View style={styles.tooltipContent}>
                    <Text style={styles.tooltipSectionText}>
                      We recommend at least 3 days/week. 4 days/week is ideal. 5
                      days/week delivers excellent results. 6 days/week
                      maximizes progress but can be challenging to maintain.
                    </Text>
                  </View>
                }
              />
              <View style={styles.weeksButtonsContainer}>
                {[2, 3, 4, 5, 6, 7].map(dayNum => (
                  <TouchableOpacity
                    key={dayNum}
                    style={[
                      styles.weekButton,
                      trainingDaysPerWeek === dayNum &&
                        styles.weekButtonSelected,
                    ]}
                    onPress={() => {
                      setTrainingDaysPerWeek(dayNum);
                      setSelectedDaysPerWeek(dayNum);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.weekButtonText,
                        trainingDaysPerWeek === dayNum &&
                          styles.weekButtonTextSelected,
                      ]}
                    >
                      {dayNum}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Training Split Preference (Optional) */}
            <View style={styles.splitPreferenceContainer}>
              <TitleWithTooltip
                title='Training Split Preference (Optional)'
                titleStyle={styles.splitPreferenceLabel}
                tooltipContent={
                  <View style={styles.tooltipContent}>
                    <View style={styles.tooltipSection}>
                      <Text style={styles.tooltipSectionTitle}>
                        Upper/Lower
                      </Text>
                      <Text style={styles.tooltipSectionText}>
                        Alternating upper- and lower-body sessions.
                      </Text>
                    </View>
                    <View style={styles.tooltipSection}>
                      <Text style={styles.tooltipSectionTitle}>
                        Push/Pull/Legs
                      </Text>
                      <Text style={styles.tooltipSectionText}>
                        Push (chest/triceps), Pull (back/biceps), Legs.
                      </Text>
                    </View>
                    <View style={styles.tooltipSection}>
                      <Text style={styles.tooltipSectionTitle}>Full Body</Text>
                      <Text style={styles.tooltipSectionText}>
                        All major muscle groups each session.
                      </Text>
                    </View>
                    <View style={styles.tooltipSection}>
                      <Text style={styles.tooltipSectionTitle}>Body Focus</Text>
                      <Text style={styles.tooltipSectionText}>
                        Focus one primary muscle group each day with supporting
                        secondary muscles for balance. Distinct from Full Body,
                        where every session trains all major groups evenly.
                      </Text>
                    </View>
                    <View style={styles.tooltipSection}>
                      <Text style={styles.tooltipSectionTitle}>
                        Auto-select
                      </Text>
                      <Text style={styles.tooltipSectionText}>
                        Let the app choose based on your schedule and goal.
                      </Text>
                    </View>
                  </View>
                }
              />
              <View style={styles.splitGrid}>
                {[
                  { key: 'upperLower' as const, title: 'Upper/Lower' },
                  { key: 'lowerUpper' as const, title: 'Lower/Upper' },
                  { key: 'pushPullLegs' as const, title: 'Push/Pull/Legs' },
                  { key: 'fullBody' as const, title: 'Full Body' },
                  { key: 'bodyPart' as const, title: 'Body Focus' },
                  { key: 'auto' as const, title: 'Auto-select' },
                ].map(option => {
                  const isSelected = splitPreference === option.key;
                  return (
                    <TouchableOpacity
                      key={option.key}
                      style={[
                        styles.splitTile,
                        isSelected && styles.splitTileSelected,
                      ]}
                      onPress={() => setSplitPreference(option.key)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.splitTileTitle,
                          isSelected && styles.splitTileTitleSelected,
                        ]}
                      >
                        {option.title}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Average workout session Duration */}
            <View style={styles.sessionDurationContainer}>
              <View style={styles.sessionDurationHeader}>
                <Text style={styles.sessionDurationLabel}>
                  Average time per workout
                </Text>
                {avgSessionMinutes <= 45 && (
                  <Tag variant='outline' size='small' text='Time-tight' />
                )}
              </View>
              <RangeSlider
                min={30}
                max={120}
                value={avgSessionMinutes}
                onValueChange={setAvgSessionMinutes}
                step={5}
                showValue={true}
                minLabel={'30m'}
                maxLabel={'120m'}
              />
            </View>

            {/* Goal Selection */}
            <View style={styles.goalSelectionContainer}>
              <TitleWithTooltip
                title='What is your primary goal?'
                titleStyle={styles.goalSelectionLabel}
                tooltipContent={
                  <View style={styles.tooltipContent}>
                    <View style={styles.tooltipSection}>
                      <Text style={styles.tooltipSectionTitle}>
                        Hypertrophy:
                      </Text>
                      <Text style={styles.tooltipSectionText}>
                        Build muscle size and shape for the best aesthetic look.
                        Uses moderate weights with 5–30 reps to create muscle
                        growth and definition.
                      </Text>
                    </View>
                    <Divider />
                    <View style={styles.tooltipSection}>
                      <Text style={styles.tooltipSectionTitle}>Strength:</Text>
                      <Text style={styles.tooltipSectionText}>
                        Maximize how much weight you can lift. Uses heavy
                        weights with 1–5 reps to build raw strength without
                        optimizing for muscle size.
                      </Text>
                    </View>
                    <Divider />
                    <View style={styles.tooltipSection}>
                      <Text style={styles.tooltipSectionTitle}>Power:</Text>
                      <Text style={styles.tooltipSectionText}>
                        Develop explosive speed and athleticism. Uses fast,
                        dynamic movements like jumps, throws, and Olympic lifts
                        to improve athletic performance.
                      </Text>
                    </View>

                    <View style={styles.tooltipCtas}>
                      <Text style={styles.tooltipCta}>
                        Want to look more muscular? →{' '}
                        <Text style={styles.tooltipCtaEmphasis}>
                          Hypertrophy
                        </Text>
                      </Text>
                      <Text style={styles.tooltipCta}>
                        Want to lift heavier? →{' '}
                        <Text style={styles.tooltipCtaEmphasis}>Strength</Text>
                      </Text>
                      <Text style={styles.tooltipCta}>
                        Want to be more athletic? →{' '}
                        <Text style={styles.tooltipCtaEmphasis}>Power</Text>
                      </Text>
                    </View>
                  </View>
                }
              />
              <Text style={styles.goalSelectionHint}>
                If unsure, leave it as Hypertrophy.
              </Text>
              <View style={styles.goalButtonsContainer}>
                {[
                  MesocycleGoal.HYPERTROPHY,
                  MesocycleGoal.STRENGTH,
                  MesocycleGoal.POWER,
                ].map(goal => (
                  <TouchableOpacity
                    key={goal}
                    style={[
                      styles.goalButton,
                      selectedGoal === goal && styles.goalButtonSelected,
                    ]}
                    onPress={() => setSelectedGoal(goal)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.goalButtonText,
                        selectedGoal === goal && styles.goalButtonTextSelected,
                      ]}
                    >
                      {goal.charAt(0).toUpperCase() + goal.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        ) : currentStep === 2 ? (
          <>
            {/* Mesocycle Muscle Emphasis */}
            <View style={styles.goalSelectionContainer}>
              <TitleWithTooltip
                title='What are your top 3 muscle groups to develop in this mesocycle? In order of priority.'
                titleStyle={styles.goalSelectionLabel}
                tooltipContent={
                  <View style={styles.tooltipContent}>
                    <View style={styles.tooltipSection}>
                      <Text style={styles.tooltipSectionText}>
                        All muscle groups will still be trained in this
                        mesocycle. The 3 choices here simply receive extra
                        emphasis via the number and type of exercises and the
                        total set volume across the block.
                      </Text>
                    </View>
                    <Divider />
                    <View style={styles.tooltipSection}>
                      <Text style={styles.tooltipSectionText}>
                        Consider your current physique development and weak
                        areas when making your selections.
                      </Text>
                    </View>
                  </View>
                }
              />

              {/* Ranked slots */}
              <View style={styles.emphasisSlotsContainer}>
                {[1, 2, 3].map(slot => (
                  <View key={`slot-${slot}`} style={styles.emphasisSlot}>
                    <Text style={styles.emphasisSlotNumber}>{slot})</Text>
                    <Text
                      style={[
                        styles.emphasisSlotText,
                        selectedEmphasis[slot - 1] &&
                          styles.emphasisSlotTextSelected,
                      ]}
                    >
                      {selectedEmphasis[slot - 1]
                        ? muscleEmphasisOptions.find(
                            o => o.value === selectedEmphasis[slot - 1]
                          )?.label
                        : 'Tap a muscle group below'}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Muscle group buttons */}
              <View style={styles.muscleButtonsContainer}>
                {muscleEmphasisOptions.map(opt => {
                  const isSelected = selectedEmphasis.includes(opt.value);
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      style={[
                        styles.muscleButton,
                        isSelected && styles.muscleButtonSelected,
                      ]}
                      onPress={() => {
                        setSelectedEmphasis(prev => {
                          if (isSelected) {
                            return prev.filter(v => v !== opt.value);
                          }
                          if (prev.length >= 3) return prev;
                          return [...prev, opt.value];
                        });
                      }}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.muscleButtonText,
                          isSelected && styles.muscleButtonTextSelected,
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </>
        ) : (
          <>
            {/* Name Input moved to Step 2 */}
            <View style={styles.nameInputContainer}>
              <TitleWithTooltip
                title='Mesocycle Name'
                titleStyle={styles.nameInputLabel}
                tooltipContent={
                  <View style={styles.tooltipContent}>
                    <View style={styles.tooltipSection}>
                      <Text style={styles.tooltipSectionText}>
                        A mesocycle is a 4-8 week training phase where you focus
                        on one specific fitness goal (like increase chest size,
                        glute strength, or improve overall endurance).
                      </Text>
                    </View>

                    <View style={styles.tooltipSection}>
                      <Text style={styles.tooltipSectionTitle}>
                        First time naming a mesocycle?
                      </Text>
                      <Text style={styles.tooltipSectionText}>
                        Name your mesocycle to remember what you worked on and
                        when. Use this format: Goal + days/week + month. If you
                        have a specific theme or timeline, like Summer Vacation
                        Prep, add that context too.
                      </Text>
                    </View>

                    <View style={styles.tooltipSection}>
                      <Text style={styles.tooltipSectionTitle}>Examples:</Text>
                      <View style={styles.tooltipList}>
                        <Text style={styles.tooltipListItem}>
                          - Glute & Calves 4d Sep &apos;25
                        </Text>
                        <Text style={styles.tooltipListItem}>
                          - Chest & Back 5d Jan &apos;26
                        </Text>
                        <Text style={styles.tooltipListItem}>
                          - Full Body Time Saver 3d Mar &apos;26
                        </Text>
                      </View>
                    </View>

                    <View style={styles.tooltipCtas}>
                      <Text style={styles.tooltipCta}>
                        Keep it concise so it&apos;s easy to scan when browsing
                        your training history.
                      </Text>
                    </View>
                  </View>
                }
              />

              <Text style={styles.customNameText}>
                You can create a custom name if desired.
              </Text>

              <Input
                placeholder='Enter mesocycle name...'
                value={mesocycleName}
                onChangeText={text => {
                  setMesocycleName(text);
                  setHasManuallyEditedName(true);
                }}
                autoCorrect={false}
              />
            </View>
            <AnimatedGHScrollView
              horizontal
              nestedScrollEnabled
              directionalLockEnabled
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
                        day =>
                          !daysColumns.map(col => col.selectedDay).includes(day)
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
                        onRemove={() =>
                          removeExercise(dayColumn.id, exercise.id)
                        }
                        onMoveUp={() =>
                          moveExercise(dayColumn.id, exercise.id, 'up')
                        }
                        onMoveDown={() =>
                          moveExercise(dayColumn.id, exercise.id, 'down')
                        }
                        onExerciseSelect={() => {
                          setCurrentExerciseContext({
                            dayId: dayColumn.id,
                            exercise: exercise,
                          });
                          setShowExerciseSelectModal(true);
                        }}
                      />
                    ))}

                    {dayColumn.exercises.length < 15 && (
                      <TouchableOpacity
                        style={styles.addColumnButton}
                        onPress={() => showAddExerciseModal(dayColumn.id)}
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
          </>
        )}
      </AnimatedGHScrollView>

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          variant='secondary'
          onPress={handleBack}
          disabled={isLoading}
          size='small'
        >
          <Text style={styles.secondaryButtonText}>
            {currentStep === 1 ? 'Cancel' : 'Back'}
          </Text>
        </Button>
        {currentStep === 1 ? (
          <Button
            style={[
              styles.primaryButton,
              !isStep1Valid && styles.disabledButton,
            ]}
            size='small'
            onPress={handleNext}
            disabled={!isStep1Valid}
          >
            <Text style={[styles.primaryButtonText]}>Next</Text>
          </Button>
        ) : currentStep === 2 ? (
          <Button
            style={[
              styles.primaryButton,
              !isStep2Valid && styles.disabledButton,
            ]}
            size='small'
            onPress={handleNext}
            disabled={!isStep2Valid}
          >
            <Text style={[styles.primaryButtonText]}>Next</Text>
          </Button>
        ) : (
          <>
            <Button
              style={[
                styles.primaryButton,
                !isStep3Valid && styles.disabledButton,
              ]}
              size='small'
              onPress={handleSaveAsTemplate}
              disabled={!isStep3Valid}
            >
              {isLoading ? (
                <ActivityIndicator size='small' color={Colors.background} />
              ) : (
                <Text style={[styles.primaryButtonText]}>Save as Template</Text>
              )}
            </Button>
            <Button
              style={[
                styles.primaryButton,
                !isStep3Valid && styles.disabledButton,
              ]}
              size='small'
              onPress={handleSubmit}
              disabled={!isStep3Valid}
            >
              {isLoading ? (
                <ActivityIndicator size='small' color={Colors.background} />
              ) : (
                <Text style={[styles.primaryButtonText]}>Create</Text>
              )}
            </Button>
          </>
        )}
      </View>

      <MesocycleBodyPartSelectionModal
        isVisible={showBodyPartModal}
        onClose={() => {
          setShowBodyPartModal(false);
        }}
        onSelectedBodyPart={(bodyPart: PrimaryMuscleGroup) => {
          if (pendingDayId) {
            addExerciseWithBodyPart(
              pendingDayId,
              bodyPart as PrimaryMuscleGroup
            );
          }
        }}
      />

      <MesocycleExerciseSelectionModal
        isVisible={showExerciseSelectModal}
        bodyPart={
          currentExerciseContext
            ? currentExerciseContext.exercise.bodyPart
            : null
        }
        onClose={() => {
          setShowExerciseSelectModal(false);
          setCurrentExerciseContext(null);
        }}
        onSelectedExercise={(exercise: any) => {
          updateExerciseSelection(exercise);
          setShowExerciseSelectModal(false);
          setCurrentExerciseContext(null);
        }}
      />
      <ConfirmationAlert
        isVisible={showCreateConfirmation}
        onConfirm={handleCreateSubmit}
        onCancel={handleAddToList}
        onClose={() => setShowCreateConfirmation(false)}
        title='Create Mesocycle'
        message='This will overwrite your current mesocycle, are you sure you want to continue?'
        confirmText='Yes'
        cancelText='Add to list'
        variant='warning'
      />
      <ConfirmationAlert
        isVisible={showTemplateConfirmation}
        onConfirm={handleSaveAsTemplateSubmit}
        onClose={() => setShowTemplateConfirmation(false)}
        title='Save as Template'
        message='This will save this mesocycle as a template and not be active, you can use it later.'
        confirmText='Save'
        cancelText='Cancel'
        variant='warning'
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    height: 75,
    paddingHorizontal: Space[3],
    paddingBottom: Space[4],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Space[1],
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: Space[3],
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Space[3],
    paddingVertical: Space[4],
  },
  primaryButton: {
    backgroundColor: Colors.primary,
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
  // Weekday and Column Styles
  weekdaysScrollContent: {
    flexGrow: 1,
    minHeight: 300,
    padding: Space[2],
  },
  weekdayColumn: {
    width: 180,
    flex: 1,
    marginRight: Space[4],
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  weekdayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Space[3],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.background,
    borderTopLeftRadius: BorderRadius.md,
    borderTopRightRadius: BorderRadius.md,
    minHeight: 44,
  },
  deleteWeekdayButton: {
    padding: 2,
    borderRadius: BorderRadius.xs,
  },
  exercisesContainer: {
    flex: 1,
    flexGrow: 1,
    padding: Space[2],
    paddingBottom: Space[4],
  },
  addColumnButton: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Space[3],
    paddingHorizontal: Space[2],
    marginBottom: Space[2],
    minHeight: 50,
  },
  addColumnText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: Space[1],
    fontSize: 11,
  },
  placeholderText: {
    color: Colors.secondary,
    fontStyle: 'italic',
  },
  // Day dropdown styles
  dayDropdown: {
    minWidth: 130,
  },
  dayDropdownContainer: {
    flex: 1,
    width: '90%',
  },
  // Add day column button
  addDayColumnButton: {
    // width: 140,
    flex: 1,
    height: '100%',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    minWidth: 100,
  },
  addDayColumnText: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: Space[2],
  },
  // Name Input Styles
  nameInputContainer: {
    paddingHorizontal: Space[1],
    paddingVertical: Space[4],
    // borderBottomWidth: 1,
    // borderBottomColor: Colors.border,
  },
  nameInputLabel: {
    ...Typography.bodyBold,
    color: Colors.text,
    marginBottom: Space[2],
    fontSize: 14,
    flexShrink: 1,
  },
  customNameText: {
    ...Typography.caption,
    color: Colors.textDisabled,
    marginBottom: Space[2],
    fontSize: 12,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: Space[2],
  },

  // Weeks Selection Styles
  weeksSelectionContainer: {
    paddingVertical: Space[4],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  weeksSelectionLabel: {
    ...Typography.bodyBold,
    color: Colors.text,
    marginBottom: Space[3],
    fontSize: 14,
    flexShrink: 1,
  },
  weeksButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Space[2],
  },
  weekButton: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    paddingVertical: Space[3],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  weekButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  weekButtonText: {
    ...Typography.bodyBold,
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  weekButtonTextSelected: {
    color: Colors.background,
  },
  // Training days per week
  trainingDaysContainer: {
    paddingVertical: Space[4],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  trainingDaysLabel: {
    ...Typography.bodyBold,
    color: Colors.text,
    marginBottom: Space[3],
    fontSize: 14,
    flexShrink: 1,
  },
  // Available days grid
  availableDaysContainer: {
    paddingVertical: Space[4],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  availableDaysLabel: {
    ...Typography.bodyBold,
    color: Colors.text,
    marginBottom: Space[3],
    fontSize: 14,
  },
  dayChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Space[2],
  },
  dayChip: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.full,
    paddingVertical: Space[2],
    paddingHorizontal: Space[3],
    minWidth: 48,
    alignItems: 'center',
  },
  dayChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  dayChipText: {
    ...Typography.bodyBold,
    color: Colors.text,
    fontSize: 12,
  },
  dayChipTextSelected: {
    color: Colors.background,
  },
  // Split preference cards
  splitPreferenceContainer: {
    paddingVertical: Space[4],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  splitPreferenceLabel: {
    ...Typography.bodyBold,
    color: Colors.text,
    marginBottom: Space[3],
    fontSize: 14,
  },
  splitCardsContainer: {
    gap: Space[2],
  },
  // Deprecated large cards replaced with compact grid tiles
  splitGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Space[2],
  },
  splitTile: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    paddingVertical: Space[3],
    paddingHorizontal: Space[4],
    minWidth: '48%',
  },
  splitTileSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  splitTileTitle: {
    ...Typography.bodyBold,
    color: Colors.text,
    textAlign: 'center',
  },
  splitTileTitleSelected: {
    color: Colors.background,
  },
  // Session duration
  sessionDurationContainer: {
    paddingVertical: Space[4],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Space[2],
  },
  sessionDurationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sessionDurationLabel: {
    ...Typography.bodyBold,
    color: Colors.text,
    fontSize: 14,
  },
  // Goal Selection Styles
  goalSelectionContainer: {
    paddingHorizontal: Space[3],
    paddingVertical: Space[4],
  },
  goalSelectionLabel: {
    ...Typography.bodyBold,
    color: Colors.text,
    marginBottom: Space[3],
    fontSize: 14,
    flexShrink: 1,
  },
  goalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Space[2],
  },
  goalSelectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: Space[2],
  },
  goalSelectionHint: {
    ...Typography.caption,
    color: Colors.textDisabled,
    marginTop: Space[1],
    marginBottom: Space[2],
  },
  goalButton: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    paddingVertical: Space[3],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  goalButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  goalButtonText: {
    ...Typography.bodyBold,
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  goalButtonTextSelected: {
    color: Colors.background,
  },
  // Muscle group button styles
  muscleButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Space[2],
    justifyContent: 'space-between',
  },
  muscleButton: {
    width: '30%', // 3 buttons per row with gaps
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingVertical: Space[3],
    paddingHorizontal: Space[2],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  muscleButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  muscleButtonText: {
    ...Typography.bodyMedium,
    color: Colors.text,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 16,
  },
  muscleButtonTextSelected: {
    color: Colors.background,
    fontWeight: '700',
  },
  // Tooltip rich content styles
  tooltipContent: {
    paddingTop: Space[1],
  },
  tooltipSection: {
    marginBottom: Space[3],
  },
  tooltipSectionTitle: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Space[1],
  },
  tooltipSectionText: {
    ...Typography.caption,
    color: Colors.textDisabled,
    lineHeight: 20,
  },

  tooltipCtas: {
    marginTop: Space[1],
    paddingTop: Space[2],
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Space[1],
  },
  tooltipCta: {
    ...Typography.bodyMedium,
    color: Colors.text,
  },
  tooltipCtaEmphasis: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: Colors.text,
  },
  tooltipList: {
    gap: Space[1],
    marginTop: Space[1],
  },
  tooltipListItem: {
    ...Typography.caption,
    color: Colors.textDisabled,
    lineHeight: 20,
  },
  emphasisSlotsContainer: {
    gap: Space[2],
    marginBottom: Space[4],
  },
  emphasisSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space[3],
    paddingVertical: Space[3],
    paddingHorizontal: Space[4],
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
    minHeight: 52,
  },
  emphasisSlotNumber: {
    ...Typography.bodyBold,
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '700',
    minWidth: 20,
  },
  emphasisSlotText: {
    ...Typography.bodyMedium,
    color: Colors.textDisabled,
    flex: 1,
    fontSize: 15,
    fontStyle: 'italic',
  },
  emphasisSlotTextSelected: {
    color: Colors.text,
    fontStyle: 'normal',
    fontWeight: '600',
  },
} as const);
