import Slider from '@react-native-community/slider';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

import { Colors, Typography } from '../../constants/theme';

interface RangeSliderProps {
  min: number;
  max: number;
  value: number;
  onValueChange: (value: number) => void;
  step?: number;
  containerStyle?: ViewStyle;
  showValue?: boolean;
  label?: string;
  disabled?: boolean;
  minimumTrackTintColor?: string;
  maximumTrackTintColor?: string;
  thumbTintColor?: string;
  onSlidingStart?: () => void;
  onSlidingComplete?: (value: number) => void;
  minLabel?: string;
  maxLabel?: string;
}

export const RangeSlider: React.FC<RangeSliderProps> = ({
  min,
  max,
  value,
  onValueChange,
  step = 1,
  containerStyle,
  showValue = true,
  label,
  disabled = false,
  minimumTrackTintColor = Colors.primary,
  maximumTrackTintColor = Colors.border,
  thumbTintColor = Colors.primary,
  onSlidingStart,
  onSlidingComplete,
  minLabel,
  maxLabel,
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={styles.sliderContainer}>
        <Slider
          style={styles.slider}
          minimumValue={min}
          maximumValue={max}
          value={value}
          onValueChange={onValueChange}
          onSlidingStart={onSlidingStart}
          onSlidingComplete={onSlidingComplete}
          step={step}
          disabled={disabled}
          minimumTrackTintColor={minimumTrackTintColor}
          maximumTrackTintColor={maximumTrackTintColor}
          thumbTintColor={thumbTintColor}
          tapToSeek={true}
        />

        {/* Min/Max labels */}
        <View style={styles.rangeLabels}>
          <Text style={styles.rangeLabel}>{minLabel ?? String(min)}</Text>
          <Text style={styles.rangeLabel}>{maxLabel ?? String(max)}</Text>
        </View>
      </View>

      {/* Current value display */}
      {showValue && (
        <View style={styles.valueContainer}>
          <Text style={styles.valueText}>{value}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  label: {
    ...Typography.bodyMedium,
    color: Colors.text,
    fontWeight: '500',
    marginBottom: 8,
  },
  sliderContainer: {
    height: 50,
  },
  slider: {
    width: '100%',
    maxHeight: 10,
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  rangeLabel: {
    ...Typography.bodyBold,
    color: Colors.textDisabled,
  },
  valueContainer: {
    alignItems: 'center',
  },
  valueText: {
    marginTop: -10,
    ...Typography.h3,
    color: Colors.primary,
    fontWeight: '600',
  },
});

export default RangeSlider;
