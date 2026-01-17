import { Footprints } from 'lucide-react-native';
import moment from 'moment';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, {
  Defs,
  Path,
  Stop,
  LinearGradient as SvgLinearGradient,
} from 'react-native-svg';

import {
  BorderRadius,
  Colors,
  Space,
  Typography,
} from '../../../constants/theme';
import { IProcessedTerraDailyData } from '../../../training-module/terra/data/interfaces/terra-daily-data';

interface TerraDataDisplayProps {
  weeklyData: IProcessedTerraDailyData[];
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

const formatNumber = (num: number) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
};

const createPath = (data: number[], widthPx = 100, heightPx = 30) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((value, index) => ({
    x: (index / (data.length - 1)) * widthPx,
    y: heightPx - ((value - min) / range) * heightPx,
  }));

  let path = `M ${points[0].x},${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cp1x = prev.x + (curr.x - prev.x) / 3;
    const cp1y = prev.y;
    const cp2x = curr.x - (curr.x - prev.x) / 3;
    const cp2y = curr.y;
    path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${curr.x},${curr.y}`;
  }
  return path;
};

const createArea = (data: number[], widthPx = 100, heightPx = 30) => {
  const path = createPath(data, widthPx, heightPx);
  return `${path} L ${widthPx},${heightPx} L 0,${heightPx} Z`;
};

