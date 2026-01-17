/**
 * Terra Data Retrieval Service
 *
 * Retrieves health data FROM Terra (the correct direction)
 * Terra is designed to provide data TO your app, not receive data FROM your app
 */

import { getDaily, getActivity, Connections } from 'terra-react';

export interface TerraDailyData {
  date: string;
  steps?: number;
  heartRate?: number;
  calories?: number;
  distance?: number;
  sleepHours?: number;
  activeMinutes?: number;
}

export class TerraDataRetrievalService {
  private static instance: TerraDataRetrievalService;

  private constructor() {
    // No dependencies
  }

  static getInstance(): TerraDataRetrievalService {
    if (!TerraDataRetrievalService.instance) {
      TerraDataRetrievalService.instance = new TerraDataRetrievalService();
    }
    return TerraDataRetrievalService.instance;
  }

  /**
   * Get daily health data from Terra for a date range
   */
  async getDailyDataFromTerra(
    startDate: Date,
    endDate: Date
  ): Promise<TerraDailyData[]> {
    try {
      console.log('📥 Retrieving daily data from Terra...');
      console.log('📅 Date range:', {
        start: startDate.toDateString(),
        end: endDate.toDateString(),
      });

      const response = await getDaily(
        Connections.APPLE_HEALTH,
        startDate,
        endDate,
        false // Don't send to webhook, return data directly
      );

      console.log('📋 Terra getDaily response:', response);

      if (response.error !== null && response.error !== undefined) {
        console.error(
          '❌ Failed to get daily data from Terra:',
          response.error
        );
        return [];
      }

      if (response.success && response.data) {
        console.log('✅ Daily data retrieved from Terra successfully');
        console.log(
          '📊 Data received:',
          JSON.stringify(response.data, null, 2)
        );

        // Process the data into our format
        // Terra returns data in response.data.data array
        const terraData = response.data.data || [];
        return this.processTerraDailyData(terraData);
      }

      console.log('⚠️ No data received from Terra');
      return [];
    } catch (error) {
      console.error('❌ Error retrieving daily data from Terra:', error);
      return [];
    }
  }

  /**
   * Get activity data from Terra for a specific date
   */
  async getActivityDataFromTerra(date: Date): Promise<any> {
    try {
      console.log('📥 Retrieving activity data from Terra...');
      console.log('📅 Date:', date.toDateString());

      // Create end date (same day, end of day)
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      const response = await getActivity(
        Connections.APPLE_HEALTH,
        date,
        endDate,
        false // Don't send to webhook, return data directly
      );

      console.log('📋 Terra getActivity response:', response);

      if (response.error !== null && response.error !== undefined) {
        console.error(
          '❌ Failed to get activity data from Terra:',
          response.error
        );
        return null;
      }

      if (response.success && response.data) {
        console.log('✅ Activity data retrieved from Terra successfully');
        console.log(
          '📊 Activity data received:',
          JSON.stringify(response.data, null, 2)
        );
        return response.data;
      }

      console.log('⚠️ No activity data received from Terra');
      return null;
    } catch (error) {
      console.error('❌ Error retrieving activity data from Terra:', error);
      return null;
    }
  }

  /**
   * Get today's health data from Terra
   */
  async getTodaysDataFromTerra(): Promise<TerraDailyData | null> {
    try {
      const today = new Date();
      const data = await this.getDailyDataFromTerra(today, today);
      return data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error("❌ Error retrieving today's data from Terra:", error);
      return null;
    }
  }

  /**
   * Get this week's health data from Terra
   */
  async getThisWeeksDataFromTerra(): Promise<TerraDailyData[]> {
    try {
      const today = new Date();
      const weekAgo = new Date(today);
      weekAgo.setDate(today.getDate() - 7);

      return await this.getDailyDataFromTerra(weekAgo, today);
    } catch (error) {
      console.error("❌ Error retrieving this week's data from Terra:", error);
      return [];
    }
  }

  /**
   * Process Terra's raw data into our format
   */
  private processTerraDailyData(rawData: any): TerraDailyData[] {
    try {
      console.log('🔄 Processing Terra raw data...');
      console.log('📊 Raw data structure:', JSON.stringify(rawData, null, 2));

      // Terra returns an array of daily data objects
      if (Array.isArray(rawData)) {
        return rawData.map((item: any) => this.processSingleDayData(item));
      } else {
        // Single day data
        return [this.processSingleDayData(rawData)];
      }
    } catch (error) {
      console.error('❌ Error processing Terra data:', error);
      return [];
    }
  }

  /**
   * Process a single day's data from Terra
   */
  private processSingleDayData(item: any): TerraDailyData {
    try {
      const processed: TerraDailyData = {
        date: item.date || new Date().toISOString().split('T')[0],
      };

      // Extract steps data
      if (item.breakdown?.movement?.steps?.achieved) {
        processed.steps = item.breakdown.movement.steps.achieved;
      }

      // Extract heart rate data
      if (
        item.breakdown?.health_data?.resting_heart_rate?.consistency?.achieved
      ) {
        processed.heartRate =
          item.breakdown.health_data.resting_heart_rate.consistency.achieved;
      }

      // Extract sleep data
      if (item.breakdown?.sleep?.hours?.achieved) {
        processed.sleepHours = item.breakdown.sleep.hours.achieved;
      }

      // Extract activity data
      if (item.breakdown?.activity?.target?.achieved) {
        const activity = item.breakdown.activity.target.achieved;
        processed.activeMinutes =
          (activity.moderate || 0) + (activity.vigorous || 0);
      }

      console.log('📊 Processed day data:', processed);
      return processed;
    } catch (error) {
      console.error('❌ Error processing single day data:', error);
      return {
        date: item.date || new Date().toISOString().split('T')[0],
      };
    }
  }
}

// Export singleton instance
export const terraDataRetrievalService =
  TerraDataRetrievalService.getInstance();
