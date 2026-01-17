import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { Logger } from '../../../services/logger';
import { ITerraConnectionStatus } from '../data/interfaces/terra-activity-data';
import {
  IProcessedTerraDailyData,
  ITerraDataFilters,
  ITerraDataResponse,
} from '../data/interfaces/terra-daily-data';
import { TerraDataService } from '../services/terra-data-management-service';

export interface TerraDataStore {
  // State
  isLoading: boolean;
  error: string | null;
  dailyData: IProcessedTerraDailyData[];
  todaysData: IProcessedTerraDailyData | null;
  thisWeeksData: IProcessedTerraDailyData[];
  searchResults: IProcessedTerraDailyData[];
  currentFilters: ITerraDataFilters;
  connectionStatus: ITerraConnectionStatus | null;
  lastSyncDate: string | null;
  statistics: {
    totalDays: number;
    averageSteps: number;
    averageCalories: number;
    averageHeartRate: number;
    dataCompleteness: number;
    lastSyncDate: string;
  } | null;

  // Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // Data actions
  syncTerraData: (startDate: Date, endDate: Date) => Promise<void>;
  getTerraDataByDateRange: (startDate: Date, endDate: Date) => Promise<void>;
  getTodaysData: () => Promise<void>;
  getThisWeeksData: () => Promise<void>;
  getLatestData: () => Promise<IProcessedTerraDailyData | null>;
  searchTerraData: (
    filters: ITerraDataFilters,
    limit?: number
  ) => Promise<void>;
  getStatistics: (days?: number) => Promise<void>;

  // Connection actions
  initializeConnection: () => Promise<void>;
  checkConnectionStatus: () => Promise<void>;
  clearAllData: () => Promise<void>;

  // Filter actions
  setFilters: (filters: ITerraDataFilters) => void;
  clearFilters: () => void;

  // Cache management
  clearCache: () => void;
  refreshData: () => Promise<void>;

  // Direct data update methods
  updateTerraData: (data: IProcessedTerraDailyData[]) => void;
  updateTodaysData: (data: IProcessedTerraDailyData | null) => void;
  updateThisWeeksData: (data: IProcessedTerraDailyData[]) => void;
}

