// Placeholder exercise options for UI-only selection (no DB calls yet)
export const placeholderExercises: OptionItem[] = [
  { value: 'bench_press', label: 'Bench Press' },
  { value: 'back_squat', label: 'Back Squat' },
  { value: 'deadlift', label: 'Deadlift' },
  { value: 'overhead_press', label: 'Overhead Press' },
  { value: 'lat_pulldown', label: 'Lat Pulldown' },
];

export interface OptionItem {
  value: string;
  label: string;
}
