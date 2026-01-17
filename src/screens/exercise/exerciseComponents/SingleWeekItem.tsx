import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Tag } from '../../../components/ui/Tag';
import { Colors, Space, Typography } from '../../../constants/theme';
import { useMesocycleStore } from '../../../training-module/mesocycle/stores/mesocycle-store';

interface SingleWeekItemProps {
  weekNumber: number;
  days_per_week: number;
  onDayPress: (day: number, week: number) => void;
  selectedDay: number;
  selectedWeek: number;
}

export const SingleWeekItem: React.FC<SingleWeekItemProps> = ({
  weekNumber,
  days_per_week,
  onDayPress,
  selectedDay,
  selectedWeek,
}) => {
  // TODO: Implement workout completion checking when we have the data
  const isDayCompleted = (dayNumber: number, weekNumber: number) => {
    return false; // Placeholder - implement based on workout data
  };
  const { selectedMesocycle } = useMesocycleStore();

  return (
    <View style={styles.weekItemContainer}>
      <Text style={styles.weekItemTitle}>Week {weekNumber}</Text>
      <View style={styles.weekItemDaysContainer}>
        {[...Array(days_per_week)].map((_, index) => {
          const dayNumber = index + 1;
          const isCompleted = isDayCompleted(dayNumber, weekNumber);
          const isCurrentDay =
            dayNumber === selectedDay && weekNumber === selectedWeek;
          const dayName = selectedMesocycle?.workout_days
            ? selectedMesocycle?.workout_days?.[dayNumber - 1]
            : `Day ${dayNumber}`;
          return (
            <TouchableOpacity
              key={index}
              onPress={() => onDayPress(dayNumber, weekNumber)}
              style={styles.weekItemDayButton}
            >
              {isCurrentDay ? (
                <Tag
                  variant={'black'}
                  style={styles.weekItemDayText}
                  text={`${dayName}`}
                />
              ) : isCompleted ? (
                <Tag
                  variant={'grey'}
                  style={styles.weekItemDayText}
                  text={`${dayName}`}
                />
              ) : (
                <Tag style={styles.weekItemDayText} text={`${dayName}`} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  weekItemContainer: {
    paddingHorizontal: Space[6],
    alignItems: 'center',
  },
  weekItemTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Space[1],
  },
  weekItemDaysContainer: {
    alignItems: 'center',
  },
  weekItemDayButton: {
    marginBottom: Space[2],
  },
  weekItemDayText: {
    width: 120,
  },
});
