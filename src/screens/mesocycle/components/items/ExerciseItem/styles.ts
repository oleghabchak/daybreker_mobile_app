import { StyleSheet } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';

import { Space, Typography } from '../../../../../../constants/theme';

export const styles = StyleSheet.create({
  exerciseItem: {
    gap: Space[1],
    flexDirection: 'column',
    alignItems: 'flex-start',
    paddingVertical: Space[2],
  },
  exerciseName: {
    ...Typography.bodyBold,
    color: Colors.text,
    fontWeight: '600',
    fontSize: 16,
  },
  muscleGroupTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Space[1],
    marginTop: Space[1],
  },
  muscleGroupTag: {
    marginRight: Space[1],
    marginBottom: Space[1],
  },
});
