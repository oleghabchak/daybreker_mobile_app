/**
 * Terra Data Retrieval Service
 *
 * Retrieves health data FROM Terra (the correct direction)
 * Terra is designed to provide data TO your app, not receive data FROM your app
 */

import { getDaily, getActivity, Connections } from 'terra-react';

import { TERRA_CONFIG } from '../../../config/terraApi';
import { supabase } from '../../../lib/supabase';

import { TerraDataService } from './terra-data-management-service';
import TerraSDKService from './terra-SDK-service';

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
  private isProcessing: boolean = false;

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
   * Initialize Terra user connection
   */
  async initializeTerraUser(): Promise<boolean> {
    try {
      console.log('🚀 Initializing Terra user connection...');

      // Get current authenticated user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        console.error('❌ No authenticated user found');
        return false;
      }

      const referenceId = user.id;
      console.log(`👤 Initializing Terra for user: ${referenceId}`);

      const sdk = TerraSDKService.getInstance();

      // Initialize SDK if not ready
      if (!sdk.isReady()) {
        console.log('🏁 Initializing Terra SDK...');
        const initialized = await sdk.initialize(
          TERRA_CONFIG.DEV_ID,
          referenceId
        );
        if (!initialized) {
          console.error('❌ Failed to initialize Terra SDK');
          return false;
        }
        console.log('✅ Terra SDK initialized successfully');
      }

      // Check if user is already connected
      const isConnected = await sdk.isUserConnected();
      console.log('🔍 User connection status:', isConnected);

      // Get detailed HealthKit status
      const healthKitStatus = await sdk.checkHealthKitStatus();
      console.log('🔍 HealthKit status:', healthKitStatus);

      if (!healthKitStatus.hasPermissions) {
        console.error('❌ Apple HealthKit permissions not granted');
        console.error(
          '❌ Please grant HealthKit permissions in iOS Settings > Privacy & Security > Health'
        );
        return false;
      }

      // Always attempt to connect to ensure proper Apple HealthKit connection
      console.log('🔗 Connecting user to Terra...');
      const connectionResult = await sdk.connectUser();

      if (connectionResult.success) {
        console.log('✅ User connected to Terra successfully');
        console.log(`👤 Terra User ID: ${connectionResult.userId}`);
        return true;
      } else {
        console.error(
          '❌ Failed to connect user to Terra:',
          connectionResult.error
        );
        return false;
      }
    } catch (error) {
      console.error('❌ Error initializing Terra user:', error);
      return false;
    }
  }
  async getDailyDataFromTerra(
    startDate: Date,
    endDate: Date
  ): Promise<TerraDailyData[]> {
    // Prevent multiple simultaneous calls
    if (this.isProcessing) {
      console.log('🚫 Terra data processing already in progress, skipping...');
      return [];
    }

    this.isProcessing = true;

    try {
      // Initialize Terra user connection first
      const initialized = await this.initializeTerraUser();
      if (!initialized) {
        console.error('❌ Failed to initialize Terra user connection');
        return [];
      }

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
        // console.log('✅ Daily data retrieved from Terra successfully');
        console.log('📊 Data received:', response.data?.data);

        // Process the data into our format
        // Terra returns data in response.data.data array
        const terraData = response.data.data || [];
        const processedData = this.processTerraDailyData(terraData);

        // Store processed data in database using TerraDataService
        console.log('💾 Storing Terra data in database...');
        try {
          const storeResult = await TerraDataService.syncTerraData(
            startDate,
            endDate,
            this
          );
          if (storeResult.status === 'ok') {
            console.log(
              `✅ Successfully stored ${storeResult.data.length} days of Terra data`
            );

            // Save the processed data to Zustand store
            console.log('💾 Saving Terra data to Zustand store...');
            try {
              const { useTerraDataStore } = await import(
                '../stores/terra-data-store'
              );
              const store = useTerraDataStore.getState();

              // Update the store with the new data
              store.setLoading(false);
              store.setError(null);

              // Convert TerraDailyData to IProcessedTerraDailyData format
              const convertedData = processedData.map(item => ({
                date: item.date,
                steps: item.steps || 0,
                distance_meters: item.distance || 0,
                floors_climbed: 0, // Not available in current Terra data
                calories_burned: item.calories || 0,
                BMR_calories: 0, // Not available in current Terra data
                net_activity_calories: 0, // Not available in current Terra data
                activity_seconds: (item.activeMinutes || 0) * 60,
                standing_hours: 0, // Not available in current Terra data
                standing_seconds: 0, // Not available in current Terra data
                resting_heart_rate: item.heartRate || null,
                max_heart_rate: null, // Not available in current Terra data
                avg_heart_rate: null, // Not available in current Terra data
                oxygen_saturation: null, // Not available in current Terra data
                stress_level: null, // Not available in current Terra data
                device_info: {
                  name: 'iPhone',
                  manufacturer: 'Apple',
                  hardware_version: 'Unknown',
                  software_version: 'Unknown',
                },
              }));

              // Use the new direct update methods
              store.updateTerraData(convertedData);

              // Update today's data if it's in the range
              const today = new Date().toISOString().split('T')[0];
              const todaysData = convertedData.find(
                item => item.date === today
              );
              if (todaysData) {
                store.updateTodaysData(todaysData);
              }

              // Update this week's data
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              const thisWeeksData = convertedData.filter(
                item => new Date(item.date) >= weekAgo
              );
              if (thisWeeksData.length > 0) {
                store.updateThisWeeksData(thisWeeksData);
              }

              console.log('✅ Terra data successfully saved to Zustand store');
            } catch (storeError) {
              console.error('❌ Error saving Terra data to store:', storeError);
            }
          } else {
            console.error('❌ Failed to store Terra data:', storeResult.error);
          }
        } catch (storeError) {
          console.error('❌ Error storing Terra data:', storeError);
        }

        return processedData;
      }

      console.log('⚠️ No data received from Terra');
      return [];
    } catch (error) {
      console.error('❌ Error retrieving daily data from Terra:', error);
      return [];
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Get activity data from Terra for a specific date
   */
  async getActivityDataFromTerra(date: Date): Promise<any> {
    try {
      // console.log('📥 Retrieving activity data from Terra...');
      // console.log('📅 Date:', date.toDateString());

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
        // console.log('✅ Activity data retrieved from Terra successfully');
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
      // First try to get from stored data
      console.log("📥 Getting today's data from storage...");
      const storedResult = await TerraDataService.getTodaysTerraData();

      if (storedResult.status === 'ok' && storedResult.data) {
        console.log("✅ Found today's data in storage");
        // Convert IProcessedTerraDailyData to TerraDailyData
        const storedData = storedResult.data;
        return {
          date: storedData.date,
          steps: storedData.steps,
          distance: storedData.distance_meters,
          heartRate: storedData.resting_heart_rate,
          calories: storedData.calories_burned,
          activeMinutes: Math.round(storedData.activity_seconds / 60),
          sleepHours: undefined, // Not available in current data structure
        };
      }

      // If not in storage, fetch from Terra and store
      console.log("📥 Today's data not in storage, fetching from Terra...");
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
      // First try to get from stored data
      console.log("📥 Getting this week's data from storage...");
      const storedResult = await TerraDataService.getThisWeeksTerraData();

      if (storedResult.status === 'ok' && storedResult.data.length > 0) {
        console.log(
          `✅ Found ${storedResult.data.length} days of data in storage`
        );
        // Convert IProcessedTerraDailyData[] to TerraDailyData[]
        return storedResult.data.map(storedData => ({
          date: storedData.date,
          steps: storedData.steps,
          distance: storedData.distance_meters,
          heartRate: storedData.resting_heart_rate,
          calories: storedData.calories_burned,
          activeMinutes: Math.round(storedData.activity_seconds / 60),
          sleepHours: undefined, // Not available in current data structure
        }));
      }

      // If not in storage, fetch from Terra and store
      console.log("📥 This week's data not in storage, fetching from Terra...");
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
   * Get stored Terra data by date range
   */
  async getStoredDataByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<TerraDailyData[]> {
    try {
      console.log('📥 Getting stored data by date range...');
      const storedResult = await TerraDataService.getTerraDataByDateRange(
        startDate,
        endDate
      );

      if (storedResult.status === 'ok') {
        console.log(`✅ Found ${storedResult.data.length} days of stored data`);
        // Convert IProcessedTerraDailyData[] to TerraDailyData[]
        return storedResult.data.map(storedData => ({
          date: storedData.date,
          steps: storedData.steps,
          distance: storedData.distance_meters,
          heartRate: storedData.resting_heart_rate,
          calories: storedData.calories_burned,
          activeMinutes: Math.round(storedData.activity_seconds / 60),
          sleepHours: undefined, // Not available in current data structure
        }));
      } else {
        console.error('❌ Failed to get stored data:', storedResult.error);
        return [];
      }
    } catch (error) {
      console.error('❌ Error getting stored data by date range:', error);
      return [];
    }
  }

  /**
   * Get Terra data statistics
   */
  async getTerraDataStatistics(days: number = 30): Promise<{
    totalDays: number;
    averageSteps: number;
    averageCalories: number;
    averageHeartRate: number;
    dataCompleteness: number;
    lastSyncDate: string;
  } | null> {
    try {
      console.log(`📊 Getting Terra data statistics for ${days} days...`);
      const statsResult = await TerraDataService.getTerraDataStatistics(days);

      if (statsResult.status === 'ok') {
        console.log('✅ Terra data statistics retrieved');
        return statsResult.data;
      } else {
        console.error(
          '❌ Failed to get Terra data statistics:',
          statsResult.error
        );
        return null;
      }
    } catch (error) {
      console.error('❌ Error getting Terra data statistics:', error);
      return null;
    }
  }

  /**
   * Force sync Terra data and store in database
   */
  async forceSyncTerraData(
    startDate: Date,
    endDate: Date
  ): Promise<TerraDailyData[]> {
    try {
      console.log('🔄 Force syncing Terra data...');
      const syncResult = await TerraDataService.syncTerraData(
        startDate,
        endDate,
        this
      );

      if (syncResult.status === 'ok') {
        console.log(
          `✅ Successfully synced ${syncResult.data.length} days of data`
        );
        // Convert IProcessedTerraDailyData[] to TerraDailyData[]
        return syncResult.data.map(storedData => ({
          date: storedData.date,
          steps: storedData.steps,
          distance: storedData.distance_meters,
          heartRate: storedData.resting_heart_rate,
          calories: storedData.calories_burned,
          activeMinutes: Math.round(storedData.activity_seconds / 60),
          sleepHours: undefined, // Not available in current data structure
        }));
      } else {
        console.error('❌ Failed to sync Terra data:', syncResult.error);
        return [];
      }
    } catch (error) {
      console.error('❌ Error force syncing Terra data:', error);
      return [];
    }
  }

  /**
   * Process Terra's raw data into our format
   */
  private processTerraDailyData(rawData: any): TerraDailyData[] {
    try {
      // console.log('🔄 Processing Terra raw data...');
      // console.log('📊 Raw data structure:', JSON.stringify(rawData, null, 2));

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
        date: item.metadata?.start_time
          ? new Date(item.metadata.start_time).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
      };

      // Extract steps data from distance_data
      if (item.distance_data?.steps) {
        processed.steps = item.distance_data.steps;
      }

      // Extract distance data
      if (item.distance_data?.distance_meters) {
        processed.distance = item.distance_data.distance_meters;
      }

      // Extract heart rate data from heart_rate_data summary
      if (item.heart_rate_data?.summary?.resting_heart_rate) {
        processed.heartRate = item.heart_rate_data.summary.resting_heart_rate;
      }

      // Extract calories data
      if (item.calories_data?.total_burned_calories) {
        processed.calories = item.calories_data.total_burned_calories;
      }

      // Extract activity data from active_durations_data
      if (item.active_durations_data?.activity_seconds) {
        processed.activeMinutes = Math.round(
          item.active_durations_data.activity_seconds / 60
        );
      }

      // Extract sleep data (if available in future updates)
      if (item.sleep_data?.total_sleep_hours) {
        processed.sleepHours = item.sleep_data.total_sleep_hours;
      }

      console.log('📊 Processed day data:', processed);
      return processed;
    } catch (error) {
      console.error('❌ Error processing single day data:', error);
      return {
        date: item.metadata?.start_time
          ? new Date(item.metadata.start_time).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
      };
    }
  }
}

// Export singleton instance
export const terraDataRetrievalService =
  TerraDataRetrievalService.getInstance();
