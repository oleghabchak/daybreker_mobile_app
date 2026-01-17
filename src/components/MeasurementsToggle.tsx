import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { BorderRadius, Colors, Space, Typography } from '../constants/theme';
import {
  MeasurementUnits,
  MeasurementUnitsLabels,
} from '../enums/measurement.enums';
import { useMeasurementUnits } from '../hooks';

interface MeasurementsToggleProps {
  // Props are now optional since the component manages its own state
  isImperial?: boolean;
  onToggle?: (isImperial: boolean) => void;
}

export const MeasurementsToggle: React.FC<MeasurementsToggleProps> = () => {
  const { isImperial, saveMeasurementPreference } = useMeasurementUnits();

  const handleToggle = async (newIsImperial: boolean) => {
    await saveMeasurementPreference(newIsImperial);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, !isImperial && styles.buttonSelected]}
        onPress={() => handleToggle(false)}
        activeOpacity={0.8}
      >
        <Text style={[styles.text, !isImperial && styles.textSelected]}>
          {MeasurementUnitsLabels[MeasurementUnits.METRIC]}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, isImperial && styles.buttonSelected]}
        onPress={() => handleToggle(true)}
        activeOpacity={0.8}
      >
        <Text style={[styles.text, isImperial && styles.textSelected]}>
          {MeasurementUnitsLabels[MeasurementUnits.IMPERIAL]}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.full,
    padding: 2,
    gap: 2,
    backgroundColor: Colors.background,
  },
  button: {
    flex: 1,
    height: 40,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSelected: {
    backgroundColor: Colors.primary,
  },
  text: {
    ...Typography.body,
    color: Colors.textDisabled,
    fontWeight: '600',
  },
  textSelected: {
    ...Typography.bodyBold,
    color: Colors.background,
  },
});
