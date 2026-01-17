import { User } from '@supabase/supabase-js';
import { IMesocycle } from '../data/interfaces/mesocycle';
import { IWorkout } from '../../workout/data/interfaces/workout';

/**
 * Workout payload for bulk insert
 */
export interface IWorkoutPayload {
  user_id: string;
  mesocycle_block_id: string;
  workout_day: number;
  workout_week: number;
  started_at: string;
  is_public: boolean;
  created_at: string;
  last_modified: string;
}

/**
 * Workout exercise payload for bulk insert
 */
export interface IWorkoutExercisePayload {
  workout_id: string;
  exercise_id: string;
  order_index: number;
  soreness_from_last: number;
  created_at: string;
  last_modified: string;
}

/**
 * Workout set payload for bulk insert
 */
export interface IWorkoutSetPayload {
  workout_exercise_id: string;
  set_number: number;
  target_reps: number;
  weight_kg: number;
  target_rir_raw: number;
  status: string;
  set_type: string;
  created_at: string;
  last_modified: string;
}

/**
 * Generator for workout payloads
 * 
 * @responsibility Generate workout data for bulk insert based on mesocycle
 */
export interface IWorkoutGenerator {
  /**
   * Generate workout payloads for all weeks and days
   * 
   * @param mesocycle Created mesocycle
   * @returns Array of workout payloads ready for bulk insert
   */
  generate(mesocycle: IMesocycle): IWorkoutPayload[];
}

/**
 * Generator for workout exercise payloads
 * 
 * @responsibility Generate exercise data for bulk insert based on workouts
 */
export interface IExerciseGenerator {
  /**
   * Generate exercise payloads for all workouts
   * 
   * @param workouts Created workouts
   * @returns Array of exercise payloads ready for bulk insert
   */
  generate(workouts: IWorkout[]): IWorkoutExercisePayload[];
}

/**
 * Generator for workout set payloads
 * 
 * @responsibility Generate set data for bulk insert based on workout exercises
 */
export interface ISetsGenerator {
  /**
   * Generate set payloads for all workout exercises
   * 
   * @param workoutExercises Created workout exercises
   * @param workouts Created workouts (for calibration logic)
   * @returns Array of set payloads ready for bulk insert
   */
  generate(workoutExercises: any[], workouts: IWorkout[]): IWorkoutSetPayload[];
}

/**
 * Base parameters for mesocycle creation use cases
 */
export interface IMesocycleCreationParams {
  user: User;
}

/**
 * Base interface for mesocycle creation use cases
 * 
 * @responsibility Defines contract for all mesocycle creation use cases
 * @follows Interface Segregation Principle (SOLID)
 */
export interface IMesocycleCreationUseCase<TParams extends IMesocycleCreationParams> {
  /**
   * Execute the mesocycle creation use case
   * 
   * @param params Use case specific parameters
   * @returns Created mesocycle
   * @throws Error if creation fails
   */
  execute(params: TParams): Promise<IMesocycle>;
}

