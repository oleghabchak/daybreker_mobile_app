/**
 * Utility functions for common calculations and operations
 */

// Re-export unit conversion functions
export * from './unitConversions';

/**
 * Adds opacity to a hex color
 * @param hexColor - Hex color string (e.g., '#8F8E8C')
 * @param opacity - Opacity percentage (0-100)
 * @returns Hex color with opacity (e.g., '#8F8E8C40' for 40% opacity)
 */
export const addOpacity = (hexColor: string, opacity: number): string => {
  // Remove # if present
  const hex = hexColor.replace('#', '');

  // Convert opacity percentage to hex (0-100 -> 00-FF)
  const alpha = Math.round((opacity / 100) * 255);
  const alphaHex = alpha.toString(16).padStart(2, '0');

  return `#${hex}${alphaHex}`;
};

/**
 * Convert HEX to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const sanitized = hex.replace('#', '');
  const value =
    sanitized.length === 3
      ? sanitized
          .split('')
          .map(c => c + c)
          .join('')
      : sanitized;
  const num = parseInt(value, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

/**
 * Convert RGB to HEX
 */
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(Math.round(r))}${toHex(Math.round(g))}${toHex(Math.round(
    b
  ))}`;
}

/**
 * Convert RGB to HSL
 */
function rgbToHsl(r: number, g: number, b: number): {
  h: number;
  s: number;
  l: number;
} {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h /= 6;
  }

  return { h: h * 360, s, l };
}

/**
 * Convert HSL to RGB
 */
function hslToRgb(h: number, s: number, l: number): {
  r: number;
  g: number;
  b: number;
} {
  h /= 360;

  if (s === 0) {
    const v = l * 255;
    return { r: v, g: v, b: v };
  }

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  const r = hue2rgb(p, q, h + 1 / 3) * 255;
  const g = hue2rgb(p, q, h) * 255;
  const b = hue2rgb(p, q, h - 1 / 3) * 255;
  return { r, g, b };
}

/**
 * Returns a soft complementary (pastel) color for the provided hex color.
 * This derives the complement on the color wheel and lifts lightness to improve legibility
 * for pill backgrounds.
 */
export function getComplementaryPastel(
  baseHex: string,
  options?: { targetLightness?: number; saturationFactor?: number }
): string {
  const { targetLightness = 0.88, saturationFactor = 0.6 } = options ?? {};
  const { r, g, b } = hexToRgb(baseHex);
  const { h, s } = rgbToHsl(r, g, b);
  const complementHue = (h + 180) % 360;
  const pastelSaturation = Math.max(0, Math.min(1, s * saturationFactor));
  const pastel = hslToRgb(complementHue, pastelSaturation, targetLightness);
  return rgbToHex(pastel.r, pastel.g, pastel.b);
}

/**
 * Formats equipment text by removing underscores and capitalizing words
 * @param equipment - Equipment string (e.g., 'machine_plate')
 * @returns Formatted equipment string (e.g., 'Machine Plate')
 */
export const removeUnderscores = (equipment: string): string => {
  if (!equipment) return '';

  return equipment
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Calculates the percentage of completed items out of total items
 * @param completed - Number of completed items
 * @param total - Total number of items
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted percentage string or 0 if total is 0
 */
export const calculatePercentage = (
  completed: number,
  total: number,
  decimals: number = 0
): string => {
  if (total === 0) return '0%';

  const percentage = (completed / total) * 100;
  return `${percentage.toFixed(decimals)}%`;
};

/**
 * Calculates the percentage as a number
 * @param completed - Number of completed items
 * @param total - Total number of items
 * @returns Percentage as a number (0-100) or 0 if total is 0
 */
export const getPercentageNumber = (
  completed: number,
  total: number
): number => {
  if (total === 0) return 0;
  return (completed / total) * 100;
};

/**
 * Formats progress as "completed/total" with optional percentage
 * @param completed - Number of completed items
 * @param total - Total number of items
 * @param showPercentage - Whether to include percentage (default: true)
 * @param decimals - Number of decimal places for percentage (default: 0)
 * @returns Formatted progress string
 */
export const formatProgress = (
  completed: number,
  total: number,
  showPercentage: boolean = true,
  decimals: number = 0
): string => {
  if (isNaN(completed) || isNaN(total)) {
    return '100%';
  }

  const base = `${completed}/${total}`;

  if (!showPercentage) return base;

  const percentage = calculatePercentage(completed, total, decimals);
  return `${percentage}`;
};

export function extractExerciseIds(data: any) {
  if (!data || !Array.isArray(data)) {
    return [];
  }
  return data.map((item: any) => item.exercise_id).reverse();
}

export function calculateCompletedExercises(data: any) {
  if (!data || !Array.isArray(data)) {
    return 0;
  }
  return data.filter((item: any) => item.exercise_id).length;
}

export function calculateCompletedSets(exercises: any[]): number {
  if (!exercises || !Array.isArray(exercises)) {
    return 0;
  }

  let totalCompletedSets = 0;

  exercises.forEach((exercise: any) => {
    if (exercise.sets && Array.isArray(exercise.sets)) {
      const completedSets = exercise.sets.filter(
        (set: any) => set.status === 'done'
      );
      totalCompletedSets += completedSets.length;
    }
  });

  return totalCompletedSets;
}

export function calculateTotalSets(exercises: any[]): number {
  if (!exercises || !Array.isArray(exercises)) {
    return 0;
  }

  let totalSets = 0;

  exercises.forEach((exercise: any) => {
    if (exercise.sets && Array.isArray(exercise.sets)) {
      totalSets += exercise.sets.length;
    }
  });

  return totalSets;
}

export function calculateCompletionPercentage(exercises: any[]): number {
  const totalSets = calculateTotalSets(exercises);
  const completedSets = calculateCompletedSets(exercises);

  if (totalSets === 0) {
    return 0;
  }

  return Math.round((completedSets / totalSets) * 100);
}

export function getExerciseCompletionStats(workouts: any) {
  // Handle different data structures
  let exercises = [];

  if (Array.isArray(workouts)) {
    // If workouts is directly an array of exercises
    exercises = workouts;
  } else if (workouts?.exercises && Array.isArray(workouts.exercises)) {
    // If workout has exercises array
    exercises = workouts.exercises;
  } else if (workouts && workouts.sets && Array.isArray(workouts.sets)) {
    // If workout is actually a single exercise object
    exercises = [workouts];
  } else {
    return {
      completedSets: 0,
      totalSets: 0,
      completionPercentage: 0,
      completedExercises: 0,
      totalExercises: 0,
    };
  }

  let completedSets = 0;
  let totalSets = 0;
  let completedExercises = 0;
  let totalExercises = 0;

  exercises.forEach((exercise: any) => {
    const exerciseName = exercise.exercise?.display_name_en || 'Unknown';

    // Handle cases where sets can be null, undefined, or not an array
    const exerciseSets = exercise.sets;

    if (exerciseSets === null || exerciseSets === undefined) {
      totalExercises += 1; // Count exercise but no sets
      return;
    }

    if (!Array.isArray(exerciseSets)) {
      totalExercises += 1; // Count exercise but no sets
      return;
    }

    if (exerciseSets.length === 0) {
      totalExercises += 1; // Count exercise but no sets
      return;
    }

    // Process valid sets
    const exerciseTotalSets = exerciseSets.length;
    const exerciseCompletedSets = exerciseSets.filter(
      (set: any) => (set && set.status === 'done') || set.status === 'skipped'
    ).length;

    totalSets += exerciseTotalSets;
    completedSets += exerciseCompletedSets;
    totalExercises += 1;

    // An exercise is completed only if ALL its sets are done
    if (exerciseCompletedSets === exerciseTotalSets && exerciseTotalSets > 0) {
      completedExercises += 1;
    }
  });

  const completionPercentage =
    totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

  const stats = {
    completedSets,
    totalSets,
    completionPercentage,
    completedExercises,
    totalExercises,
  };

  return stats;
}

/**
 * Additional number transformation utilities
 */

/**
 * Process workout set data and ensure proper number formatting
 * @param sets - Array of workout sets
 * @param isImperial - Whether to use imperial units
 * @returns Processed sets with proper number formatting
 */
export const processWorkoutSets = (sets: any[], isImperial: boolean) => {
  if (!Array.isArray(sets)) return [];

  return sets.map(set => ({
    ...set,
    weight: safeParseNumber(set.weight),
    reps: safeParseNumber(set.reps),
    rir: safeParseNumber(set.rir),
    // Add formatted display values
    weightDisplay: transformWeightForDisplay(set.weight, isImperial),
    repsDisplay: transformRepsForDisplay(set.reps),
  }));
};

/**
 * Validate workout set data
 * @param set - Workout set object
 * @param isImperial - Whether to use imperial units
 * @returns Validation result with errors
 */
export const validateWorkoutSet = (set: any, isImperial: boolean) => {
  const errors: string[] = [];

  const weightValidation = validateWeightInput(set.weight, isImperial);
  if (!weightValidation.isValid && weightValidation.error) {
    errors.push(weightValidation.error);
  }

  const repsValidation = validateRepsInput(set.reps);
  if (!repsValidation.isValid && repsValidation.error) {
    errors.push(repsValidation.error);
  }

  return {
    isValid: errors.length === 0,
    errors,
    processedSet: {
      ...set,
      weight: weightValidation.value,
      reps: repsValidation.value,
    },
  };
};

/**
 * Calculate total volume for a workout (weight * reps for all sets)
 * @param sets - Array of workout sets
 * @param isImperial - Whether to use imperial units
 * @returns Total volume
 */
export const calculateTotalVolume = (
  sets: any[],
  isImperial: boolean
): number => {
  if (!Array.isArray(sets)) return 0;

  return sets.reduce((total, set) => {
    const weight = safeParseNumber(set.weight);
    const reps = safeParseNumber(set.reps);

    // Convert weight to kg for consistent calculation
    const weightKg = isImperial ? lbsToKg(weight) : weight;

    return total + weightKg * reps;
  }, 0);
};

/**
 * Calculate average weight for completed sets
 * @param sets - Array of workout sets
 * @param isImperial - Whether to use imperial units
 * @returns Average weight in kg
 */
export const calculateAverageWeight = (
  sets: any[],
  isImperial: boolean
): number => {
  if (!Array.isArray(sets)) return 0;

  const completedSets = sets.filter(
    set =>
      set.status === 'done' &&
      safeParseNumber(set.weight) > 0 &&
      safeParseNumber(set.reps) > 0
  );

  if (completedSets.length === 0) return 0;

  const totalWeight = completedSets.reduce((total, set) => {
    const weight = safeParseNumber(set.weight);
    return total + (isImperial ? lbsToKg(weight) : weight);
  }, 0);

  return totalWeight / completedSets.length;
};

/**
 * Calculate one rep max using Epley formula
 * @param weight - Weight lifted
 * @param reps - Number of reps performed
 * @param isImperial - Whether weight is in imperial units
 * @returns Estimated one rep max in kg
 */
export const calculateOneRepMax = (
  weight: number,
  reps: number,
  isImperial: boolean
): number => {
  const safeWeight = safeParseNumber(weight);
  const safeReps = safeParseNumber(reps);

  if (safeWeight <= 0 || safeReps <= 0) return 0;

  // Convert to kg for calculation
  const weightKg = isImperial ? lbsToKg(safeWeight) : safeWeight;

  // Epley formula: 1RM = weight * (1 + reps/30)
  const oneRepMax = weightKg * (1 + safeReps / 30);

  return roundToDecimals(oneRepMax, 1);
};
