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
import {
  getComplementaryPastel,
  removeUnderscores,
} from '../../../../utils/helpers';

interface AnimatedExerciseItemProps {
  exercise: any;
  index: number;
  isSelected: boolean;
  onPress: () => void;
}

export const AnimatedExerciseItem: React.FC<AnimatedExerciseItemProps> = ({
  exercise,
  index,
  isSelected,
  onPress,
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

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }],
      }}
    >
      <TouchableOpacity
        style={[styles.exerciseItem, isSelected && styles.selectedExerciseItem]}
        onPress={onPress}
      >
        <View style={styles.exerciseHeader}>
          <Text style={styles.exerciseName}>
            {exercise.exercise_display_name_en}
          </Text>
        </View>

        <View style={styles.exerciseDetails}>
          {exercise?.exercise_muscle_groups_simple?.primary?.[0] && (
            <Tag
              text={removeUnderscores(
                exercise.exercise_muscle_groups_simple.primary[0]
              )}
              variant='lightBlue'
              size='small'
            />
          )}
          {exercise?.exercise_primary_movement_pattern && (
            <Tag
              text={removeUnderscores(
                exercise.exercise_primary_movement_pattern
              )}
              variant='custom'
              customBackgroundColor={getComplementaryPastel(Colors.secondary)}
              customTextColor={Colors.text}
              size='small'
            />
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  exerciseItem: {
    borderRadius: BorderRadius.md,
    padding: Space[2],
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedExerciseItem: {
    borderColor: Colors.lightBlue,
    backgroundColor: Colors.textLink + '10',
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Space[1],
  },
  exerciseName: {
    ...Typography.h3,
    color: Colors.text,
    flex: 1,
  },
  exerciseDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Space[2],
  },
});
