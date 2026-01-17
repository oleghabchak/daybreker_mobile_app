/**
 * Database Enums from Supabase
 *
 * These enums correspond to the database enum types defined in Supabase
 * and provide type safety for database operations.
 */

// Primary mesocycle fitness goal options
export enum PrimaryMesocycleFitnessGoal {
  STRENGTH = 'strength',
  HYPERTROPHY = 'hypertrophy',
  POWER = 'power',
  CARDIO = 'cardio',
  MOBILITY = 'mobility',
  PLYOMETRIC = 'plyometric',
  OLYMPIC = 'olympic',
  WARMUP = 'warmup',
}

// Exercise difficulty levels
export enum ExerciseDifficultyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

// Available equipment types
export enum Equipment {
  BARBELL = 'barbell',
  DUMBBELL = 'dumbbell',
  CABLE = 'cable',
  BODYWEIGHT = 'bodyweight',
  BAND = 'band',
  MACHINE = 'machine',
  KETTLEBELL = 'kettlebell',
  TRX = 'trx',
  PLATE = 'plate',
  EZ_BAR = 'ez_bar',
  TRAP_BAR = 'trap_bar',
  SMITH_MACHINE = 'smith_machine',
  BOX = 'box',
  PULL_UP_BAR = 'pull_up_bar',
  DIP_BARS = 'dip_bars',
  LANDMINE = 'landmine',
  SLED = 'sled',
  FOAM_ROLLER = 'foam_roller',
  SANDBAG = 'sandbag',
}

// Equipment display titles for UI
export const EquipmentTitles: Record<Equipment, string> = {
  [Equipment.BARBELL]: 'Barbell',
  [Equipment.DUMBBELL]: 'Dumbbell',
  [Equipment.CABLE]: 'Cable Machine',
  [Equipment.BODYWEIGHT]: 'Bodyweight',
  [Equipment.BAND]: 'Resistance Band',
  [Equipment.MACHINE]: 'Weight Machine',
  [Equipment.KETTLEBELL]: 'Kettlebell',
  [Equipment.TRX]: 'TRX Suspension',
  [Equipment.PLATE]: 'Weight Plate',
  [Equipment.EZ_BAR]: 'EZ Bar',
  [Equipment.TRAP_BAR]: 'Trap Bar',
  [Equipment.SMITH_MACHINE]: 'Smith Machine',
  [Equipment.BOX]: 'Box/Platform',
  [Equipment.PULL_UP_BAR]: 'Pull-up Bar',
  [Equipment.DIP_BARS]: 'Dip Bars',
  [Equipment.LANDMINE]: 'Landmine',
  [Equipment.SLED]: 'Sled',
  [Equipment.FOAM_ROLLER]: 'Foam Roller',
  [Equipment.SANDBAG]: 'Sandbag',
};

// Primary muscle groups targeted by exercises
export enum PrimaryMuscleGroup {
  QUADS = 'quads',
  GLUTES = 'glutes',
  CHEST = 'chest',
  BACK = 'back',
  SHOULDERS = 'shoulders',
  ABS = 'abs',
  HAMSTRINGS = 'hamstrings',
  LOW_BACK = 'low_back',
  CALVES = 'calves',
  BICEPS = 'biceps',
  TRICEPS = 'triceps',
  FOREARMS = 'forearms',
  TRAPS = 'traps',
  FULL_BODY = 'full_body',
}

// Body positions for exercises
export enum BodyPosition {
  SIT = 'sit',
  STAND = 'stand',
  PRONE = 'prone',
  SIDE_LYING = 'side_lying',
  KNEELING = 'kneeling',
  SUPINE = 'supine',
  HANGING = 'hanging',
  ALL_FOURS = 'all_fours',
  LUNGE_STANCE = 'lunge_stance',
  HALF_KNEELING = 'half_kneeling',
  INVERTED = 'inverted',
}

// Primary movement patterns
export enum PrimaryMovementPattern {
  SQUAT = 'squat',
  LUNGE = 'lunge',
  HINGE = 'hinge',
  PUSH = 'push',
  PULL = 'pull',
  CARRY = 'carry',
  JUMP = 'jump',
  REACH = 'reach',
  LIFT = 'lift',
  WALK = 'walk',
}

// Primary movement planes
export enum PrimaryMovementPlane {
  SAGITTAL = 'sagittal',
  FRONTAL = 'frontal',
  TRANSVERSE = 'transverse',
}

// Set types for workout programming
export enum SetType {
  WARMUP = 'warmup',
  WORKING = 'working',
  DROP = 'drop',
  FAILURE = 'failure',
}

// Health data sources
export enum HealthDataSource {
  APPLE_HEALTH = 'apple_health',
  GOOGLE_FIT = 'google_fit',
  MANUAL = 'manual',
}

// Mesocycle status options
export enum MesocycleStatus {
  PLANNING = 'planning',
  ACTIVE = 'active',
  COMPLETED = 'completed',
}

// Mesocycle goal types
export enum MesocycleGoal {
  STRENGTH = 'strength',
  HYPERTROPHY = 'hypertrophy',
  POWER = 'power',
}

// Grip types for exercises
export enum GripType {
  OVERHAND = 'overhand',
  UNDERHAND = 'underhand',
  NEUTRAL = 'neutral',
  MIXED = 'mixed',
  WIDE = 'wide',
  NARROW = 'narrow',
  THUMBS_OUT = 'thumbs_out',
  THUMBS_IN = 'thumbs_in',
  UNILATERAL = 'unilateral',
}

// Tempo count patterns in seconds (eccentric-pause-concentric-pause)
export enum TempoCount {
  TWO_ZERO_TWO_ZERO = '2-0-2-0',
  THREE_ONE_TWO_ZERO = '3-1-2-0',
  FOUR_ZERO_ONE_ZERO = '4-0-1-0',
}

// Stance position options
export enum StancePosition {
  NARROW = 'narrow',
  NEUTRAL = 'neutral',
  WIDE = 'wide',
  UNILATERAL = 'unilateral',
}

// Training methods for exercise organization
export enum TrainingMethod {
  STRAIGHT_SETS = 'straight_sets',
  SUPERSETS = 'supersets',
  GIANT_SETS = 'giant_sets',
}

// Force vector directions
export enum ForceVector {
  VERTICAL_PUSH = 'vertical_push',
  VERTICAL_PULL = 'vertical_pull',
  HORIZONTAL_PUSH = 'horizontal_push',
  HORIZONTAL_PULL = 'horizontal_pull',
  LATERAL = 'lateral',
  ROTATIONAL = 'rotational',
}

export enum WorkoutStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned',
}
