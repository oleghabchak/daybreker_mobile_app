import { User } from '@supabase/supabase-js';

import { Logger } from '../../../services/logger';
import { ComprehensiveMesocycleData } from '../../../types/mesocycle_types';
import { MesocycleStatus } from '../data/enums/mesocycle-status';
import { IMesocycle } from '../data/interfaces/mesocycle';
import { ICreateMesocycleParams } from '../data/params/create-mesocycle-params';
import { IWorkoutGenerator, IExerciseGenerator, ISetsGenerator } from '../interfaces/mesocycle-creation.interfaces';
import { MesocycleCreationService } from '../services/mesocycle-creation-service';
import { MesocycleService } from '../services/mesocycle-service';

export interface ICopyMesocycleParams {
  user: User;
  mesocycleId: string;
  newMesocycleName?: string;
  status?: MesocycleStatus;
}

/**
 * Use Case: Copy Mesocycle
 *
 * @responsibility Creates a copy of an existing mesocycle with cleared weights and reps
 * while preserving the structure and exercises
 *
 * @follows Single Responsibility Principle (SOLID)
 * @implements Strategy Pattern through generator interfaces
 */
export class CopyMesocycleUseCase {
  /**
   * Executes the use case to copy a mesocycle
   *
   * @param params Copy parameters including user and source mesocycle ID
   * @returns Created mesocycle copy
   * @throws Error if copying fails
   */
  static async execute(params: ICopyMesocycleParams): Promise<IMesocycle> {
    const { user, mesocycleId, newMesocycleName, status = MesocycleStatus.PLANNING } = params;

    Logger.debug('CopyMesocycleUseCase: Starting', {
      sourceMesocycleId: mesocycleId,
      userId: user.id,
    });

    // 1. Get the source mesocycle with all dependencies
    const mesocycleDataResponse = await MesocycleService.getMesocyclesWithSets(user.id);
    
    if (mesocycleDataResponse.status === 'error') {
      throw new Error(`Failed to fetch mesocycle data: ${mesocycleDataResponse.error}`);
    }

    const sourceMesocycle = mesocycleDataResponse.data?.find(m => m.id === mesocycleId);
    
    if (!sourceMesocycle) {
      throw new Error(`Mesocycle with ID ${mesocycleId} not found`);
    }

    Logger.debug('CopyMesocycleUseCase: Found source mesocycle', {
      sourceMesocycleId: sourceMesocycle.id,
      sourceMesocycleName: sourceMesocycle.name,
      workoutsCount: sourceMesocycle.workouts?.length || 0,
    });

    // 2. Prepare mesocycle data for the copy
    const mesocycleData: ICreateMesocycleParams = {
      user_id: user.id,
      name: newMesocycleName || `${sourceMesocycle.name} - Copy`,
      start_date: new Date().toISOString().split('T')[0],
      num_weeks: sourceMesocycle.num_weeks,
      goal: sourceMesocycle.goal as any, // Cast to MesocycleGoal enum
      status: status, // Use provided status or default to PLANNING
      days_per_week: sourceMesocycle.days_per_week || 3,
      minutes_per_session: 60, // Default value
      muscle_emphasis: sourceMesocycle.muscle_emphasis || undefined,
      split_type: sourceMesocycle.split_type || undefined,
    };

    // 3. Create generators for copying the structure
    const workoutGenerator = new CopyWorkoutGenerator(user, sourceMesocycle);
    const exerciseGenerator = new CopyExerciseGenerator(sourceMesocycle);
    const setsGenerator = new CopySetsGenerator(sourceMesocycle);

    // 4. Delegate to transaction service
    const mesocycle = await MesocycleCreationService.createMesocycleCore({
      mesocycleData,
      workoutGenerator,
      exerciseGenerator,
      setsGenerator,
    });

    Logger.debug('CopyMesocycleUseCase: Completed', {
      newMesocycleId: mesocycle.id,
      newMesocycleName: mesocycle.name,
    });

    return mesocycle;
  }
}

/**
 * Workout generator for copying existing mesocycle structure
 */
class CopyWorkoutGenerator implements IWorkoutGenerator {
  constructor(
    private readonly user: User,
    private readonly sourceMesocycle: ComprehensiveMesocycleData
  ) {}

  generate(mesocycle: IMesocycle): any[] {
    const currentDateTime = new Date().toISOString();
    const workoutsPayloads: any[] = [];

    // Generate workouts based on the source mesocycle structure
    for (let week = 1; week <= this.sourceMesocycle.num_weeks; week++) {
      for (let day = 1; day <= (this.sourceMesocycle.days_per_week || 3); day++) {
        workoutsPayloads.push({
          user_id: this.user.id,
          mesocycle_block_id: mesocycle.id,
          workout_day: day,
          workout_week: week,
          started_at: currentDateTime,
          is_public: false,
          created_at: currentDateTime,
          last_modified: currentDateTime,
        });
      }
    }

    return workoutsPayloads;
  }
}

/**
 * Exercise generator for copying existing mesocycle exercise structure
 */
class CopyExerciseGenerator implements IExerciseGenerator {
  constructor(private readonly sourceMesocycle: ComprehensiveMesocycleData) {}

