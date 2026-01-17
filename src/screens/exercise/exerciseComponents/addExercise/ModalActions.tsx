import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Button, ConfirmationAlert } from '../../../../components/ui';
import { Colors, Space, Typography } from '../../../../constants/theme';

interface ModalActionsProps {
  isFormValid: boolean;
  isMesocycleLoading: boolean;
  swapExercise?: any;
  onClose: () => void;
  onAddExercise: () => void;
  isConfirmationAlertVisible: boolean;
  onConfirmSwap: () => void;
  onCancelSwap: () => void;
  onCloseConfirmation: () => void;
}

export const ModalActions: React.FC<ModalActionsProps> = ({
  isFormValid,
  isMesocycleLoading,
  swapExercise,
  onClose,
  onAddExercise,
  isConfirmationAlertVisible,
  onConfirmSwap,
  onCancelSwap,
  onCloseConfirmation,
}) => {
  return (
    <>
      <View style={styles.modalActions}>
        <Button variant='secondary' onPress={onClose}>
          <Text style={styles.secondaryButtonText}>Cancel</Text>
        </Button>
        <Button
          style={[styles.primaryButton, !isFormValid && styles.disabledButton]}
          onPress={swapExercise ? onConfirmSwap : onAddExercise}
          disabled={!isFormValid || isMesocycleLoading}
        >
          {isMesocycleLoading ? (
            <ActivityIndicator size='small' color={Colors.background} />
          ) : (
            <Text
              style={[
                styles.primaryButtonText,
                !isFormValid && styles.disabledButtonText,
              ]}
            >
              {swapExercise ? 'Swap' : 'Add'}
            </Text>
          )}
        </Button>
      </View>
      <ConfirmationAlert
        isVisible={isConfirmationAlertVisible}
        onConfirm={onConfirmSwap}
        onClose={onCloseConfirmation}
        onCancel={onCancelSwap}
        message='Are you want to swap exercise only for workout or for whole mesocycle?'
        confirmText='Mesocycle'
        cancelText='Workout'
        variant='warning'
      />
    </>
  );
};

const styles = StyleSheet.create({
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Space[3],
    paddingHorizontal: Space[3],
    paddingVertical: Space[2],
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  secondaryButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  disabledButton: {
    backgroundColor: Colors.textDisabled,
    borderColor: Colors.textDisabled,
  },
  primaryButtonText: {
    ...Typography.bodyBold,
    color: Colors.background,
    fontWeight: '600',
  },
  secondaryButtonText: {
    ...Typography.bodyBold,
    color: Colors.background,
    fontWeight: '600',
  },
  disabledButtonText: {
    color: Colors.border,
  },
});