export const useTerraDataStore = create<TerraDataStore>()(
  persist(
    (set, get) => ({
      // Initial state
      isLoading: false,
      error: null,
      dailyData: [],
      todaysData: null,
      thisWeeksData: [],
      searchResults: [],
      currentFilters: {},
      connectionStatus: null,
      lastSyncDate: null,
      statistics: null,

      // Basic state setters
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },

      // Data actions
      syncTerraData: async (startDate: Date, endDate: Date) => {
        set({ isLoading: true, error: null });

        try {
          const result = await TerraDataService.syncTerraData(
            startDate,
            endDate
          );

          if (result.status === 'ok') {
            // Update the store with the synced data
            const newData = result.data;
            const existingData = get().dailyData;

            // Add new data to existing daily data (avoid duplicates)
            const uniqueNewData = newData.filter(
              newItem =>
                !existingData.some(
                  existingItem => existingItem.date === newItem.date
                )
            );

            if (uniqueNewData.length > 0) {
              set({
                dailyData: [...existingData, ...uniqueNewData],
                isLoading: false,
                lastSyncDate: new Date().toISOString(),
              });
              Logger.info(
                `✅ Synced ${uniqueNewData.length} new days of Terra data`
              );
            } else {
              set({ isLoading: false });
              Logger.info('✅ Terra data sync completed - no new data');
            }
          } else {
            set({
              error: result.error.message || 'Failed to sync Terra data',
              isLoading: false,
            });
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to sync Terra data';
          set({
            error: errorMessage,
            isLoading: false,
          });
        }
      },

      getTerraDataByDateRange: async (startDate: Date, endDate: Date) => {
        set({ isLoading: true, error: null });

        try {
          const result = await TerraDataService.getTerraDataByDateRange(
            startDate,
            endDate
          );

          if (result.status === 'ok') {
            set({
              dailyData: result.data,
              isLoading: false,
            });
          } else {
            set({
              error: result.error.message || 'Failed to fetch Terra data',
              isLoading: false,
            });
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to fetch Terra data';
          set({
            error: errorMessage,
            isLoading: false,
          });
        }
      },

      getTodaysData: async () => {
        set({ isLoading: true, error: null });

        try {
          const result = await TerraDataService.getTodaysTerraData();

          if (result.status === 'ok') {
            set({
              todaysData: result.data,
              isLoading: false,
            });
          } else {
            set({
              error: result.error.message || "Failed to fetch today's data",
              isLoading: false,
            });
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to fetch today's data";
          set({
            error: errorMessage,
            isLoading: false,
          });
        }
      },

      getThisWeeksData: async () => {
        set({ isLoading: true, error: null });

        try {
          const result = await TerraDataService.getThisWeeksTerraData();

          if (result.status === 'ok') {
            set({
              thisWeeksData: result.data,
              isLoading: false,
            });
            Logger.info(
              `✅ Retrieved ${result.data.length} days of this week's data`
            );
          } else {
            set({
              error: result.error.message || "Failed to fetch this week's data",
              isLoading: false,
            });
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to fetch this week's data";
          set({
            error: errorMessage,
            isLoading: false,
          });
        }
      },

      getLatestData: async () => {
        set({ isLoading: true, error: null });

        try {
          const result = await TerraDataService.getLatestTerraData();

          if (result.status === 'ok') {
            set({ isLoading: false });
            return result.data;
          } else {
            set({
              error: result.error.message || 'Failed to fetch latest data',
              isLoading: false,
            });
            return null;
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to fetch latest data';
          set({
            error: errorMessage,
            isLoading: false,
          });
          return null;
        }
      },

      searchTerraData: async (filters: ITerraDataFilters, limit?: number) => {
        set({ isLoading: true, error: null, currentFilters: filters });

        try {
          const result = await TerraDataService.searchTerraData({
            filters,
            limit,
          });

          if (result.status === 'ok') {
            set({
              searchResults: result.data.data,
              isLoading: false,
            });
          } else {
            set({
              error: result.error.message || 'Failed to search Terra data',
              isLoading: false,
            });
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to search Terra data';
          set({
            error: errorMessage,
            isLoading: false,
          });
        }
      },

      getStatistics: async (days: number = 30) => {
        set({ isLoading: true, error: null });

        try {
          const result = await TerraDataService.getTerraDataStatistics(days);

          if (result.status === 'ok') {
            set({
              statistics: result.data,
              isLoading: false,
            });
          } else {
            set({
              error: result.error.message || 'Failed to fetch statistics',
              isLoading: false,
            });
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to fetch statistics';
          set({
            error: errorMessage,
            isLoading: false,
          });
        }
      },

      // Connection actions
      initializeConnection: async () => {
        set({ isLoading: true, error: null });

        try {
          const result = await TerraDataService.initializeTerraConnection();

          if (result.status === 'ok') {
            set({ isLoading: false });
            // Refresh connection status after initialization
            get().checkConnectionStatus();
          } else {
            set({
              error:
                result.error.message || 'Failed to initialize Terra connection',
              isLoading: false,
            });
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to initialize Terra connection';
          set({
            error: errorMessage,
            isLoading: false,
          });
        }
      },

      checkConnectionStatus: async () => {
        set({ isLoading: true, error: null });

        try {
          const result = await TerraDataService.checkTerraConnectionStatus();

          if (result.status === 'ok') {
            set({
              connectionStatus: result.data,
              isLoading: false,
            });
          } else {
            set({
              error:
                result.error.message || 'Failed to check connection status',
              isLoading: false,
            });
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to check connection status';
          set({
            error: errorMessage,
            isLoading: false,
          });
        }
      },

      clearAllData: async () => {
        set({ isLoading: true, error: null });

        try {
          const result = await TerraDataService.clearAllTerraData();

          if (result.status === 'ok') {
            set({
              dailyData: [],
              todaysData: null,
              thisWeeksData: [],
              searchResults: [],
              statistics: null,
              lastSyncDate: null,
              isLoading: false,
            });
          } else {
            set({
              error: result.error.message || 'Failed to clear Terra data',
              isLoading: false,
            });
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to clear Terra data';
          set({
            error: errorMessage,
            isLoading: false,
          });
        }
      },

      // Filter actions
      setFilters: (filters: ITerraDataFilters) => {
        set({ currentFilters: filters });
      },

      clearFilters: () => {
        set({
          currentFilters: {},
          searchResults: [],
        });
      },

      // Cache management
      clearCache: () => {
        set({
          dailyData: [],
          todaysData: null,
          thisWeeksData: [],
          searchResults: [],
          statistics: null,
          lastSyncDate: null,
          error: null,
        });
      },

      refreshData: async () => {
        const { getTodaysData, getThisWeeksData, getStatistics } = get();

        set({ isLoading: true, error: null });

        try {
          await Promise.all([
            getTodaysData(),
            getThisWeeksData(),
            getStatistics(),
          ]);

          set({ isLoading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to refresh data';
          set({
            error: errorMessage,
            isLoading: false,
          });
        }
      },

      // Direct data update methods
      updateTerraData: (data: IProcessedTerraDailyData[]) => {
        const existingData = get().dailyData;
        const newData = data.filter(
          newItem =>
            !existingData.some(
              existingItem => existingItem.date === newItem.date
            )
        );

        if (newData.length > 0) {
          set({
            dailyData: [...existingData, ...newData],
            lastSyncDate: new Date().toISOString(),
          });
          Logger.info(
            `✅ Updated store with ${newData.length} new days of Terra data`
          );
        }
      },

      updateTodaysData: (data: IProcessedTerraDailyData | null) => {
        set({ todaysData: data });
        if (data) {
          Logger.info("✅ Updated today's Terra data in store");
        }
      },

      updateThisWeeksData: (data: IProcessedTerraDailyData[]) => {
        set({ thisWeeksData: data });
        Logger.info(
          `✅ Updated this week's Terra data in store (${data.length} days)`
        );
      },
    }),
    {
      name: 'terra-data-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        dailyData: state.dailyData,
        todaysData: state.todaysData,
        thisWeeksData: state.thisWeeksData,
        statistics: state.statistics,
        lastSyncDate: state.lastSyncDate,
        connectionStatus: state.connectionStatus,
      }),
    }
  )
);
