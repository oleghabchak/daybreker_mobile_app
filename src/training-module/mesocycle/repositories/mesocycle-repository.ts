import { IRepository } from '../../../shared-module/data/interfaces/repository';
import { AsyncResponse } from '../../../shared-module/data/types/async-response';
import { MesocycleStatus } from '../data/enums/mesocycle-status';
import { IMesocycle } from '../data/interfaces/mesocycle';
import { IMesocycleSummary } from '../data/interfaces/mesocycle-summary';
import { ICreateMesocycleParams } from '../data/params/create-mesocycle-params';
import { IGetMesocycleByIdParams } from '../data/params/get-mesocycle-by-id-params';
import { IGetMesocycleByUserIdParams } from '../data/params/get-mesocycle-by-user-id-params';

export class MesocycleRepository extends IRepository {
  static tableName: string = 'mesocycle';

  static create(
    params: ICreateMesocycleParams
  ): Promise<AsyncResponse<IMesocycle>> {
    return this.errorHandlingWrapper(async () => {
      const mesocycleData: ICreateMesocycleParams = {
        ...params,
        created_at: new Date().toISOString(),
        last_modified: new Date().toISOString(),
      };

      const { data, error } = await this.table
        .insert([mesocycleData])
        .select()
        .single<IMesocycle>();

      if (error) {
        throw error;
      }

      return data;
    });
  }

  static async getNamesList(
    userId: string
  ): Promise<AsyncResponse<Pick<IMesocycle, 'id' | 'name'>>> {
    return this.errorHandlingWrapper(async () => {
      const { data, error } = await this.table
        .select<'id, name', Pick<IMesocycle, 'id' | 'name'>>('id, name')
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      return data;
    });
  }

  static async getMesocyclesSummary(
    userId: string
  ): Promise<AsyncResponse<IMesocycleSummary[]>> {
    return this.errorHandlingWrapper(async () => {
      const { data, error } = await this.table
        .select<
          'id, name, num_weeks, days_per_week, status, is_ai_generated',
          IMesocycleSummary
        >('id, name, num_weeks, days_per_week, status, is_ai_generated')
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      return data || [];
    });
  }

  static getAll(userId: string): Promise<AsyncResponse<IMesocycle[]>> {
    return this.errorHandlingWrapper(async () => {
      const { data, error } = await this.table
        .select<'*', IMesocycle>()
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      return data;
    });
  }

  static getById({
    id,
  }: IGetMesocycleByIdParams): Promise<AsyncResponse<IMesocycle>> {
    return this.errorHandlingWrapper(async () => {
      const { data, error } = await this.table
        .select('*')
        .eq('id', id)
        .single<IMesocycle>();

      if (error) {
        throw error;
      }

      return data;
    });
  }

  static getByUserId({
    userId,
  }: IGetMesocycleByUserIdParams): Promise<AsyncResponse<IMesocycle>> {
    return this.errorHandlingWrapper(async () => {
      const { data, error } = await this.table
        .select('*')
        .eq('userId', userId)
        .single<IMesocycle>();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned - user doesn't have a mesocycle profile yet
          return null;
        }

        throw error;
      }

      return data;
    });
  }

  static async updateName(
    id: string,
    name: string
  ): Promise<AsyncResponse<IMesocycle>> {
    return this.errorHandlingWrapper(async () => {
      const { data, error } = await this.table
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

  static async completeAllActiveMesocycles(
    userId: string,
    excludeMesocycleId?: string
  ): Promise<AsyncResponse<void>> {
    return this.errorHandlingWrapper(async () => {
      let query = this.table
        .update({
          status: MesocycleStatus.COMPLETED,
          last_modified: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('status', MesocycleStatus.ACTIVE);

      // Exclude the mesocycle we're about to activate
      if (excludeMesocycleId) {
        query = query.neq('id', excludeMesocycleId);
      }

      const { error } = await query;

      if (error) {
        throw error;
      }

      return undefined;
    });
  }
}
