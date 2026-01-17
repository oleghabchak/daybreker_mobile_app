import { EllipsisVertical } from 'lucide-react-native';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { NumberInput } from '../../../../components';
import { TooltipComponent } from '../../../../components/common/TooltipComponent';
import { SetActionTooltip } from '../../../../components/tooltips/SetActionTooltip';
import { Checkbox } from '../../../../components/ui/CheckBox';
import { ConfirmationAlert } from '../../../../components/ui/ConfirmationAlert';
import { Divider } from '../../../../components/ui/Divider';
import { FeatureFlagService } from '../../../../config/feature-flags';
import { Colors, Space } from '../../../../constants/theme';
import { ExerciseStatus } from '../../../../enums/exercise.enum';
import { useMeasurementUnits } from '../../../../hooks/useMeasurementUnits';
import { useAuthStore } from '../../../../models/AuthenticationStore';
import { Logger } from '../../../../services/logger';
import { AsyncResponse } from '../../../../shared-module/data/types/async-response';
import { IWorkoutExercise } from '../../../../training-module/workout/data/interfaces/workout-exercise';
import { IWorkoutSet } from '../../../../training-module/workout/data/interfaces/workout-set';
import { useWorkoutStore } from '../../../../training-module/workout/stores/workout-store';
import {
  addOpacity,
  convertDisplayWeightToStorage,
  convertStorageWeightToDisplay,
} from '../../../../utils/helpers';
import { calculateSetRIR } from '../../../../utils/rirCalculation';

import { styles } from './SetRow.styles';
import { SetTooltip } from './SetTooltip';

export interface SetRowProps {
  setId: string;
  set: IWorkoutSet;
  blockLength?: number; // Total weeks in mesocycle block
  currentWeek?: number; // Current workout week
  isKeySet?: boolean; // Whether this is a key set
  isDeloadWeek?: boolean; // Whether this is a deload week
  onWeightUpdate: (
    setId: string,
    weight: number
  ) => Promise<AsyncResponse<boolean>>;
  onRepsUpdate: (
    setId: string,
    reps: number
  ) => Promise<AsyncResponse<boolean>>;
  onAddSet?: () => void;
  onSkipSet?: () => void;
  onDeleteSet?: () => void;
  showDivider?: boolean;
  onStatusChange?: (newStatus: ExerciseStatus) => void;
  onMenuPress?: (exercise: IWorkoutExercise) => void;
  isInputDisabled?: boolean;
}

