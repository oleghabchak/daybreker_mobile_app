import { Plus, SkipForward, Trash2 } from 'lucide-react-native';
import React, { useState } from 'react';

import { Colors } from '../../constants/theme';

import { ActionTooltip, ActionItem } from './ActionTooltip';
import { TooltipPosition } from './BaseTooltip';

export interface SetActionTooltipProps {
  onAddSet?: () => void;
  onSkipSet?: () => void;
  onDeleteSet?: () => void;
  position?: TooltipPosition;
  disabled?: boolean;
  onShow?: () => void;
  onHide?: () => void;
  children: React.ReactNode;
}

export const SetActionTooltip: React.FC<SetActionTooltipProps> = ({
  onAddSet,
  onSkipSet,
  onDeleteSet,
  position = 'top',
  disabled = false,
  onShow,
  onHide,
  children,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const handleShow = () => {
    setIsVisible(true);
    onShow?.();
  };

  const handleHide = () => {
    setIsVisible(false);
    onHide?.();
  };

  const actions: ActionItem[] = [
    {
      id: 'add',
      label: 'Add Set',
      icon: <Plus size={16} color={Colors.primary} />,
      onPress: () => {
        onAddSet?.();
        handleHide();
      },
      variant: 'primary',
    },
    {
      id: 'skip',
      label: 'Skip Set',
      icon: <SkipForward size={16} color={Colors.text} />,
      onPress: () => {
        onSkipSet?.();
        handleHide();
      },
      variant: 'default',
    },
    {
      id: 'delete',
      label: 'Delete Set',
      icon: <Trash2 size={16} color={Colors.error} />,
      onPress: () => {
        onDeleteSet?.();
        handleHide();
      },
      variant: 'danger',
    },
  ];

  return (
    <ActionTooltip
      isVisible={isVisible}
      onShow={handleShow}
      onHide={handleHide}
      title='Set Actions'
      actions={actions}
      position={position}
      disabled={disabled}
      width={200}
    >
      {children}
    </ActionTooltip>
  );
};

export default SetActionTooltip;
