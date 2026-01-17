/**
 * Unit conversion utilities for imperial and metric systems
 */

// Conversion constants
const KG_TO_LBS = 2.2046226218;
const LBS_TO_KG = 1 / KG_TO_LBS;

/**
 * Round number to nearest 0.5 increment
 * @param value - Number to round
 * @returns Number rounded to nearest 0.5
 */
export const roundToHalf = (value: number): number => {
  return Math.round(value * 2) / 2;
};

/**
 * Round imperial weight input to nearest 0.5 increment
 * @param input - Weight input in pounds
 * @returns Rounded weight in pounds
 */
export const roundImperialWeight = (input: string | number | null): number => {
  const value = safeParseNumber(input);
  if (value! <= 0) return 0;
  return roundToHalf(value ?? 0);
};

/**
 * Convert weight from kilograms to pounds with 0.5 lb rounding
 */
export const kgToLbs = (kg: number): number => {
  if (isNaN(kg) || kg < 0) return 0;
  const lbs = kg * KG_TO_LBS;
  // Round to nearest 0.5 increment
  return roundToHalf(lbs);
};

/**
 * Convert weight from pounds to kilograms
 */
export const lbsToKg = (lbs: number): number => {
  if (isNaN(lbs) || lbs < 0) return 0;
  return lbs * LBS_TO_KG;
};

/**
 * Convert distance from meters to feet
 */
export const metersToFeet = (meters: number): number => {
  if (isNaN(meters) || meters < 0) return 0;
  return meters * 3.28084;
};

/**
 * Convert distance from feet to meters
 */
export const feetToMeters = (feet: number): number => {
  if (isNaN(feet) || feet < 0) return 0;
  return feet / 3.28084;
};

/**
 * Convert height from centimeters to feet and inches
 */
export const cmToFeetInches = (
  cm: number
): { feet: number; inches: number } => {
  if (isNaN(cm) || cm < 0) return { feet: 0, inches: 0 };

  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);

  return { feet, inches };
};

/**
 * Convert height from feet and inches to centimeters
 */
export const feetInchesToCm = (feet: number, inches: number): number => {
  if (isNaN(feet) || isNaN(inches) || feet < 0 || inches < 0) return 0;
  return (feet * 12 + inches) * 2.54;
};

/**
 * Convert temperature from Celsius to Fahrenheit
 */
export const celsiusToFahrenheit = (celsius: number): number => {
  if (isNaN(celsius)) return 0;
  return (celsius * 9) / 5 + 32;
};

/**
 * Convert temperature from Fahrenheit to Celsius
 */
export const fahrenheitToCelsius = (fahrenheit: number): number => {
  if (isNaN(fahrenheit)) return 0;
  return ((fahrenheit - 32) * 5) / 9;
};

/**
 * Format weight for display based on unit system
 */
export const formatWeight = (weightKg: number, isImperial: boolean): string => {
  if (isNaN(weightKg) || weightKg <= 0) return '0';

  const displayWeight = isImperial ? kgToLbs(weightKg) : weightKg;
  return displayWeight.toFixed(1);
};

/**
 * Format height for display based on unit system
 */
export const formatHeight = (heightCm: number, isImperial: boolean): string => {
  if (isNaN(heightCm) || heightCm <= 0) return isImperial ? '0\'0"' : '0 cm';

  if (isImperial) {
    const { feet, inches } = cmToFeetInches(heightCm);
    return `${feet}'${inches}"`;
  } else {
    return `${heightCm.toFixed(1)} cm`;
  }
};

/**
 * Parse weight input and convert to kg for storage
 */
export const parseWeightInput = (
  input: string,
  isImperial: boolean
): number => {
  const value = parseFloat(input);
  if (isNaN(value) || value <= 0) return 0;

  return isImperial ? lbsToKg(value) : value;
};

/**
 * Parse height input and convert to cm for storage
 */
