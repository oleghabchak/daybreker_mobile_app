import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { BorderRadius, Colors, Space, Typography } from '../../constants/theme';

import { BaseTooltip, BaseTooltipProps, TooltipPosition } from './BaseTooltip';

export interface ActionItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onPress: () => void;
  variant?: 'default' | 'danger' | 'primary';
  disabled?: boolean;
}

export interface ActionTooltipProps extends Omit<BaseTooltipProps, 'content'> {
  title?: string;
  actions: ActionItem[];
  onActionPress?: (actionId: string) => void;
  position?: TooltipPosition;
}

export const ActionTooltip: React.FC<ActionTooltipProps> = ({
  title,
  actions,
  onActionPress,
  width = 200,
  ...baseProps
}) => {
  const handleActionPress = (action: ActionItem) => {
    if (action.disabled) return;
    action.onPress();
    onActionPress?.(action.id);
  };

  const getActionButtonStyle = (variant: ActionItem['variant']) => {
    switch (variant) {
      case 'danger':
        return [styles.actionButton, styles.dangerActionButton];
      case 'primary':
        return [styles.actionButton, styles.primaryActionButton];
      default:
        return [styles.actionButton, styles.defaultActionButton];
    }
  };

  const getActionTextStyle = (variant: ActionItem['variant']) => {
    switch (variant) {
      case 'danger':
        return [styles.actionText, styles.dangerActionText];
      case 'primary':
        return [styles.actionText, styles.primaryActionText];
      default:
        return [styles.actionText, styles.defaultActionText];
    }
  };

  const content = (
    <View style={styles.content}>
      {title && <Text style={styles.title}>{title}</Text>}

      {actions.map(action => (
        <TouchableOpacity
          key={action.id}
          style={[
            ...getActionButtonStyle(action.variant),
            action.disabled && styles.disabledActionButton,
          ]}
          onPress={() => handleActionPress(action)}
          disabled={action.disabled}
        >
          {action.icon}
          <Text
            style={[
              ...getActionTextStyle(action.variant),
              action.disabled && styles.disabledActionText,
            ]}
          >
            {action.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return <BaseTooltip {...baseProps} content={content} width={width} />;
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  title: {
    ...Typography.bodyMedium,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Space[2],
    textAlign: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Space[2],
    paddingHorizontal: Space[3],
    borderRadius: BorderRadius.sm,
    marginBottom: Space[2],
    gap: Space[2],
  },
  defaultActionButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.background,
  },
  primaryActionButton: {
    backgroundColor: Colors.primary + '10',
    borderWidth: 1,
    borderColor: Colors.primary + '20',
  },
  dangerActionButton: {
    backgroundColor: Colors.error + '10',
    borderWidth: 1,
    borderColor: Colors.error + '20',
  },
  disabledActionButton: {
    opacity: 0.5,
  },
  actionText: {
    ...Typography.caption,
    marginLeft: Space[2],
    fontWeight: '500',
  },
  defaultActionText: {
    color: Colors.text,
  },
  primaryActionText: {
    color: Colors.primary,
  },
  dangerActionText: {
    color: Colors.error,
  },
  disabledActionText: {
    color: Colors.textDisabled,
  },
});

export default ActionTooltip;
