import { IRepository } from '../../../shared-module/data/interfaces/repository';
import { AsyncResponse } from '../../../shared-module/data/types/async-response';
import { ICustomExercise } from '../data/interfaces/custom-exercise';

export class CustomExerciseRepository extends IRepository {
  static tableName: string = 'user_custom_exercises';

  static async create(
    data: ICustomExercise
  ): Promise<AsyncResponse<ICustomExercise>> {
    return this.errorHandlingWrapper(async () => {
      const { data: exercise, error } = await this.table
        .insert([
          {
            ...data,
            review_status: 'pending', // Set default review status
            created_at: new Date().toISOString(),
            last_modified: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        return error;
      }

      return exercise;
    });
  }

  static async delete(id: string): Promise<AsyncResponse<boolean>> {
    return this.errorHandlingWrapper(async () => {
      const { error } = await this.table.delete().eq('id', id);

      if (error) {
        throw error;
      }

      return true;
    });
  }

  static async getByUserId(
    userId: string
  ): Promise<AsyncResponse<ICustomExercise[]>> {
    return this.errorHandlingWrapper(async () => {
      const { data, error } = await this.table
        .select('*')
        .eq('created_by_user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return error;
      }

      return data;
    });
  }
}
