import { IRepository } from '../../../shared-module/data/interfaces/repository';
import { AsyncResponse } from '../../../shared-module/data/types/async-response';
import {
  IMesocycleTemplate,
  ICreateMesocycleTemplateInput,
  UpdateMesocycleTemplateInput,
  MesocycleTemplateFilters,
} from '../data/interfaces/mesocycle-templates';

export class MesocycleTemplateRepository extends IRepository {
  static tableName: string = 'mesocycle_templates';

  /**
   * Creates a new mesocycle template
   * @param params Template creation parameters
   * @returns Created template
   */
  static create(
    params: Partial<ICreateMesocycleTemplateInput> & {
      name: string;
      goal: any;
      num_weeks: number;
      user_id?: string;
      is_app_template?: boolean;
      start_date?: string;
      days_per_week?: number;
      muscle_emphasis?: string[];
      length_weeks?: number;
      minutes_per_session?: number;
      weight_now?: number;
      joint_pain_now?: string[];
      split_type?: string;
      exercise_variation?: number;
    }
  ): Promise<AsyncResponse<IMesocycleTemplate>> {
    return this.errorHandlingWrapper(async () => {
      const templateData = {
        ...params,
        created_at: new Date().toISOString(),
        last_modified: new Date().toISOString(),
      };

      const { data, error } = await this.table
        .insert([templateData])
        .select()
        .single<IMesocycleTemplate>();

      if (error) {
        throw error;
      }

      return data;
    });
  }

  /**
   * Gets all templates, optionally filtered
   * @param filters Optional filters for templates
   * @returns Array of templates
   */
  static getAll(
    filters?: MesocycleTemplateFilters
  ): Promise<AsyncResponse<IMesocycleTemplate[]>> {
    return this.errorHandlingWrapper(async () => {
      let query = this.table.select<'*', IMesocycleTemplate>('*');

      if (filters?.goal) {
        query = query.eq('goal', filters.goal);
      }
      if (filters?.is_public !== undefined) {
        query = query.eq('is_public', filters.is_public);
      }
      if (filters?.created_by_user_id) {
        query = query.eq('created_by_user_id', filters.created_by_user_id);
      }
      if (filters?.min_weeks) {
        query = query.gte('num_weeks', filters.min_weeks);
      }
      if (filters?.max_weeks) {
        query = query.lte('num_weeks', filters.max_weeks);
      }
      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data || [];
    });
  }

  /**
   * Gets a template by ID
   * @param id Template ID
   * @returns Template or null
   */
  static getById(id: string): Promise<AsyncResponse<IMesocycleTemplate>> {
    return this.errorHandlingWrapper(async () => {
      const { data, error } = await this.table
        .select<'*', IMesocycleTemplate>('*')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      return data;
    });
  }

  /**
   * Gets templates created by a specific user
   * @param userId User ID
   * @returns Array of user's templates
   */
  static getByUserId(
    userId: string
  ): Promise<AsyncResponse<IMesocycleTemplate[]>> {
    return this.errorHandlingWrapper(async () => {
      const { data, error } = await this.table
        .select<'*', IMesocycleTemplate>('*')
        .eq('created_by_user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    });
  }

  /**
   * Updates an existing template
   * @param params Update parameters
   * @returns Updated template
   */
  static update(
    params: UpdateMesocycleTemplateInput
  ): Promise<AsyncResponse<IMesocycleTemplate>> {
    return this.errorHandlingWrapper(async () => {
      const { id, ...updateData } = params;

      const { data, error } = await this.table
        .update({
          ...updateData,
          last_modified: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single<IMesocycleTemplate>();

      if (error) {
        throw error;
      }

      return data;
    });
  }

  /**
   * Deletes a template
   * @param id Template ID
   * @returns Success status
   */
  static delete(id: string): Promise<AsyncResponse<void>> {
    return this.errorHandlingWrapper(async () => {
      const { error } = await this.table.delete().eq('id', id);

      if (error) {
        throw error;
      }

      return;
    });
  }
}
