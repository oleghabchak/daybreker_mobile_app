import { Trash2 } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Tag } from '../../../../components/ui/Tag';
import {
  BorderRadius,
  Colors,
  Space,
  Typography,
} from '../../../../constants/theme';
import { ICustomExercise } from '../../../../training-module/exercise/data/interfaces/custom-exercise';

interface CustomExerciseItemProps {
  exercise: ICustomExercise;
  index: number;
  isSelected: boolean;
  onPress: () => void;
  onDelete: () => void;
}

export const CustomExerciseItem: React.FC<CustomExerciseItemProps> = ({
  exercise,
  index,
  isSelected,
  onPress,
  onDelete,
}) => {
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.8))[0];

  useEffect(() => {
    const delay = index * 25;

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim, index]);

  const getExerciseType = () => {
    if (exercise.is_compound) return 'Compound';
    if (exercise.is_unilateral) return 'Unilateral';
    if (exercise.is_machine) return 'Machine';
    return 'Isolation';
  };

  const getMuscleGroup = () => {
    // For custom exercises, we can use tags or create a simple categorization
    if (exercise.tags && exercise.tags.length > 0) {
      return exercise.tags[0];
    }
    return 'Custom';
  };

  return (
    <Animated.View
      style={[
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
        styles.exerciseItem,
      ]}
    >
      <View style={styles.exerciseHeader}>
        <Text style={styles.exerciseName}>{exercise.name}</Text>
        <View style={styles.exerciseDetails}>
          <Tag text={getMuscleGroup()} variant='lightBlue' size='small' />
          <Tag
            text={getExerciseType()}
            variant='custom'
            customBackgroundColor={Colors.secondary + '20'}
            customTextColor={Colors.text}
            size='small'
          />
        </View>
      </View>
      <TouchableOpacity onPress={onDelete}>
        <Trash2 size={20} color={Colors.error} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    padding: Space[2],
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Space[2],
  },
  selectedExerciseItem: {
    borderColor: Colors.lightBlue,
    backgroundColor: Colors.textLink + '10',
  },
  exerciseHeader: {
    flexDirection: 'column',
    gap: Space[1],
  },
  exerciseName: {
    ...Typography.bodyBold,
    color: Colors.text,
    fontWeight: '600',
    fontSize: 16,
  },
  deleteButton: {
    paddingHorizontal: Space[2],
    paddingVertical: Space[1],
  },
  deleteButtonText: {
    color: Colors.error,
  },
  exerciseDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Space[2],
    marginBottom: Space[2],
  },
  exerciseMeta: {},
  metaRow: {
    flexDirection: 'row',
    marginBottom: Space[1],
  },
  metaLabel: {
    color: Colors.textDisabled,
    width: 60,
  },
  metaValue: {
    color: Colors.text,
    fontWeight: '500',
  },
  exerciseDescription: {
    ...Typography.bodyMedium,
    color: Colors.textDisabled,
    lineHeight: 18,
  },
});
