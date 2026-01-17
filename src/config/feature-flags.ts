/**
 * Feature flags for gradual rollout and A/B testing
 */

export interface FeatureFlags {
  calibrationWeek: boolean;
  calibrationWeekRolloutPercentage: number;
  calibrationWeekBetaUsers: string[];
}

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  calibrationWeek: true, // Enabled for development
  calibrationWeekRolloutPercentage: 100, // 100% rollout
  calibrationWeekBetaUsers: []
};

export class FeatureFlagService {
  private static flags: FeatureFlags = DEFAULT_FEATURE_FLAGS;

  static setFlags(flags: Partial<FeatureFlags>): void {
    this.flags = { ...this.flags, ...flags };
  }

  static isCalibrationWeekEnabled(userId?: string): boolean {
    // Check if globally enabled
    if (!this.flags.calibrationWeek) {
      return false;
    }

    // If no userId provided, allow for development/testing
    if (!userId) {
      return this.flags.calibrationWeekRolloutPercentage >= 100;
    }

    // Check beta users
    if (this.flags.calibrationWeekBetaUsers.includes(userId)) {
      return true;
    }

    // Check rollout percentage
    if (this.flags.calibrationWeekRolloutPercentage > 0) {
      // Simple hash-based rollout
      const hash = this.hashUserId(userId);
      return hash < this.flags.calibrationWeekRolloutPercentage;
    }

    return false;
  }

  private static hashUserId(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) % 100;
  }
}
