import { supabase } from '../../../lib/supabase';
import { Logger } from '../../../services/logger';
import { AsyncResponse } from '../../../shared-module/data/types/async-response';
import { ComprehensiveMesocycleData } from '../../../types/mesocycle_types';
import { MesocycleStatus } from '../data/enums/mesocycle-status';
import { IMesocycle } from '../data/interfaces/mesocycle';
import { IMesocycleTemplateExercise } from '../data/interfaces/mesocycle-templates';
import { IMesocycleWithDetails } from '../data/interfaces/mesosycle-with-details';

export class MesocycleService {
  protected static async errorHandlingWrapper<T>(
    wrapper: () => Promise<any>
  ): Promise<AsyncResponse<T>> {
    try {
      const response = await wrapper();

      return {
        status: 'ok',
        data: response,
      };
    } catch (error) {
      return {
        status: 'error',
        error: error as Error,
      };
    }
  }

  static async getMesocycleDetails(
    mesocycleId: string
  ): Promise<AsyncResponse<IMesocycleWithDetails>> {
    return this.errorHandlingWrapper(async () => {
      const { data, error } = await supabase.rpc('get_mesocycle_details', {
        mesocycle_id: mesocycleId,
      });

      if (error) {
        throw error;
      }

      return data;
    });
  }

  static async getMesocyclesWithSets(
    userId: string
  ): Promise<AsyncResponse<ComprehensiveMesocycleData[]>> {
    return this.errorHandlingWrapper(async () => {
      const { data, error } = await supabase.rpc(
        'get_mesocycles_with_sets_new',
        {
          user_id_param: userId,
        }
      );

      if (error) {
        return error;
      }

      const comprehensiveData: ComprehensiveMesocycleData[] = Array.isArray(
        data
      )
        ? data
        : [];

      return comprehensiveData;
    });
  }

  static async getMesocyclesWithSetsById(
    id: string
  ): Promise<AsyncResponse<ComprehensiveMesocycleData | null>> {
    return this.errorHandlingWrapper(async () => {
      const { data, error } = await supabase.rpc(
        'get_mesocycles_with_sets_new_by_id',
        { id_param: id}
      );

      if (error) {
        return error;
      }

      const comprehensiveData: ComprehensiveMesocycleData[] = Array.isArray(
        data
      )
        ? data
        : [];

      return comprehensiveData[0] || null;
    });
  }

  static async getMesocycleTemplates(
    isAppTemplate?: boolean,
    userId?: string
  ): Promise<AsyncResponse<IMesocycle[]>> {
    return this.errorHandlingWrapper(async () => {
      let query = supabase.from('mesocycle_templates').select('*');

      if (isAppTemplate !== undefined) {
        query = query.eq('is_app_template', isAppTemplate);
      }
      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data;
    });
  }

  static async getTemplateExercises(
    mesocycleBlockId: string
  ): Promise<AsyncResponse<IMesocycleTemplateExercise[]>> {
    return this.errorHandlingWrapper(async () => {
      const { data, error } = await supabase
        .from('mesocycle_template_exercises')
        .select('*')
        .eq('mesocycle_block_id', mesocycleBlockId)
        .order('day_of_week', { ascending: true });

      if (error) {
        throw error;
      }
      return data;
    });
  }

  static async updateMesocycleName(
    id: string,
    name: string
  ): Promise<AsyncResponse<IMesocycle>> {
    return this.errorHandlingWrapper(async () => {
      const { data, error } = await supabase
        .from('mesocycle')
        .update({
          name,
          last_modified: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single<IMesocycle>();

      if (error) {
        throw error;
      }

      return data;
    });
  }

  static async updateMesocycleStatus(
    id: string,
    status: MesocycleStatus
  ): Promise<AsyncResponse<IMesocycle>> {
    return this.errorHandlingWrapper(async () => {
      const { data, error } = await supabase
        .from('mesocycle')
        .update({
          status,
          last_modified: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single<IMesocycle>();

      if (error) {
        throw error;
      }

      return data;
    });
  }

  static async deleteMesocycle(id: string): Promise<AsyncResponse<void>> {
    return this.errorHandlingWrapper(async () => {
      const { error } = await supabase.from('mesocycle').delete().eq('id', id);

      if (error) {
        throw error;
      }

      return undefined;
    });
  }

  static async deleteTemplate(id: string): Promise<AsyncResponse<void>> {
    return this.errorHandlingWrapper(async () => {
      const { error: templateError } = await supabase
        .from('mesocycle_templates')
        .delete()
        .eq('id', id);

      if (templateError) {
        throw templateError;
      }

      return undefined;
    });
  }
}
