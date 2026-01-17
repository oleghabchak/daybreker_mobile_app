import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Colors, Space, Typography } from '../../constants/theme';

import { BaseTooltip, BaseTooltipProps, TooltipPosition } from './BaseTooltip';

export interface ModalTooltipProps extends Omit<BaseTooltipProps, 'content'> {
  title?: string;
  content: React.ReactNode;
  showCloseButton?: boolean;
  onClose?: () => void;
  headerStyle?: any;
  contentStyle?: any;
  position?: TooltipPosition;
}

export const ModalTooltip: React.FC<ModalTooltipProps> = ({
  title,
  content,
  showCloseButton = false,
  onClose,
  headerStyle,
  contentStyle,
  width = 280,
  height = 200,
  ...baseProps
}) => {
  const modalContent = (
    <View style={styles.container}>
      {(title || showCloseButton) && (
        <View style={[styles.header, headerStyle]}>
          {title && <Text style={styles.title}>{title}</Text>}
          {showCloseButton && (
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <View style={[styles.content, contentStyle]}>{content}</View>
    </View>
  );

  return (
    <BaseTooltip
      {...baseProps}
      content={modalContent}
      width={width}
      height={height}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Space[3],
  },
  title: {
    ...Typography.h3,
    fontWeight: '600',
    color: Colors.text,
  },
  closeButton: {
    padding: Space[1],
    minWidth: 24,
    minHeight: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: Colors.textDisabled,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
});

export default ModalTooltip;
