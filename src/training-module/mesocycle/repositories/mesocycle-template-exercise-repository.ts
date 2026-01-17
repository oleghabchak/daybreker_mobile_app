import { IRepository } from '../../../shared-module/data/interfaces/repository';
import { AsyncResponse } from '../../../shared-module/data/types/async-response';
import { IMesocycleTemplateExercise } from '../data/interfaces/mesocycle-templates';

export interface ICreateMesocycleTemplateExerciseParams {
  mesocycle_block_id: string;
  exercise_id: string;
  day_of_week?: number;
  exercise_name?: string | null;
}

export class MesocycleTemplateExerciseRepository extends IRepository {
  static tableName: string = 'mesocycle_template_exercises';

  /**
   * Creates a new mesocycle template exercise
   * @param params Exercise creation parameters
   * @returns Created exercise
   */
  static create(
    params: ICreateMesocycleTemplateExerciseParams
  ): Promise<AsyncResponse<IMesocycleTemplateExercise>> {
    return this.errorHandlingWrapper(async () => {
      const exerciseData = {
        ...params,
        created_at: new Date().toISOString(),
        last_modified: new Date().toISOString(),
      };

      const { data, error } = await this.table
        .insert([exerciseData])
        .select()
        .single<IMesocycleTemplateExercise>();

      if (error) {
        throw error;
      }

      return data;
    });
  }

  /**
   * Bulk creates multiple template exercises
   * @param exercises Array of exercise parameters
   * @returns Array of created exercises
   */
  static bulkCreate(
    exercises: ICreateMesocycleTemplateExerciseParams[]
  ): Promise<AsyncResponse<IMesocycleTemplateExercise[]>> {
    return this.errorHandlingWrapper(async () => {
      const exercisesData = exercises.map(exercise => ({
        ...exercise,
        created_at: new Date().toISOString(),
        last_modified: new Date().toISOString(),
      }));

      const { data, error } = await this.table
        .insert(exercisesData)
        .select();

      if (error) {
        throw error;
      }

      return data || [];
    });
  }

  /**
   * Gets all exercises for a specific template
   * @param mesocycleBlockId Template ID
   * @returns Array of exercises
   */
  static getByTemplateId(
    mesocycleBlockId: string
  ): Promise<AsyncResponse<IMesocycleTemplateExercise[]>> {
    return this.errorHandlingWrapper(async () => {
      const { data, error } = await this.table
        .select<'*', IMesocycleTemplateExercise>('*')
        .eq('mesocycle_block_id', mesocycleBlockId)
        .order('day_of_week', { ascending: true });

      if (error) {
        throw error;
      }

      return data || [];
    });
  }

  /**
   * Deletes all exercises for a template
   * @param mesocycleBlockId Template ID
   * @returns Success status
   */
  static deleteByTemplateId(mesocycleBlockId: string): Promise<AsyncResponse<void>> {
    return this.errorHandlingWrapper(async () => {
      const { error } = await this.table
        .delete()
        .eq('mesocycle_block_id', mesocycleBlockId);

      if (error) {
        throw error;
      }

      return;
    });
  }
}

