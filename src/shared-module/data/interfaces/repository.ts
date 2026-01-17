import { supabase } from '../../../lib/supabase';
import { AsyncResponse } from '../types/async-response';

export class IRepository {
  static tableName: string;

  static get table() {
    return supabase.from(this.tableName);
  }

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
}
