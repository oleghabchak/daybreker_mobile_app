import { ComprehensiveMesocycleData } from '../../../../types/mesocycle_types';
import {
  DayColumn,
  ExerciseColumn,
} from '../../components/forms/MesocycleExercisesForm/fields/MesocycleDaysColumnsField/types';

/**
 * Simple utility to transform mesocycle data to DayColumn format
 * Focuses on first week only and provides basic exercise mapping
 */
export class MesocycleDataTransformer {
  /**
   * Transforms mesocycle data to DayColumn format for form initialization
   * @param mesocycleData - Complete mesocycle data from Supabase
   * @returns DayColumn array representing the first week's structure
   */
  static transformToDayColumns(
    mesocycleData: ComprehensiveMesocycleData
  ): DayColumn[] {
    if (!mesocycleData.workouts || mesocycleData.workouts.length === 0) {
      return [];
    }

    // Filter workouts for the first week only
    const firstWeekWorkouts = mesocycleData.workouts.filter(
      workout => workout.workout_week === 1
    );

    // Group workouts by day
    const workoutsByDay = new Map<number, typeof firstWeekWorkouts>();

    firstWeekWorkouts.forEach(workout => {
      const day = workout.workout_day;
      if (!workoutsByDay.has(day)) {
        workoutsByDay.set(day, []);
      }
      workoutsByDay.get(day)!.push(workout);
    });

    // Convert to DayColumn format
    const dayColumns: DayColumn[] = [];

    workoutsByDay.forEach((workouts, dayNumber) => {
      // Get the first workout of this day to extract exercise structure
      const templateWorkout = workouts[0];

      if (templateWorkout.exercises && templateWorkout.exercises.length > 0) {
        const exercises: ExerciseColumn[] = templateWorkout.exercises.map(
          (exercise, index) => ({
            id: `exercise-${dayNumber}-${index}`,
            bodyPart: this.mapExerciseToBodyPart(exercise.exercise_id),
            selectedExercise: {
              exercise_uid: exercise.exercise_id,
              exercise_canonical_id: exercise.exercise_id,
              exercise_display_name_en: this.getExerciseDisplayName(
                exercise.exercise_id
              ),
              exercise_name_aliases: [],
              exercise_status: 'active',
              exercise_keywords: [],
              exercise_tags: '',
              exercise_primary_movement_pattern: '',
              exercise_mechanics_type: '',
              exercise_kinematic_context: '',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            } as any,
          })
        );

        dayColumns.push({
          id: `day-${dayNumber}`,
          selectedDay: this.mapDayNumberToDayName(dayNumber),
          exercises,
        });
      }
    });

    // Sort by day number
    return dayColumns.sort((a, b) => {
      const dayA = this.mapDayNameToNumber(a.selectedDay || '');
      const dayB = this.mapDayNameToNumber(b.selectedDay || '');
      return dayA - dayB;
    });
  }

  /**
   * Maps exercise ID to primary muscle group
   */
  private static mapExerciseToBodyPart(
    exerciseId: string
  ): PrimaryMuscleGroup | null {
    const exerciseToBodyPart: Record<string, PrimaryMuscleGroup> = {
      bench_press: PrimaryMuscleGroup.CHEST,
      squat: PrimaryMuscleGroup.QUADS,
      deadlift: PrimaryMuscleGroup.HAMSTRINGS,
      overhead_press: PrimaryMuscleGroup.SHOULDERS,
      pull_up: PrimaryMuscleGroup.BACK,
      bicep_curl: PrimaryMuscleGroup.BICEPS,
      tricep_dip: PrimaryMuscleGroup.TRICEPS,
      push_up: PrimaryMuscleGroup.CHEST,
      row: PrimaryMuscleGroup.BACK,
      lat_pulldown: PrimaryMuscleGroup.BACK,
      shoulder_press: PrimaryMuscleGroup.SHOULDERS,
      leg_press: PrimaryMuscleGroup.QUADS,
      lunges: PrimaryMuscleGroup.QUADS,
      plank: PrimaryMuscleGroup.ABS,
      crunch: PrimaryMuscleGroup.ABS,
    };

    return exerciseToBodyPart[exerciseId] || null;
  }

  /**
   * Gets display name for exercise
   */
  private static getExerciseDisplayName(exerciseId: string): string {
    const exerciseNames: Record<string, string> = {
      bench_press: 'Bench Press',
      squat: 'Squat',
      deadlift: 'Deadlift',
      overhead_press: 'Overhead Press',
      pull_up: 'Pull Up',
      bicep_curl: 'Bicep Curl',
      tricep_dip: 'Tricep Dip',
      push_up: 'Push Up',
      row: 'Row',
      lat_pulldown: 'Lat Pulldown',
      shoulder_press: 'Shoulder Press',
      leg_press: 'Leg Press',
      lunges: 'Lunges',
      plank: 'Plank',
      crunch: 'Crunch',
    };

    return exerciseNames[exerciseId] || exerciseId;
  }

  /**
   * Maps day number to day name
   */
  private static mapDayNumberToDayName(dayNumber: number): string {
    const dayNames = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ];
    return dayNames[dayNumber - 1] || 'Monday';
  }

  /**
   * Maps day name to day number
   */
  private static mapDayNameToNumber(dayName: string): number {
    const dayNames = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ];
    return dayNames.indexOf(dayName) + 1 || 1;
  }

  /**
   * Creates a default mesocycle name with "Copy" suffix
   */
  static createDefaultCopyName(originalName: string): string {
    return `${originalName} Copy`;
  }
}
