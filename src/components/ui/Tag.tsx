import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { BorderRadius, Colors, Space, Typography } from '../../constants/theme';
import { addOpacity } from '../../utils/helpers';

export interface TagProps {
  text: string;
  variant?:
    | 'primary'
    | 'secondary'
    | 'lightBlue'
    | 'custom'
    | 'grey'
    | 'black'
    | 'outline'
    | 'outlineBlue'
    | 'outlineRed'
    | 'success';
  customBackgroundColor?: string;
  customTextColor?: string;
  size?: 'small' | 'medium' | 'large';
  style?: StyleProp<ViewStyle>;
}

export const Tag: React.FC<TagProps> = ({
  text,
  variant = 'primary',
  customBackgroundColor,
  customTextColor,
  size = 'medium',
  style,
}) => {
  const getBackgroundColor = () => {
    if (customBackgroundColor) return customBackgroundColor;

    switch (variant) {
      case 'primary':
        return Colors.background;
      case 'secondary':
        return Colors.secondary;
      case 'success':
        return Colors.teal;
      case 'lightBlue':
        return Colors.lightBlue;
      case 'grey':
        return Colors.textDisabled;
      case 'black':
        return Colors.text;
      case 'outline':
      case 'outlineBlue':
        return addOpacity(Colors.secondary, 12);
      case 'outlineRed':
        return addOpacity(Colors.error, 12);
      default:
        return Colors.primary;
    }
  };

  const getTextColor = () => {
    if (customTextColor) return customTextColor;

    switch (variant) {
      case 'primary':
        return Colors.text;
      case 'secondary':
        return Colors.textInverse;
      case 'success':
        return Colors.textInverse;
      case 'lightBlue':
        return Colors.text;
      case 'outline':
        return Colors.text;
      case 'outlineBlue':
        return Colors.secondary;
      case 'outlineRed':
        return Colors.error;
      default:
        return Colors.textInverse;
    }
  };

  return (
    <View
      style={[
        {
          ...(style as ViewStyle),
          backgroundColor: getBackgroundColor(),
          ...(variant === 'primary' && {
            borderWidth: 1,
            borderColor: getTextColor(),
          }),
          ...(variant === 'outline' && {
            borderWidth: 1,
            borderColor: getTextColor(),
          }),
          ...(variant === 'outlineBlue' && {
            borderWidth: 1,
            borderColor: Colors.secondary,
          }),
          ...(variant === 'outlineRed' && {
            borderWidth: 1,
            borderColor: Colors.error,
          }),
        },
        styles.tag,
        styles[size],
      ]}
    >
      <Text
        style={[
          styles.tagText,
          styles[`${size}Text`],
          { color: getTextColor() },
        ]}
      >
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  tag: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.full,
  },
  small: {
    paddingHorizontal: Space[1],
    minHeight: 16,
  },
  medium: {
    paddingHorizontal: Space[3],
    minHeight: 20,
  },
  large: {
    paddingHorizontal: Space[4],
    minHeight: 24,
  },

  tagText: {
    ...Typography.smallBold,
    textTransform: 'uppercase',
  },

  smallText: {
    fontSize: 9,
  },
  mediumText: {
    fontSize: 12,
  },
  largeText: {
    fontSize: 14,
  },
});
