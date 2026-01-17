/**
 * Calculates RIR (Reps in Reserve) based on mesocycle week and block length
 *
 * RIR Progression Patterns:
 * - 4w: 3 → 2 → 1 (allow 0 on last key set) → Deload (RIR 4–6; −50% sets)
 * - 5w: 3 → 2 → 2 → 1 (allow 0) → Deload
 * - 6w: 3 → 3 → 2 → 2 → 1 (allow 0) → Deload
 * - 7w: 3 → 3 → 2 → 2 → 1 → 1 (allow 0) → Deload (optional micro‑deload in W4: −20–30% vol, +2 RIR)
 * - 8w: 3 → 3 → 2 → 2 → 1 → 1 → 1 (allow 0) → Deload (or 4 + micro‑deload + 3 + deload)
 */

export interface RIRCalculationOptions {
  blockLength: number; // Total weeks in the mesocycle block
  currentWeek: number; // Current week (1-based)
  isDeloadWeek?: boolean; // Whether this is a deload week
  isKeySet?: boolean; // Whether this is a key set (allows RIR 0)
  allowZeroRIR?: boolean; // Whether to allow RIR 0 on the last week
}

export interface RIRResult {
  rir: number;
  isDeloadWeek: boolean;
  weekType: 'normal' | 'deload' | 'micro-deload';
}

/**
 * Calculate RIR based on mesocycle progression
 */
export function calculateRIR(options: RIRCalculationOptions): RIRResult {
  const {
    blockLength,
    currentWeek,
    isDeloadWeek = false,
    isKeySet = false,
    allowZeroRIR = false,
  } = options;

  // Handle deload weeks
  if (isDeloadWeek) {
    return {
      rir: 4, // Deload weeks use RIR 4-6, defaulting to 4
      isDeloadWeek: true,
      weekType: 'deload',
    };
  }

  // Define progression patterns for each block length
  const progressionPatterns: Record<number, number[]> = {
    4: [3, 2, 1, 0], // Week 4 allows RIR 0 for key sets
    5: [3, 2, 2, 1, 0], // Week 5 allows RIR 0 for key sets
    6: [3, 3, 2, 2, 1, 0], // Week 6 allows RIR 0 for key sets
    7: [3, 3, 2, 2, 1, 1, 0], // Week 7 allows RIR 0 for key sets
    8: [3, 3, 2, 2, 1, 1, 1, 0], // Week 8 allows RIR 0 for key sets
  };

  // Get the progression pattern for the block length
  const pattern = progressionPatterns[blockLength];
  if (!pattern) {
    // Fallback for unsupported block lengths
    console.warn(
      `Unsupported block length: ${blockLength}. Using default progression.`
    );
    return {
      rir: 2, // Default RIR
      isDeloadWeek: false,
      weekType: 'normal',
    };
  }

  // Check if current week is within the pattern
  if (currentWeek < 1 || currentWeek > pattern.length) {
    console.warn(
      `Current week ${currentWeek} is outside pattern range (1-${pattern.length})`
    );
    return {
      rir: 2, // Default RIR
      isDeloadWeek: false,
      weekType: 'normal',
    };
  }

  // Get the base RIR for the current week (0-indexed)
  let baseRIR = pattern[currentWeek - 1];

  // Special handling for the last week (RIR 0)
  const isLastWeek = currentWeek === pattern.length;
  if (isLastWeek && baseRIR === 0) {
    // Only allow RIR 0 for key sets or if explicitly allowed
    if (isKeySet || allowZeroRIR) {
      return {
        rir: 0,
        isDeloadWeek: false,
        weekType: 'normal',
      };
    } else {
      // For non-key sets on the last week, use RIR 1
      baseRIR = 1;
    }
  }

  // Handle micro-deload for 7-week blocks (week 4)
  if (blockLength === 7 && currentWeek === 4) {
    return {
      rir: baseRIR + 2, // Add 2 RIR for micro-deload
      isDeloadWeek: false,
      weekType: 'micro-deload',
    };
  }

  return {
    rir: baseRIR,
    isDeloadWeek: false,
    weekType: 'normal',
  };
}

/**
 * Get RIR progression for the entire mesocycle block
 */
export function getRIRProgression(
  blockLength: number
): { week: number; rir: number; weekType: string }[] {
  const progression: { week: number; rir: number; weekType: string }[] = [];

  for (let week = 1; week <= blockLength; week++) {
    const result = calculateRIR({
      blockLength,
      currentWeek: week,
      isKeySet: true, // Assume key sets for progression display
      allowZeroRIR: true,
    });

    progression.push({
      week,
      rir: result.rir,
      weekType: result.weekType,
    });
  }

  return progression;
}

/**
 * Calculate RIR for a specific exercise set
 */
export function calculateSetRIR(
  blockLength: number,
  currentWeek: number,
  isKeySet: boolean = false,
  isDeloadWeek: boolean = false
): number {
  const result = calculateRIR({
    blockLength,
    currentWeek,
    isKeySet,
    isDeloadWeek,
    allowZeroRIR: isKeySet,
  });

  return result.rir;
}

/**
 * Get the recommended deload week RIR range
 */
export function getDeloadRIRRange(): { min: number; max: number } {
  return { min: 4, max: 6 };
}

/**
 * Check if a week should be a deload week based on block length
 */
export function shouldBeDeloadWeek(
  blockLength: number,
  currentWeek: number
): boolean {
  // Deload typically happens after the main block
  return currentWeek > blockLength;
}

/**
 * Get micro-deload information for 7-week blocks
 */
export function getMicroDeloadInfo(
  blockLength: number,
  currentWeek: number
): {
  isMicroDeload: boolean;
  volumeReduction: number;
  rirIncrease: number;
} {
  const isMicroDeload = blockLength === 7 && currentWeek === 4;

  return {
    isMicroDeload,
    volumeReduction: isMicroDeload ? 25 : 0, // 20-30% volume reduction
    rirIncrease: isMicroDeload ? 2 : 0,
  };
}
