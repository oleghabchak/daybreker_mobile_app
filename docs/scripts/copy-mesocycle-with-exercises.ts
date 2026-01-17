import { createClient } from '@supabase/supabase-js';

import { environment } from '../../src/config/environment';
import { IMesocycle } from '../../src/training-module/mesocycle/data/interfaces/mesocycle';
import { ICreateMesocycleParams } from '../../src/training-module/mesocycle/data/params/create-mesocycle-params';
import { IGetMesocycleByIdParams } from '../../src/training-module/mesocycle/data/params/get-mesocycle-by-id-params';
import { IWorkout } from '../../src/training-module/workout/data/interfaces/workout';
import { IWorkoutExercise } from '../../src/training-module/workout/data/interfaces/workout-exercise';
import { IWorkoutSet } from '../../src/training-module/workout/data/interfaces/workout-set';
import { ICreateWorkoutExerciseParams } from '../../src/training-module/workout/data/params/create-workout-exercise-params';
import { ICreateWorkoutParams } from '../../src/training-module/workout/data/params/create-workout-params';
import { ICreateWorkoutSetParams } from '../../src/training-module/workout/data/params/set/create-workout-set-params';

const supabase = createClient(
  environment.supabase.url,
  environment.supabase.anonKey
);

type AsyncResponse<T, E = Error> =
  | { status: 'ok'; data: T }
  | { status: 'error'; error: E };

class IRepository {
  static tableName: string;

  static get table() {
    return supabase.from(this.tableName);
  }

  protected static async errorHandlingWrapper<T>(
    wrapper: () => Promise<any>
  ): Promise<AsyncResponse<T>> {
    try {
      const response = await wrapper();

      return {
        status: 'ok',
        data: response,
      };
    } catch (error) {
      return {
        status: 'error',
        error: error as Error,
      };
    }
  }
}

class MesocycleRepository extends IRepository {
  static tableName: string = 'mesocycle';

  static create(
    params: ICreateMesocycleParams
  ): Promise<AsyncResponse<IMesocycle>> {
    return this.errorHandlingWrapper(async () => {
      const mesocycleData: ICreateMesocycleParams = {
        ...params,
        created_at: new Date().toISOString(),
        last_modified: new Date().toISOString(),
      };

      const { data, error } = await this.table
        .insert([mesocycleData])
        .select()
        .single<IMesocycle>();

      if (error) {
        throw error;
      }

      return data;
    });
  }

  static getById({
    id,
  }: IGetMesocycleByIdParams): Promise<AsyncResponse<IMesocycle>> {
    return this.errorHandlingWrapper(async () => {
      const { data, error } = await this.table
        .select('*')
        .eq('id', id)
        .single<IMesocycle>();

      if (error) {
        throw error;
      }

      return data;
    });
  }
}

class WorkoutRepository extends IRepository {
  static tableName: string = 'workouts';

  static create(
    params: ICreateWorkoutParams
  ): Promise<AsyncResponse<IWorkout>> {
    return this.errorHandlingWrapper(async () => {
      const workoutData: ICreateWorkoutParams = {
        ...params,
        started_at: params.started_at || new Date().toISOString(),
        is_public: params.is_public ?? false,
        created_at: new Date().toISOString(),
        last_modified: new Date().toISOString(),
      };

      const { data, error } = await this.table
        .insert([workoutData])
        .select()
        .single<IWorkout>();

      if (error) {
        throw error;
      }

      return data;
    });
  }

  static async getByMesocycleId(
    mesocycleId: string
  ): Promise<AsyncResponse<IWorkout[]>> {
    return this.errorHandlingWrapper(async () => {
      const { data, error } = await this.table
        .select<'*', IWorkout[]>()
        .eq('mesocycle_block_id', mesocycleId);

      if (error) {
        throw error;
      }

      return data;
    });
  }
}

class WorkoutExerciseRepository extends IRepository {
  static tableName: string = 'workout_exercises';

  static async create(
    params: ICreateWorkoutExerciseParams
  ): Promise<AsyncResponse<IWorkoutExercise>> {
    return this.errorHandlingWrapper(async () => {
      const workoutExerciseData: ICreateWorkoutExerciseParams & {
        created_at: string;
        last_modified: string;
      } = {
        ...params,
        created_at: new Date().toISOString(),
        last_modified: new Date().toISOString(),
      };

      const { data, error } = await this.table
        .insert([workoutExerciseData])
        .select()
        .single<IWorkoutExercise>();

      if (error) {
        throw error;
      }

      return data;
    });
  }

  static async getByWorkoutId(
    workoutId: string
  ): Promise<AsyncResponse<IWorkoutExercise[]>> {
    return this.errorHandlingWrapper(async () => {
      const { data, error } = await this.table
        .select()
        .eq('workout_id', workoutId);

      if (error) {
        throw error;
      }

      return data;
    });
  }

  static async getLastExerciseIndex(
    workoutId: string
  ): Promise<AsyncResponse<number>> {
    return this.errorHandlingWrapper(async () => {
      const { data, error } = await this.table
        .select<'order_index', { order_index: number }>('order_index')
        .eq('workout_id', workoutId)
        .order('order_index', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return 0;
        }

        throw error;
      }

      return data.order_index;
    });
  }
}

class WorkoutSetRepository extends IRepository {
  static tableName: string = 'workout_sets';

