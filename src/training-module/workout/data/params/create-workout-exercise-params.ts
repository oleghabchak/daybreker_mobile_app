export interface ICreateWorkoutExerciseParams {
  workout_id: string;
  exercise_id: string;
  order_index: number;
  soreness_from_last: number;
  workout_day?: number;
  auto_generate_warmups?: boolean;
}
