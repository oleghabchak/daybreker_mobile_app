import { errorManager } from '../../../services/errorNotificationManager';
import { Logger } from '../../../services/logger';
import { supabase } from '../../../lib/supabase';
import { IWorkout } from '../../workout/data/interfaces/workout';
import { WorkoutExerciseRepository } from '../../workout/repositories/workout-exercise-repository';
import { WorkoutRepository } from '../../workout/repositories/workout-repository';
import { WorkoutSetRepository } from '../../workout/repositories/workout-set-repository';
import { IMesocycle } from '../data/interfaces/mesocycle';
import { ICreateMesocycleParams } from '../data/params/create-mesocycle-params';
import {
  IWorkoutGenerator,
  IExerciseGenerator,
  ISetsGenerator,
} from '../interfaces/mesocycle-creation.interfaces';
import { MesocycleRepository } from '../repositories/mesocycle-repository';

/**
 * Base service for creating mesocycles with optimized bulk inserts
 * Contains shared logic used by specific use cases
 *
 * @responsibility Core mesocycle creation logic with bulk operations
 */
export class MesocycleCreationService {
  /**
   * Core mesocycle creation logic that handles:
   * 1. Creating the mesocycle
   * 2. Bulk creating all workouts
   * 3. Bulk creating all workout exercises
   * 4. Bulk creating all workout sets
   *
   * @public For use by specific creation use cases
   * @param params Creation parameters with generators following defined interfaces
   */
  static async createMesocycleCore(params: {
    mesocycleData: ICreateMesocycleParams;
    workoutGenerator: IWorkoutGenerator;
    exerciseGenerator: IExerciseGenerator;
    setsGenerator: ISetsGenerator;
  }): Promise<IMesocycle> {
    const {
      mesocycleData,
      workoutGenerator,
      exerciseGenerator,
      setsGenerator,
    } = params;

    Logger.debug('MesocycleCreationService: Creating mesocycle', {
      mesocycleData,
    });

    // 1. Create the mesocycle
    const mesocycleRequest = await MesocycleRepository.create(mesocycleData);
    if (mesocycleRequest.status === 'error') {
      errorManager.showError(mesocycleRequest.error);
      throw mesocycleRequest.error;
    }
    const mesocycle = mesocycleRequest.data;
    Logger.debug('MesocycleCreationService: Mesocycle created', {
      mesocycleId: mesocycle.id,
    });

    // 2. Bulk create workouts using generator interface
    const workoutsPayloads = workoutGenerator.generate(mesocycle);
    Logger.debug('MesocycleCreationService: Creating workouts', {
      count: workoutsPayloads.length,
    });

    const { data: workouts, error: workoutsError } =
      await WorkoutRepository.table.insert(workoutsPayloads).select();

    if (workoutsError) {
      Logger.error(
        'MesocycleCreationService: Failed to create workouts',
        workoutsError
      );
      throw workoutsError;
    }
    Logger.debug('MesocycleCreationService: Workouts created', {
      count: workouts.length,
    });

    // 3. Bulk create workout exercises using generator interface
    const exercisesPayloads = exerciseGenerator.generate(
      workouts as IWorkout[]
    );
    Logger.debug('MesocycleCreationService: Creating exercises', {
      count: exercisesPayloads.length,
    });

    const { data: workoutExercises, error: exercisesError } =
      await WorkoutExerciseRepository.table.insert(exercisesPayloads).select();

    if (exercisesError) {
      Logger.error(
        'MesocycleCreationService: Failed to create exercises',
        exercisesError
      );
      throw exercisesError;
    }
    Logger.debug('MesocycleCreationService: Exercises created', {
      count: workoutExercises.length,
    });

    // 4. Bulk create workout sets using generator interface
    const setsPayloads = setsGenerator.generate(
      workoutExercises,
      workouts as IWorkout[]
    );
    Logger.debug('MesocycleCreationService: Creating sets', {
      count: setsPayloads.length,
    });

    const { data: workoutSets, error: setsError } =
      await WorkoutSetRepository.table.insert(setsPayloads).select();

    if (setsError) {
      Logger.error(
        'MesocycleCreationService: Failed to create sets',
        setsError
      );
      throw setsError;
    }
    Logger.debug('MesocycleCreationService: Sets created', {
      count: workoutSets.length,
    });

    return mesocycle;
  }

