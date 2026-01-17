import { StyleSheet } from 'react-native';

import {
  BorderRadius,
  Colors,
  Space,
  Typography,
} from '../../../../../constants/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    height: 75,
    paddingHorizontal: Space[3],
    paddingBottom: Space[4],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Space[1],
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: Space[3],
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Space[3],
    paddingVertical: Space[4],
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  disabledButton: {
    backgroundColor: Colors.textDisabled,
    borderColor: Colors.textDisabled,
  },
  primaryButtonText: {
    ...Typography.bodyBold,
    color: Colors.background,
    fontWeight: '600',
  },
  secondaryButtonText: {
    ...Typography.bodyBold,
    color: Colors.background,
    fontWeight: '600',
  },
  // Weekday and Column Styles
  weekdaysScrollContent: {
    flexGrow: 1,
    minHeight: 300,
    padding: Space[2],
  },
  weekdayColumn: {
    width: 180,
    flex: 1,
    marginRight: Space[4],
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
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
    flex: 1,
    flexGrow: 1,
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
  placeholderText: {
    color: Colors.secondary,
    fontStyle: 'italic',
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
  customNameText: {
    ...Typography.caption,
    color: Colors.textDisabled,
    marginBottom: Space[2],
    fontSize: 12,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: Space[2],
  },

  // Weeks Selection Styles
  weeksSelectionContainer: {
    paddingVertical: Space[4],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  weeksSelectionLabel: {
    ...Typography.bodyBold,
    color: Colors.text,
    marginBottom: Space[3],
    fontSize: 14,
    flexShrink: 1,
  },
  weeksButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Space[2],
  },
  weekButton: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    paddingVertical: Space[3],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  weekButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  weekButtonText: {
    ...Typography.bodyBold,
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  weekButtonTextSelected: {
    color: Colors.background,
  },
  // Training days per week
  trainingDaysContainer: {
    paddingVertical: Space[4],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  trainingDaysLabel: {
    ...Typography.bodyBold,
    color: Colors.text,
    marginBottom: Space[3],
    fontSize: 14,
    flexShrink: 1,
  },
  // Available days grid
  availableDaysContainer: {
    paddingVertical: Space[4],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  availableDaysLabel: {
    ...Typography.bodyBold,
    color: Colors.text,
    marginBottom: Space[3],
    fontSize: 14,
  },
  dayChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Space[2],
  },
  dayChip: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.full,
    paddingVertical: Space[2],
    paddingHorizontal: Space[3],
    minWidth: 48,
    alignItems: 'center',
  },
  dayChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  dayChipText: {
    ...Typography.bodyBold,
    color: Colors.text,
    fontSize: 12,
  },
  dayChipTextSelected: {
    color: Colors.background,
  },
  // Split preference cards
  splitPreferenceContainer: {
    paddingVertical: Space[4],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  splitPreferenceLabel: {
    ...Typography.bodyBold,
    color: Colors.text,
    marginBottom: Space[3],
    fontSize: 14,
  },
  splitCardsContainer: {
    gap: Space[2],
  },
  // Deprecated large cards replaced with compact grid tiles
  splitGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Space[2],
  },
  splitTile: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    paddingVertical: Space[3],
    paddingHorizontal: Space[4],
    minWidth: '48%',
  },
  splitTileSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  splitTileTitle: {
    ...Typography.bodyBold,
    color: Colors.text,
    textAlign: 'center',
  },
  splitTileTitleSelected: {
    color: Colors.background,
  },
  // Session duration
  sessionDurationContainer: {
    paddingVertical: Space[4],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Space[2],
  },
  sessionDurationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sessionDurationLabel: {
    ...Typography.bodyBold,
    color: Colors.text,
    fontSize: 14,
  },
  // Goal Selection Styles
  goalSelectionContainer: {
    paddingHorizontal: Space[3],
    paddingVertical: Space[4],
  },
  goalSelectionLabel: {
    ...Typography.bodyBold,
    color: Colors.text,
    marginBottom: Space[3],
    fontSize: 14,
    flexShrink: 1,
  },
  goalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Space[2],
  },
  goalSelectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: Space[2],
  },
  goalSelectionHint: {
    ...Typography.caption,
    color: Colors.textDisabled,
    marginTop: Space[1],
    marginBottom: Space[2],
  },
  goalButton: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    paddingVertical: Space[3],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  goalButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  goalButtonText: {
    ...Typography.bodyBold,
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  goalButtonTextSelected: {
    color: Colors.background,
  },
  // Muscle group button styles
  muscleButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Space[2],
    justifyContent: 'space-between',
  },
  muscleButton: {
    width: '30%', // 3 buttons per row with gaps
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingVertical: Space[3],
    paddingHorizontal: Space[2],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  muscleButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  muscleButtonText: {
    ...Typography.bodyMedium,
    color: Colors.text,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 16,
  },
  muscleButtonTextSelected: {
    color: Colors.background,
    fontWeight: '700',
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
  tooltipCtaEmphasis: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: Colors.text,
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
  emphasisSlotsContainer: {
    gap: Space[2],
    marginBottom: Space[4],
  },
  emphasisSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space[3],
    paddingVertical: Space[3],
    paddingHorizontal: Space[4],
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
    minHeight: 52,
  },
  emphasisSlotNumber: {
    ...Typography.bodyBold,
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '700',
    minWidth: 20,
  },
  emphasisSlotText: {
    ...Typography.bodyMedium,
    color: Colors.textDisabled,
    flex: 1,
    fontSize: 15,
    fontStyle: 'italic',
  },
  emphasisSlotTextSelected: {
    color: Colors.text,
    fontStyle: 'normal',
    fontWeight: '600',
  },
} as const);
