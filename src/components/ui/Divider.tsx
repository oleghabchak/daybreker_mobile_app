import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Space } from '../../constants/theme';

export interface DividerProps {
  color?: string;
  width?: number;
  marginVertical?: number;
  marginHorizontal?: number;
  style?: ViewStyle;
}

export const Divider: React.FC<DividerProps> = ({
  color = Colors.border,
  width = 1,
  marginVertical = Space[3],
  marginHorizontal = 0,
  style,
}) => {
  return (
    <View
      style={[
        styles.divider,
        {
          backgroundColor: color,
          height: width,
          marginVertical,
          marginHorizontal,
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  divider: {
    width: '100%',
  },
});
