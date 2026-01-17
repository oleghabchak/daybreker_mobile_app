import { StyleSheet } from 'react-native';

import { Colors, Space, Typography } from '../../../constants/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: Space[4],
    paddingVertical: Space[3],
  },
  switchContainer: {
    marginBottom: Space[4],
  },
  templateList: {
    flex: 1,
  },
  savedTemplateList: {
    paddingVertical: Space[8],
    justifyContent: 'center',
    alignItems: 'center',
  },
  templateItem: {
    gap: Space[1],
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: Space[2],
  },
  templateItemContainer: {},
  templateItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
  },
  templateItemActions: {
    padding: Space[2],
  },
  templateName: {
    ...Typography.bodyBold,
    color: Colors.text,
    fontWeight: '600',
  },
  exerciseMuscleGroup: {
    ...Typography.body,
    color: Colors.text,
    fontSize: 14,
    opacity: 0.7,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.text,
    textAlign: 'center',
    paddingVertical: Space[4],
  },
  exercisesList: {
    height: 200, // Fixed height for consistent layout
    marginBottom: Space[4],
  },
  exercisesListContent: {
    flexGrow: 1,
    paddingVertical: Space[2],
  },
} as const);
