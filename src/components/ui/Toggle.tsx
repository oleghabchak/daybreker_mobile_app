import React from 'react';
import {
  Platform,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  BorderRadius,
  Colors,
  Shadows,
  Space,
  Typography,
} from '../../constants/theme';
import { TooltipComponent, getTooltipMetrics } from '../common/TooltipComponent';

export interface ToggleProps {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  variant?: 'default' | 'primary';
  size?: 'small' | 'medium';
  tooltipContent?: React.ReactNode | string;
}

export const Toggle: React.FC<ToggleProps> = ({
  label,
  description,
  value,
  onValueChange,
  disabled = false,
  variant = 'default',
  size = 'medium',
  tooltipContent,
}) => {
  const tooltipMetrics = getTooltipMetrics(Typography.bodyMedium.fontSize);

  return (
    <TouchableOpacity
      style={[
        styles.container,
        styles[variant],
        disabled && styles.disabled,
        size === 'small' && styles.small,
      ]}
      onPress={() => !disabled && onValueChange(!value)}
      activeOpacity={0.7}
      disabled={disabled}
    >
      <View style={styles.content}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          {tooltipContent != null ? (
            <View
              style={{
                marginLeft: tooltipMetrics.spacing,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <TooltipComponent
                content={
                  <View>
                    <Text style={{ ...Typography.h2, color: Colors.text, marginBottom: Space[3], textAlign: 'center' }}>{label}</Text>
                    {tooltipContent}
                  </View>
                }
                titleFontSize={Typography.bodyMedium.fontSize}
                triggerSize={tooltipMetrics.iconSize}
              />
            </View>
          ) : null}
        </View>
        {description && <Text style={styles.description}>{description}</Text>}
      </View>

      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{
          false:
            variant === 'primary' ? Colors.textDisabled : Colors.textDisabled,
          true: variant === 'primary' ? Colors.primary : Colors.primary,
        }}
        thumbColor={Colors.background}
        ios_backgroundColor={Colors.textDisabled}
        style={[styles.switch, size === 'small' && styles.smallSwitch]}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    padding: Space[4],
    borderRadius: BorderRadius.md,
    ...Shadows.sm,
  },
  small: {
    padding: Space[2],
  },
  default: {
    // Default styling (existing)
  },
  primary: {
    backgroundColor: Colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  disabled: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
    marginRight: Space[4],
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    ...Typography.bodyMedium,
    color: Colors.text,
    marginBottom: Space[1],
  },
  defaultLabel: {
    // Default label styling
  },
  primaryLabel: {
    color: Colors.primary,
    fontWeight: '600',
  },
  description: {
    ...Typography.caption,
    color: Colors.textDisabled,
  },
  defaultDescription: {
    // Default description styling
  },
  primaryDescription: {
    color: Colors.primary,
    opacity: 0.8,
  },
  switch: {
    transform: Platform.OS === 'android' ? [{ scale: 0.9 }] : [],
  },
  smallSwitch: {
    transform: Platform.OS === 'android' ? [{ scale: 0.7 }] : [],
  },
});
