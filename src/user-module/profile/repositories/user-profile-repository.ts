import { IRepository } from '../../../shared-module/data/interfaces/repository';
import { AsyncResponse } from '../../../shared-module/data/types/async-response';
import { IUserProfile } from '../interfaces/user-profile';

export class UserProfileRepository extends IRepository {
  static tableName: string = 'profiles';

  static async setCurrentMesocycleId(
    userId: string,
    mesocycleId: string | null
  ): Promise<AsyncResponse<IUserProfile>> {
    return this.errorHandlingWrapper(async () => {
      const { data, error } = await this.table
        .update({ current_mesocycle_id: mesocycleId })
        .eq('user_id', userId)
        .select<'*', IUserProfile>('*')
        .single();

      if (error) {
        throw error;
      }

      return data;
    });
  }

  static async getByUserId(
    userId: string
  ): Promise<AsyncResponse<IUserProfile>> {
    return this.errorHandlingWrapper(async () => {
      const { data, error } = await this.table
        .select<'*', IUserProfile>('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        throw error;
      }

      return data;
    });
  }
}
