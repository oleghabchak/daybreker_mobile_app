/**
 * Mesocycle Templates Module
 * 
 * This module provides functionality for creating and managing mesocycle templates.
 * Templates allow users to save mesocycle configurations for reuse.
 * 
 * Architecture:
 * - mesocycle_templates: Main template metadata
 * - mesocycle_template_exercises: Exercises organized by day_of_week
 */

// Repositories
export { MesocycleTemplateRepository } from '../mesocycle/repositories/mesocycle-template-repository';
export { MesocycleTemplateExerciseRepository } from '../mesocycle/repositories/mesocycle-template-exercise-repository';

// Use Cases
export { CreateMesocycleTemplateUseCase } from '../mesocycle/usecases/create-mesocycle-template-use-case';

// Types
export type { ICreateMesocycleTemplateParams } from '../mesocycle/data/params/create-mesocycle-template-params';
export type { 
  IMesocycleTemplate,
  ICreateMesocycleTemplateInput,
  UpdateMesocycleTemplateInput,
  MesocycleTemplateFilters,
  IMesocycleTemplateExercise,
  IMesocycleTemplateWithExercises
} from '../mesocycle/data/interfaces/mesocycle-templates';

