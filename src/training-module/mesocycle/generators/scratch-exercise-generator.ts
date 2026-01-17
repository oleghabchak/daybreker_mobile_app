import { IWorkout } from '../../workout/data/interfaces/workout';
import { IExerciseGenerator, IWorkoutExercisePayload } from '../interfaces/mesocycle-creation.interfaces';

/**
 * Day column structure from scratch creation UI
 */
interface IDayColumn {
  selectedDay: string | null;
  exercises: Array<{
    selectedExercise: { exercise_uid: string } | null;
  }>;
}

/**
 * Exercise generator for from-scratch mesocycle creation
 * 
 * @responsibility Generate exercises from user selection
 * @implements IExerciseGenerator
 */
export class ScratchExerciseGenerator implements IExerciseGenerator {
  constructor(
    private readonly daysColumns: IDayColumn[]
  ) {}

  generate(workouts: IWorkout[]): IWorkoutExercisePayload[] {
    const currentDateTime = new Date().toISOString();
    const exercisesPayloads: IWorkoutExercisePayload[] = [];

    this.daysColumns.forEach((column, dayIndex) => {
      const dayWorkouts = workouts.filter(w => w.workout_day === dayIndex + 1);

      column.exercises.forEach((exercise, exerciseIndex) => {
        if (!exercise.selectedExercise) return;

        for (const workout of dayWorkouts) {
          exercisesPayloads.push({
            workout_id: workout.id,
            exercise_id: exercise.selectedExercise.exercise_uid,
            order_index: exerciseIndex + 1,
            soreness_from_last: 1,
            created_at: currentDateTime,
            last_modified: currentDateTime,
          });
        }
      });
    });

    return exercisesPayloads;
  }
}

