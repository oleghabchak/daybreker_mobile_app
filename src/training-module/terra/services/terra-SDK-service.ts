import {
  initTerra,
  getDaily,
  Connections,
  initConnection,
  getUserId,
} from 'terra-react';

import { TERRA_CONFIG } from '../../../config/terraApi';

export interface TerraSDKConfig {
  devId: string;
  referenceId: string;
}

export interface TerraConnectionResult {
  success: boolean;
  userId?: string;
  error?: string;
}

export interface TerraActivityData {
  name: string;
  startTime: string;
  endTime: string;
  steps: number;
  distanceMeters?: number;
  calories?: number;
  avgHeartRate?: number;
  maxHeartRate?: number;
}

class TerraSDKService {
  private static instance: TerraSDKService;
  private isInitialized = false;
  private config: TerraSDKConfig | null = null;

  static getInstance(): TerraSDKService {
    if (!TerraSDKService.instance) {
      TerraSDKService.instance = new TerraSDKService();
    }
    return TerraSDKService.instance;
  }

  /**
   * Initialize Terra SDK
   */
  async initialize(devId: string, referenceId: string): Promise<boolean> {
    try {
      console.log('🚀 Initializing Terra SDK...');
      console.log(`📱 Dev ID: ${devId}`);
      console.log(`👤 Reference ID: ${referenceId}`);

      // Check if terra-react is properly imported
      if (!initTerra) {
        console.error('❌ terra-react not properly imported');
        return false;
      }

      const result = await initTerra(devId, referenceId);

      console.log('📋 Terra SDK init result:', result);

      // Check if initialization was successful
      if (result.success === true) {
        console.log('✅ Terra SDK initialization successful');
        this.config = { devId, referenceId };
        this.isInitialized = true;
        return true;
      } else if (result.error !== null && result.error !== undefined) {
        console.error('❌ Terra SDK initialization failed:', result.error);
        console.error(
          '❌ Error details:',
          JSON.stringify(result.error, null, 2)
        );
        return false;
      } else {
        console.error('❌ Terra SDK initialization failed: Unknown error');
        console.error('❌ Result:', JSON.stringify(result, null, 2));
        return false;
      }
    } catch (error) {
      console.error('❌ Failed to initialize Terra SDK:', error);
      console.error(
        '❌ Error stack:',
        error instanceof Error ? error.stack : 'No stack trace'
      );
      return false;
    }
  }

