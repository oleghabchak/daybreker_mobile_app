import { User } from '@supabase/supabase-js';

import { Logger } from '../../../services/logger';
import { MesocycleStatus } from '../data/enums/mesocycle-status';
import { IMesocycle } from '../data/interfaces/mesocycle';
import { ICreateMesocycleParams } from '../data/params/create-mesocycle-params';
import { ScratchExerciseGenerator } from '../generators/scratch-exercise-generator';
import { ScratchSetsGenerator } from '../generators/scratch-sets-generator';
import { ScratchWorkoutGenerator } from '../generators/scratch-workout-generator';
import { MesocycleCreationService } from '../services/mesocycle-creation-service';

export interface ICreateFromScratchParams {
  user: User;
  mesocycleName: string;
  selectedWeeks: number;
  selectedGoal: any;
  daysColumns: {
    selectedDay: string | null;
    exercises: {
      selectedExercise: { exercise_uid: string } | null;
    }[];
  }[];
  trainingDaysPerWeek: number;
  avgSessionMinutes: number;
  status?: MesocycleStatus;
}

/**
 * Use Case: Create Mesocycle from Scratch
 *
 * @responsibility Creates a mesocycle with user-selected exercises
 * from scratch with optimized bulk inserts
 *
 * @follows Single Responsibility Principle (SOLID)
 * @implements Strategy Pattern through generator interfaces
 */
export class CreateMesocycleFromScratchUseCase {
  /**
   * Executes the use case to create a mesocycle from scratch
   *
   * @param params Scratch creation parameters
   * @returns Created mesocycle
   * @throws Error if creation fails
   */
  static async execute(params: ICreateFromScratchParams): Promise<IMesocycle> {
    const {
      user,
      mesocycleName,
      selectedWeeks,
      selectedGoal,
      daysColumns,
      trainingDaysPerWeek,
      avgSessionMinutes,
      status = MesocycleStatus.ACTIVE,
    } = params;

    Logger.debug('CreateMesocycleFromScratchUseCase: Starting', {
      mesocycleName,
      selectedWeeks,
      daysCount: daysColumns.length,
    });

    // Prepare mesocycle data
    const mesocycleData: ICreateMesocycleParams = {
      user_id: user.id,
      name: mesocycleName,
      start_date: new Date().toISOString().split('T')[0],
      num_weeks: selectedWeeks,
      goal: selectedGoal,
      status: status, // Use provided status or default to ACTIVE
      days_per_week: daysColumns.length || trainingDaysPerWeek,
      workout_days: daysColumns
        .map(col => col.selectedDay)
        .filter((day): day is string => day !== null),
      minutes_per_session: avgSessionMinutes,
    };

    // Create generators following defined interfaces
    const workoutGenerator = new ScratchWorkoutGenerator(
      user,
      selectedWeeks,
      daysColumns
    );
    const exerciseGenerator = new ScratchExerciseGenerator(daysColumns);
    const setsGenerator = new ScratchSetsGenerator(3);

    // Delegate to transaction service
    const mesocycle = await MesocycleCreationService.createMesocycleCore({
      mesocycleData,
      workoutGenerator,
      exerciseGenerator,
      setsGenerator,
    });

    Logger.debug('CreateMesocycleFromScratchUseCase: Completed', {
      mesocycleId: mesocycle.id,
    });

    return mesocycle;
  }
}
