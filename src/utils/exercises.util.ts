import { IMesocycleTemplateExercise } from "../training-module/mesocycle/data/interfaces/mesocycle-templates";

export const groupByDay = (exercises: IMesocycleTemplateExercise[]) => {
  const exercisesByDay = new Map<number, IMesocycleTemplateExercise[]>();

  exercises.forEach((exercise) => {
    if (!exercisesByDay.has(exercise.day_of_week))
      exercisesByDay.set(exercise.day_of_week, []);
    
    exercisesByDay.get(exercise.day_of_week)!.push(exercise);
  });

  return exercisesByDay;
}

