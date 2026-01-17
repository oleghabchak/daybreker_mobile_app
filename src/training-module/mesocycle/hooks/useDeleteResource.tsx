import { useState } from "react";

type UseDeleteResourceProps = {
  onClose?: (...args: any[]) => Promise<any> | any;
  onCancel?: (...args: any[]) => Promise<any> | any;
  onConfirm?: (...args: any[]) => Promise<any> | any;
};

export const useDeleteResource = ({
  onClose,
  onCancel,
  onConfirm,
}: UseDeleteResourceProps = {}) => {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOnClose = () => {
    setShowDeleteConfirmation(false);
    onClose?.();
  }

  const handleConfirmDelete = async () => {
    setIsDeleting(true);

    try {
      if (onConfirm instanceof Promise) {
        await onConfirm?.();
      } else {
        onConfirm?.();
      }

      setShowDeleteConfirmation(false);
    } catch (error) {
      console.error('Error deleting resource:', error);
    } finally {
      setIsDeleting(false);
    }
  }

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
    onCancel?.();
  };

  return {
    showDeleteConfirmation,
    isDeleting,
    setShowDeleteConfirmation,
    handleOnClose,
    handleConfirmDelete,
    handleCancelDelete,
  }
}