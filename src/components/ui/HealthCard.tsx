/**
 * HealthCard - Composable health metric display component
 *
 * Reusable card component for displaying health scores with consistent styling
 */

import { LinearGradient } from 'expo-linear-gradient';
import { LucideIcon } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  BorderRadius,
  Colors,
  Shadows,
  Space,
  Typography,
} from '../../constants/theme';

interface HealthCardProps {
  title: string;
  score?: number | null;
  unit?: string;
  color: string;
  icon: LucideIcon;
  onPress?: () => void;
  loading?: boolean;
  error?: string | null;
  trend?: 'up' | 'down' | 'stable';
  size?: 'small' | 'medium' | 'large';
}

export const HealthCard: React.FC<HealthCardProps> = ({
  title,
  score,
  unit = '',
  color,
  icon: Icon,
  onPress,
  loading = false,
  error = null,
  trend,
  size = 'medium',
}) => {
  const formatScore = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return '--';
    return Math.round(value).toString();
  };

  const getTrendColor = (): string => {
    switch (trend) {
      case 'up':
        return Colors.success;
      case 'down':
        return Colors.error;
      case 'stable':
        return Colors.textDisabled;
      default:
        return Colors.textDisabled;
    }
  };

  const getTrendSymbol = (): string => {
    switch (trend) {
      case 'up':
        return '↗';
      case 'down':
        return '↘';
      case 'stable':
        return '→';
      default:
        return '';
    }
  };

  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      style={[styles.container, styles[size]]}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
    >
      <LinearGradient
        colors={[`${color}20`, `${color}10`]}
        style={[styles.gradient, styles[`${size}Gradient`]]}
      >
        {/* Header with icon */}
        <View style={styles.header}>
          <Icon size={size === 'small' ? 20 : 24} color={color} />
          {trend && (
            <Text style={[styles.trend, { color: getTrendColor() }]}>
              {getTrendSymbol()}
            </Text>
          )}
        </View>

        {/* Score display */}
        <View style={styles.scoreContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <View
                style={[styles.loadingBar, { backgroundColor: `${color}40` }]}
              />
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorScore}>--</Text>
              <Text style={styles.errorText}>Error</Text>
            </View>
          ) : (
            <>
              <Text style={[styles.score, styles[`${size}Score`]]}>
                {formatScore(score)}
                {unit && <Text style={styles.unit}>{unit}</Text>}
              </Text>
              <Text style={[styles.title, styles[`${size}Title`]]}>
                {title}
              </Text>
            </>
          )}
        </View>

        {/* Footer for additional info */}
        {onPress && (
          <View style={styles.footer}>
            <Text style={styles.viewMore}>Tap to view</Text>
          </View>
        )}
      </LinearGradient>
    </Component>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    ...Shadows.sm,
  },

  // Size variants
  small: {
    minHeight: 80,
    flex: 1,
    margin: Space[1],
  },
  medium: {
    minHeight: 120,
    flex: 1,
    margin: Space[1],
  },
  large: {
    minHeight: 160,
    width: '100%',
    marginBottom: Space[4],
  },

  gradient: {
    padding: Space[4],
    height: '100%',
    justifyContent: 'space-between',
  },

  smallGradient: {
    padding: Space[3],
  },
  mediumGradient: {
    padding: Space[4],
  },
  largeGradient: {
    padding: Space[6],
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Space[2],
  },

  trend: {
    ...Typography.bodyMedium,
    fontSize: 16,
  },

  scoreContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  score: {
    ...Typography.h2,
    color: Colors.textPrimary,
    textAlign: 'center',
    fontWeight: '700',
  },

  smallScore: {
    fontSize: 20,
  },
  mediumScore: {
    fontSize: 28,
  },
  largeScore: {
    fontSize: 36,
  },

  unit: {
    ...Typography.caption,
    color: Colors.textDisabled,
    fontSize: 14,
    fontWeight: '400',
  },

  title: {
    ...Typography.caption,
    color: Colors.textDisabled,
    textAlign: 'center',
    marginTop: Space[1],
  },

  smallTitle: {
    fontSize: 11,
  },
  mediumTitle: {
    fontSize: 13,
  },
  largeTitle: {
    fontSize: 15,
  },

  // Loading state
  loadingContainer: {
    alignItems: 'center',
  },
  loadingBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: Space[2],
  },
  loadingText: {
    ...Typography.caption,
    color: Colors.textDisabled,
  },

  // Error state
  errorContainer: {
    alignItems: 'center',
  },
  errorScore: {
    ...Typography.h2,
    color: Colors.error,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.error,
    marginTop: Space[1],
  },

  // Footer
  footer: {
    alignItems: 'center',
    marginTop: Space[2],
  },
  viewMore: {
    ...Typography.caption,
    color: Colors.textDisabled,
    opacity: 0.7,
  },
});
