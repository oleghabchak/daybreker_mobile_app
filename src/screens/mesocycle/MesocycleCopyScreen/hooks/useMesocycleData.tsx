import { useState, useEffect } from 'react';

import { MesocycleService } from '../../../../training-module/mesocycle/services/mesocycle-service';
import { ComprehensiveMesocycleData } from '../../../../types/mesocycle_types';

export interface UseMesocycleDataResult {
  mesocycleData: ComprehensiveMesocycleData | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Simple hook to fetch comprehensive mesocycle data by ID
 */
export const useMesocycleData = (
  mesocycleId: string | null
): UseMesocycleDataResult => {
  const [mesocycleData, setMesocycleData] =
    useState<ComprehensiveMesocycleData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mesocycleId) {
      setMesocycleData(null);
      setError(null);
      return;
    }

    const fetchMesocycleData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response =
          await MesocycleService.getMesocyclesWithSetsById(mesocycleId);

        if (response.status === 'error') {
          throw new Error(
            response.error?.message || 'Failed to fetch mesocycle data'
          );
        }

        if (!response.data) {
          throw new Error('Mesocycle not found');
        }

        setMesocycleData(response.data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        setMesocycleData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMesocycleData();
  }, [mesocycleId]);

  return {
    mesocycleData,
    isLoading,
    error,
  };
};
