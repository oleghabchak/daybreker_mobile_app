import { SquarePen, RefreshCcw, Trash2 } from 'lucide-react-native';
import React from 'react';

import { Colors } from '../../constants/theme';
import { IWorkoutExercise } from '../../training-module/workout/data/interfaces/workout-exercise';

import { ActionItem, ActionTooltip } from './ActionTooltip';
import { TooltipPosition } from './BaseTooltip';

export interface ExerciseActionTooltipProps {
  visible: boolean;
  onClose: () => void;
  onSwapExercise: () => void;
  onDeleteExercise: () => void;
  onAddNotes: () => void;
  exercise: IWorkoutExercise;
  children: React.ReactNode;
  position?: TooltipPosition;
}

export const ExerciseActionTooltip: React.FC<ExerciseActionTooltipProps> = ({
  visible,
  onClose,
  onSwapExercise,
  onDeleteExercise,
  onAddNotes,
  children,
  position = 'top',
}) => {
  const actions: ActionItem[] = [
    {
      id: 'swap',
      label: 'Swap Exercise',
      icon: <RefreshCcw size={16} color={Colors.text} />,
      onPress: onSwapExercise,
      variant: 'default',
    },
    {
      id: 'delete',
      label: 'Delete Exercise',
      icon: <Trash2 size={16} color={Colors.error} />,
      onPress: onDeleteExercise,
      variant: 'danger',
    },
    {
      id: 'addNotes',
      label: 'Add Notes',
      icon: <SquarePen size={16} color={Colors.text} />,
      onPress: onAddNotes,
      variant: 'default',
    },
  ];

  return (
    <ActionTooltip
      isVisible={visible}
      onHide={onClose}
      title='Exercise Actions'
      actions={actions}
      position={position}
      width={200}
    >
      {children}
    </ActionTooltip>
  );
};
