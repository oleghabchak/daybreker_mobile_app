import { StyleSheet } from 'react-native';

import {
  Colors,
  Space,
  Typography,
} from '../../../../../../../constants/theme';

export const styles = StyleSheet.create({
  // Name Input Styles
  nameInputContainer: {
    paddingHorizontal: Space[1],
    paddingVertical: Space[4],
    // borderBottomWidth: 1,
    // borderBottomColor: Colors.border,
  },
  nameInputLabel: {
    ...Typography.bodyBold,
    color: Colors.text,
    marginBottom: Space[2],
    fontSize: 14,
    flexShrink: 1,
  },

  // Tooltip rich content styles
  tooltipContent: {
    paddingTop: Space[1],
  },
  tooltipSection: {
    marginBottom: Space[3],
  },
  tooltipSectionTitle: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Space[1],
  },
  tooltipSectionText: {
    ...Typography.caption,
    color: Colors.textDisabled,
    lineHeight: 20,
  },
  tooltipList: {
    gap: Space[1],
    marginTop: Space[1],
  },
  tooltipListItem: {
    ...Typography.caption,
    color: Colors.textDisabled,
    lineHeight: 20,
  },
  tooltipCtas: {
    marginTop: Space[1],
    paddingTop: Space[2],
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Space[1],
  },
  tooltipCta: {
    ...Typography.bodyMedium,
    color: Colors.text,
  },

  customNameText: {
    ...Typography.caption,
    color: Colors.textDisabled,
    marginBottom: Space[2],
    fontSize: 12,
  },
} as const);
