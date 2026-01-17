import { NativeModules, Platform } from 'react-native';

const { HealthKitManager } = NativeModules;

export class HealthKitLogger {
  private static instance: HealthKitLogger;
  private isInitialized = false;

  static getInstance(): HealthKitLogger {
    if (!HealthKitLogger.instance) {
      HealthKitLogger.instance = new HealthKitLogger();
    }
    return HealthKitLogger.instance;
  }

  /**
   * Initialize HealthKit and request permissions
   */
  async initialize(): Promise<boolean> {
    if (Platform.OS !== 'ios') {
      console.log('❌ HealthKit is only available on iOS');
      return false;
    }

    try {
      console.log('🏥 Initializing HealthKit...');

      // Check if HealthKit is available
      const isAvailable = await HealthKitManager.isHealthDataAvailable();
      if (!isAvailable) {
        console.log('❌ HealthKit not available on this device');
        return false;
      }

      console.log('✅ HealthKit is available');

      // Request permissions
      const permissionsGranted =
        await HealthKitManager.requestHealthKitPermissions();
      if (!permissionsGranted) {
        console.log('❌ HealthKit permissions not granted');
        return false;
      }

      this.isInitialized = true;
      console.log('✅ HealthKit initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize HealthKit:', error);
      return false;
    }
  }

  /**
   * Get steps for a specific date
   */
  async getStepsForDate(date: Date): Promise<number> {
    if (!this.isInitialized) {
      throw new Error('HealthKit not initialized. Call initialize() first.');
    }

    try {
      // Use local date string to avoid timezone issues
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`; // YYYY-MM-DD format in local timezone

      console.log(
        `📅 Requesting steps for: ${dateString} (${date.toLocaleDateString()})`
      );

      const steps = await HealthKitManager.getStepsForDate(dateString);
      return Math.round(steps);
    } catch (error) {
      console.log(
        `❌ Failed to get steps for ${date.toLocaleDateString()}:`,
        error
      );
      return 0;
    }
  }

  /**
   * Get steps for each day this week and log to console
   */
  async logWeeklySteps(): Promise<void> {
    console.log('📊 === FETCHING WEEKLY STEPS DATA ===');

    if (!this.isInitialized) {
      console.log('❌ HealthKit not initialized. Initializing now...');
      const initialized = await this.initialize();
      if (!initialized) {
        console.log('❌ Failed to initialize HealthKit');
        return;
      }
    }

    try {
      const today = new Date();
      const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.

      // Calculate start of week (Monday)
      const startOfWeek = new Date(today);
      const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1; // Handle Sunday as last day of week
      startOfWeek.setDate(today.getDate() - daysFromMonday);
      startOfWeek.setHours(0, 0, 0, 0);

      console.log(`📅 Week starting: ${startOfWeek.toDateString()}`);
      console.log(`📅 Today: ${today.toDateString()}`);
      console.log('');

      const weeklySteps: { date: string; steps: number; dayName: string }[] =
        [];

      // Fetch steps for each day of the week
      for (let i = 0; i < 7; i++) {
        const currentDate = new Date(startOfWeek);
        currentDate.setDate(startOfWeek.getDate() + i);

        const dayNames = [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday',
        ];
        const dayName = dayNames[i];

        console.log(
          `📊 Fetching steps for ${dayName} (${currentDate.toDateString()})...`
        );

        const steps = await this.getStepsForDate(currentDate);

        weeklySteps.push({
          date: currentDate.toDateString(),
          steps,
          dayName,
        });

        console.log(`👟 ${dayName}: ${steps.toLocaleString()} steps`);
      }

      console.log('');
      console.log('📊 === WEEKLY STEPS SUMMARY ===');

      const totalSteps = weeklySteps.reduce((sum, day) => sum + day.steps, 0);
      const averageSteps = Math.round(totalSteps / 7);
      const maxSteps = Math.max(...weeklySteps.map(day => day.steps));
      const minSteps = Math.min(...weeklySteps.map(day => day.steps));

      console.log(`👟 Total Steps This Week: ${totalSteps.toLocaleString()}`);
      console.log(`📈 Average Daily Steps: ${averageSteps.toLocaleString()}`);
      console.log(`🔥 Highest Day: ${maxSteps.toLocaleString()} steps`);
      console.log(`😴 Lowest Day: ${minSteps.toLocaleString()} steps`);

      console.log('');
      console.log('📊 === DAILY BREAKDOWN ===');
      weeklySteps.forEach(day => {
        const isToday = day.date === today.toDateString();
        const indicator = isToday ? '📍 TODAY' : '';
        console.log(
          `${day.dayName}: ${day.steps.toLocaleString()} steps ${indicator}`
        );
      });

      console.log('📊 === END WEEKLY STEPS SUMMARY ===');
    } catch (error) {
      console.error('❌ Failed to fetch weekly steps:', error);
    }
  }

  /**
   * Quick method to just log this week's steps
   */
  static async logThisWeekSteps(): Promise<void> {
    const logger = HealthKitLogger.getInstance();
    await logger.logWeeklySteps();
  }
}

export default HealthKitLogger;