export const SetRow: React.FC<SetRowProps> = ({
  set,
  setId,
  showDivider = true,
  onAddSet,
  onDeleteSet,
  onStatusChange,
  blockLength,
  currentWeek,
  isKeySet = false,
  isDeloadWeek = false,
  isInputDisabled = false,
}) => {
  const { getUnit, isImperial } = useMeasurementUnits();
  const {
    updateSetStatus,
    updateWeight,
    updateReps,
    markAsSkipped,
    isWorkoutCompleted,
  } = useWorkoutStore();
  const weightInputRef = useRef<TextInput>(null);
  const repsInputRef = useRef<TextInput>(null);
  const [weightValue, setWeightValue] = useState<number | null>(null);
  const [repsValue, setRepsValue] = useState<number | null>(null);
  const [localStatus, setLocalStatus] = useState<ExerciseStatus>(set.status);

  const [isWeightLoading, setIsWeightLoading] = useState(false);
  const [isRepsLoading, setIsRepsLoading] = useState(false);
  const [showHighRepsModal, setShowHighRepsModal] = useState(false);
  const [showZeroRepsModal, setShowZeroRepsModal] = useState(false);
  const [pendingRepsValue, setPendingRepsValue] = useState<number | null>(null);
  const [isUserValue, setIsUserValue] = useState(set.is_user_value);
  const isInitialized = useRef(false);
  const hasUserModifiedReps = useRef(false);

  // Calculate RIR based on mesocycle progression
  const calculatedRIR = useMemo(() => {
    if (blockLength && currentWeek) {
      const rir = calculateSetRIR(
        blockLength,
        currentWeek,
        isKeySet,
        isDeloadWeek
      );

      return rir;
    }

    return 0; // Fallback to default RIR if mesocycle data not available
  }, [blockLength, currentWeek, isKeySet, isDeloadWeek]);

  const { user } = useAuthStore();

  const isCalibrationSet = useMemo(() => {
    // Check if feature is enabled for this user
    const featureEnabled = FeatureFlagService.isCalibrationWeekEnabled(
      user?.id
    );

    if (!featureEnabled) {
      return false;
    }

    // Defensive programming: ensure all required data is present
    if (
      !currentWeek ||
      !set.set_number ||
      currentWeek < 1 ||
      set.set_number < 1
    ) {
      return false;
    }

    // Only Week 1, Set 1 can be calibration sets
    const isWeek1Set1 = currentWeek === 1 && set.set_number === 1;

    // Exercise must not be skipped to allow calibration
    const statusAllowsCalibration = set.status !== ExerciseStatus.SKIPPED;

    const result = isWeek1Set1 && statusAllowsCalibration;

    return result;
  }, [currentWeek, set.status, set.set_number, user?.id]);

  const isValidationSet = useMemo(() => {
    // Check if feature is enabled for this user
    const featureEnabled = FeatureFlagService.isCalibrationWeekEnabled(
      user?.id
    );

    if (!featureEnabled) {
      return false;
    }

    // Defensive programming: ensure all required data is present
    if (
      !currentWeek ||
      !set.set_number ||
      currentWeek < 1 ||
      set.set_number < 1
    ) {
      return false;
    }

    // Only Week 1, Set 2 can be validation sets
    const isWeek1Set2 = currentWeek === 1 && set.set_number === 2;

    // Exercise must not be skipped to allow validation
    const statusAllowsValidation = set.status !== ExerciseStatus.SKIPPED;

    const result = isWeek1Set2 && statusAllowsValidation;

    return result;
  }, [currentWeek, set.status, set.set_number, user?.id]);

  // const isMaxEffortSet = useMemo(() => calculatedRIR === 0, [calculatedRIR]);

  useEffect(() => {
    setLocalStatus(set.status);
  }, [set.status]);

  useEffect(() => {
    if (!isInitialized.current) {
      const displayWeight = convertStorageWeightToDisplay(
        set.weight_kg,
        isImperial
      );
      setWeightValue(displayWeight !== null ? displayWeight : 0);
      setRepsValue(set.actual_reps);
    }
  }, [set.weight_kg, set.actual_reps, isImperial]);

  const handleStatusChange = useCallback(
    async (status: ExerciseStatus) => {
      // Show calibration feedback for calibration sets when attempting to complete
      if (
        isCalibrationSet &&
        status === ExerciseStatus.DONE &&
        repsValue !== null
      ) {
        if (repsValue < 8) {
          Alert.alert('Too Heavy', 'Reduce weight for better form and safety', [
            { text: 'Got it' },
          ]);
          return; // Don't proceed with status change
        } else if (repsValue > 12) {
          Alert.alert('Too Light', 'Increase weight to challenge yourself', [
            { text: 'Got it' },
          ]);
          return; // Don't proceed with status change
        }
        // If reps are 8-12, continue without showing alert (allow completion)
      }

      // Only update local status if calibration check passes
      setLocalStatus(status);

      try {
        onStatusChange?.(status);
      } catch {}

      // Save weight and reps before updating status
      const convertedWeight = convertDisplayWeightToStorage(
        weightValue!,
        isImperial
      );

      setIsWeightLoading(true);
      setIsRepsLoading(true);

      Logger.debug('[SetRow] Saving weight and reps before status update', {
        setId,
        convertedWeight,
        repsValue,
        isCalibrationSet,
      });

      // Save weight
      if (convertedWeight !== null) {
        const weightResult = await updateWeight(setId, convertedWeight);
        Logger.debug('[SetRow] Weight saved', { setId, weightResult });
      } else {
        const weightResult = await updateWeight(setId, 0);
        Logger.debug('[SetRow] Weight saved as 0', { setId, weightResult });
      }

      // Save reps
      if (hasUserModifiedReps.current || repsValue !== null) {
        const repsResult = await updateReps(setId, repsValue!);
        Logger.debug('[SetRow] Reps saved', { setId, repsResult });
      }

      setIsWeightLoading(false);
      setIsRepsLoading(false);

      Logger.debug(
        '[SetRow] About to update status, weight/reps should be in DB',
        {
          setId,
          status,
          currentWeek,
        }
      );

      // For calibration sets, trigger progressive overload with weight/reps data
      // This ensures calibration processing happens with all required data
      const statusResult = await updateSetStatus(
        setId,
        status,
        currentWeek === 1
      );
      Logger.debug('[SetRow] Status updated, trigger should have fired', {
        setId,
        statusResult,
      });
    },
    [
      setId,
      updateSetStatus,
      updateWeight,
      updateReps,
      onStatusChange,
      weightValue,
      repsValue,
      isImperial,
      isCalibrationSet,
    ]
  );

  const handleCheckboxPress = useCallback(async () => {
    let newStatus: ExerciseStatus;

    if (localStatus === ExerciseStatus.SKIPPED) {
      newStatus = ExerciseStatus.NOT_STARTED;
    } else if (localStatus === ExerciseStatus.DONE) {
      newStatus = ExerciseStatus.NOT_STARTED;
    } else {
      newStatus = ExerciseStatus.DONE;
    }

    await handleStatusChange(newStatus);
  }, [localStatus, handleStatusChange]);

  const handleSkipSet = useCallback(async () => {
    setLocalStatus(ExerciseStatus.SKIPPED);

    try {
      onStatusChange?.(ExerciseStatus.SKIPPED);
    } catch {}

    try {
      const result = await markAsSkipped(setId);
      if (result.status === 'error') {
        console.error('❌ Failed to skip set:', result.error);
        setLocalStatus(ExerciseStatus.NOT_STARTED);
      }
    } catch (error) {
      console.error('❌ Error skipping set:', error);
      setLocalStatus(ExerciseStatus.NOT_STARTED);
    }
  }, [setId, markAsSkipped, onStatusChange]);

  const handleHighRepsConfirm = useCallback(() => {
    if (pendingRepsValue !== null) {
      setRepsValue(pendingRepsValue);
      hasUserModifiedReps.current = true;
      setIsUserValue(true);
    }
    setShowHighRepsModal(false);
    setPendingRepsValue(null);
  }, [pendingRepsValue]);

  const handleHighRepsCancel = useCallback(() => {
    setShowHighRepsModal(false);
    setPendingRepsValue(null);
  }, []);

  const handleZeroRepsConfirm = useCallback(() => {
    if (pendingRepsValue !== null) {
      setRepsValue(pendingRepsValue);
      setIsUserValue(true);
    }
    setShowZeroRepsModal(false);
    setPendingRepsValue(null);
  }, [pendingRepsValue]);

  const handleZeroRepsCancel = useCallback(() => {
    setShowZeroRepsModal(false);
    setPendingRepsValue(null);
  }, []);

  const handleRepsChange = useCallback((text: string) => {
    const numericValue = parseFloat(text);
    hasUserModifiedReps.current = true;
    setIsUserValue(true);

    // Check if the value is 0 and show confirmation modal
    if (!isNaN(numericValue) && numericValue === 0) {
      setPendingRepsValue(numericValue);
      setShowZeroRepsModal(true);
    }
    // Check if the value is over 100 and show confirmation modal
    else if (!isNaN(numericValue) && numericValue > 100) {
      setPendingRepsValue(numericValue);
      setShowHighRepsModal(true);
    } else {
      setRepsValue(text as unknown as number);
    }
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.setsRow}>
        <SetActionTooltip
          onAddSet={onAddSet}
          onSkipSet={handleSkipSet}
          onDeleteSet={onDeleteSet}
          position='right'
          disabled={isWorkoutCompleted}
        >
          <EllipsisVertical
            color={Colors.text}
            style={styles.setsOptionsButton}
          />
        </SetActionTooltip>
        <TouchableOpacity
          style={[styles.setsColumn, styles.weightColumn]}
          onPress={() => {
            weightInputRef.current?.focus();
          }}
          activeOpacity={0.9}
          hitSlop={{ top: 0, bottom: 10 }}
        >
          <Text style={styles.setsHeaderText}>WEIGHT</Text>

          <NumberInput
            ref={weightInputRef as React.RefObject<TextInput>}
            variant='outlinedDark'
            value={weightValue!}
            style={styles.weightInput}
            inputStyle={{
              color: isUserValue ? Colors.text : Colors.textDisabled,
            }}
            keyboardType='decimal-pad'
            loadingPosition='left'
            measurement={getUnit('weight')}
            maxLength={6}
            maxValue={isImperial ? 1200.5 : 544}
            disabled={isInputDisabled}
            loading={isWeightLoading}
            allowDecimals={isImperial} // Only allow decimals for imperial units
            onChangeText={text => {
              setWeightValue(text as unknown as number);
              setIsUserValue(true);
            }}
            onEndEditing={async () => {
              setIsWeightLoading(true);
              const convertedWeight = convertDisplayWeightToStorage(
                weightValue!,
                isImperial
              );
              if (convertedWeight !== null) {
                await updateWeight(setId, convertedWeight).then(() => {
                  setIsWeightLoading(false);
                  setIsUserValue(true);
                });
              } else {
                await updateWeight(setId, 0).then(() => {
                  setIsWeightLoading(false);
                  setIsUserValue(true);
                });
              }
            }}
          />
          {isCalibrationSet && (
            <Text style={styles.weightHelperText}>10RM</Text>
          )}
          {isValidationSet && (
            <Text style={styles.weightHelperText}>VALIDATION</Text>
          )}
        </TouchableOpacity>
        <View style={styles.setsColumn}>
          <View style={styles.labelWithTooltip}>
            <Text style={styles.setsHeaderText}>REPS</Text>
            <View
              style={[styles.tooltipInlineIcon, styles.tooltipInlineIconReps]}
            >
              <TooltipComponent
                content={
                  <SetTooltip
                    isCalibrationSet={isCalibrationSet}
                    isValidationSet={isValidationSet}
                  />
                }
                triggerHitSlop={10}
              />
            </View>
          </View>
          <TouchableOpacity
            onPress={() => {
              repsInputRef.current?.focus();
            }}
            hitSlop={{ top: 0, bottom: 16, left: 10, right: 10 }}
          >
            <NumberInput
              ref={repsInputRef as React.RefObject<TextInput>}
              variant='outlinedDark'
              value={repsValue!}
              style={styles.weightInput}
              inputStyle={{
                color: isUserValue ? Colors.text : Colors.textDisabled,
              }}
              inputContainerStyle={
                isCalibrationSet
                  ? styles.calibrationInputContainer
                  : isValidationSet
                    ? styles.validationInputContainer
                    : undefined
              }
              keyboardType='number-pad'
              maxLength={3}
              maxValue={999}
              loadingPosition='left'
              loading={isRepsLoading}
              disabled={isInputDisabled}
              onChangeText={handleRepsChange}
              onEndEditing={async () => {
                if (!hasUserModifiedReps.current) {
                  return;
                }
                setIsRepsLoading(true);
                await updateReps(setId, repsValue!).then(() => {
                  setIsRepsLoading(false);
                  setIsUserValue(true);
                });
              }}
            />
            <Text style={styles.setsRirText}>RIR {calculatedRIR}</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          hitSlop={{ top: 0, bottom: 10, right: 10 }}
          style={styles.setsColumn}
          onPress={handleCheckboxPress}
          disabled={
            weightValue === null || repsValue === null || isWorkoutCompleted
          }
        >
          <Text style={styles.setsHeaderText}>
            {localStatus === ExerciseStatus.SKIPPED ? 'skipped' : 'DONE'}
          </Text>
          <Checkbox
            disabled={
              weightValue === null || repsValue === null || isWorkoutCompleted
            }
            checked={localStatus === ExerciseStatus.DONE}
            onCheckChange={handleCheckboxPress} // Empty function since we're using onPress
            skipped={localStatus === ExerciseStatus.SKIPPED}
            variant={'primary'}
          />
        </TouchableOpacity>
      </View>
      {showDivider && (
        <Divider
          color={addOpacity(Colors.textDisabled, 40)}
          marginVertical={Space[0]}
        />
      )}

      {/* Zero Reps Confirmation Modal */}
      <ConfirmationAlert
        isVisible={showZeroRepsModal}
        onClose={handleZeroRepsCancel}
        onConfirm={handleZeroRepsConfirm}
        onCancel={handleZeroRepsCancel}
        title='Zero Reps'
        message='Are you sure you want to log 0 reps?'
        confirmText='Yes, Log It'
        cancelText='Cancel'
        variant='warning'
        size='small'
      />

      {/* High Reps Confirmation Modal */}
      <ConfirmationAlert
        isVisible={showHighRepsModal}
        onClose={handleHighRepsCancel}
        onConfirm={handleHighRepsConfirm}
        onCancel={handleHighRepsCancel}
        title='High Rep Count'
        message={`Are you sure you want to log ${pendingRepsValue} reps? Most exercises are performed with fewer than 100 reps.`}
        confirmText='Yes, Log It'
        cancelText='Cancel'
        variant='warning'
        size='small'
      />

      {/* Calibration Alert */}
      {/* <CalibrationAlert
        isVisible={showCalibrationAlert}
        onClose={() => setShowCalibrationAlert(false)}
        reps={repsValue || 0}
        weight={
          convertDisplayWeightToStorage(weightValue || 0, isImperial) || 0
        }
      /> */}
    </View>
  );
};
