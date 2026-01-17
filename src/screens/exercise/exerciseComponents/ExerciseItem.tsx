import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Colors, Space, Typography } from '../../../constants/theme';

export interface ExerciseItemProps {
  exercise: {
    exercise_uid: string;
    exercise_display_name_en: string;
    exercise_primary_movement_pattern: string;
    exercise_implement_primary: string;
    exercise_muscle_groups_simple: string[];
    exercise_coordination_complexity: string;
    exercise_mechanics_type: string;
    exercise_keywords: string[];
    exercise_tags: string[];
  };
  index: number;
  onPress?: (exercise: ExerciseItemProps['exercise']) => void;
  showDetails?: boolean;
}

export const ExerciseItem: React.FC<ExerciseItemProps> = ({
  exercise,
  index,
  onPress,
  showDetails = false,
}) => {
  const handlePress = () => {
    if (onPress) {
      onPress(exercise);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, onPress && styles.clickable]}
      onPress={handlePress}
      disabled={!onPress}
    >
      <View style={styles.header}>
        <Text style={styles.index}>{index + 1}.</Text>
        <Text style={styles.name}>{exercise.exercise_display_name_en}</Text>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Pattern:</Text>
          <Text style={styles.value}>
            {exercise.exercise_primary_movement_pattern}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Equipment:</Text>
          <Text style={styles.value}>
            {exercise.exercise_implement_primary}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Difficulty:</Text>
          <Text style={styles.value}>
            {exercise.exercise_coordination_complexity}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Mechanics:</Text>
          <Text style={styles.value}>{exercise.exercise_mechanics_type}</Text>
        </View>

        {showDetails && (
          <>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Muscles:</Text>
              <Text style={styles.value}>
                {exercise.exercise_muscle_groups_simple.join(', ')}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.label}>Keywords:</Text>
              <Text style={styles.value}>
                {exercise.exercise_keywords.slice(0, 3).join(', ')}
                {exercise.exercise_keywords.length > 3 && '...'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.label}>Tags:</Text>
              <Text style={styles.value}>
                {exercise.exercise_tags.slice(0, 3).join(', ')}
                {exercise.exercise_tags.length > 3 && '...'}
              </Text>
            </View>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: Space[3],
    marginBottom: Space[2],
    borderWidth: 1,
    borderColor: Colors.border,
  },
  clickable: {
    elevation: 2,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Space[2],
  },
  index: {
    // ...Typography.bodySmall,
    color: Colors.textDisabled,
    marginRight: Space[2],
    fontWeight: '600',
  },
  name: {
    ...Typography.bodyMedium,
    color: Colors.text,
    fontWeight: '600',
    flex: 1,
  },
  details: {
    gap: Space[1],
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  label: {
    // ...Typography.bodySmall,
    color: Colors.textDisabled,
    width: 80,
    marginRight: Space[2],
  },
  value: {
    // ...Typography.bodySmall,
    color: Colors.text,
    flex: 1,
  },
});
