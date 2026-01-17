import { Edit3, Trash2, Copy, Play, SquarePen } from 'lucide-react-native';
import React from 'react';

import { Colors } from '../../constants';
import { IMesocycleSummary } from '../../training-module/mesocycle/data/interfaces/mesocycle-summary';

import { ActionTooltip, ActionItem } from './ActionTooltip';
import { TooltipPosition } from './BaseTooltip';

export interface MesocycleActionTooltipProps {
  visible: boolean;
  onClose: () => void;
  onEditMesocycle: () => void;
  onDeleteMesocycle: () => void;
  onCopyMesocycle: () => void;
  onActivateMesocycle: () => void;
  onAddNote: () => void;
  mesocycle: IMesocycleSummary;
  children: React.ReactNode;
  position?: TooltipPosition;
}

export const MesocycleActionTooltip: React.FC<MesocycleActionTooltipProps> = ({
  visible,
  onClose,
  onEditMesocycle,
  onDeleteMesocycle,
  onCopyMesocycle,
  onActivateMesocycle,
  onAddNote,
  children,
  position = 'top',
}) => {
  const actions: ActionItem[] = [
    {
      id: 'activate',
      label: 'Activate Mesocycle',
      icon: <Play size={16} color={Colors.primary} />,
      onPress: () => {
        onActivateMesocycle();
        onClose();
      },
      variant: 'primary',
    },
    {
      id: 'edit',
      label: 'Edit Mesocycle',
      icon: <Edit3 size={16} color={Colors.text} />,
      onPress: () => {
        onEditMesocycle();
        onClose();
      },
      variant: 'default',
    },
    {
      id: 'copy',
      label: 'Copy Mesocycle',
      icon: <Copy size={16} color={Colors.text} />,
      onPress: () => {
        onCopyMesocycle();
        onClose();
      },
      variant: 'default',
    },
    {
      id: 'addNote',
      label: 'Add Note',
      icon: <SquarePen size={16} color={Colors.text} />,
      onPress: () => {
        onAddNote();
        onClose();
      },
      variant: 'default',
    },
    {
      id: 'delete',
      label: 'Delete Mesocycle',
      icon: <Trash2 size={16} color={Colors.error} />,
      onPress: () => {
        onDeleteMesocycle();
        onClose();
      },
      variant: 'danger',
    },
  ];

  return (
    <ActionTooltip
      isVisible={visible}
      onHide={onClose}
      title='Mesocycle Actions'
      actions={actions}
      position={position}
      width={200}
    >
      {children}
    </ActionTooltip>
  );
};
