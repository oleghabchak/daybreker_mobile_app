import { FC, useEffect, useState } from 'react';
import { View, SafeAreaView, Text } from 'react-native';

import { Header } from '../../../components';
import { useBackPress } from '../../../hooks/useBackPress';
import { useAuthStore } from '../../../models/AuthenticationStore';
import { useMesocycleCreation } from '../../../training-module/mesocycle/hooks/useMesocycleCreation';
import type {
  DayColumn,
  ExerciseColumn,
} from '../components/forms/MesocycleExercisesForm/fields';
import { MesocycleExercisesForm } from '../components/forms/MesocycleExercisesForm/MesocycleExercisesForm';

import { useGetMesocycleParam, useMesocycleData } from './hooks';
import { styles } from './styles';

export const MesocycleCopyScreen: FC = () => {
  const { handleBackPress } = useBackPress();
  const { mesocycleSource } = useGetMesocycleParam();
  const { user } = useAuthStore();
  const { copyMesocycle, isCreating } = useMesocycleCreation();

  // Fetch comprehensive mesocycle data
  const { mesocycleData, isLoading, error } = useMesocycleData(
    mesocycleSource?.id || null
  );

  // Form state
  const [initialFormData, setInitialFormData] = useState({
    mesocycleName: mesocycleSource?.name + ' Copy' || '',
    daysColumns: [] as any[],
  });

  // Initialize form with mesocycle data when available
  useEffect(() => {
    if (mesocycleData) {
      // Build a very simple first-week copy using exercise IDs only
      const firstWeek = (mesocycleData.workouts || []).filter(
        w => w.workout_week === 1
      );
      const byDay = new Map<number, any[]>();
      firstWeek.forEach(w => {
        const d = w.workout_day;
        if (!byDay.has(d)) byDay.set(d, []);
        byDay.get(d)!.push(w);
      });

      const dayName = (dayNum: number) => {
        const names = [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday',
        ];
        return names[dayNum - 1] || 'Monday';
      };

      const dayColumns: DayColumn[] = [];
      Array.from(byDay.entries()).forEach(([dayNum, workouts]) => {
        const template = workouts[0];
        const exercises: ExerciseColumn[] = (template?.exercises || []).map(
          (ex: any, idx: number) => {
            return {
              id: `exercise-${dayNum}-${idx}`,
              bodyPart: ex.exercise?.exercise_muscle_groups_simple?.primary[0],
              selectedExercise: {
                exercise_uid: ex.exercise_id,
                exercise_canonical_id: ex.exercise.exercise_canonical_id,
                exercise_display_name_en: ex.exercise.exercise_display_name_en,
                exercise_name_aliases: [],
                exercise_status: 'active',
                exercise_keywords: [],
                exercise_tags: [],
                exercise_i18n_translations: {},
                exercise_version: '1',
                exercise_primary_movement_pattern: '',
                exercise_mechanics_type: '',
                exercise_kinematic_context: '',
                exercise_dominant_plane_of_motion: '',
                exercise_functional_vector_modifiers: [],
                exercise_movement_drivers: {},
                exercise_primary_joint_actions: [],
                exercise_joint_rom_degrees: {},
                exercise_joint_moment_profiles: [],
                exercise_length_bias_by_muscle: {},
                exercise_execution_laterality: '',
                exercise_range_of_motion_variant: '',
                exercise_body_orientation: '',
                exercise_back_support_required: '',
                exercise_stance_type: '',
                exercise_stance_width_category: '',
                exercise_foot_rotation_category: '',
                exercise_stance_code_by_plane: '',
                exercise_implement_primary: '',
                exercise_implement_secondary: [],
                exercise_cable_attachment: '',
                exercise_external_line_of_action: {},
                exercise_grip_orientation: '',
                exercise_grip_width_category: '',
                exercise_thumb_style: '',
                exercise_grip_code_by_plane: '',
                exercise_foot_orientation_degrees: {},
                exercise_machine_brand: '',
                exercise_machine_brand_custom_name: '',
                exercise_machine_model: '',
                exercise_muscles_ta2: [],
                exercise_muscle_groups_simple: {},
                exercise_muscle_roles: {},
                exercise_contraindications: [],
                exercise_joint_stress_profile: {},
                exercise_icf_tags_optional: [],
                exercise_impact_rating: '',
                exercise_stability_demand: '',
                exercise_coordination_complexity: '',
              },
            };
          }
        );

        dayColumns.push({
          id: `day-${dayNum}`,
          selectedDay: dayName(dayNum),
          exercises,
        });
      });

      dayColumns.sort(
        (a, b) =>
          [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
            'Sunday',
          ].indexOf(a.selectedDay || '') +
          1 -
          ([
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
            'Sunday',
          ].indexOf(b.selectedDay || '') +
            1)
      );

      setInitialFormData({
        mesocycleName: `${mesocycleData.name} Copy`,
        daysColumns: dayColumns,
      });
    }
  }, [mesocycleData]);

  const isTemplateReady = initialFormData.daysColumns.length > 0;

  const handleCopy = async (
    mesocycleName: string,
    daysColumns: DayColumn[]
  ) => {
    if (!user || !mesocycleSource?.id) return;
    
    try {
      await copyMesocycle({
        user,
        mesocycleId: mesocycleSource.id,
        newMesocycleName: mesocycleName,
      });
      handleBackPress();
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Header
        title='Copy Mesocycle'
        showLogo={false}
        showBackButton={true}
        onBackPress={handleBackPress}
        onNotificationPress={() => console.log('Notifications pressed')}
      />

      {/* Content */}
      {!isTemplateReady ? (
        <View style={styles.content}>
          <Text>Preparing template…</Text>
        </View>
      ) : (
        <View style={styles.content}>
          <MesocycleExercisesForm
            initialState={initialFormData}
            onCopy={handleCopy}
            isLoading={isCreating}
          />
        </View>
      )}
    </SafeAreaView>
  );
};
