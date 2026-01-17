// Interfaces
// Legacy exports (keeping for backward compatibility)
import HealthKitService from '../../services/HealthKitService';

import { TerraDataRetrievalService } from './services/terra-data-service';
import TerraSDKService from './services/terra-SDK-service';

export * from './data/interfaces/terra-daily-data';
export * from './data/interfaces/terra-activity-data';

// Types
export * from './data/types/terra-data-types';

// Repository
export { TerraDataRepository } from './repositories/terra-data-repository';

// Services
export { TerraDataService } from './services/terra-data-management-service';

// Store
export { useTerraDataStore } from './stores/terra-data-store';
export type { TerraDataStore } from './stores/terra-data-store';

export { TerraSDKService, HealthKitService, TerraDataRetrievalService };