export const parseHeightInput = (
  input: string,
  isImperial: boolean
): number => {
  if (isImperial) {
    // Parse format like "5'10" or "5'10\"" or "5 10"
    const match = input.match(/(\d+)['\s]*(\d+)/);
    if (match) {
      const feet = parseInt(match[1]);
      const inches = parseInt(match[2]);
      return feetInchesToCm(feet, inches);
    }
    return 0;
  } else {
    // Parse cm input
    const value = parseFloat(input);
    return isNaN(value) || value <= 0 ? 0 : value;
  }
};

/**
 * Round to specified decimal places
 */
export const roundTo = (value: number, decimals: number = 1): number => {
  if (isNaN(value)) return 0;
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

/**
 * Validate numeric input
 */
export const isValidNumericInput = (input: string): boolean => {
  const value = parseFloat(input);
  return !isNaN(value) && value >= 0;
};

/**
 * Number transformation and validation helpers
 */

/**
 * Safely parse a number from string or number input
 * @param input - String or number input
 * @param defaultValue - Default value if parsing fails (default: 0)
 * @returns Parsed number or default value
 */
export const safeParseNumber = (
  input: string | number | null,
  defaultValue: number = 0
): number | null => {
  if (typeof input === 'number') {
    return isNaN(input) ? defaultValue : input;
  }

  if (typeof input === 'string') {
    const parsed = parseFloat(input);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  return null;
};

/**
 * Ensure a number is within valid range
 * @param value - Number to validate
 * @param min - Minimum allowed value (default: 0)
 * @param max - Maximum allowed value (default: Infinity)
 * @returns Clamped number within range
 */
export const clampNumber = (
  value: number,
  min: number | null = 0,
  max: number = Infinity
): number => {
  const num = safeParseNumber(value);
  return Math.max(min ?? 0, Math.min(max, num ?? 0));
};

/**
 * Transform weight value for display with proper formatting
 * @param weight - Weight value (in kg)
 * @param isImperial - Whether to display in imperial units
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted weight string
 */

/**
 * Transform weight value for storage (always in kg)
 * @param input - Weight input (string or number)
 * @param isImperial - Whether input is in imperial units
 * @returns Weight in kg
 */
export const transformWeightToLbsAndRound = (
  input: string | number | null,
  isImperial: boolean
): number | null => {
  const value = safeParseNumber(input);
  if (value! <= 0) return null;
  return roundToHalf(isImperial ? kgToLbs(value ?? 0) : (value ?? 0));
};

export const transformWeightToKgAndRound = (
  input: string | number | null,
  isImperial: boolean
): number | null => {
  const value = safeParseNumber(input);
  if (value! <= 0) return null;

  if (isImperial) {
    // For imperial input, convert to kg and round to 1 decimal place
    return roundToDecimals(lbsToKg(value ?? 0), 1);
  } else {
    // For metric input, round to 1 decimal place
    return roundToDecimals(value ?? 0, 1);
  }
};

/**
 * Validate and sanitize weight input
 * @param input - Weight input
 * @param isImperial - Whether input is in imperial units
 * @returns Object with isValid, value, and error message
 */
export const validateWeightInput = (
  input: string | number | null,
  isImperial: boolean
): { isValid: boolean; value: number | null; error?: string } => {
  const value = safeParseNumber(input);

  if (value && value < 0) {
    return { isValid: false, value: null, error: 'Weight cannot be negative' };
  }

  if (value && value > 1000) {
    return { isValid: false, value: null, error: 'Weight seems too high' };
  }

  return {
    isValid: true,
    value: transformWeightToKgAndRound(input, isImperial),
  };
};

/**
 * Validate and sanitize reps input
 * @param input - Reps input
 * @returns Object with isValid, value, and error message
 */

/**
 * Convert display value back to storage value for weight
 * @param displayValue - Display value (formatted string)
 * @param isImperial - Whether display is in imperial units
 * @returns Weight in kg for storage
 */
export const convertDisplayToStorageWeight = (
  displayValue: string | null,
  isImperial: boolean
): number | null => {
  return transformWeightToKgAndRound(displayValue, isImperial);
};

/**
 * Convert storage value to display value for weight
 * @param storageValue - Storage value (in kg)
 * @param isImperial - Whether to display in imperial units
 * @returns Formatted weight string for display
 */
export const convertStorageToDisplayWeight = (
  storageValue: number | null,
  isImperial: boolean
): string | null => {
  return transformWeightToKgAndRound(storageValue, isImperial) as string | null;
};

/**
 * Round number to specified decimal places
 * @param value - Number to round
 * @param decimals - Number of decimal places (default: 1)
 * @returns Rounded number
 */
export const roundToDecimals = (
  value: number | null,
  decimals: number = 1
): number => {
  const multiplier = Math.pow(10, decimals);
  return Math.round((value ?? 0) * multiplier) / multiplier;
};

/**
 * Check if a number is effectively zero (within small tolerance)
 * @param value - Number to check
 * @param tolerance - Tolerance for zero check (default: 0.001)
 * @returns True if number is effectively zero
 */
export const isEffectivelyZero = (
  value: number | null,
  tolerance: number = 0.001
): boolean => {
  return Math.abs(value ?? 0) < tolerance;
};

/**
 * Format number with thousand separators
 * @param value - Number to format
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted number string
 */
export const formatNumberWithSeparators = (
  value: number | null,
  decimals: number = 0
): string => {
  const safeValue = safeParseNumber(value);
  return safeValue!.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * Convert unrounded weight_kg from database to display value
 * @param weightKg - Unrounded weight in kg from database
 * @param isImperial - Whether to display in imperial units
 * @returns Display value (rounded to 1 decimal place)
 */
export const convertStorageWeightToDisplay = (
  weightKg: number | null,
  isImperial: boolean
): number | null => {
  const safeWeight = safeParseNumber(weightKg);
  if (safeWeight === null) return null;

  if (isImperial) {
    // Convert kg to lbs and round to nearest 0.1
    const lbs = safeWeight * KG_TO_LBS;
    return Math.round(lbs * 1) / 1; // Round to 1 decimal place
  } else {
    // Round kg to 1 decimal place
    return Math.round(safeWeight * 1) / 1;
  }
};

/**
 * Convert display value to unrounded weight_kg for database storage
 * @param displayValue - Display value (rounded kg or rounded lbs)
 * @param isImperial - Whether display value is in imperial units
 * @returns Unrounded weight in kg for database storage
 */
export const convertDisplayWeightToStorage = (
  displayValue: number | null,
  isImperial: boolean
): number | null => {
  const safeValue = safeParseNumber(displayValue);
  if (safeValue === null) return null;

  if (isImperial) {
    // Convert lbs to kg (unrounded for storage)
    return safeValue * LBS_TO_KG;
  } else {
    // Return kg as-is (unrounded for storage)
    return safeValue;
  }
};

/**
 * Format weight for display with proper rounding
 * @param weightKg - Unrounded weight in kg from database
 * @param isImperial - Whether to display in imperial units
 * @returns Formatted weight string for display
 */
export const formatWeightForDisplay = (
  weightKg: number | null,
  isImperial: boolean
): string => {
  const displayValue = convertStorageWeightToDisplay(weightKg, isImperial);
  if (displayValue === null) return '0';

  return displayValue.toFixed(0); // Show whole numbers for both metric and imperial
};
