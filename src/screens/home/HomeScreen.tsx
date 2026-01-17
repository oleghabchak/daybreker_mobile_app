import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { RefreshControl } from 'react-native-gesture-handler';

import { ScrollViewWithIndicator } from '../../components/ScrollViewWithIndicator';
import { Header } from '../../components/ui/Header';
import { BorderRadius, Colors, Space, Typography } from '../../constants/theme';
import { GateOverlay } from '../../features/onboardingGate';
import { supabase } from '../../lib/supabase';
import { Logger } from '../../services/logger';
import { useTerraDataStore } from '../../training-module/terra';

import { AgeAnalysis } from './components/AgeAnalysis';
import { AgeReversalInsight } from './components/AgeReversalInsight';
import { HealthMetricsGrid } from './components/HealthMetricsGrid';
import { TerraDataDisplay } from './components/TerraDataDisplay';

export const HomeScreen = ({ navigation }: any) => {
  const [profile, setProfile] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [chronologicalAge, setChronologicalAge] = useState<number | null>(null);
  const [biologicalAge] = useState<number>(38.2);

  const [bioAgeHistory] = useState<number[]>([
    40.5, 40.1, 39.8, 39.5, 39.2, 38.8, 38.2,
  ]);

  type MetricKey = 'sleep' | 'training' | 'respiratory' | 'immunity';
  type Metric = {
    score: number;
    trend: 'up' | 'down' | 'stable';
    previous: number;
    label: string;
    weekData: number[];
    unit: string;
    weight: number;
  };

  const [healthMetrics] = useState<Record<MetricKey, Metric>>({
    sleep: {
      score: 82,
      trend: 'up',
      previous: 78,
      label: 'Sleep Score',
      weekData: [75, 78, 76, 80, 79, 85, 82],
      unit: 'pts',
      weight: 0.3,
    },
    training: {
      score: 72,
      trend: 'stable',
      previous: 70,
      label: 'Training Stress',
      weekData: [65, 68, 70, 75, 72, 71, 72],
      unit: 'optimal',
      weight: 0.25,
    },
    respiratory: {
      score: 76,
      trend: 'stable',
      previous: 76,
      label: 'Respiratory Health',
      weekData: [74, 75, 76, 75, 77, 76, 76],
      unit: 'pts',
      weight: 0.25,
    },
    immunity: {
      score: 71,
      trend: 'down',
      previous: 74,
      label: 'Immunity Index',
      weekData: [75, 74, 73, 74, 72, 73, 71],
      unit: 'pts',
      weight: 0.2,
    },
  });

  const {
    isLoading,
    thisWeeksData,
    syncTerraData,
    initializeConnection,
    checkConnectionStatus,
  } = useTerraDataStore();

  const initializeTerraAndFetchData = async () => {
    if (isInitialized) {
      return;
    }

    setIsInitialized(true);

    try {
      await initializeConnection();
      await checkConnectionStatus();

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 7);
      await syncTerraData(startDate, endDate);
    } catch (error) {
      Logger.error('Error during Terra initialization:', error);
      setIsInitialized(false);
    } finally {
      setIsInitialized(false);
    }
  };

  useEffect(() => {
    initializeTerraAndFetchData();
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      setProfile(profileData);

      if (profileData?.date_of_birth) {
        const dob = new Date(profileData.date_of_birth);
        const now = new Date();
        const msPerYear = 365.2425 * 24 * 60 * 60 * 1000;
        const ageYears = (now.getTime() - dob.getTime()) / msPerYear;
        setChronologicalAge(Number(ageYears.toFixed(1)));
      }
    } catch (error) {
      Logger.error('Error loading dashboard data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadUserData();

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 7);
      await syncTerraData(startDate, endDate);
    } catch (error) {
      Logger.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const getDisplayFirstName = (p: any) => {
    if (!p) return 'User';
    const firstFromColumn =
      typeof p.first_name === 'string' ? p.first_name.trim() : '';
    if (firstFromColumn) return firstFromColumn;
    const fromFull = typeof p.full_name === 'string' ? p.full_name.trim() : '';
    if (fromFull) {
      const token = fromFull.split(/\s+/)[0];
      if (token) return token;
    }
    return 'User';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollViewWithIndicator
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Header title='Home' />

        <View style={styles.header}>
          <Text style={styles.userName}>{getDisplayFirstName(profile)}</Text>
          {isLoading && (
            <Text style={styles.loadingText}>
              Syncing health data... <ActivityIndicator />
            </Text>
          )}
        </View>

        <TerraDataDisplay weeklyData={thisWeeksData || []} />

        <AgeAnalysis
          biologicalAge={biologicalAge}
          chronologicalAge={chronologicalAge}
          bioAgeHistory={bioAgeHistory}
        />

        <HealthMetricsGrid healthMetrics={healthMetrics} />

        <AgeReversalInsight />
      </ScrollViewWithIndicator>

      <GateOverlay />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Space[6],
    paddingBottom: Space[3],
  },
  greeting: {
    ...Typography.body,
    color: Colors.textDisabled,
  },
  userName: {
    ...Typography.h1,
    color: Colors.textPrimary,
  },
  loadingText: {
    ...Typography.caption,
    color: Colors.textDisabled,
    fontStyle: 'italic',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  terraDataSection: {
    paddingHorizontal: Space[6],
    marginBottom: Space[6],
  },
  terraDataCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Space[4],
    marginBottom: Space[3],
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 1,
  },
  terraDataTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: Space[3],
  },
  terraDataSubtitle: {
    ...Typography.caption,
    color: Colors.textDisabled,
  },
  terraDataGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Space[3],
  },
  terraDataItem: {
    width: '48%',
    alignItems: 'center',
    padding: Space[2],
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.sm,
  },
  terraDataLabel: {
    ...Typography.caption,
    color: Colors.textDisabled,
    marginBottom: Space[1],
    textAlign: 'center',
  },
  terraDataValue: {
    ...Typography.h3,
    color: Colors.textPrimary,
    fontWeight: '600',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: Space[6],
    marginBottom: Space[8],
  },
  sectionTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
    marginBottom: Space[4],
  },

  scrollContent: {
    paddingBottom: Space[4],
  },
});
