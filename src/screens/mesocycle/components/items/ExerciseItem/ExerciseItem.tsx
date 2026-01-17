import { Dumbbell, Tag } from 'lucide-react-native';
import { FC, useState } from 'react';
import { View, Text } from 'react-native';

import { Divider } from '../../../../../components';
import { Colors, Space } from '../../../../../constants/theme';
import { IExerciseLibraryData } from '../../../../../training-module/exercise';
import { IMesocycleTemplateExercise } from '../../../../../training-module/mesocycle-templates';

import { styles } from './styles';

export type ExerciseItemProps = {
  exercise: IMesocycleTemplateExercise;
};
type ExerciseDataMap = Map<string, IExerciseLibraryData>;

export const ExerciseItem: FC<ExerciseItemProps> = ({ exercise }) => {
  const [exerciseDataMap, setExerciseDataMap] = useState<ExerciseDataMap>(
    new Map()
  );

  const exerciseData = exerciseDataMap.get(exercise.exercise_id);
  const exerciseName = exerciseData?.exercise_display_name_en || 'Loading...';
  const muscleGroups = exerciseData?.exercise_muscle_groups_simple;

  const primaryMuscles = muscleGroups?.primary || [];
  const muscleGroupsToDisplay =
    primaryMuscles.length > 0
      ? primaryMuscles
      : [exercise.exercise_muscle_group];

  return (
    <View style={styles.exerciseItem}>
      <Divider />
      <View
        style={{ flexDirection: 'row', gap: Space[4], alignItems: 'center' }}
      >
        <Dumbbell size={20} color={Colors.secondary} />
        <View
          style={{
            flexDirection: 'column',
            alignItems: 'flex-start',
            flex: 1,
          }}
        >
          <Text style={styles.exerciseName}>{exerciseName}</Text>
          <View style={styles.muscleGroupTags}>
            {muscleGroupsToDisplay.map((muscleGroup: string, index: number) => (
              <Tag
                key={index}
                variant='black'
                text={muscleGroup}
                style={styles.muscleGroupTag}
              />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};
