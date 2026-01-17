import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  CircleX,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Modal as RNModal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Slider, SliderRef } from '../../../components/slider/Slider';
import { Divider } from '../../../components/ui/Divider';
import { ScreenWidth } from '../../../constants';
import {
  BorderRadius,
  Colors,
  Space,
  Typography,
} from '../../../constants/theme';
import { useMesocycleStore } from '../../../training-module/mesocycle/stores/mesocycle-store';

import { WeekItem } from './WeekItem';

interface WorkoutScheduleModalProps {
  isVisible: boolean;
  onClose: () => void;
  onWorkoutSelect: (
    workoutDay: number,
    workoutWeek: number,
    mesocycleId: string
  ) => void;
}

export const WorkoutScheduleModal: React.FC<WorkoutScheduleModalProps> = ({
  isVisible,
  onClose,
  onWorkoutSelect,
}) => {
  const { selectedWorkoutWeek, selectedWorkoutDay, selectedMesocycle } =
    useMesocycleStore();
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const sliderRef = React.useRef<SliderRef>(null);

  const numWeeks = selectedMesocycle?.num_weeks ?? 1;
  const daysPerWeek = selectedMesocycle?.days_per_week ?? 0;

  const generateWeekPairs = (totalWeeks: number) => {
    const weekArray = Array.from({ length: totalWeeks }, (_, i) => i + 1);
    const weekPairs = [];
    for (let i = 0; i < totalWeeks; i += 2) {
      weekPairs.push(weekArray[i]);
    }
    return { weekArray, weekPairs };
  };

  const { weekPairs } = React.useMemo(
    () => generateWeekPairs(numWeeks),
    [numWeeks]
  );

  const currentWeekDisplay = React.useMemo(() => {
    const weeks1item = weekPairs[currentWeekIndex];
    const weeks2item = weekPairs[currentWeekIndex] + 1;
    return { weeks1item, weeks2item };
  }, [weekPairs, currentWeekIndex]);

  const handleItemChange = React.useCallback((index: number) => {
    setIsTransitioning(true);
    setCurrentWeekIndex(index);

    setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
  }, []);

  const handleDayPress = (day: number, week: number) => {
    if (selectedMesocycle) {
      onWorkoutSelect(day, week, selectedMesocycle.id);
      onClose();
    }
  };

  useEffect(() => {
    const weekIndex = Number((selectedWorkoutWeek / 2).toFixed(0));
    sliderRef.current?.scrollToIndex(weekIndex - 1);
  }, [isVisible, selectedWorkoutWeek]);

  const handleSliderNext = () => {
    if (currentWeekIndex < Math.ceil(numWeeks / 2) - 1) {
      sliderRef.current?.scrollToNext();
    }
  };

  const handleSliderPrevious = () => {
    if (currentWeekIndex > 0) {
      sliderRef.current?.scrollToPrevious();
    }
  };

  const handleBackdropPress = () => {
    onClose();
  };

  const handleBackButtonPress = () => {
    onClose();
    return true;
  };

  return (
    <RNModal
      visible={isVisible}
      onDismiss={onClose}
      transparent={true}
      animationType='fade'
      presentationStyle='overFullScreen'
      onRequestClose={handleBackButtonPress}
      statusBarTranslucent={true}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={handleBackdropPress}
      >
        <TouchableOpacity
          style={styles.modalContainer}
          activeOpacity={1}
          onPress={e => e.stopPropagation()}
        >
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <CalendarIcon size={24} color={Colors.text} />
              <Text style={styles.titleText}>{selectedMesocycle?.name}</Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole='button'
            >
              <CircleX size={20} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <Divider color={Colors.border} />

          {selectedMesocycle ? (
            <>
              <View style={styles.weekContainer}>
                <Text style={styles.weekText}>
                  {isTransitioning
                    ? 'WEEKS --- / ' + numWeeks
                    : `WEEKS ${currentWeekDisplay.weeks1item}${
                        currentWeekDisplay.weeks2item <= numWeeks
                          ? `-${currentWeekDisplay.weeks2item}`
                          : ''
                      } / ${numWeeks}`}
                </Text>
                <TouchableOpacity
                  onPress={handleSliderPrevious}
                  disabled={currentWeekIndex === 0}
                  style={[
                    styles.navButton,
                    currentWeekIndex === 0 && styles.navButtonDisabled,
                  ]}
                >
                  <ChevronLeft
                    size={24}
                    color={currentWeekIndex === 0 ? Colors.border : Colors.text}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSliderNext}
                  disabled={currentWeekIndex >= Math.ceil(numWeeks / 2) - 1}
                  style={[
                    styles.navButton,
                    currentWeekIndex >= Math.ceil(numWeeks / 2) - 1 &&
                      styles.navButtonDisabled,
                  ]}
                >
                  <ChevronRight
                    size={24}
                    color={
                      currentWeekIndex >= Math.ceil(numWeeks / 2) - 1
                        ? Colors.border
                        : Colors.text
                    }
                  />
                </TouchableOpacity>
              </View>

              <Slider
                height={200}
                ref={sliderRef}
                onItemChange={handleItemChange}
              >
                {weekPairs.map(weekStart => (
                  <View style={{ flexDirection: 'row' }} key={weekStart}>
                    <WeekItem
                      week1={weekStart}
                      week2={weekStart + 1}
                      days_per_week={daysPerWeek}
                      onDayPress={handleDayPress}
                      maxWeeks={numWeeks}
                      selectedDay={selectedWorkoutDay}
                      selectedWeek={selectedWorkoutWeek}
                    />
                  </View>
                ))}
              </Slider>
            </>
          ) : (
            <View style={styles.noMesocycleContainer}>
              <Text style={styles.noMesocycleText}>No mesocycle selected</Text>
              <Text style={styles.noMesocycleSubtext}>
                Please select a mesocycle first
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalContainer: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.xl,
    margin: Space[4],
    width: ScreenWidth * 0.9,
    shadowColor: Colors.text,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Space[6],
    paddingTop: Space[3],
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space[2],
  },
  titleText: {
    ...Typography.h2,
    color: Colors.text,
    textAlign: 'center',
  },
  noMesocycleContainer: {
    paddingVertical: Space[8],
    paddingHorizontal: Space[6],
    alignItems: 'center',
    justifyContent: 'center',
  },
  noMesocycleText: {
    ...Typography.h3,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Space[2],
  },
  noMesocycleSubtext: {
    ...Typography.body,
    color: Colors.textDisabled,
    textAlign: 'center',
  },
  weekText: {
    ...Typography.bodySemiBold,
    color: Colors.textDisabled,
    paddingHorizontal: Space[3],
  },
  weekContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Space[6],
  },
  navButton: {
    padding: Space[2],
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
});
