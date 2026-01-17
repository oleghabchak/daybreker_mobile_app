import { MesocycleGoal, MesocycleStatus } from './databas.enums';

export enum UnitsPreference {
  METRIC = 'metric',
  IMPERIAL = 'imperial',
}

export enum BiologicalSex {
  MALE = 'male',
  FEMALE = 'female',
}

export enum DesiredBodyType {
  MASCULINE = 'masculine',
  FEMININE = 'feminine',
}

export enum ExperienceLevel {
  LESS_THAN_6_MONTHS = '<6_months',
  SIX_TO_12_MONTHS = '6-12_months',
  ONE_TO_3_YEARS = '1-3_years',
  THREE_TO_5_YEARS = '3-5_years',
  FIVE_TO_SEVEN_YEARS = '5-7_years',
  SEVEN_PLUS_YEARS = '7+_years',
}

export enum Equipment {
  BARBELL = 'barbell',
  DUMBBELLS = 'dumbbells',
  CABLES = 'cables',
  MACHINES = 'machines',
  SMITH = 'smith',
  ELASTIC_BANDS = 'elastic_bands',
  HEX_BAR = 'hex_bar',
  TRX = 'trx',
  KETTLEBELLS = 'kettlebells',
  SLED = 'sled',
  PULL_UP_BAR = 'pullup_bar',
}

export enum InjuryLocation {
  SHOULDER = 'shoulder',
  ELBOW = 'elbow',
  WRIST = 'wrist',
  HIP = 'hip',
  KNEE = 'knee',
  ANKLE = 'ankle',
  SPINE = 'spine',
  OTHER = 'other',
}

export enum JointHypermobility {
  YES = 'yes',
  NO = 'no',
  UNSURE = 'unsure',
}

export enum WarmupSetsPreference {
  YES = 'true',
  NO = 'false',
}

export enum MuscleGroup {
  SHOULDERS = 'shoulders',
  BACK = 'back',
  CHEST = 'chest',
  ARMS = 'arms',
  GLUTES = 'glutes',
  HAMSTRINGS = 'hamstrings',
  QUADS = 'quads',
  CALVES = 'calves',
  ABS = 'abs',
}

export enum SplitType {
  SHOULDER = 'shoulders',
  ELBOW = 'elbow',
  WRIST = 'wrist',
  HIP = 'hip',
  KNEE = 'knee',
  ANKLE = 'ankle',
  SPINE = 'spine',
  OTHER = 'other',
}

export enum MuscleEmphasis {
  SHOULDERS = 'shoulders',
  BACK = 'back',
  CHEST = 'chest',
  ARMS = 'arms',
  GLUTES = 'glutes',
  HAMSTRINGS = 'hamstrings',
  QUADS = 'quads',
  CALVES = 'calves',
  ABS = 'abs',
}

export const unitsPreferences = [
  { value: UnitsPreference.METRIC, label: 'Metric' },
  { value: UnitsPreference.IMPERIAL, label: 'Imperial' },
];

export const biologicalSexOptions = [
  { value: BiologicalSex.MALE, label: 'Male' },
  { value: BiologicalSex.FEMALE, label: 'Female' },
];

export const desiredBodyTypeOptions = [
  { value: DesiredBodyType.MASCULINE, label: 'Masculine' },
  { value: DesiredBodyType.FEMININE, label: 'Feminine' },
];

export const experienceLevels = [
  { value: ExperienceLevel.LESS_THAN_6_MONTHS, label: '<6 months' },
  { value: ExperienceLevel.SIX_TO_12_MONTHS, label: '6-12 months' },
  { value: ExperienceLevel.ONE_TO_3_YEARS, label: '1-3 years' },
  { value: ExperienceLevel.THREE_TO_5_YEARS, label: '3-5 years' },
  { value: ExperienceLevel.FIVE_TO_SEVEN_YEARS, label: '5-7 years' },
  { value: ExperienceLevel.SEVEN_PLUS_YEARS, label: '7+ years' },
];

