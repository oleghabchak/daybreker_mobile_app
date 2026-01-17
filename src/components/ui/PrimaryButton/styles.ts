import { StyleSheet } from 'react-native';

import { Colors, Typography } from '../../../constants/theme';

export const styles = StyleSheet.create({
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  primaryButtonText: {
    ...Typography.bodyBold,
    color: Colors.background,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: Colors.textDisabled,
    borderColor: Colors.textDisabled,
  },
} as const);