export const TerraDataDisplay: React.FC<TerraDataDisplayProps> = ({
  weeklyData,
}) => {
  if (!weeklyData || weeklyData.length === 0) {
    return (
      <View style={styles.section}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>HEALTH DATA</Text>
          <Text style={styles.noDataText}>No health data available</Text>
        </View>
      </View>
    );
  }

  // Calculate weekly totals and averages
  const totalSteps = weeklyData.reduce((sum, day) => sum + day.steps, 0);
  const totalCalories = weeklyData.reduce(
    (sum, day) => sum + day.calories_burned,
    0
  );
  const totalDistance = weeklyData.reduce(
    (sum, day) => sum + day.distance_meters,
    0
  );
  const avgSteps = Math.round(totalSteps / weeklyData.length);
  const avgCalories = Math.round(totalCalories / weeklyData.length);

  // Extract data for charts
  const stepsData = weeklyData.map(day => day.steps);
  const caloriesData = weeklyData.map(day => day.calories_burned);
  const distanceData = weeklyData.map(day => day.distance_meters / 1000); // Convert to km

  // Find best day
  const bestDay = weeklyData.reduce((best, current) =>
    current.steps > best.steps ? current : best
  );

  return (
    <View style={styles.section}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.sectionTitle}>HEALTH DATA</Text>
          <Text style={styles.sectionSubtitle}>
            {moment().subtract(7, 'days').format('DD MMM YYYY')} -{' '}
            {moment().format('DD MMM YYYY')}
          </Text>
        </View>

        {/* Weekly Summary */}
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{formatNumber(totalSteps)}</Text>
            <Text style={styles.summaryLabel}>Total Steps</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              {formatNumber(totalCalories)}
            </Text>
            <Text style={styles.summaryLabel}>Calories Burned</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              {(totalDistance / 1000).toFixed(1)}km
            </Text>
            <Text style={styles.summaryLabel}>Distance</Text>
          </View>
        </View>

        {/* Daily Breakdown */}
        <View style={styles.dailyBreakdown}>
          <Text style={styles.subsectionTitle}>Daily Activity</Text>
          <View style={styles.dailyGrid}>
            {weeklyData.map((day, index) => (
              <View key={day.date} style={styles.dailyItem}>
                <Text style={styles.dailyDate}>{formatDate(day.date)}</Text>
                {day.activity_seconds > 0 && (
                  <Text style={styles.activityTime}>
                    {Math.round(day.activity_seconds / 60)}min active
                  </Text>
                )}
                <View style={styles.dailyMetrics}>
                  <Text style={styles.dailySteps}>
                    <Footprints size={14} color={Colors.secondary} />
                    {formatNumber(day.steps)}
                  </Text>
                  <Text style={styles.dailyCalories}>
                    {Math.round(day.calories_burned)} kcal
                  </Text>
                  <Text style={styles.dailyDistance}>
                    {(day.distance_meters / 1000).toFixed(1)}km
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Charts */}
        <View style={styles.chartsSection}>
          <Text style={styles.subsectionTitle}>Weekly Trends</Text>

          {/* Steps Chart */}
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Steps</Text>
            <Svg
              width={'100%'}
              height={60}
              viewBox='0 0 100 60'
              preserveAspectRatio='none'
            >
              <Defs>
                <SvgLinearGradient
                  id='stepsGradient'
                  x1='0%'
                  y1='0%'
                  x2='0%'
                  y2='100%'
                >
                  <Stop offset='0%' stopColor='#3B82F6' stopOpacity={0.3} />
                  <Stop offset='100%' stopColor='#3B82F6' stopOpacity={0.05} />
                </SvgLinearGradient>
              </Defs>
              <Path
                d={createArea(stepsData, 100, 50)}
                fill='url(#stepsGradient)'
              />
              <Path
                d={createPath(stepsData, 100, 50)}
                fill='none'
                stroke='#3B82F6'
                strokeWidth={2}
                strokeLinecap='round'
              />
            </Svg>
          </View>

          {/* Calories Chart */}
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Calories Burned</Text>
            <Svg
              width={'100%'}
              height={60}
              viewBox='0 0 100 60'
              preserveAspectRatio='none'
            >
              <Defs>
                <SvgLinearGradient
                  id='caloriesGradient'
                  x1='0%'
                  y1='0%'
                  x2='0%'
                  y2='100%'
                >
                  <Stop offset='0%' stopColor='#EF4444' stopOpacity={0.3} />
                  <Stop offset='100%' stopColor='#EF4444' stopOpacity={0.05} />
                </SvgLinearGradient>
              </Defs>
              <Path
                d={createArea(caloriesData, 100, 50)}
                fill='url(#caloriesGradient)'
              />
              <Path
                d={createPath(caloriesData, 100, 50)}
                fill='none'
                stroke='#EF4444'
                strokeWidth={2}
                strokeLinecap='round'
              />
            </Svg>
          </View>
        </View>

        {/* Best Day Highlight */}
        <View style={styles.bestDayCard}>
          <Text style={styles.bestDayTitle}>🏆 Best Day</Text>
          <Text style={styles.bestDayDate}>{formatDate(bestDay.date)}</Text>
          <View style={styles.bestDayMetrics}>
            <Text style={styles.bestDayValue}>
              {formatNumber(bestDay.steps)} steps
            </Text>
            <Text style={styles.bestDayValue}>
              {Math.round(bestDay.calories_burned)} calories
            </Text>
            <Text style={styles.bestDayValue}>
              {(bestDay.distance_meters / 1000).toFixed(1)}km
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: Space[3],
    marginBottom: Space[6],
  },
  card: {
    backgroundColor: Colors.exerciseCard,
    borderRadius: BorderRadius.lg,
    padding: Space[4],
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Space[4],
  },
  sectionTitle: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '600',
    marginBottom: Space[4],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subsectionTitle: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginBottom: Space[3],
  },
  sectionSubtitle: {
    fontSize: 12,
    color: Colors.textDisabled,
    fontWeight: '400',
    marginBottom: Space[3],
  },
  noDataText: {
    ...Typography.body,
    color: Colors.textDisabled,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Space[5],
    paddingVertical: Space[3],
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.md,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Space[1],
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.textDisabled,
    textAlign: 'center',
  },
  dailyBreakdown: {
    marginBottom: Space[5],
  },
  dailyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Space[2],
  },
  dailyItem: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.sm,
    padding: Space[3],
    alignItems: 'center',
  },
  dailyDate: {
    fontSize: 12,
    color: Colors.textDisabled,
    marginBottom: Space[2],
    fontWeight: '500',
  },
  dailyMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    alignItems: 'center',
    marginBottom: Space[1],
  },
  dailySteps: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.secondary,
    marginBottom: 2,
  },
  dailyCalories: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primary,
    marginBottom: 2,
  },
  dailyDistance: {
    fontSize: 12,
    color: Colors.textDisabled,
  },
  activityTime: {
    fontSize: 10,
    color: '#10B981',
    fontWeight: '500',
  },
  chartsSection: {
    marginBottom: Space[5],
  },
  chartContainer: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Space[3],
    marginBottom: Space[4],
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Space[2],
  },
  bestDayCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: BorderRadius.md,
    padding: Space[4],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  bestDayTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: Space[1],
  },
  bestDayDate: {
    fontSize: 14,
    color: '#92400E',
    marginBottom: Space[2],
  },
  bestDayMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  bestDayValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
    textAlign: 'center',
  },
});
