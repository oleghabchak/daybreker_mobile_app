export const FeedbackOptions = {
  pump: {
    key: 'pump',
    title: 'Pump',
    options: [
      { value: 'none', label: 'None' },
      { value: 'light', label: 'Light' },
      { value: 'strong', label: 'Strong' },
      { value: 'max', label: 'Max' },
    ],
  },

  effort: {
    key: 'effort',
    title: 'Effort',
    options: [
      { value: 'easy', label: 'Easy' },
      { value: 'med', label: 'Medium' },
      { value: 'hard', label: 'Hard' },
      { value: 'brutal', label: 'Brutal' },
    ],
  },

  jointPain: {
    key: 'jointPain',
    title: 'Joint Pain',
    options: [
      { value: 'none', label: 'None' },
      { value: 'mild', label: 'Light' },
      { value: 'sharp', label: 'Strong' },
      { value: 'max', label: 'Max' },
    ],
  },
} as const;

export type PumpLevel = (typeof FeedbackOptions.pump.options)[number]['value'];
export type EffortLevel =
  (typeof FeedbackOptions.effort.options)[number]['value'];
export type JointPainLevel =
  (typeof FeedbackOptions.jointPain.options)[number]['value'];

export interface FeedbackOption {
  value: string;
  label: string;
}
