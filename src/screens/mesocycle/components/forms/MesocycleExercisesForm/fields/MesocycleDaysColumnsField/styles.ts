import { StyleSheet } from 'react-native';

import {
  BorderRadius,
  Colors,
  Space,
  Typography,
} from '../../../../../../../constants/theme';

export const styles = StyleSheet.create({
  // Weekday and Column Styles
  weekdaysScrollContent: {
    // Let content define its own height; parent screen should handle overall scroll if needed
    flexGrow: 0,
    minHeight: 300,
    padding: Space[2],
  },
  weekdayColumn: {
    width: 180,
    // Let column expand vertically as children grow; avoid stretching/shrinking conflicts
    flexGrow: 0,
    flexShrink: 0,
    marginRight: Space[4],
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignSelf: 'flex-start',
  },
  weekdayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Space[3],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.background,
    borderTopLeftRadius: BorderRadius.md,
    borderTopRightRadius: BorderRadius.md,
    minHeight: 44,
  },
  deleteWeekdayButton: {
    padding: 2,
    borderRadius: BorderRadius.xs,
  },
  exercisesContainer: {
    // Allow natural height growth; no internal scrolling
    padding: Space[2],
    paddingBottom: Space[4],
  },
  addColumnButton: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Space[3],
    paddingHorizontal: Space[2],
    marginBottom: Space[2],
    minHeight: 50,
  },
  addColumnText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: Space[1],
    fontSize: 11,
  },
  // Day dropdown styles
  dayDropdown: {
    minWidth: 130,
  },
  dayDropdownContainer: {
    flex: 1,
    width: '90%',
  },
  // Add day column button
  addDayColumnButton: {
    // width: 140,
    flex: 1,
    height: '100%',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    minWidth: 100,
  },
  addDayColumnText: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: Space[2],
  },
} as const);
