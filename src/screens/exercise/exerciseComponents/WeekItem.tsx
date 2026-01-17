import React from 'react';
import { StyleSheet, View } from 'react-native';

import { SingleWeekItem } from './SingleWeekItem';

interface WeekItemProps {
  week1: number;
  week2: number;
  days_per_week: number;
  onDayPress: (day: number, week: number) => void;
  maxWeeks: number;
  selectedDay: number;
  selectedWeek: number;
}

export const WeekItem: React.FC<WeekItemProps> = ({
  week1,
  week2,
  days_per_week,
  onDayPress,
  maxWeeks,
  selectedDay,
  selectedWeek,
}) => {
  return (
    <View style={styles.sliderContainer}>
      <SingleWeekItem
        weekNumber={week1}
        days_per_week={days_per_week}
        onDayPress={onDayPress}
        selectedDay={selectedDay}
        selectedWeek={selectedWeek}
      />
      {week2 <= maxWeeks && (
        <SingleWeekItem
          weekNumber={week2}
          days_per_week={days_per_week}
          onDayPress={onDayPress}
          selectedDay={selectedDay}
          selectedWeek={selectedWeek}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sliderContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
