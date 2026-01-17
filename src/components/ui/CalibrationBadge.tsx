import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BorderRadius, Colors, Space, Typography } from '../../constants/theme';

interface CalibrationBadgeProps {
  children: string;
  style?: any;
}

export const CalibrationBadge: React.FC<CalibrationBadgeProps> = ({
  children,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.text}>{children}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFE5E5', // Light red background similar to the input field
    borderColor: Colors.error, // #E85C4A - same as the red input field
    borderWidth: 1,
    borderRadius: BorderRadius.full, // Same rounded shape as NumberInput
    paddingHorizontal: Space[2], // 8px horizontal padding
    paddingVertical: Space[1], // 4px vertical padding
    alignSelf: 'flex-start', // Only take up as much space as needed
    minHeight: 28, // Slightly smaller than the 36px input field
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Space[2], // 8px vertical spacing below the badge
  },
  text: {
    ...Typography.bodyBold,
    color: Colors.error, // #E85C4A - same red color as the border
    fontSize: 14, // Slightly smaller than the input text
    textAlign: 'center',
  },
});

export default CalibrationBadge;
