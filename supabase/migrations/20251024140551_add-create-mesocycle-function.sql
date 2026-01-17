set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_complete_mesocycle(p_user_id uuid, p_name text, p_start_date date, p_num_weeks smallint, p_goal text, p_status text DEFAULT 'planning'::text, p_workout_days text[] DEFAULT NULL::text[], p_days_per_week numeric DEFAULT NULL::numeric, p_muscle_emphasis text[] DEFAULT NULL::text[], p_length_weeks numeric DEFAULT NULL::numeric, p_minutes_per_session numeric DEFAULT NULL::numeric, p_weight_now numeric DEFAULT NULL::numeric, p_joint_pain_now text[] DEFAULT NULL::text[], p_split_type text DEFAULT NULL::text, p_exercise_variation numeric DEFAULT NULL::numeric, p_workouts_data jsonb DEFAULT '[]'::jsonb, p_exercises_data jsonb DEFAULT '[]'::jsonb, p_sets_data jsonb DEFAULT '[]'::jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_mesocycle_id uuid;
  v_mesocycle_record RECORD;
  v_workouts jsonb := '[]'::jsonb;
  v_exercises jsonb := '[]'::jsonb;
  v_sets jsonb := '[]'::jsonb;
  v_result jsonb;
BEGIN
  -- Start transaction (automatic in function)
  
  -- 1. Create mesocycle
  INSERT INTO public.mesocycle (
    user_id,
    name,
    start_date,
    num_weeks,
    goal,
    status,
    workout_days,
    days_per_week,
    muscle_emphasis,
    length_weeks,
    minutes_per_session,
    weight_now,
    joint_pain_now,
    split_type,
    exercise_variation
  ) VALUES (
    p_user_id,
    p_name,
    p_start_date,
    p_num_weeks,
    p_goal::mesocycle_goal_enum,
    p_status::mesocycle_status_enum,
    p_workout_days,
    p_days_per_week,
    p_muscle_emphasis,
    p_length_weeks,
    p_minutes_per_session,
    p_weight_now,
    p_joint_pain_now,
    p_split_type,
    p_exercise_variation
  )
  RETURNING * INTO v_mesocycle_record;
  
  v_mesocycle_id := v_mesocycle_record.id;
  
  -- 2. Create workouts if provided
  IF p_workouts_data IS NOT NULL AND jsonb_array_length(p_workouts_data) > 0 THEN
    INSERT INTO public.workouts (
      user_id,
      mesocycle_block_id,
      workout_day,
      workout_week,
      started_at,
      is_public,
      created_at,
      last_modified
    )
    SELECT 
      (v->>'user_id')::uuid,
      v_mesocycle_id,
      (v->>'workout_day')::numeric,
      (v->>'workout_week')::numeric,
      (v->>'started_at')::timestamp with time zone,
      COALESCE((v->>'is_public')::boolean, false),
      COALESCE((v->>'created_at')::timestamp with time zone, now()),
      COALESCE((v->>'last_modified')::timestamp with time zone, now())
    FROM jsonb_array_elements(p_workouts_data) AS v;
    
    -- Get all created workouts as JSONB
    SELECT jsonb_agg(to_jsonb(w.*))
    INTO v_workouts
    FROM public.workouts w
    WHERE w.mesocycle_block_id = v_mesocycle_id;
  END IF;
  
  -- 3. Create workout exercises if provided
  IF p_exercises_data IS NOT NULL AND jsonb_array_length(p_exercises_data) > 0 THEN
    INSERT INTO public.workout_exercises (
      workout_id,
      exercise_id,
      order_index,
      soreness_from_last,
      created_at,
      last_modified
    )
    SELECT 
      (v->>'workout_id')::uuid,
      (v->>'exercise_id')::uuid,
      (v->>'order_index')::smallint,
      (v->>'soreness_from_last')::smallint,
      COALESCE((v->>'created_at')::timestamp with time zone, now()),
      COALESCE((v->>'last_modified')::timestamp with time zone, now())
    FROM jsonb_array_elements(p_exercises_data) AS v;
    
    -- Get all created exercises as JSONB
    SELECT jsonb_agg(to_jsonb(we.*))
    INTO v_exercises
    FROM public.workout_exercises we
    WHERE we.workout_id IN (
      SELECT id FROM public.workouts WHERE mesocycle_block_id = v_mesocycle_id
    );
  END IF;
  
  -- 4. Create workout sets if provided
  IF p_sets_data IS NOT NULL AND jsonb_array_length(p_sets_data) > 0 THEN
    INSERT INTO public.workout_sets (
      workout_exercise_id,
      set_number,
      target_reps,
      weight_kg,
      target_rir_raw,
      status,
      set_type,
      created_at,
      last_modified
    )
    SELECT 
      (v->>'workout_exercise_id')::uuid,
      (v->>'set_number')::smallint,
      (v->>'target_reps')::smallint,
      (v->>'weight_kg')::numeric,
      (v->>'target_rir_raw')::smallint,
      v->>'status',
      v->>'set_type',
      COALESCE((v->>'created_at')::timestamp with time zone, now()),
      COALESCE((v->>'last_modified')::timestamp with time zone, now())
    FROM jsonb_array_elements(p_sets_data) AS v;
    
    -- Get all created sets as JSONB
    SELECT jsonb_agg(to_jsonb(ws.*))
    INTO v_sets
    FROM public.workout_sets ws
    WHERE ws.workout_exercise_id IN (
      SELECT we.id FROM public.workout_exercises we
      JOIN public.workouts w ON we.workout_id = w.id
      WHERE w.mesocycle_block_id = v_mesocycle_id
    );
  END IF;
  
  -- Build result object
  v_result := jsonb_build_object(
    'mesocycle', to_jsonb(v_mesocycle_record),
    'workouts', COALESCE(v_workouts, '[]'::jsonb),
    'exercises', COALESCE(v_exercises, '[]'::jsonb),
    'sets', COALESCE(v_sets, '[]'::jsonb)
  );
  
  RETURN v_result;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Any error will cause automatic rollback
    RAISE EXCEPTION 'Failed to create complete mesocycle: %', SQLERRM;
END;
$function$
;


