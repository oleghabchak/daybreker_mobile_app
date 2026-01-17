import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

import {
  BorderRadius,
  Colors,
  Shadows,
  Space,
  Typography,
} from '../../constants/theme';

export interface SectionCardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  footer?: React.ReactNode;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  title,
  description,
  children,
  style,
  contentStyle,
  footer,
}) => {
  return (
    <View style={[styles.container, style]}>
      {(title || description) && (
        <View style={styles.header}>
          {title && <Text style={styles.title}>{title}</Text>}
          {description && <Text style={styles.description}>{description}</Text>}
        </View>
      )}

      <View style={[styles.content, contentStyle]}>{children}</View>

      {footer && <View style={styles.footer}>{footer}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Space[5],
    ...Shadows.sm,
  },
  header: {
    marginBottom: Space[3],
  },
  title: {
    ...Typography.h3,
    color: Colors.text,
  },
  description: {
    ...Typography.caption,
    color: Colors.textDisabled,
    marginTop: Space[1],
  },
  content: {
    gap: Space[2],
  },
  footer: {
    marginTop: Space[3],
  },
});

export default SectionCard;
