import { MoreVertical } from 'lucide-react-native';
import moment from 'moment';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { MesocycleKebabTooltip, Tag } from '../../../components';
import { isIOS } from '../../../constants';
import {
  BorderRadius,
  Colors,
  Shadows,
  Space,
  Typography,
} from '../../../constants/theme';
import { useMesocycleStore } from '../../../training-module/mesocycle/stores/mesocycle-store';
import { IWorkout } from '../../../training-module/workout/data/interfaces/workout';
import { useWorkoutStore } from '../../../training-module/workout/stores/workout-store';

import { WorkoutScheduleModal } from './WorkoutScheduleModal';

export interface WorkoutStatsInfo {
  day: number;
  workout_days: string[];
  weekCurrent: number;
  weekTotal: number;
  exercises: {
    completed: number;
    total: number;
  };
  sets: {
    completed: number;
    total: number;
  };
  duration: string;
  volume: string;
}

export interface WorkoutStatsCardProps {
  workouts: IWorkout[];
  weekCurrent: number;
  weekTotal: number;
  workoutDays: string[] | undefined;

  onPress?: () => void;
  onMenuPress?: () => void;
  onAddMesocycle?: () => void;
  onAddExercises?: () => void;
  onCopyMesocycle?: () => void;
  onAddNote?: () => void;
  onStartWithTemplate?: () => void;
  onStartFromScratch?: () => void;
  onWorkoutSelect?: (
    workoutDay: number,
    workoutWeek: number,
    mesocycleId: string
  ) => void;
}

export const WorkoutStatsCard: React.FC<WorkoutStatsCardProps> = ({
  workoutDays,
  weekTotal,
  weekCurrent,
  onAddMesocycle,
  onAddExercises,
  onCopyMesocycle,
  onAddNote,
  onStartWithTemplate,
  onStartFromScratch,
}) => {
  const { selectedWorkoutDay, setSelectedWorkoutDay, setSelectedWorkoutWeek } =
    useMesocycleStore();
  const { currentWorkout } = useWorkoutStore();
  const [isWorkoutScheduleModalVisible, setIsWorkoutScheduleModalVisible] =
    useState(false);
  const [kebabVisible, setKebabVisible] = useState(false);
  const [isMesocycleSubmenuVisible, setIsMesocycleSubmenuVisible] =
    useState(false);

  const handleCloseKebab = () => {
    setKebabVisible(false);
    setIsMesocycleSubmenuVisible(false);
  };

  const handleWorkoutSelect = (
    workoutDay: number,
    workoutWeek: number,
    mesocycleId: string
  ) => {
    setSelectedWorkoutDay(workoutDay);
    setSelectedWorkoutWeek(workoutWeek);
  };

  return (
    <View style={styles.shadowWrapper}>
      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.dayInfo}>
            <Text style={styles.dayText}>Day {selectedWorkoutDay}</Text>
          </View>

          <MesocycleKebabTooltip
            isVisible={kebabVisible}
            isMesocycleSubmenuVisible={isMesocycleSubmenuVisible}
            onAddMesocycle={() => {
              handleCloseKebab();
              onAddMesocycle?.();
            }}
            onAddExercises={() => {
              handleCloseKebab();
              onAddExercises?.();
            }}
            onCopyMesocycle={() => {
              handleCloseKebab();
              onCopyMesocycle?.();
            }}
            onStartWithTemplate={() => {
              handleCloseKebab();
              onStartWithTemplate?.();
            }}
            onStartFromScratch={() => {
              handleCloseKebab();
              onStartFromScratch?.();
            }}
            onAddNote={() => {
              handleCloseKebab();
              onAddNote?.();
            }}
            onShow={() => setKebabVisible(true)}
            onHide={() => setKebabVisible(false)}
            position='bottom'
            style={styles.menuButton}
          >
            <TouchableOpacity
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              onPress={() => setKebabVisible(true)}
              style={styles.menuButton}
            >
              <MoreVertical size={24} color={Colors.text} />
            </TouchableOpacity>
          </MesocycleKebabTooltip>
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: Space[2],
          }}
        >
          {workoutDays && <Tag text={workoutDays[selectedWorkoutDay - 1]} />}
          <Tag text={`Week ${weekCurrent}/${weekTotal}`} />
          {currentWorkout && currentWorkout?.completed_at !== null && (
            <Tag
              variant='success'
              text={
                moment(currentWorkout?.completed_at).format('ddd, MMM D') + ' ✓'
              }
            />
          )}
        </View>
      </View>
      {!currentWorkout && (
        <TouchableOpacity
          style={styles.centerText}
          onPress={() => {
            setKebabVisible(true);
          }}
        >
          <Text style={styles.centerTextLabel}>No mesocycle yet</Text>
        </TouchableOpacity>
      )}
      {isWorkoutScheduleModalVisible && (
        <WorkoutScheduleModal
          isVisible={isWorkoutScheduleModalVisible}
          onClose={() => setIsWorkoutScheduleModalVisible(false)}
          onWorkoutSelect={handleWorkoutSelect}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  shadowWrapper: {
    ...Shadows.bottomOnly,
  },
  container: {
    position: 'relative',
    padding: 21, // Reduced by another 15% from 25px
    borderBottomWidth: isIOS ? 0 : 1,
    borderLeftWidth: isIOS ? 0 : 1,
    borderRightWidth: isIOS ? 0 : 1,
    borderBottomColor: Colors.borderLightGray,
    borderLeftColor: Colors.borderLightGray,
    borderRightColor: Colors.borderLightGray,
    borderBottomLeftRadius: BorderRadius.lg,
    borderBottomRightRadius: BorderRadius.lg,
    backgroundColor: Colors.background,
  },
  gradient: {
    padding: Space[4],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 9, // Reduced by another 15% from 11px
  },
  dayInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayText: {
    ...Typography.h1,
    marginLeft: Space[2],
  },
  menuButton: {
    marginRight: -6,
  },
  tagsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Space[2],
    marginLeft: Space[2],
    gap: Space[2],
  },
  checkIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space[1],
    backgroundColor: Colors.teal,
    borderRadius: BorderRadius.sm,
    padding: Space[1],
  },
  centerText: {
    paddingVertical: Space[8],
    paddingHorizontal: Space[8],
    marginHorizontal: Space[4],
    marginTop: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerTextLabel: {
    ...Typography.bodyMedium,
    color: Colors.textDisabled,
    textAlign: 'center',
  },
});
