import { User } from '@supabase/supabase-js';

import { Logger } from '../../../services/logger';
import { MesocycleStatus } from '../data/enums/mesocycle-status';
import { IMesocycle } from '../data/interfaces/mesocycle';
import { IMesocycleTemplateExercise } from '../data/interfaces/mesocycle-templates';
import { ICreateMesocycleParams } from '../data/params/create-mesocycle-params';
import { TemplateExerciseGenerator } from '../generators/template-exercise-generator';
import { TemplateSetsGenerator } from '../generators/template-sets-generator';
import { TemplateWorkoutGenerator } from '../generators/template-workout-generator';
import { MesocycleCreationService } from '../services/mesocycle-creation-service';

export interface ICreateFromTemplateParams {
  user: User;
  selectedTemplate: IMesocycle;
  templateExercises: IMesocycleTemplateExercise[];
  mesocycleName?: string;
  status?: MesocycleStatus;
}

/**
 * Use Case: Create Mesocycle from Template
 *
 * @responsibility Creates a mesocycle based on a predefined template
 * with optimized bulk inserts
 *
 * @follows Single Responsibility Principle (SOLID)
 * @implements Strategy Pattern through generator interfaces
 */
export class CreateMesocycleFromTemplateUseCase {
  /**
   * Executes the use case to create a mesocycle from a template
   *
   * @param params Template creation parameters
   * @returns Created mesocycle
   * @throws Error if creation fails
   */
  static async execute(params: ICreateFromTemplateParams): Promise<IMesocycle> {
    const { user, selectedTemplate, templateExercises, mesocycleName, status = MesocycleStatus.ACTIVE } = params;

    Logger.debug('CreateMesocycleFromTemplateUseCase: Starting', {
      templateId: selectedTemplate.id,
      templateName: selectedTemplate.name,
    });

    // Prepare mesocycle data
    const mesocycleData: ICreateMesocycleParams = {
      user_id: user.id,
      name: mesocycleName || selectedTemplate.name,
      start_date: new Date().toISOString().split('T')[0],
      num_weeks: selectedTemplate.num_weeks,
      goal: selectedTemplate.goal,
      status: status, // Use provided status or default to ACTIVE
      days_per_week: selectedTemplate.days_per_week,
      minutes_per_session: selectedTemplate.minutes_per_session || 60,
    };

    // Create generators following defined interfaces
    const workoutGenerator = new TemplateWorkoutGenerator(
      user,
      selectedTemplate
    );
    const exerciseGenerator = new TemplateExerciseGenerator(
      selectedTemplate,
      templateExercises
    );
    const setsGenerator = new TemplateSetsGenerator(3);

    // Delegate to transaction service
    const mesocycle = await MesocycleCreationService.createMesocycleCore({
      mesocycleData,
      workoutGenerator,
      exerciseGenerator,
      setsGenerator,
    });

    Logger.debug('CreateMesocycleFromTemplateUseCase: Completed', {
      mesocycleId: mesocycle.id,
    });

    return mesocycle;
  }
}
