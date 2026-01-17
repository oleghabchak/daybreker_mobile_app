import { AsyncResponse } from '../../../shared-module/data/types/async-response';
import { WorkoutSetRepository } from '../repositories/workout-set-repository';

export interface CalibrationData {
  original_weight: number;
  original_reps: number;
  calculated_10rm: number;
  calibrated_at: string;
  calibration_quality: 'good' | 'fair' | 'poor';
}

export class CalibrationService {
  /**
   * Determines the set type based on workout week, day, and set number
   * This is the single source of truth for set type logic
   */
  static getSetType(
    workoutWeek: number,
    workoutDay: number,
    setNumber: number,
    exerciseStatus: string
  ): 'warmup' | 'working' | 'calibration' | 'validation' {
    // Defensive checks
    if (!workoutWeek || !setNumber || workoutWeek < 1 || setNumber < 1) {
      return 'working';
    }

    // Exercise must not be skipped
    if (exerciseStatus === 'skipped') {
      return 'working';
    }

    // Week 1, Day 1 special logic
    if (workoutWeek === 1) {
      switch (setNumber) {
        case 1:
          return 'calibration';
        case 2:
          return 'validation';
        case 3:
          return 'working';
        default:
          return 'working';
      }
    }

    // Default to working set for all other cases
    return 'working';
  }

  /**
   * Determines if a set should be treated as a calibration set
   * This is the single source of truth for calibration logic
   * @deprecated Use getSetType instead
   */
  static isCalibrationSet(
    workoutWeek: number,
    setNumber: number,
    exerciseStatus: string
  ): boolean {
    // Defensive checks
    if (!workoutWeek || !setNumber || workoutWeek < 1 || setNumber < 1) {
      return false;
    }

    // Only Week 1, Set 1 can be calibration sets
    const isWeek1Set1 = workoutWeek === 1 && setNumber === 1;

    // Exercise must not be skipped
    const statusAllowsCalibration = exerciseStatus !== 'skipped';

    return isWeek1Set1 && statusAllowsCalibration;
  }

  /**
   * Calculates 10RM from calibration set data
   */
  static calculate10RM(weight: number, reps: number): number {
    if (reps <= 0 || weight <= 0) {
      throw new Error('Invalid weight or reps for 10RM calculation');
    }

    // Using Epley formula: 1RM = weight * (1 + reps/30)
    // For 10RM: 10RM = 1RM / (1 + 10/30) = 1RM / 1.33
    const oneRM = weight * (1 + reps / 30);
    const tenRM = oneRM / 1.33;

    return Math.round(tenRM * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Processes calibration set completion
   */
  static async processCalibrationSet(
    setId: string,
    weight: number,
    reps: number
  ): Promise<AsyncResponse<CalibrationData>> {
    try {
      const calculated10RM = this.calculate10RM(weight, reps);

      const calibrationData: CalibrationData = {
        original_weight: weight,
        original_reps: reps,
        calculated_10rm: calculated10RM,
        calibrated_at: new Date().toISOString(),
        calibration_quality: this.assessCalibrationQuality(reps),
      };

      // Update the set with calibration data
      const updateResult = await WorkoutSetRepository.update({
        id: setId,
        data: {
          set_type: 'calibration',
          calibration_data: calibrationData,
        },
      });

      if (updateResult.status === 'error') {
        return updateResult;
      }

      return {
        status: 'ok',
        data: calibrationData,
      };
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  }

  /**
   * Assesses the quality of calibration based on reps performed
   */
  private static assessCalibrationQuality(
    reps: number
  ): 'good' | 'fair' | 'poor' {
    if (reps >= 8 && reps <= 12) {
      return 'good';
    } else if (reps >= 6 && reps <= 15) {
      return 'fair';
    } else {
      return 'poor';
    }
  }

  /**
   * Gets calibration data for a specific set
   */
  static async getCalibrationData(
    setId: string
  ): Promise<AsyncResponse<CalibrationData | null>> {
    try {
      // Get the set data using the table directly since getById doesn't exist
      const { data, error } = await WorkoutSetRepository.table
        .select('*')
        .eq('id', setId)
        .single();

      if (error) {
        return {
          status: 'error',
          error: new Error(error.message),
        };
      }

      if (!data || data.set_type !== 'calibration' || !data.calibration_data) {
        return {
          status: 'ok',
          data: null,
        };
      }

      return {
        status: 'ok',
        data: data.calibration_data as CalibrationData,
      };
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  }
}
