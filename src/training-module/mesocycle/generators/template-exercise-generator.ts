import { IMesocycleTemplateExercise } from '../data/interfaces/mesocycle-templates';
import { IMesocycle } from '../data/interfaces/mesocycle';
import { IWorkout } from '../../workout/data/interfaces/workout';
import { IExerciseGenerator, IWorkoutExercisePayload } from '../interfaces/mesocycle-creation.interfaces';
import { groupByDay } from '../../../utils/exercises.util';

/**
 * Exercise generator for template-based mesocycle creation
 * 
 * @responsibility Generate exercises from template specification
 * @implements IExerciseGenerator
 */
export class TemplateExerciseGenerator implements IExerciseGenerator {
  private readonly exercisesByDay: Map<number, IMesocycleTemplateExercise[]>;

  constructor(
    private readonly template: IMesocycle,
    templateExercises: IMesocycleTemplateExercise[]
  ) {
    this.exercisesByDay = groupByDay(templateExercises);
  }

  generate(workouts: IWorkout[]): IWorkoutExercisePayload[] {
    const currentDateTime = new Date().toISOString();
    const exercisesPayloads: IWorkoutExercisePayload[] = [];

    for (let day = 1; day <= this.template.days_per_week; day++) {
      const dayExercises = this.exercisesByDay.get(day) || [];
      const dayWorkouts = workouts.filter(w => w.workout_day === day);

      for (let exerciseIndex = 0; exerciseIndex < dayExercises.length; exerciseIndex++) {
        const templateExercise = dayExercises[exerciseIndex];
        
        for (const workout of dayWorkouts) {
          exercisesPayloads.push({
            workout_id: workout.id,
            exercise_id: templateExercise.exercise_id,
            order_index: exerciseIndex + 1,
            soreness_from_last: 1,
            created_at: currentDateTime,
            last_modified: currentDateTime,
          });
        }
      }
    }

    return exercisesPayloads;
  }
}

