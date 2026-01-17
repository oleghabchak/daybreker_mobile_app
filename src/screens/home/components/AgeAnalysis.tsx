import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, {
  Defs,
  Path,
  Stop,
  LinearGradient as SvgLinearGradient,
} from 'react-native-svg';

import { BorderRadius, Colors, Space } from '../../../constants/theme';

interface AgeAnalysisProps {
  biologicalAge: number;
  chronologicalAge: number | null;
  bioAgeHistory: number[];
}

const getAgeWidth = (age: number) => {
  const minDisplay = 20;
  const maxDisplay = 80;
  return (age / 100) * (maxDisplay - minDisplay) + minDisplay;
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

export const AgeAnalysis: React.FC<AgeAnalysisProps> = ({
  biologicalAge,
  chronologicalAge,
  bioAgeHistory,
}) => {
  return (
    <View style={styles.section}>
      <View style={styles.card}>
        {/* Bio Age */}
        <View style={{ marginBottom: Space[3] }}>
          <View style={styles.ageRowHeader}>
            <Text style={styles.ageRowLabel}>Biological age</Text>
            <Text style={styles.ageRowValue}>{biologicalAge.toFixed(1)}</Text>
          </View>
          <View style={styles.ageBarBackground}>
            <LinearGradient
              colors={['#86EFAC', '#6EE7B7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.ageBarFill,
                { width: `${getAgeWidth(biologicalAge)}%` },
              ]}
            />
          </View>
        </View>

        {/* Chronological Age */}
        <View>
          <View style={styles.ageRowHeader}>
            <Text style={styles.ageRowLabel}>Chronological age</Text>
            <Text style={styles.ageRowValue}>
              {(chronologicalAge ?? 45).toFixed(1)}
            </Text>
          </View>
          <View style={styles.ageBarBackground}>
            <LinearGradient
              colors={['#FCA5A5', '#F87171']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.ageBarFill,
                { width: `${getAgeWidth(chronologicalAge ?? 45)}%` },
              ]}
            />
          </View>
        </View>

        {/* Summary */}
        <View style={{ alignItems: 'center', marginTop: Space[4] }}>
          <Text style={styles.ageSummaryText}>
            {(() => {
              const chrono = chronologicalAge ?? 45;
              const diff = chrono - biologicalAge;
              if (diff > 0) {
                return (
                  <Text>
                    <Text style={{ color: '#059669' }}>
                      You&apos;re {diff.toFixed(1)} years younger
                    </Text>
                    <Text style={{ color: Colors.textDisabled }}>
                      {' '}
                      than your chronological age
                    </Text>
                  </Text>
                );
              }
              if (diff < 0) {
                return (
                  <Text>
                    <Text style={{ color: Colors.textPrimary }}>
                      You&apos;re {Math.abs(diff).toFixed(1)} years older
                    </Text>
                    <Text style={{ color: Colors.textDisabled }}>
                      {' '}
                      than your chronological age
                    </Text>
                  </Text>
                );
              }
              return (
                <Text style={{ color: Colors.textDisabled }}>
                  You&apos;re age matched with your chronological age
                </Text>
              );
            })()}
          </Text>
        </View>

        {/* Bio Age Trend */}
        <View
          style={{
            paddingTop: Space[4],
            marginTop: Space[4],
            borderTopWidth: 1,
            borderTopColor: '#F1F5F9',
          }}
        >
          <Text style={styles.trendLabel}>6 Month Trend</Text>
          <Svg
            width={'100%'}
            height={40}
            viewBox='0 0 100 40'
            preserveAspectRatio='none'
          >
            <Defs>
              <SvgLinearGradient
                id='bioAgeTrend'
                x1='0%'
                y1='0%'
                x2='0%'
                y2='100%'
              >
                <Stop offset='0%' stopColor='#6EE7B7' stopOpacity='0.15' />
                <Stop offset='100%' stopColor='#6EE7B7' stopOpacity='0.02' />
              </SvgLinearGradient>
            </Defs>
            <Path
              d={createArea(bioAgeHistory, 100, 40)}
              fill='url(#bioAgeTrend)'
            />
            <Path
              d={createPath(bioAgeHistory, 100, 40)}
              fill='none'
              stroke='#6EE7B7'
              strokeWidth={1.5}
              strokeLinecap='round'
            />
          </Svg>
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
  ageRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: Space[2],
  },
  ageRowLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ageRowValue: {
    fontSize: 20,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  ageBarBackground: {
    height: 18,
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    overflow: 'hidden',
  },
  ageBarFill: {
    height: '100%',
    borderRadius: 16,
  },
  ageSummaryText: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '500',
    marginBottom: 4,
  },
  trendLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: Space[2],
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
