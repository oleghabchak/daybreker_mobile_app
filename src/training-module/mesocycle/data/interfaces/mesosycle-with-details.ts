import { IWorkout } from '../../../workout/data/interfaces/workout';

import { IMesocycle } from './mesocycle';

export interface IMesocycleWithDetails extends IMesocycle {
  workouts: IWorkout;
}