  static async create(
    params: ICreateWorkoutSetParams
  ): Promise<AsyncResponse<IWorkoutSet>> {
    return this.errorHandlingWrapper(async () => {
      const workoutSetData: ICreateWorkoutSetParams & {
        created_at: string;
        last_modified: string;
      } = {
        ...params,
        created_at: new Date().toISOString(),
        last_modified: new Date().toISOString(),
      };

      const { data, error } = await this.table
        .insert([workoutSetData])
        .select()
        .single<IWorkoutSet>();

      if (error) {
        throw error;
      }

      return data;
    });
  }
}

class CreateWorkoutExerciseWithSetsUseCase {
  static async execute({
    workoutId,
    exerciseId,
    defaultSets,
  }: {
    workoutId: string;
    exerciseId: string;
    defaultSets: number;
  }): Promise<AsyncResponse<boolean>> {
    const workoutLatestExerciseIndexRequest =
      await WorkoutExerciseRepository.getLastExerciseIndex(workoutId);

    if (workoutLatestExerciseIndexRequest.status === 'error') {
      return workoutLatestExerciseIndexRequest;
    }

    const orderIndex = workoutLatestExerciseIndexRequest.data;

    const createWorkoutExerciseRequest = await WorkoutExerciseRepository.create(
      {
        workout_id: workoutId,
        exercise_id: exerciseId,
        order_index: orderIndex + 1,
        soreness_from_last: 1,
        auto_generate_warmups: false,
      }
    );

    if (createWorkoutExerciseRequest.status === 'error') {
      return createWorkoutExerciseRequest;
    }

    const workoutExercise = createWorkoutExerciseRequest.data;

    const workoutSetsPromises = [];
    for (let i = 0; i < defaultSets; i++) {
      const createWorkoutSetRequest = await WorkoutSetRepository.create({
        workout_exercise_id: workoutExercise.id,
        set_number: i + 1,
        target_reps: 10,
        weight_kg: 0,
        target_rir_raw: 2,
        status: 'not_started',
      });

      workoutSetsPromises.push(createWorkoutSetRequest);
    }

    const workoutSets = await Promise.all(workoutSetsPromises);
    for (const set of workoutSets) {
      if (set.status === 'error') {
        return { status: 'error', error: set.error };
      }
    }

    return { status: 'ok', data: true };
  }
}

// User id of user to who this mesocycle should be copied
const targetUserId: string = 'e797f80f-6a62-4835-94fd-75d24878477f';

// Mesocycle id from what everything will be copied
const mesocycleId: string = '30a2ef30-e388-4442-9153-9c66db6e828f';

// Mesocycle name for targetUserId
const mesocycleName: string =
  "Glutes, Hamstrings, & Shoulders 2d 8w Sep '25 Hypertrophy";

// Its working!!!

const create = async () => {
  const workoutExercisesMap: Map<
    string,
    {
      workout: IWorkout;
      exercises: IWorkoutExercise[];
    }
  > = new Map();

  const mesocycleRequest = await MesocycleRepository.getById({
    id: mesocycleId,
  });

  if (mesocycleRequest.status === 'error') {
    console.log('mesocycle error', mesocycleRequest.error);
    return;
  }

  const mesocycle = mesocycleRequest.data;

  const workoutsRequest = await WorkoutRepository.getByMesocycleId(mesocycleId);

  if (workoutsRequest.status === 'error') {
    console.log('workouts error', workoutsRequest.error);
    return;
  }

  const workouts = workoutsRequest.data;

  for (const workout of workouts) {
    const exercisesRequest = await WorkoutExerciseRepository.getByWorkoutId(
      workout.id
    );

    if (exercisesRequest.status === 'error') {
      console.log('workout exercise error', workout.id, exercisesRequest.error);

      continue;
    }

    const workoutExercises = exercisesRequest.data;

    if (!workoutExercises.length) continue;

    workoutExercisesMap.set(workout.id, {
      workout,
      exercises: workoutExercises,
    });
  }

  const createMesocycleRequest = await MesocycleRepository.create({
    user_id: targetUserId,
    name: mesocycleName,
    start_date: new Date().toISOString().split('T')[0],
    num_weeks: mesocycle.num_weeks,
    days_per_week: mesocycle.days_per_week,
    goal: mesocycle.goal,
  });

  if (createMesocycleRequest.status === 'error') {
    console.log('Failed to create mesocycle', createMesocycleRequest.error);

    return;
  }

  const createdMesocycle = createMesocycleRequest.data;

  const workoutsStartDate = new Date().toISOString();

  console.log('Creating workouts');
  const workoutItems = Array.from(workoutExercisesMap.values());
  const batchSize = 5;

  for (let i = 0; i < workoutItems.length; i += batchSize) {
    const batch = workoutItems.slice(i, i + batchSize);

    console.log(i, ' / ', workoutItems.length);

    await Promise.all(
      batch.map(async workoutItem => {
        const workoutRequest = await WorkoutRepository.create({
          user_id: targetUserId,
          mesocycle_block_id: createdMesocycle.id,
          workout_day: workoutItem.workout.workout_day,
          workout_week: workoutItem.workout.workout_week,
          started_at: workoutsStartDate,
          is_public: workoutItem.workout.is_public,
        });

        if (workoutRequest.status === 'error') {
          console.log('failed to create workout', workoutRequest.error);
          return;
        }

        const workout = workoutRequest.data;

        await Promise.all(
          workoutItem.exercises.map(async exercise => {
            await CreateWorkoutExerciseWithSetsUseCase.execute({
              workoutId: workout.id,
              exerciseId: exercise.exercise_id,
              defaultSets: 3,
            });
          })
        );
      })
    );
  }

  console.log('Creation copy of mesocycle is done!');
};

create();
