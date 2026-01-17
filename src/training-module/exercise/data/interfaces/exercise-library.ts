/**
 * Interface for exercise library data fetched by ID
 */
export interface IExerciseLibraryData {
  exercise_uid: string;
  exercise_display_name_en: string;
  exercise_muscle_groups_simple: any;
}

/**
 * Interface for exercise library search filters
 */
export interface IExerciseLibraryFilters {
  muscleGroups?: string[];
  movementPattern?: string;
  equipment?: string;
  searchQuery?: string;
}

/**
 * Interface for exercise library search parameters
 */
export interface IExerciseLibrarySearchParams {
  filters?: IExerciseLibraryFilters;
  limit?: number;
  offset?: number;
}

/**
 * Interface for exercise library response
 */
export interface IExerciseLibraryResponse {
  exercises: IExerciseLibraryData[];
  total: number;
  hasMore: boolean;
}
