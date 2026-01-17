import { StyleSheet } from 'react-native';

import { Colors, Typography } from '../../../constants/theme';

export const styles = StyleSheet.create({
  secondaryButtonText: {
    ...Typography.bodyBold,
    color: Colors.background,
    fontWeight: '600',
  },
} as const);
