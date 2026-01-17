import { Trash2 } from 'lucide-react-native';
import React from 'react';

import { Colors } from '../../constants';

import { ActionTooltip, ActionItem } from './ActionTooltip';
import { TooltipPosition } from './BaseTooltip';

export interface TemplateActionTooltipProps {
  visible: boolean;
  onClose: () => void;
  onDeleteTemplate: () => void;
  templateName?: string;
  position?: TooltipPosition;
  width?: number;
  children: React.ReactNode;
}

export const TemplateActionTooltip: React.FC<TemplateActionTooltipProps> = ({
  visible,
  onClose,
  onDeleteTemplate,
  templateName = 'Template',
  position = 'bottom-right',
  width = 200,
  children,
}) => {
  const actions: ActionItem[] = [
    {
      id: 'delete',
      label: 'Delete Template',
      icon: <Trash2 size={16} color={Colors.error} />,
      onPress: () => {
        onDeleteTemplate();
        onClose();
      },
      variant: 'danger',
    },
  ];

  return (
    <ActionTooltip
      isVisible={visible}
      onHide={onClose}
      title={`${templateName} Actions`}
      actions={actions}
      position={position}
      width={width}
    >
      {children}
    </ActionTooltip>
  );
};
