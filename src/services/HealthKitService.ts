import { NativeModules, Platform } from 'react-native';

interface HealthKitData {
  date: string;
  steps: number;
  heartRate: number;
  activeEnergy: number;
  distance: number;
  sleepHours: number;
  weight: number;
  height: number;
  bodyMassIndex: number;
}

const { HealthKitManager } = NativeModules;

class HealthKitService {
  private static instance: HealthKitService;
  private isInitialized = false;
  private isHealthKitAvailable = false;

  static getInstance(): HealthKitService {
    if (!HealthKitService.instance) {
      HealthKitService.instance = new HealthKitService();
    }
    return HealthKitService.instance;
  }

  /**
   * Initialize HealthKit service
   */
  async initialize(): Promise<boolean> {
    if (Platform.OS !== 'ios') {
      console.warn('HealthKit is only available on iOS');
      return false;
    }

    try {
      console.log('🏥 Initializing HealthKit service...');

      // Check if HealthKit is available
      this.isHealthKitAvailable =
        await HealthKitManager.isHealthDataAvailable();

      if (!this.isHealthKitAvailable) {
        console.error('❌ HealthKit not available on this device');
        return false;
      }

      console.log('✅ HealthKit is available');

      // Request HealthKit permissions
      const permissionsGranted =
        await HealthKitManager.requestHealthKitPermissions();

      if (!permissionsGranted) {
        console.error('❌ HealthKit permissions not granted');
        return false;
      }

      this.isInitialized = true;
      console.log('✅ HealthKit service initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize HealthKit service:', error);
      return false;
    }
  }

  /**
   * Get Apple Watch data for a date range using native HealthKit APIs
   */
  async getAppleWatchData(
    startDate: Date,
    endDate: Date
  ): Promise<HealthKitData[]> {
    if (!this.isInitialized) {
      throw new Error(
        'HealthKit service not initialized. Call initialize() first.'
      );
    }

    console.log('⌚ Getting Apple Watch data from HealthKit...');
    console.log(
      `Date range: ${startDate.toDateString()} to ${endDate.toDateString()}`
    );

    try {
      const healthData: HealthKitData[] = [];
      const currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        console.log(
          `📅 Getting HealthKit data for ${currentDate.toDateString()}...`
        );

        const dayData = await this.getHealthKitDataForDate(currentDate);
        healthData.push(dayData);

        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
      }

      console.log('✅ HealthKit data retrieved successfully');
      console.log(`Total days: ${healthData.length}`);

      // Log summary statistics
      this.logHealthKitSummary(healthData);

      return healthData;
    } catch (error) {
      console.error('❌ Failed to get HealthKit data:', error);
      throw error;
    }
  }

  /**
   * Get HealthKit data for a specific date
   */
  private async getHealthKitDataForDate(date: Date): Promise<HealthKitData> {
    try {
      console.log(`📊 Fetching HealthKit data for ${date.toDateString()}...`);

      const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD format

      // Fetch all data types in parallel
      const [
        steps,
        heartRate,
        activeEnergy,
        distance,
        sleepHours,
        weight,
        height,
      ] = await Promise.all([
        HealthKitManager.getStepsForDate(dateString),
        HealthKitManager.getHeartRateForDate(dateString),
        HealthKitManager.getActiveEnergyForDate(dateString),
        HealthKitManager.getDistanceForDate(dateString),
        HealthKitManager.getSleepDataForDate(dateString),
        HealthKitManager.getWeight(),
        HealthKitManager.getHeight(),
      ]);

      // Calculate BMI
      const bodyMassIndex =
        weight > 0 && height > 0
          ? weight / ((height / 100) * (height / 100))
          : 0;

      const healthData: HealthKitData = {
        date: dateString,
        steps: Math.round(steps),
        heartRate: Math.round(heartRate * 10) / 10,
        activeEnergy: Math.round(activeEnergy),
        distance: Math.round(distance),
        sleepHours: Math.round(sleepHours * 10) / 10,
        weight: Math.round(weight * 10) / 10,
        height: Math.round(height),
        bodyMassIndex: Math.round(bodyMassIndex * 10) / 10,
      };

      console.log(`📊 HealthKit data for ${date.toDateString()}:`, healthData);
      return healthData;
    } catch (error) {
      console.error(
        `❌ Failed to get HealthKit data for ${date.toDateString()}:`,
        error
      );

      // Return empty data structure if HealthKit fails
      return {
        date: date.toISOString().split('T')[0],
        steps: 0,
        heartRate: 0,
        activeEnergy: 0,
        distance: 0,
        sleepHours: 0,
        weight: 0,
        height: 0,
        bodyMassIndex: 0,
      };
    }
  }

  /**
   * Log HealthKit data summary
   */
  private logHealthKitSummary(data: HealthKitData[]): void {
    console.log('🏥 === HEALTHKIT DATA SUMMARY ===');

    const totalSteps = data.reduce((sum, day) => sum + day.steps, 0);
    const totalDistance = data.reduce((sum, day) => sum + day.distance, 0);
    const totalActiveEnergy = data.reduce(
      (sum, day) => sum + day.activeEnergy,
      0
    );
    const totalSleepHours = data.reduce((sum, day) => sum + day.sleepHours, 0);
    const avgHeartRate =
      data.reduce((sum, day) => sum + day.heartRate, 0) / data.length;

    console.log(`📊 Total Steps: ${totalSteps.toLocaleString()}`);
    console.log(`🚶 Total Distance: ${(totalDistance / 1000).toFixed(2)} km`);
    console.log(
      `🔥 Total Active Energy: ${totalActiveEnergy.toLocaleString()} kcal`
    );
    console.log(`😴 Total Sleep: ${totalSleepHours.toFixed(1)} hours`);
    console.log(`❤️ Average Heart Rate: ${avgHeartRate.toFixed(1)} bpm`);
    console.log('🏥 === END HEALTHKIT SUMMARY ===');
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      healthKitAvailable: this.isHealthKitAvailable,
      platform: Platform.OS,
    };
  }

  /**
   * Check if service is ready
   */
  isReady(): boolean {
    return this.isInitialized && this.isHealthKitAvailable;
  }
}

export default HealthKitService;
export type { HealthKitData };
