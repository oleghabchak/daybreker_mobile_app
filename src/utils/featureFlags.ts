// Feature flags for gradual migration
export const FeatureFlags = {
  useNewDesignSystem: false, // Toggle this to enable new components
  useNewSpacing: false,
  useNewColors: false,
  useUnifiedPermissions: true, // Already implemented
};

// Helper to check feature flags
export const isFeatureEnabled = (flag: keyof typeof FeatureFlags): boolean => {
  return FeatureFlags[flag];
};