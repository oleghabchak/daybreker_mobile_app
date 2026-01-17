import { User } from '@supabase/supabase-js';

import { errorManager } from '../../../services/errorNotificationManager';
import { Logger } from '../../../services/logger';
import { MesocycleGoal } from '../data/enums/mesocycle-goal';
import { IMesocycleTemplate } from '../data/interfaces/mesocycle-templates';
import { ICreateMesocycleTemplateParams } from '../data/params/create-mesocycle-template-params';
import { MesocycleTemplateExerciseRepository } from '../repositories/mesocycle-template-exercise-repository';
import { MesocycleTemplateRepository } from '../repositories/mesocycle-template-repository';

export interface ICreateMesocycleTemplateParams_UseCase {
  user?: User; // Optional - if not provided, it's an app template
  name: string;
  goal: MesocycleGoal;
  num_weeks: number;
  days_per_week?: number;
  muscle_emphasis?: string[];
  length_weeks?: number;
  minutes_per_session?: number;
  weight_now?: number;
  joint_pain_now?: string[];
  split_type?: string;
  exercise_variation?: number;
  description?: string;
  is_app_template?: boolean; // True for app templates, false for user templates
  // For "from scratch" creation - exercises organized by day
  daysColumns?: {
    selectedDay: string | null;
    exercises: {
      selectedExercise: {
        exercise_uid: string;
        exercise_display_name_en?: string;
      } | null;
    }[];
  }[];
}

/**
 * Use Case: Create Mesocycle Template
 *
 * @responsibility Creates a mesocycle template that can be used later
 * to quickly create new mesocycles with predefined structure
 *
 * @follows Single Responsibility Principle (SOLID)
 */
export class CreateMesocycleTemplateUseCase {
  /**
   * Executes the use case to create a mesocycle template
   *
   * @param params Template creation parameters
   * @returns Created template
   * @throws Error if creation fails
   */
  static async execute(
    params: ICreateMesocycleTemplateParams_UseCase
  ): Promise<IMesocycleTemplate> {
    const {
      user,
      name,
      goal,
      num_weeks,
      days_per_week,
      muscle_emphasis,
      length_weeks,
      minutes_per_session,
      weight_now,
      joint_pain_now,
      split_type,
      exercise_variation,
      is_app_template,
      daysColumns,
    } = params;

    Logger.debug('CreateMesocycleTemplateUseCase: Starting', {
      name,
      goal,
      num_weeks,
      is_app_template,
    });

    // Prepare template data
    const templateData: ICreateMesocycleTemplateParams = {
      user_id: is_app_template ? undefined : user?.id,
      name,
      start_date: new Date().toISOString().split('T')[0],
      num_weeks,
      goal,
      days_per_week,
      muscle_emphasis,
      length_weeks: length_weeks || num_weeks,
      minutes_per_session,
      weight_now,
      joint_pain_now,
      split_type,
      exercise_variation,
      is_app_template: is_app_template ?? false,
    };

    // Create the template
    const templateRequest =
      await MesocycleTemplateRepository.create(templateData);
    if (templateRequest.status === 'error') {
      Logger.error(
        'CreateMesocycleTemplateUseCase: Failed to save template',
        templateRequest.error
      );
      errorManager.showError(templateRequest.error);
      throw templateRequest.error;
    }

    const template = templateRequest.data;
    Logger.debug('CreateMesocycleTemplateUseCase: Template created', {
      templateId: template.id,
    });

    // If exercises are provided, save them to mesocycle_template_exercises
    if (daysColumns && daysColumns.length > 0) {
      Logger.debug(
        'CreateMesocycleTemplateUseCase: Saving exercises to template',
        {
          daysCount: daysColumns.length,
        }
      );

      const templateExercises: {
        mesocycle_block_id: string;
        exercise_id: string;
        day_of_week: number;
        exercise_name: string | null;
      }[] = [];

      const alreadyExists = new Set<string>();

      // Collect all exercises from all days
      daysColumns.forEach((dayColumn, dayIndex) => {
        dayColumn.exercises.forEach(exerciseWrapper => {
          if (exerciseWrapper.selectedExercise) {
            const exerciseId = `${template.id}-${exerciseWrapper.selectedExercise.exercise_uid}`;
            if (alreadyExists.has(exerciseId)) {
              return;
            }
            alreadyExists.add(exerciseId);
            templateExercises.push({
              mesocycle_block_id: template.id,
              exercise_id: exerciseWrapper.selectedExercise.exercise_uid,
              day_of_week: dayIndex + 1,
              exercise_name:
                exerciseWrapper.selectedExercise.exercise_display_name_en ||
                null,
            });
          }
        });
      });

      // Bulk create template exercises
      if (templateExercises.length > 0) {
        const exercisesRequest =
          await MesocycleTemplateExerciseRepository.bulkCreate(
            templateExercises
          );

        if (exercisesRequest.status === 'error') {
          Logger.error(
            'CreateMesocycleTemplateUseCase: Failed to save exercises',
            exercisesRequest.error
          );
          // Don't throw - template is already created, just log the error
        } else {
          Logger.debug('CreateMesocycleTemplateUseCase: Exercises saved', {
            count: exercisesRequest.data.length,
          });
        }
      }
    }

    Logger.debug('CreateMesocycleTemplateUseCase: Completed', {
      templateId: template.id,
    });

    return template;
  }
}
