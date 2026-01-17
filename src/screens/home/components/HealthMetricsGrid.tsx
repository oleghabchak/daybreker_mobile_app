import {
  Activity,
  Brain,
  Info,
  Minus,
  Shield,
  TrendingDown,
  TrendingUp,
  Wind,
} from 'lucide-react-native';
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  Path,
  Stop,
  LinearGradient as SvgLinearGradient,
} from 'react-native-svg';

import {
  TooltipComponent,
  getTooltipMetrics,
} from '../../../components/common/TooltipComponent';
import {
  BorderRadius,
  Colors,
  Space,
  Typography,
} from '../../../constants/theme';

const { width } = Dimensions.get('window');

type MetricKey = 'sleep' | 'training' | 'respiratory' | 'immunity';
type Metric = {
  score: number;
  trend: 'up' | 'down' | 'stable';
  previous: number;
  label: string;
  weekData: number[];
  unit: string;
  weight: number; // fraction 0-1
};

interface HealthMetricsGridProps {
  healthMetrics: Record<MetricKey, Metric>;
}

const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
  if (trend === 'up') return <TrendingUp size={12} color={'#16a34a'} />;
  if (trend === 'down') return <TrendingDown size={12} color={'#ef4444'} />;
  return <Minus size={12} color={'#9ca3af'} />;
};

const getMetricIcon = (metric: MetricKey) => {
  switch (metric) {
    case 'sleep':
      return <Brain size={20} color={'#60A5FA'} />;
    case 'training':
      return <Activity size={20} color={'#FB923C'} />;
    case 'respiratory':
      return <Wind size={20} color={'#5EEAD4'} />;
    case 'immunity':
      return <Shield size={20} color={'#A78BFA'} />;
    default:
      return <Activity size={20} color={'#60A5FA'} />;
  }
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

export const HealthMetricsGrid: React.FC<HealthMetricsGridProps> = ({
  healthMetrics,
}) => {
  const tooltipMetrics = getTooltipMetrics(14);

  return (
    <View style={styles.section}>
      <View style={styles.metricsHeaderRow}>
        <Text style={styles.metricsHeader}>HEALTH METRICS</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TooltipComponent
            content={
              <View>
                <Text
                  style={{
                    ...Typography.h2,
                    color: Colors.text,
                    marginBottom: Space[3],
                    textAlign: 'center',
                  }}
                >
                  Bio Age Impact
                </Text>
                <Text
                  style={{
                    ...Typography.caption,
                    color: '#9ca3af',
                    lineHeight: 18,
                  }}
                >
                  These metrics show how each domain contributes to your current
                  bio age trend.
                </Text>
              </View>
            }
            titleFontSize={14}
            triggerSize={tooltipMetrics.iconSize}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: tooltipMetrics.spacing,
              }}
            >
              <Info size={tooltipMetrics.iconSize} color={'#9ca3af'} />
              <Text style={styles.metricsInfoText}> Impact on bio age</Text>
            </View>
          </TooltipComponent>
        </View>
      </View>

      <View style={styles.metricsGridNew}>
        {(Object.entries(healthMetrics) as [MetricKey, Metric][]).map(
          ([key, metric]) => {
            const baseColor =
              key === 'sleep'
                ? '#60A5FA'
                : key === 'training'
                  ? '#FB923C'
                  : key === 'respiratory'
                    ? '#5EEAD4'
                    : '#A78BFA';
            const min = Math.min(...metric.weekData);
            const max = Math.max(...metric.weekData);
            const cy =
              30 -
              ((metric.weekData[metric.weekData.length - 1] - min) /
                (max - min || 1)) *
                30;
            const gradientId = `gradient-${key}`;
            return (
              <View key={key} style={styles.metricCard}>
                <View
                  style={{ position: 'absolute', inset: 0, opacity: 0.05 }}
                />
                <View style={{ position: 'relative' }}>
                  <View style={styles.metricCardHeader}>
                    {getMetricIcon(key)}
                    <View
                      style={{ flexDirection: 'row', alignItems: 'center' }}
                    >
                      {getTrendIcon(metric.trend)}
                    </View>
                  </View>
                  <Text style={styles.metricLabel}>{metric.label}</Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'flex-end',
                      gap: 4,
                    }}
                  >
                    <Text style={styles.metricScore}>{metric.score}</Text>
                    <Text style={styles.metricUnit}>{metric.unit}</Text>
                  </View>
                  <Text style={styles.metricImpact}>
                    {Math.round(metric.weight * 100)}% impact
                  </Text>

                  <View style={{ marginTop: Space[3] }}>
                    <Svg
                      width={'100%'}
                      height={32}
                      viewBox='0 0 100 32'
                      preserveAspectRatio='none'
                    >
                      <Defs>
                        <SvgLinearGradient
                          id={gradientId}
                          x1='0%'
                          y1='0%'
                          x2='0%'
                          y2='100%'
                        >
                          <Stop
                            offset='0%'
                            stopColor={baseColor}
                            stopOpacity={0.3}
                          />
                          <Stop
                            offset='100%'
                            stopColor={baseColor}
                            stopOpacity={0.05}
                          />
                        </SvgLinearGradient>
                      </Defs>
                      <Path
                        d={createArea(metric.weekData, 100, 30)}
                        fill={`url(#${gradientId})`}
                      />
                      <Path
                        d={createPath(metric.weekData, 100, 30)}
                        fill='none'
                        stroke={baseColor}
                        strokeWidth={2}
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                      <Circle
                        cx={100}
                        cy={cy}
                        r={3}
                        fill={'#ffffff'}
                        stroke={baseColor}
                        strokeWidth={2}
                      />
                    </Svg>
                    <View style={styles.metricChartLabels}>
                      <Text style={styles.metricChartLabelText}>7d</Text>
                      <Text style={styles.metricChartLabelText}>today</Text>
                    </View>
                  </View>
                </View>
              </View>
            );
          }
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: Space[3],
    marginBottom: Space[6],
  },
  metricsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Space[3],
  },
  metricsHeader: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '600',
  },
  metricsInfoText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  metricsGridNew: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Space[2],
  },
  metricCard: {
    width: (width - Space[3] * 2 - Space[2]) / 2,
    backgroundColor: Colors.exerciseCard,
    borderRadius: BorderRadius.md,
    padding: Space[4],
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 1,
  },
  metricCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Space[3],
  },
  metricLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  metricScore: {
    fontSize: 22,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  metricUnit: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  metricImpact: {
    marginTop: 2,
    fontSize: 12,
    color: '#9CA3AF',
  },
  metricChartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  metricChartLabelText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});
