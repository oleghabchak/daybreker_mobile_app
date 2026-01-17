import { IRepository } from '../../../shared-module/data/interfaces/repository';
import { AsyncResponse } from '../../../shared-module/data/types/async-response';
import {
  ITerraActivityData,
  ITerraUserProfile,
  ITerraConnectionStatus,
} from '../data/interfaces/terra-activity-data';
import {
  IProcessedTerraDailyData,
  ITerraDataSearchParams,
  ITerraDataResponse,
} from '../data/interfaces/terra-daily-data';

export class TerraDataRepository extends IRepository {
  static tableName: string = 'terra_daily_data';

  /**
   * Store processed Terra daily data
   */
  static async storeDailyData(
    userId: string,
    data: IProcessedTerraDailyData
  ): Promise<AsyncResponse<IProcessedTerraDailyData>> {
    return this.errorHandlingWrapper(async () => {
      const terraData = {
        user_id: userId,
        date: data.date,
        steps: data.steps,
        distance_meters: data.distance_meters,
        floors_climbed: data.floors_climbed,
        calories_burned: data.calories_burned,
        BMR_calories: data.BMR_calories,
        net_activity_calories: data.net_activity_calories,
        activity_seconds: data.activity_seconds,
        standing_hours: data.standing_hours,
        standing_seconds: data.standing_seconds,
        resting_heart_rate: data.resting_heart_rate,
        max_heart_rate: data.max_heart_rate,
        avg_heart_rate: data.avg_heart_rate,
        oxygen_saturation: data.oxygen_saturation,
        stress_level: data.stress_level,
        device_info: data.device_info,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: result, error } = await this.table
        .upsert([terraData], {
          onConflict: 'user_id,date',
          ignoreDuplicates: false,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        date: result.date,
        steps: result.steps,
        distance_meters: result.distance_meters,
        floors_climbed: result.floors_climbed,
        calories_burned: result.calories_burned,
        BMR_calories: result.BMR_calories,
        net_activity_calories: result.net_activity_calories,
        activity_seconds: result.activity_seconds,
        standing_hours: result.standing_hours,
        standing_seconds: result.standing_seconds,
        resting_heart_rate: result.resting_heart_rate,
        max_heart_rate: result.max_heart_rate,
        avg_heart_rate: result.avg_heart_rate,
        oxygen_saturation: result.oxygen_saturation,
        stress_level: result.stress_level,
        device_info: result.device_info,
      };
    });
  }

  /**
   * Get daily data for a specific user and date range
   */
  static async getDailyDataByDateRange(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<AsyncResponse<IProcessedTerraDailyData[]>> {
    return this.errorHandlingWrapper(async () => {
      const { data, error } = await this.table
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      if (error) {
        throw error;
      }

      return data.map(item => ({
        date: item.date,
        steps: item.steps,
        distance_meters: item.distance_meters,
        floors_climbed: item.floors_climbed,
        calories_burned: item.calories_burned,
        BMR_calories: item.BMR_calories,
        net_activity_calories: item.net_activity_calories,
        activity_seconds: item.activity_seconds,
        standing_hours: item.standing_hours,
        standing_seconds: item.standing_seconds,
        resting_heart_rate: item.resting_heart_rate,
        max_heart_rate: item.max_heart_rate,
        avg_heart_rate: item.avg_heart_rate,
        oxygen_saturation: item.oxygen_saturation,
        stress_level: item.stress_level,
        device_info: item.device_info,
      }));
    });
  }

  /**
   * Get latest daily data for a user
   */
  static async getLatestDailyData(
    userId: string
  ): Promise<AsyncResponse<IProcessedTerraDailyData | null>> {
    return this.errorHandlingWrapper(async () => {
      const { data, error } = await this.table
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        throw error;
      }

      return {
        date: data.date,
        steps: data.steps,
        distance_meters: data.distance_meters,
        floors_climbed: data.floors_climbed,
        calories_burned: data.calories_burned,
        BMR_calories: data.BMR_calories,
        net_activity_calories: data.net_activity_calories,
        activity_seconds: data.activity_seconds,
        standing_hours: data.standing_hours,
        standing_seconds: data.standing_seconds,
        resting_heart_rate: data.resting_heart_rate,
        max_heart_rate: data.max_heart_rate,
        avg_heart_rate: data.avg_heart_rate,
        oxygen_saturation: data.oxygen_saturation,
        stress_level: data.stress_level,
        device_info: data.device_info,
      };
    });
  }

  /**
   * Search Terra data with filters and pagination
   */
  static async searchTerraData(
    userId: string,
    params: ITerraDataSearchParams
  ): Promise<AsyncResponse<ITerraDataResponse>> {
    return this.errorHandlingWrapper(async () => {
      let query = this.table
        .select('*', { count: 'exact' })
        .eq('user_id', userId);

      // Apply date range filter
      if (params.filters?.dateRange) {
        query = query
          .gte(
            'date',
            params.filters.dateRange.start.toISOString().split('T')[0]
          )
          .lte(
            'date',
            params.filters.dateRange.end.toISOString().split('T')[0]
          );
      }

      // Apply pagination
      if (params.limit) {
        query = query.limit(params.limit);
      }
      if (params.offset) {
        query = query.range(
          params.offset,
          params.offset + (params.limit || 50) - 1
        );
      }

      const { data, error, count } = await query.order('date', {
        ascending: false,
      });

      if (error) {
        throw error;
      }

      const processedData = data.map(item => ({
        date: item.date,
        steps: item.steps,
        distance_meters: item.distance_meters,
        floors_climbed: item.floors_climbed,
        calories_burned: item.calories_burned,
        BMR_calories: item.BMR_calories,
        net_activity_calories: item.net_activity_calories,
        activity_seconds: item.activity_seconds,
        standing_hours: item.standing_hours,
        standing_seconds: item.standing_seconds,
        resting_heart_rate: item.resting_heart_rate,
        max_heart_rate: item.max_heart_rate,
        avg_heart_rate: item.avg_heart_rate,
        oxygen_saturation: item.oxygen_saturation,
        stress_level: item.stress_level,
        device_info: item.device_info,
      }));

      return {
        data: processedData,
        total: count || 0,
        hasMore: params.offset
          ? params.offset + (params.limit || 50) < (count || 0)
          : false,
        dateRange: {
          start:
            params.filters?.dateRange?.start.toISOString().split('T')[0] || '',
          end: params.filters?.dateRange?.end.toISOString().split('T')[0] || '',
        },
      };
    });
  }

  /**
   * Get Terra data statistics for a user
   */
  static async getTerraDataStatistics(
    userId: string,
    days: number = 30
  ): Promise<
    AsyncResponse<{
      totalDays: number;
      averageSteps: number;
      averageCalories: number;
      averageHeartRate: number;
      dataCompleteness: number;
      lastSyncDate: string;
    }>
  > {
    return this.errorHandlingWrapper(async () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);

      const { data, error } = await this.table
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        return {
          totalDays: 0,
          averageSteps: 0,
          averageCalories: 0,
          averageHeartRate: 0,
          dataCompleteness: 0,
          lastSyncDate: '',
        };
      }

      const totalSteps = data.reduce((sum, item) => sum + (item.steps || 0), 0);
      const totalCalories = data.reduce(
        (sum, item) => sum + (item.calories_burned || 0),
        0
      );
      const heartRateData = data.filter(item => item.avg_heart_rate);
      const averageHeartRate =
        heartRateData.length > 0
          ? heartRateData.reduce((sum, item) => sum + item.avg_heart_rate, 0) /
            heartRateData.length
          : 0;

      return {
        totalDays: data.length,
        averageSteps: Math.round(totalSteps / data.length),
        averageCalories: Math.round(totalCalories / data.length),
        averageHeartRate: Math.round(averageHeartRate),
        dataCompleteness: Math.round((data.length / days) * 100),
        lastSyncDate: data[0]?.updated_at || '',
      };
    });
  }

  /**
   * Delete Terra data for a user
   */
  static async deleteUserData(userId: string): Promise<AsyncResponse<boolean>> {
    return this.errorHandlingWrapper(async () => {
      const { error } = await this.table.delete().eq('user_id', userId);

      if (error) {
        throw error;
      }

      return true;
    });
  }
}
