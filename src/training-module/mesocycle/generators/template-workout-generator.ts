import { User } from '@supabase/supabase-js';
import { IMesocycle } from '../data/interfaces/mesocycle';
import { IWorkoutGenerator, IWorkoutPayload } from '../interfaces/mesocycle-creation.interfaces';

/**
 * Workout generator for template-based mesocycle creation
 * 
 * @responsibility Generate workouts from template specification
 * @implements IWorkoutGenerator
 */
export class TemplateWorkoutGenerator implements IWorkoutGenerator {
  constructor(
    private readonly user: User,
    private readonly template: IMesocycle
  ) {}

  generate(mesocycle: IMesocycle): IWorkoutPayload[] {
    const currentDateTime = new Date().toISOString();
    const workoutsPayloads: IWorkoutPayload[] = [];

    for (let week = 1; week <= this.template.num_weeks; week++) {
      for (let day = 1; day <= this.template.days_per_week; day++) {
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

