export enum MeasurementUnits {
  METRIC = 'metric',
  IMPERIAL = 'imperial',
}

export const MeasurementUnitsLabels = {
  [MeasurementUnits.METRIC]: 'Metric',
  [MeasurementUnits.IMPERIAL]: 'Imperial',
};

export const MeasurementUnitsDisplay = {
  [MeasurementUnits.METRIC]: {
    weight: 'kg',
    height: 'cm',
    distance: 'km',
    temperature: '°C',
  },
  [MeasurementUnits.IMPERIAL]: {
    weight: 'lbs',
    height: 'in',
    distance: 'mi',
    temperature: '°F',
  },
};
