import { StyleSheet } from 'react-native';

import {
  BorderRadius,
  Colors,
  Space,
  Typography,
} from '../../../../constants/theme';
import { addOpacity } from '../../../../utils/helpers';

const CALIBRATION_RED = Colors.error;
const VALIDATION_BLUE = Colors.secondary;

export const styles = StyleSheet.create({
  container: {},
  weightInput: {
    width: 100,
    color: Colors.text,
  },
  weightColumn: {
    width: 140,
  },
  badgeContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: Space[1],
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space[1],
    backgroundColor: CALIBRATION_RED,
    paddingHorizontal: Space[2],
    paddingVertical: Space[1],
    borderRadius: BorderRadius.full,
    shadowColor: addOpacity(CALIBRATION_RED, 40),
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  badgeText: {
    ...Typography.smallBold,
    color: Colors.background,
    letterSpacing: 0.6,
  },
  badgeTooltipTrigger: {
    marginLeft: Space[1],
  },
  tooltipContentCompact: {
    gap: Space[2],
  },
  tooltipTitleCompact: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: Colors.text,
  },
  tooltipTextCompact: {
    ...Typography.caption,
    color: Colors.text,
    lineHeight: 18,
  },
  tooltipBoldText: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.text,
  },
  setsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  setsOptionsButton: {
    marginTop: 14,
    marginLeft: -3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setNumberContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Space[2],
  },
  setNumberText: {
    ...Typography.smallBold,
    color: Colors.text,
    textAlign: 'center',
  },

  iconColumn: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Space[3],
  },
  setsColumn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Space[2],
    marginBottom: Space[1],
  },
  setsHeaderText: {
    ...Typography.smallBold,
    textTransform: 'uppercase',
    color: Colors.textDisabled,
    marginBottom: Space[1],
    textAlign: 'center',
    width: 40,
  },
  setsRirText: {
    ...Typography.smallBold,
    color: Colors.textDisabled,
    marginTop: Space[1],
    position: 'absolute',
    bottom: -14,
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  setsTooltipText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space[2],
    ...Typography.caption,
    color: Colors.background,
    textTransform: 'uppercase',
  },
  setsTooltipContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Space[6],
    borderRadius: BorderRadius.sm,
    height: 110,
    width: 150,
  },
  tooltipButton: {
    marginTop: Space[1],
    gap: Space[2],
    marginBottom: Space[2],
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelWithTooltip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
  },
  tooltipInlineIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  tooltipInlineIconReps: {
    marginTop: -2,
  },
  tooltipContent: {
    paddingTop: Space[1],
  },
  tooltipSection: {
    marginBottom: Space[3],
  },
  tooltipMainTitle: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Space[3],
    textAlign: 'center',
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
  tooltipDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: Space[3],
  },
  calibrationInputContainer: {
    borderColor: CALIBRATION_RED,
    backgroundColor: addOpacity(CALIBRATION_RED, 12),
  },
  validationInputContainer: {
    borderColor: VALIDATION_BLUE,
    backgroundColor: addOpacity(VALIDATION_BLUE, 12),
  },
  calibrationInputText: {
    color: Colors.text,
  },
  calibrationMeasurementText: {
    color: Colors.text,
  },
  weightHelperText: {
    ...Typography.smallBold,
    color: Colors.textDisabled,
    marginTop: Space[1],
    position: 'absolute',
    bottom: -6,
    left: 0,
    right: 0,
    textAlign: 'center',
  },
});
