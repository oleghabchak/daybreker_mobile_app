import { AsyncResponse } from '../../../shared-module/data/types/async-response';
import { ITerraConnectionStatus } from '../data/interfaces/terra-activity-data';
import {
  IProcessedTerraDailyData,
  ITerraDataSearchParams,
  ITerraDataResponse,
} from '../data/interfaces/terra-daily-data';
import { TerraDataRepository } from '../repositories/terra-data-repository';

export class TerraDataService {
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

  /**
   * Get current authenticated user ID
   */
  private static async getCurrentUserId(): Promise<string | null> {
    try {
      const { supabase } = await import('../../../lib/supabase');
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user?.id || null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Sync Terra data and store in database
   */
  static async syncTerraData(
    startDate: Date,
    endDate: Date,
    terraDataRetrievalService?: any
  ): Promise<AsyncResponse<IProcessedTerraDailyData[]>> {
    return this.errorHandlingWrapper(async () => {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      console.log('🔄 Syncing Terra data...');

      // Get raw data from Terra
      if (!terraDataRetrievalService) {
        throw new Error('Terra data retrieval service not provided');
      }

      const rawData = await terraDataRetrievalService.getDailyDataFromTerra(
        startDate,
        endDate
      );

      if (!rawData || rawData.length === 0) {
        console.log('⚠️ No Terra data received');
        return [];
      }

      console.log(`📊 Processing ${rawData.length} days of Terra data`);

      // Process and store each day's data
      const processedData: IProcessedTerraDailyData[] = [];

      for (const dayData of rawData) {
        const processed = await this.processTerraDailyData(dayData);
        if (processed) {
          // Store in database
          const storeResult = await TerraDataRepository.storeDailyData(
            userId,
            processed
          );
          if (storeResult.status === 'ok') {
            processedData.push(storeResult.data);
          }
        }
      }

      console.log(
        `✅ Successfully synced ${processedData.length} days of data`
      );
      return processedData;
    });
  }

  /**
   * Process raw Terra daily data into our format
   */
  private static async processTerraDailyData(
    rawData: any
  ): Promise<IProcessedTerraDailyData | null> {
    try {
      const metadata = rawData.metadata;
      const date = metadata?.start_time
        ? new Date(metadata.start_time).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];

      const processed: IProcessedTerraDailyData = {
        date,
        steps: rawData.distance_data?.steps || 0,
        distance_meters: rawData.distance_data?.distance_meters || 0,
        floors_climbed: rawData.distance_data?.floors_climbed || 0,
        calories_burned: rawData.calories_data?.total_burned_calories || 0,
        BMR_calories: rawData.calories_data?.BMR_calories || 0,
        net_activity_calories:
          rawData.calories_data?.net_activity_calories || 0,
        activity_seconds: rawData.active_durations_data?.activity_seconds || 0,
        standing_hours:
          rawData.active_durations_data?.standing_hours_count || 0,
        standing_seconds: rawData.active_durations_data?.standing_seconds || 0,
        resting_heart_rate:
          rawData.heart_rate_data?.summary?.resting_heart_rate,
        max_heart_rate: rawData.heart_rate_data?.summary?.max_heart_rate,
        avg_heart_rate: rawData.heart_rate_data?.summary?.avg_heart_rate,
        oxygen_saturation:
          rawData.oxygen_data?.saturation_samples?.[0]?.oxygen_saturation,
        stress_level: rawData.stress_data?.samples?.[0]?.stress_level,
        device_info: {
          name: rawData.device_data?.name || 'Unknown',
          manufacturer: rawData.device_data?.manufacturer || 'Unknown',
          hardware_version: rawData.device_data?.hardware_version || 'Unknown',
          software_version: rawData.device_data?.software_version || 'Unknown',
        },
      };

      return processed;
    } catch (error) {
      console.error('Error processing Terra daily data:', error);
      return null;
    }
  }

  /**
   * Get Terra data by date range
   */
  static async getTerraDataByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<AsyncResponse<IProcessedTerraDailyData[]>> {
    return this.errorHandlingWrapper(async () => {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const result = await TerraDataRepository.getDailyDataByDateRange(
        userId,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );

      if (result.status === 'error') {
        throw result.error;
      }

      return result.data;
    });
  }

  /**
   * Get latest Terra data
   */
  static async getLatestTerraData(): Promise<
    AsyncResponse<IProcessedTerraDailyData | null>
  > {
    return this.errorHandlingWrapper(async () => {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const result = await TerraDataRepository.getLatestDailyData(userId);

      if (result.status === 'error') {
        throw result.error;
      }

      return result.data;
    });
  }

  /**
   * Get today's Terra data
   */
  static async getTodaysTerraData(): Promise<
    AsyncResponse<IProcessedTerraDailyData | null>
  > {
    return this.errorHandlingWrapper(async () => {
      const today = new Date();
      const result = await this.getTerraDataByDateRange(today, today);

      if (result.status === 'ok') {
        return result.data.length > 0 ? result.data[0] : null;
      } else {
        throw result.error;
      }
    });
  }

  /**
   * Get this week's Terra data
   */
  static async getThisWeeksTerraData(): Promise<
    AsyncResponse<IProcessedTerraDailyData[]>
  > {
    return this.errorHandlingWrapper(async () => {
      const today = new Date();
      const weekAgo = new Date(today);
      weekAgo.setDate(today.getDate() - 7);

      const result = await this.getTerraDataByDateRange(weekAgo, today);

      if (result.status === 'error') {
        throw result.error;
      }

      return result.data;
    });
  }

  /**
   * Search Terra data with filters
   */
  static async searchTerraData(
    params: ITerraDataSearchParams
  ): Promise<AsyncResponse<ITerraDataResponse>> {
    return this.errorHandlingWrapper(async () => {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const result = await TerraDataRepository.searchTerraData(userId, params);

      if (result.status === 'error') {
        throw result.error;
      }

      return result.data;
    });
  }

  /**
   * Get Terra data statistics
   */
  static async getTerraDataStatistics(days: number = 30): Promise<
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
      const userId = await this.getCurrentUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const result = await TerraDataRepository.getTerraDataStatistics(
        userId,
        days
      );

      if (result.status === 'error') {
        throw result.error;
      }

      return result.data;
    });
  }

  /**
   * Initialize Terra connection
   */
  static async initializeTerraConnection(
    terraDataRetrievalService?: any
  ): Promise<AsyncResponse<boolean>> {
    return this.errorHandlingWrapper(async () => {
      console.log('🚀 Initializing Terra connection...');

      if (!terraDataRetrievalService) {
        throw new Error('Terra data retrieval service not provided');
      }

      const initialized = await terraDataRetrievalService.initializeTerraUser();

      if (initialized) {
        console.log('✅ Terra connection initialized successfully');
        return true;
      } else {
        console.error('❌ Failed to initialize Terra connection');
        return false;
      }
    });
  }

  /**
   * Check Terra connection status
   */
  static async checkTerraConnectionStatus(): Promise<
    AsyncResponse<ITerraConnectionStatus>
  > {
    return this.errorHandlingWrapper(async () => {
      const sdk = (
        await import('../services/terra-SDK-service')
      ).default.getInstance();

      const isConnected = await sdk.isUserConnected();
      const healthKitStatus = await sdk.checkHealthKitStatus();

      return {
        is_connected: isConnected,
        provider: 'APPLE_HEALTH',
        last_sync: new Date().toISOString(),
        permissions_status: {
          health_kit: healthKitStatus.hasPermissions,
          activity: healthKitStatus.hasPermissions,
          heart_rate: healthKitStatus.hasPermissions,
          sleep: healthKitStatus.hasPermissions,
          nutrition: false, // Not implemented yet
        },
        device_info: {
          name: 'iPhone',
          manufacturer: 'Apple',
          model: 'iPhone',
          os_version: 'iOS',
        },
      };
    });
  }

  /**
   * Clear all Terra data for current user
   */
  static async clearAllTerraData(): Promise<AsyncResponse<boolean>> {
    return this.errorHandlingWrapper(async () => {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const result = await TerraDataRepository.deleteUserData(userId);

      if (result.status === 'error') {
        throw result.error;
      }

      return result.data;
    });
  }
}