  /**
   * Generate auth token for Terra connection
   * This should be called from your backend in production
   */
  async generateAuthToken(): Promise<string> {
    try {
      console.log('🔑 Generating Terra auth token...');

      const response = await fetch(
        'https://api.tryterra.co/v2/auth/generateAuthToken',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'dev-id': this.config!.devId,
            'x-api-key': TERRA_CONFIG.API_KEY,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Auth token generation failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Auth token generated successfully');
      return result.token;
    } catch (error) {
      console.error('❌ Failed to generate auth token:', error);
      throw error;
    }
  }

  /**
   * Connect user to Terra (Apple HealthKit)
   */
  async connectUser(): Promise<TerraConnectionResult> {
    if (!this.isInitialized) {
      return {
        success: false,
        error: 'Terra SDK not initialized. Call initialize() first.',
      };
    }

    try {
      console.log('🔗 Connecting user to Terra...');

      // Generate auth token
      const token = await this.generateAuthToken();

      // Initialize connection to Apple HealthKit
      const connection = Connections.APPLE_HEALTH;
      const customPermissions = [] as any[]; // Leave empty to default to all permissions
      const schedulerOn = true; // Enables background delivery

      console.log('🔍 Connections object:', Connections);
      console.log('🔍 APPLE_HEALTH connection:', connection);

      console.log('📱 Initializing Apple HealthKit connection...');
      console.log('📋 Connection parameters:', {
        connection,
        token: token ? 'Present' : 'Missing',
        schedulerOn,
        customPermissions,
      });

      const successMessage = await initConnection(
        connection,
        token,
        schedulerOn,
        customPermissions
      );

      console.log('📋 initConnection response:', successMessage);

      // Check if successMessage is null or undefined
      if (!successMessage) {
        console.error('❌ Connection failed: No response from initConnection');
        return {
          success: false,
          error: 'No response from initConnection',
        };
      }

      // Check if there's an error in the response
      if (successMessage.error !== null && successMessage.error !== undefined) {
        console.error('❌ Connection failed:', successMessage.error);
        return {
          success: false,
          error: successMessage.error,
        };
      }

      console.log('✅ Connection initialized successfully');

      // Validate the connection by getting user ID
      console.log('🔍 Validating connection by getting user ID...');
      const userIdRes = (await getUserId(Connections.APPLE_HEALTH)) as any;
      console.log('🔍 getUserId response type:', typeof userIdRes);
      console.log('🔍 getUserId response:', JSON.stringify(userIdRes, null, 2));
      console.log(
        '🔍 getUserId response keys:',
        userIdRes ? Object.keys(userIdRes) : 'null/undefined'
      );

      if (userIdRes) {
        console.log('✅ User connected successfully. User ID:', userIdRes);
        return {
          success: true,
          userId: String(userIdRes),
        };
      } else {
        console.log('⚠️ Connection initialized but no user ID found');
        console.log(
          '⚠️ This may indicate Apple HealthKit permissions are not granted'
        );
        return {
          success: false,
          error:
            'Connection initialized but no user ID found - check Apple HealthKit permissions',
        };
      }
    } catch (error) {
      console.error('❌ Failed to connect user:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check if user is already connected to Terra
   */
  async isUserConnected(): Promise<boolean> {
    if (!this.isInitialized) {
      return false;
    }

    try {
      const res = (await getUserId(Connections.APPLE_HEALTH)) as any;
      return !!res;
    } catch (error) {
      console.error('❌ Error checking connection status:', error);
      return false;
    }
  }

  /**
   * Get current user ID if connected
   */
  async getCurrentUserId(): Promise<string | null> {
    if (!this.isInitialized) {
      return null;
    }

    try {
      const res = (await getUserId(Connections.APPLE_HEALTH)) as any;
      return res ? String(res) : null;
    } catch (error) {
      console.error('❌ Error getting user ID:', error);
      return null;
    }
  }

  /**
   * Note: Terra API does not support writing/submitting data
   * Terra is designed to pull data from connected devices, not receive data from apps
   * This method is kept for reference but will not work
   */
  async postActivityData(activityData: TerraActivityData): Promise<boolean> {
    console.log(
      '⚠️ Terra API does not support writing data - this method will not work'
    );
    console.log('📦 Activity data that would be posted:', activityData);
    console.log(
      '💡 Consider storing this data locally in your database instead'
    );
    return false;
  }

  /**
   * Get daily data from Apple Health
   */
  async getDailyData(startDate: Date, endDate: Date): Promise<any> {
    if (!this.isInitialized) {
      throw new Error('Terra SDK not initialized. Call initialize() first.');
    }

    try {
      console.log('📥 Getting daily data from Apple Health...');
      console.log(
        `📅 Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`
      );

      const response = await getDaily(
        Connections.APPLE_HEALTH,
        startDate,
        endDate,
        false
      );

      if (response.error !== null) {
        console.error('❌ Failed to get daily data:', response.error);
        return null;
      }

      console.log('✅ Daily data retrieved successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Error getting daily data:', error);
      return null;
    }
  }

  /**
   * Post steps data for a specific date
   */
  async postStepsForDate(date: Date, steps: number): Promise<boolean> {
    // Use a reasonable time window for the activity (not full day)
    const startTime = new Date(date);
    startTime.setHours(8, 0, 0, 0); // 8 AM start

    const endTime = new Date(date);
    endTime.setHours(18, 0, 0, 0); // 6 PM end (10 hour activity window)

    // Format dates with microsecond precision and +00:00 timezone (Terra format)
    const formatTerraDate = (date: Date): string => {
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const day = String(date.getUTCDate()).padStart(2, '0');
      const hours = String(date.getUTCHours()).padStart(2, '0');
      const minutes = String(date.getUTCMinutes()).padStart(2, '0');
      const seconds = String(date.getUTCSeconds()).padStart(2, '0');
      const milliseconds = String(date.getUTCMilliseconds()).padStart(3, '0');
      const microseconds = '000'; // Add microseconds

      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}${microseconds}+00:00`;
    };

    const activityData: TerraActivityData = {
      name: `Daily Steps - ${date.toDateString()}`,
      startTime: formatTerraDate(startTime),
      endTime: formatTerraDate(endTime),
      steps: steps,
    };

    return this.postActivityData(activityData);
  }

  /**
   * Check Apple HealthKit permissions and connection status
   */
  async checkHealthKitStatus(): Promise<{
    isConnected: boolean;
    userId: string | null;
    hasPermissions: boolean;
    error?: string;
  }> {
    if (!this.isInitialized) {
      return {
        isConnected: false,
        userId: null,
        hasPermissions: false,
        error: 'Terra SDK not initialized',
      };
    }

    try {
      console.log('🔍 Checking Apple HealthKit status...');

      const userIdRes = (await getUserId(Connections.APPLE_HEALTH)) as any;
      console.log('🔍 HealthKit getUserId response type:', typeof userIdRes);
      console.log(
        '🔍 HealthKit getUserId response:',
        JSON.stringify(userIdRes, null, 2)
      );
      console.log(
        '🔍 HealthKit getUserId response keys:',
        userIdRes ? Object.keys(userIdRes) : 'null/undefined'
      );

      const isConnected = !!userIdRes;
      const userId = userIdRes ? String(userIdRes) : null;

      return {
        isConnected,
        userId,
        hasPermissions: isConnected,
        error: isConnected
          ? undefined
          : 'Apple HealthKit permissions not granted or connection not established',
      };
    } catch (error) {
      console.error('❌ Error checking HealthKit status:', error);
      return {
        isConnected: false,
        userId: null,
        hasPermissions: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check if SDK is ready
   */
  isReady(): boolean {
    const ready = this.isInitialized && this.config !== null;
    console.log('🔍 TerraSDK isReady check:', {
      isInitialized: this.isInitialized,
      hasConfig: this.config !== null,
      ready: ready,
    });
    return ready;
  }

  /**
   * Get current configuration
   */
  getConfig(): TerraSDKConfig | null {
    return this.config;
  }
}

export default TerraSDKService;
