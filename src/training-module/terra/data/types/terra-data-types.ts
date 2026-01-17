/**
 * Terra Data Types
 * Type definitions for Terra API responses and data structures
 */

import {
  ITerraUserProfile,
  ITerraActivityData,
} from '../interfaces/terra-activity-data';
import { ITerraDailyData } from '../interfaces/terra-daily-data';

/**
 * Terra API Response Types
 */
export type TerraApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string | null;
};

/**
 * Terra Daily Data Response Type
 */
export type TerraDailyDataResponse = TerraApiResponse<{
  data: ITerraDailyData[];
  status: string;
  type: string;
  user: ITerraUserProfile;
}>;

/**
 * Terra Activity Data Response Type
 */
export type TerraActivityDataResponse = TerraApiResponse<ITerraActivityData>;

/**
 * Terra Connection Response Type
 */
export type TerraConnectionResponse = TerraApiResponse<{
  success: boolean;
  userId?: string;
  error?: string;
}>;

/**
 * Terra User ID Response Type
 */
export type TerraUserIdResponse = TerraApiResponse<{
  userId: string;
  success: boolean;
}>;

/**
 * Terra Data Processing Status
 */
export type TerraDataProcessingStatus =
  | 'idle'
  | 'processing'
  | 'success'
  | 'error';

/**
 * Terra Data Sync Status
 */
export type TerraDataSyncStatus = 'not_synced' | 'syncing' | 'synced' | 'error';

/**
 * Terra Data Types Enum
 */
export enum TerraDataType {
  DAILY = 'daily',
  ACTIVITY = 'activity',
  SLEEP = 'sleep',
  HEART_RATE = 'heart_rate',
  NUTRITION = 'nutrition',
  WORKOUT = 'workout',
}

/**
 * Terra Provider Types Enum
 */
export enum TerraProvider {
  APPLE_HEALTH = 'APPLE_HEALTH',
  GOOGLE_FIT = 'GOOGLE',
  SAMSUNG_HEALTH = 'SAMSUNG',
  FREESTYLE_LIBRE = 'FREESTYLE_LIBRE',
  HEALTH_CONNECT = 'HEALTH_CONNECT',
}

/**
 * Terra Data Aggregation Types
 */
export type TerraDataAggregation = 'daily' | 'weekly' | 'monthly' | 'yearly';

/**
 * Terra Data Export Format
 */
export type TerraDataExportFormat = 'json' | 'csv' | 'pdf';

/**
 * Terra Data Validation Result
 */
export interface ITerraDataValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
}

/**
 * Terra Data Statistics
 */
export interface ITerraDataStatistics {
  totalDays: number;
  averageSteps: number;
  averageCalories: number;
  averageHeartRate: number;
  totalWorkouts: number;
  dataCompleteness: number; // Percentage
  lastSyncDate: string;
  deviceCount: number;
}