export const equipmentOptions = [
  { value: Equipment.BARBELL, label: 'Barbell' },
  { value: Equipment.DUMBBELLS, label: 'Dumbbells' },
  { value: Equipment.CABLES, label: 'Cables' },
  { value: Equipment.MACHINES, label: 'Machines' },
  { value: Equipment.SMITH, label: 'Smith Machine' },
  { value: Equipment.ELASTIC_BANDS, label: 'Elastic Bands' },
  { value: Equipment.HEX_BAR, label: 'Hex Bar (Trap Bar)' },
  { value: Equipment.TRX, label: 'TRX' },
  { value: Equipment.KETTLEBELLS, label: 'Kettlebells' },
  { value: Equipment.SLED, label: 'Sled' },
  { value: Equipment.PULL_UP_BAR, label: 'Pull-up Bar' },
];

export const injuryLocations = [
  { value: InjuryLocation.SHOULDER, label: 'Shoulder' },
  { value: InjuryLocation.ELBOW, label: 'Elbow' },
  { value: InjuryLocation.WRIST, label: 'Wrist' },
  { value: InjuryLocation.HIP, label: 'Hip' },
  { value: InjuryLocation.KNEE, label: 'Knee' },
  { value: InjuryLocation.ANKLE, label: 'Ankle' },
  { value: InjuryLocation.SPINE, label: 'Spine' },
  { value: InjuryLocation.OTHER, label: 'Other' },
];

export const jointHypermobilityOptions = [
  { value: JointHypermobility.YES, label: 'Yes' },
  { value: JointHypermobility.NO, label: 'No' },
  { value: JointHypermobility.UNSURE, label: 'Unsure' },
];

export const warmupSetsOptions = [
  { value: WarmupSetsPreference.YES, label: 'Yes' },
  { value: WarmupSetsPreference.NO, label: 'No' },
];

export const cycleLengths = [4, 5, 6, 8, 9, 10];
export const sessionDurations = [30, 45, 60, 75, 90, 105, 120];
export const trainingDaysOptions = [2, 3, 4, 5, 6];

export const splitTypeOptions = [
  { value: SplitType.SHOULDER, label: 'Shoulder' },
  { value: SplitType.ELBOW, label: 'Elbow' },
  { value: SplitType.WRIST, label: 'Wrist' },
  { value: SplitType.HIP, label: 'Hip' },
  { value: SplitType.KNEE, label: 'Knee' },
  { value: SplitType.ANKLE, label: 'Ankle' },
  { value: SplitType.SPINE, label: 'Spine' },
  { value: SplitType.OTHER, label: 'Other' },
];

export const muscleEmphasisOptions = [
  { value: MuscleEmphasis.SHOULDERS, label: 'Shoulders' },
  { value: MuscleEmphasis.BACK, label: 'Back' },
  { value: MuscleEmphasis.CHEST, label: 'Chest' },
  { value: MuscleEmphasis.ARMS, label: 'Arms' },
  { value: MuscleEmphasis.GLUTES, label: 'Glutes' },
  { value: MuscleEmphasis.HAMSTRINGS, label: 'Hamstrings' },
  { value: MuscleEmphasis.QUADS, label: 'Quads' },
  { value: MuscleEmphasis.CALVES, label: 'Calves' },
  { value: MuscleEmphasis.ABS, label: 'Abs' },
];

export const mesocycleGoalOptions = [
  { value: MesocycleGoal.HYPERTROPHY, label: 'Hypertrophy' },
  { value: MesocycleGoal.STRENGTH, label: 'Strength' },
  { value: MesocycleGoal.POWER, label: 'Power' },
];

export const mesocycleStatusOptions = [
  { value: MesocycleStatus.PLANNING, label: 'Planning' },
  { value: MesocycleStatus.ACTIVE, label: 'Active' },
  { value: MesocycleStatus.COMPLETED, label: 'Completed' },
];