  /**
   * Create mesocycle with all related data in a single transaction using Edge Function
   * Uses SQL function for atomic operation with automatic rollback on error
   * 
   * @public For use by specific creation use cases requiring transaction safety
   * @param params Creation parameters with generators
   */
  static async createMesocycleInTransaction(params: {
    mesocycleData: ICreateMesocycleParams;
    workoutGenerator: IWorkoutGenerator;
    exerciseGenerator: IExerciseGenerator;
    setsGenerator: ISetsGenerator;
  }): Promise<IMesocycle> {
    const {
      mesocycleData,
      workoutGenerator,
      exerciseGenerator,
      setsGenerator,
    } = params;

    Logger.debug('MesocycleCreationService: Creating mesocycle in transaction', {
      mesocycleData,
    });

    // Generate all payloads first
    // Note: We need workouts to generate exercises, but we don't have real workout IDs yet
    // So we create temporary workout placeholders that will be replaced by real IDs in the SQL function
    const tempWorkouts = Array.from({ length: (mesocycleData.num_weeks || 0) * (mesocycleData.days_per_week || 3) }, (_, i) => ({
      id: `temp-${i}`,
      mesocycle_block_id: '',
      user_id: mesocycleData.user_id,
      workout_day: (i % (mesocycleData.days_per_week || 3)) + 1,
      workout_week: Math.floor(i / (mesocycleData.days_per_week || 3)) + 1,
    })) as any[];
    
    const workoutsPayloads = workoutGenerator.generate(mesocycleData as any);
    const exercisesPayloads = exerciseGenerator.generate(tempWorkouts as any);
    const setsPayloads = setsGenerator.generate(exercisesPayloads, tempWorkouts as any);

    Logger.debug('MesocycleCreationService: Generated payloads', {
      workouts: workoutsPayloads.length,
      exercises: exercisesPayloads.length,
      sets: setsPayloads.length,
    });

    // Call Edge Function that creates everything in a transaction
    const { data: result, error } = await supabase.functions.invoke('create-mesocycle', {
      body: {
        user_id: mesocycleData.user_id,
        name: mesocycleData.name,
        start_date: mesocycleData.start_date,
        num_weeks: mesocycleData.num_weeks,
        goal: mesocycleData.goal,
        status: mesocycleData.status || 'planning',
        workout_days: mesocycleData.workout_days || null,
        days_per_week: mesocycleData.days_per_week || null,
        muscle_emphasis: mesocycleData.muscle_emphasis || null,
        length_weeks: mesocycleData.length_weeks || null,
        minutes_per_session: mesocycleData.minutes_per_session || null,
        weight_now: mesocycleData.weight_now || null,
        joint_pain_now: mesocycleData.joint_pain_now || null,
        split_type: mesocycleData.split_type || null,
        exercise_variation: mesocycleData.exercise_variation || null,
        workouts_data: workoutsPayloads as any,
        exercises_data: exercisesPayloads as any,
        sets_data: setsPayloads as any,
      }
    });

    if (error) {
      Logger.error('MesocycleCreationService: Failed to create mesocycle in transaction', error);
      errorManager.showError(error);
      throw error;
    }

    if (!result.success) {
      const errorMsg = 'Failed to create mesocycle';
      Logger.error('MesocycleCreationService: Mesocycle creation failed', result);
      errorManager.showError(errorMsg);
      throw new Error(errorMsg);
    }

    Logger.debug('MesocycleCreationService: Mesocycle created in transaction', {
      mesocycleId: result.data.mesocycle.id,
      workoutsCount: result.data.workouts?.length || 0,
      exercisesCount: result.data.exercises?.length || 0,
      setsCount: result.data.sets?.length || 0,
    });

    return result.data.mesocycle as IMesocycle;
  }
}
