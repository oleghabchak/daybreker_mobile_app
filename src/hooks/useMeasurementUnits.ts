import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

import {
  MeasurementUnits,
  MeasurementUnitsDisplay,
} from '../enums/measurement.enums';

export const useMeasurementUnits = () => {
  const [isImperial, setIsImperial] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Load measurement preference from AsyncStorage
  useEffect(() => {
    const loadMeasurementPreference = async () => {
      try {
        const savedPreference = await AsyncStorage.getItem('measurementUnits');
        if (savedPreference !== null) {
          const isImperialValue = savedPreference === MeasurementUnits.IMPERIAL;
          setIsImperial(isImperialValue);
        } else {
          // Default to Imperial when no preference is stored
          await AsyncStorage.setItem(
            'measurementUnits',
            MeasurementUnits.IMPERIAL
          );
          setIsImperial(true);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading measurement preference:', error);
        setIsLoading(false);
      }
    };

    loadMeasurementPreference();
  }, []);

  // Save measurement preference to AsyncStorage
  const saveMeasurementPreference = async (newIsImperial: boolean) => {
    try {
      const preference = newIsImperial
        ? MeasurementUnits.IMPERIAL
        : MeasurementUnits.METRIC;
      await AsyncStorage.setItem('measurementUnits', preference);
      setIsImperial(newIsImperial);
    } catch (error) {
      console.error('Error saving measurement preference:', error);
    }
  };

  // Get current measurement unit for a specific type
  const getUnit = (
    type: keyof (typeof MeasurementUnitsDisplay)[MeasurementUnits.METRIC]
  ) => {
    const currentUnits = isImperial
      ? MeasurementUnits.IMPERIAL
      : MeasurementUnits.METRIC;
    return MeasurementUnitsDisplay[currentUnits][type];
  };

  // Get all current measurement units
  const getCurrentUnits = () => {
    return isImperial
      ? MeasurementUnitsDisplay[MeasurementUnits.IMPERIAL]
      : MeasurementUnitsDisplay[MeasurementUnits.METRIC];
  };

  // Toggle between imperial and metric
  const toggleUnits = () => {
    saveMeasurementPreference(!isImperial);
  };

  return {
    isImperial,
    isLoading,
    getUnit,
    getCurrentUnits,
    saveMeasurementPreference,
    toggleUnits,
  };
};
