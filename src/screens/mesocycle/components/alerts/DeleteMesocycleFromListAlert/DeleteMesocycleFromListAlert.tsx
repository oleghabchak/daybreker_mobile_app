import { FC, useEffect, useMemo } from 'react';

import { ConfirmationAlert } from '../../../../../components/ui';
import { IMesocycleSummary } from '../../../../../training-module/mesocycle/data/interfaces/mesocycle-summary';
import { MesocycleService } from '../../../../../training-module/mesocycle/services/mesocycle-service';
import { useDeleteResource } from '../../../../../training-module/mesocycle/hooks/useDeleteResource';

export type DeleteMesocycleFromListAlertProps<
  ResourceType extends { id: string | number },
> = {
  resource: ResourceType | null;
  onSuccess?: (resourceId: string) => void;
  onCancel?: () => void;
};

export const DeleteMesocycleFromListAlert: FC<
  DeleteMesocycleFromListAlertProps<IMesocycleSummary>
> = ({ resource, onSuccess, onCancel }) => {
  const deleteMesocycle = async () => {
    const response = await MesocycleService.deleteMesocycle(resource!.id);

    if (response.status === 'ok') return Promise.resolve(resource!.id);

    const rejectError =
      response.status !== 'error'
        ? new Error('Unknown response status from deleteMesocycle')
        : response.error;

    return Promise.reject(rejectError);
  };

  const onConfirm = async () => {
    if (!resource) return;

    try {
      const resourceId = await deleteMesocycle();

      onSuccess?.(resourceId);
    } catch (error) {
      console.error('Error deleting mesocycle:', error);
    }
  };

  const {
    isDeleting,
    showDeleteConfirmation,
    setShowDeleteConfirmation,
    handleOnClose,
    handleConfirmDelete,
    handleCancelDelete,
  } = useDeleteResource({
    onConfirm,
    onCancel,
    onClose: onCancel,
  });

  const memoResource = useMemo(() => resource, [resource]);

  useEffect(() => {
    setShowDeleteConfirmation(!!memoResource);
  }, [memoResource]);

  return (
    <ConfirmationAlert
      isVisible={showDeleteConfirmation}
      onConfirm={handleConfirmDelete}
      onCancel={handleCancelDelete}
      onClose={handleOnClose}
      title='Delete Mesocycle'
      message={`Are you sure you want to delete "${resource?.name}"? This action cannot be undone.`}
      confirmText='Delete'
      cancelText='Cancel'
      variant='danger'
      loading={isDeleting}
      disabled={isDeleting}
    />
  );
};