  generate(workouts: any[]): any[] {
    const currentDateTime = new Date().toISOString();
    const exercisesPayloads: any[] = [];

    // Group new workouts by day and week for easy lookup
    const newWorkoutsByDayWeek = new Map<string, any[]>();
    
    workouts.forEach(workout => {
      const key = `${workout.workout_day}-${workout.workout_week}`;
      if (!newWorkoutsByDayWeek.has(key)) {
        newWorkoutsByDayWeek.set(key, []);
      }
      newWorkoutsByDayWeek.get(key)!.push(workout);
    });

    // Copy exercises from source mesocycle
    if (this.sourceMesocycle.workouts && this.sourceMesocycle.workouts.length > 0) {
      // Group source workouts by day to get the exercise structure
      const sourceWorkoutsByDay = new Map<number, any[]>();
      
      this.sourceMesocycle.workouts.forEach(workout => {
        if (!sourceWorkoutsByDay.has(workout.workout_day)) {
          sourceWorkoutsByDay.set(workout.workout_day, []);
        }
        sourceWorkoutsByDay.get(workout.workout_day)!.push(workout);
      });

      // For each day, get the exercise structure from the first workout of that day
      sourceWorkoutsByDay.forEach((sourceWorkouts, day) => {
        // Take the first workout of this day as template (all workouts of same day should have same exercises)
        const templateWorkout = sourceWorkouts[0];
        
        if (templateWorkout.exercises && templateWorkout.exercises.length > 0) {
          // For each exercise in the template workout
          templateWorkout.exercises.forEach((sourceExercise: any, exerciseIndex: number) => {
            // Create this exercise for all weeks of this day
            for (let week = 1; week <= this.sourceMesocycle.num_weeks; week++) {
              const key = `${day}-${week}`;
              const dayWorkouts = newWorkoutsByDayWeek.get(key) || [];
              
              dayWorkouts.forEach(workout => {
                exercisesPayloads.push({
                  workout_id: workout.id,
                  exercise_id: sourceExercise.exercise_id,
                  order_index: sourceExercise.order_index || (exerciseIndex + 1),
                  soreness_from_last: 1, // Reset soreness
                  created_at: currentDateTime,
                  last_modified: currentDateTime,
                });
              });
            }
          });
        }
      });
    }

    return exercisesPayloads;
  }
}

/**
 * Sets generator for copying mesocycle with cleared weights and reps
 */
class CopySetsGenerator implements ISetsGenerator {
  constructor(private readonly sourceMesocycle: ComprehensiveMesocycleData) {}

  generate(workoutExercises: any[], workouts: any[]): any[] {
    const currentDateTime = new Date().toISOString();
    const workoutSetsPayloads: any[] = [];

    // Create a map to find source sets by exercise ID
    const sourceSetsByExerciseId = new Map<string, any[]>();
    
    if (this.sourceMesocycle.workouts) {
      this.sourceMesocycle.workouts.forEach(workout => {
        if (workout.exercises) {
          workout.exercises.forEach((exercise: any) => {
            if (exercise.sets) {
              // Group sets by exercise ID (not workout_exercise_id, but the actual exercise_id)
              const exerciseId = exercise.exercise_id;
              if (!sourceSetsByExerciseId.has(exerciseId)) {
                sourceSetsByExerciseId.set(exerciseId, []);
              }
              
              // Add sets from this exercise (we'll use the first occurrence as template)
              if (sourceSetsByExerciseId.get(exerciseId)!.length === 0) {
                exercise.sets.forEach((set: any) => {
                  sourceSetsByExerciseId.get(exerciseId)!.push(set);
                });
              }
            }
          });
        }
      });
    }

    // Group workouts by day and week to match with source structure
    const newWorkoutsByDayWeek = new Map<string, any>();
    workouts.forEach(workout => {
      const key = `${workout.workout_day}-${workout.workout_week}`;
      newWorkoutsByDayWeek.set(key, workout);
    });

    // Generate sets for each workout exercise
    workoutExercises.forEach(workoutExercise => {
      const workout = newWorkoutsByDayWeek.get(`${workoutExercise.workout_day}-${workoutExercise.workout_week}`);
      if (!workout) return;

      // Find the source sets for this exercise
      const sourceSets = sourceSetsByExerciseId.get(workoutExercise.exercise_id) || [];
      
      // If we have source sets, copy their structure
      if (sourceSets.length > 0) {
        sourceSets.forEach((sourceSet: any) => {
          workoutSetsPayloads.push({
            workout_exercise_id: workoutExercise.id,
            set_number: sourceSet.set_number,
            target_reps: sourceSet.target_reps || 10, // Keep target reps but use default if not set
            weight_kg: 0, // Clear weight
            target_rir_raw: sourceSet.target_rir_raw || 2, // Keep target RIR but use default if not set
            status: 'not_started', // Reset status
            set_type: sourceSet.set_type || 'working', // Keep set type
            created_at: currentDateTime,
            last_modified: currentDateTime,
          });
        });
      } else {
        // Fallback: create default sets if no source sets found
        const numberOfSets = 3;
        
        for (let i = 0; i < numberOfSets; i++) {
          const setNumber = i + 1;
          let setType = 'working';
          if (setNumber === 1) {
            setType = 'warmup';
          }

          workoutSetsPayloads.push({
            workout_exercise_id: workoutExercise.id,
            set_number: setNumber,
            target_reps: 10,
            weight_kg: 0,
            target_rir_raw: 2,
            status: 'not_started',
            set_type: setType,
            created_at: currentDateTime,
            last_modified: currentDateTime,
          });
        }
      }
    });

    return workoutSetsPayloads;
  }
}
