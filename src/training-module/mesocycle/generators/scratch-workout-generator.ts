import { User } from '@supabase/supabase-js';
import { IMesocycle } from '../data/interfaces/mesocycle';
import { IWorkoutGenerator, IWorkoutPayload } from '../interfaces/mesocycle-creation.interfaces';

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
 * Workout generator for from-scratch mesocycle creation
 * 
 * @responsibility Generate workouts from user input
 * @implements IWorkoutGenerator
 */
export class ScratchWorkoutGenerator implements IWorkoutGenerator {
  constructor(
    private readonly user: User,
    private readonly selectedWeeks: number,
    private readonly daysColumns: IDayColumn[]
  ) {}

  generate(mesocycle: IMesocycle): IWorkoutPayload[] {
    const currentDateTime = new Date().toISOString();
    const workoutsPayloads: IWorkoutPayload[] = [];

    for (let week = 1; week <= this.selectedWeeks; week++) {
      for (let dayIndex = 0; dayIndex < this.daysColumns.length; dayIndex++) {
        workoutsPayloads.push({
          user_id: this.user.id,
          mesocycle_block_id: mesocycle.id,
          workout_day: dayIndex + 1,
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

