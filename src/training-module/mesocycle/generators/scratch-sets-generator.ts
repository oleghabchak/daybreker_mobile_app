import { IWorkout } from '../../workout/data/interfaces/workout';
import { CalibrationService } from '../../workout/services/calibration-service';
import { ISetsGenerator, IWorkoutSetPayload } from '../interfaces/mesocycle-creation.interfaces';

/**
 * Sets generator for from-scratch mesocycle creation
 * 
 * @responsibility Generate workout sets from user input
 * @implements ISetsGenerator
 */
export class ScratchSetsGenerator implements ISetsGenerator {
  constructor(private readonly defaultSets: number) {}

  generate(workoutExercises: any[], workouts: IWorkout[]): IWorkoutSetPayload[] {
    const workoutSetsPayloads: IWorkoutSetPayload[] = [];
    const currentDateTime = new Date().toISOString();

    for (const workout of workouts) {
      const exercises = workoutExercises.filter(
        (workoutExercise) => workoutExercise.workout_id === workout.id
      );

      for (const exercise of exercises) {
        for (let i = 0; i < this.defaultSets; i++) {
          const setNumber = i + 1;
          
          // Apply calibration logic for set type
          const setType = CalibrationService.getSetType(
            workout.workout_week,
            workout.workout_day,
            setNumber,
            'not_started'
          );

          workoutSetsPayloads.push({
            workout_exercise_id: exercise.id,
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
    }

    return workoutSetsPayloads;
  }
}

