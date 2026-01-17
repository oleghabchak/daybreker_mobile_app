import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Custom hook that debounces a value
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds
 * @returns The debounced value
 */
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Enhanced hook for managing data persistence with debouncing
export const usePendingChanges = (saveDelay: number = 2000) => {
  const pendingChangesRef = useRef<
    Map<
      string,
      {
        updates: any;
        saveFunction: Function;
        timestamp: number;
      }
    >
  >(new Map());

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Debounced save function
  const debouncedSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      if (pendingChangesRef.current.size > 0) {
        setIsSaving(true);
        console.log('💾 Auto-saving pending changes...');

        const savePromises = Array.from(
          pendingChangesRef.current.entries()
        ).map(async ([setId, change]) => {
          try {
            await change.saveFunction(setId, change.updates);
            console.log('✅ Auto-saved change for set:', setId);
            return { success: true, setId };
          } catch (error) {
            console.error(
              '❌ Failed to auto-save change for set:',
              setId,
              error
            );
            return { success: false, setId, error };
          }
        });

        const results = await Promise.allSettled(savePromises);

        // Clear successfully saved changes
        results.forEach((result, index) => {
          if (result.status === 'fulfilled' && result.value.success) {
            const setId = Array.from(pendingChangesRef.current.keys())[index];
            pendingChangesRef.current.delete(setId);
          }
        });

        setIsSaving(false);
      }
    }, saveDelay) as unknown as NodeJS.Timeout;
  }, [saveDelay]);

  // Queue change for saving with debouncing
  const queueChange = useCallback(
    (setId: string, updates: any, saveFunction: Function) => {
      pendingChangesRef.current.set(setId, {
        updates,
        saveFunction,
        timestamp: Date.now(),
      });
      console.log('📝 Queued change for set:', setId, updates);
      debouncedSave();
    },
    [debouncedSave]
  );

  // Force save all pending changes immediately
  const forceSave = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (pendingChangesRef.current.size > 0) {
      setIsSaving(true);
      console.log('🚀 Force saving all pending changes...');

      const savePromises = Array.from(pendingChangesRef.current.entries()).map(
        async ([setId, change]) => {
          try {
            await change.saveFunction(setId, change.updates);
            console.log('✅ Force saved change for set:', setId);
            return { success: true, setId };
          } catch (error) {
            console.error(
              '❌ Failed to force save change for set:',
              setId,
              error
            );
            return { success: false, setId, error };
          }
        }
      );

      await Promise.allSettled(savePromises);
      pendingChangesRef.current.clear();
      setIsSaving(false);
    }
  }, []);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      // Force save on unmount (synchronously if possible)
      if (pendingChangesRef.current.size > 0) {
        console.log('🔄 Component unmounting, saving pending changes...');

        pendingChangesRef.current.forEach(async (change, setId) => {
          try {
            await change.saveFunction(setId, change.updates);
            console.log('✅ Saved pending change on unmount for set:', setId);
          } catch (error) {
            console.error(
              '❌ Failed to save pending change on unmount:',
              setId,
              error
            );
          }
        });
      }
    };
  }, []);

  return {
    queueChange,
    forceSave,
    isSaving,
    hasPendingChanges: pendingChangesRef.current.size > 0,
  };
};

// Additional utility for batch operations
export const useBatchSave = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const batchSave = useCallback(
    async (operations: { id: string; data: any; saveFunction: Function }[]) => {
      setIsProcessing(true);
      console.log('📦 Starting batch save operation...');

      try {
        const results = await Promise.allSettled(
          operations.map(async ({ id, data, saveFunction }) => {
            try {
              await saveFunction(id, data);
              return { success: true, id };
            } catch (error) {
              console.error(`❌ Batch save failed for ${id}:`, error);
              return { success: false, id, error };
            }
          })
        );

        const successCount = results.filter(
          r => r.status === 'fulfilled' && r.value.success
        ).length;

        console.log(
          `✅ Batch save completed: ${successCount}/${operations.length} successful`
        );
        return results;
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  return { batchSave, isProcessing };
};
