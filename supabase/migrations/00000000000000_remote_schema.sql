-- BASELINE MIGRATION
-- This file reflects the current production schema.
-- Do not apply manually or with `supabase db push` on production.

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "mesocycle";


ALTER SCHEMA "mesocycle" OWNER TO "postgres";


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






CREATE SCHEMA IF NOT EXISTS "ops";


ALTER SCHEMA "ops" OWNER TO "postgres";


CREATE SCHEMA IF NOT EXISTS "phi";


ALTER SCHEMA "phi" OWNER TO "postgres";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE SCHEMA IF NOT EXISTS "ref";


ALTER SCHEMA "ref" OWNER TO "postgres";


CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pg_trgm" WITH SCHEMA "public";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."body_position_enum" AS ENUM (
    'sit',
    'stand',
    'prone',
    'side_lying',
    'kneeling',
    'supine',
    'hanging',
    'all_fours',
    'lunge_stance',
    'half_kneeling',
    'inverted'
);


ALTER TYPE "public"."body_position_enum" OWNER TO "postgres";


CREATE TYPE "public"."equipment_enum" AS ENUM (
    'barbell',
    'dumbbell',
    'cable',
    'bodyweight',
    'band',
    'machine',
    'kettlebell',
    'trx',
    'plate',
    'ez_bar',
    'trap_bar',
    'smith_machine',
    'box',
    'pull_up_bar',
    'dip_bars',
    'landmine',
    'sled',
    'foam_roller',
    'sandbag'
);


ALTER TYPE "public"."equipment_enum" OWNER TO "postgres";


CREATE TYPE "public"."exercise_difficulty_level_enum" AS ENUM (
    'beginner',
    'intermediate',
    'advanced'
);


ALTER TYPE "public"."exercise_difficulty_level_enum" OWNER TO "postgres";


CREATE TYPE "public"."exercise_domain" AS ENUM (
    'cardio',
    'strength/hypertrophy'
);


ALTER TYPE "public"."exercise_domain" OWNER TO "postgres";


CREATE TYPE "public"."exercise_status" AS ENUM (
    'done',
    'not_started',
    'skipped'
);


ALTER TYPE "public"."exercise_status" OWNER TO "postgres";


CREATE TYPE "public"."force_vector_enum" AS ENUM (
    'vertical_push',
    'vertical_pull',
    'horizontal_push',
    'horizontal_pull',
    'lateral',
    'rotational'
);


ALTER TYPE "public"."force_vector_enum" OWNER TO "postgres";


CREATE TYPE "public"."grip_type_enum" AS ENUM (
    'overhand',
    'underhand',
    'neutral',
    'mixed',
    'wide',
    'narrow',
    'thumbs_out',
    'thumbs_in',
    'unilateral'
);


ALTER TYPE "public"."grip_type_enum" OWNER TO "postgres";


CREATE TYPE "public"."health_data_source_enum" AS ENUM (
    'apple_health',
    'google_fit',
    'manual'
);


ALTER TYPE "public"."health_data_source_enum" OWNER TO "postgres";


CREATE TYPE "public"."mesocycle_goal_enum" AS ENUM (
    'strength',
    'hypertrophy',
    'power'
);


ALTER TYPE "public"."mesocycle_goal_enum" OWNER TO "postgres";


CREATE TYPE "public"."mesocycle_status_enum" AS ENUM (
    'planning',
    'active',
    'completed'
);


ALTER TYPE "public"."mesocycle_status_enum" OWNER TO "postgres";


CREATE TYPE "public"."primary_mesocycle_fitness_goal_enum" AS ENUM (
    'strength',
    'hypertrophy',
    'power',
    'cardio',
    'mobility',
    'plyometric',
    'olympic',
    'warmup'
);


ALTER TYPE "public"."primary_mesocycle_fitness_goal_enum" OWNER TO "postgres";


CREATE TYPE "public"."primary_movement_pattern_enum" AS ENUM (
    'squat',
    'lunge',
    'hinge',
    'push',
    'pull',
    'carry',
    'jump',
    'reach',
    'lift',
    'walk'
);


ALTER TYPE "public"."primary_movement_pattern_enum" OWNER TO "postgres";


CREATE TYPE "public"."primary_movement_plane_enum" AS ENUM (
    'sagittal',
    'frontal',
    'transverse'
);


ALTER TYPE "public"."primary_movement_plane_enum" OWNER TO "postgres";


CREATE TYPE "public"."primary_muscle_group_exercised_enum" AS ENUM (
    'quads',
    'glutes',
    'chest',
    'back',
    'shoulders',
    'abs',
    'hamstrings',
    'low_back',
    'calves',
    'biceps',
    'triceps',
    'forearms',
    'traps',
    'full_body'
);


ALTER TYPE "public"."primary_muscle_group_exercised_enum" OWNER TO "postgres";


CREATE TYPE "public"."set_type_enum" AS ENUM (
    'warmup',
    'working',
    'drop',
    'failure'
);


ALTER TYPE "public"."set_type_enum" OWNER TO "postgres";


CREATE TYPE "public"."stance_position_enum" AS ENUM (
    'narrow',
    'neutral',
    'wide',
    'unilateral'
);


ALTER TYPE "public"."stance_position_enum" OWNER TO "postgres";


CREATE TYPE "public"."tempo_count_in_seconds_enum" AS ENUM (
    '2-0-2-0',
    '3-1-2-0',
    '4-0-1-0'
);


ALTER TYPE "public"."tempo_count_in_seconds_enum" OWNER TO "postgres";


CREATE TYPE "public"."training_method_enum" AS ENUM (
    'straight_sets',
    'supersets',
    'giant_sets'
);


ALTER TYPE "public"."training_method_enum" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_next_workout_targets"("p_user_id" "uuid", "p_exercise_id" "uuid", "p_block_week" integer) RETURNS TABLE("suggested_weight" numeric, "target_rir" numeric, "target_sets" smallint, "reasoning" "text")
    LANGUAGE "plpgsql"
    AS $$
declare
  v_inc numeric := 2.5;
  v_last_weight numeric;
  v_last_rir numeric;
  v_set_cap smallint := 6;
  v_pref_min smallint;
  v_pref_max smallint;
  v_recovery_gate_avg numeric;
begin
  select coalesce(default_weight_increment_kg,2.5),
         set_cap,
         preferred_rep_range_min, preferred_rep_range_max
  into v_inc, v_set_cap, v_pref_min, v_pref_max
  from exercises where id = p_exercise_id;

  select ws.weight_kg, ws.achieved_rir_raw
  into v_last_weight, v_last_rir
  from workout_sets ws
  join workout_exercises we on we.id = ws.workout_exercise_id
  join workouts w on w.id = we.workout_id
  where w.user_id = p_user_id and we.exercise_id = p_exercise_id and ws.is_effective_set = true
  order by w.started_at desc, we.order_index asc, ws.set_number desc
  limit 1;

  select avg(we.recovery_gate)::numeric
  into v_recovery_gate_avg
  from workout_exercises we
  join workouts w on w.id = we.workout_id
  where w.user_id = p_user_id and we.exercise_id = p_exercise_id;

  target_sets := least(3 + greatest(p_block_week - 1, 0), v_set_cap);
  target_rir := greatest(0, 3 - greatest(p_block_week - 1, 0));

  if v_recovery_gate_avg is not null and v_recovery_gate_avg >= 5 then
    target_rir := least(target_rir + 1, 4);
    target_sets := greatest(2, target_sets - 1);
  end if;

  if v_last_weight is null then
    suggested_weight := null;
    reasoning := 'No prior data; use onboarding estimate. Sets ramp by week, RIR tapers.';
  else
    if coalesce(v_last_rir, 3) <= 1 then
      suggested_weight := v_last_weight + v_inc;
      reasoning := format('Progressed: last RIR=%.1f, +%.2fkg.', v_last_rir, v_inc);
    else
      suggested_weight := v_last_weight;
      reasoning := format('Hold: last RIR=%.1f not near failure.', v_last_rir);
    end if;
  end if;

  return;
end; $$;


ALTER FUNCTION "public"."calculate_next_workout_targets"("p_user_id" "uuid", "p_exercise_id" "uuid", "p_block_week" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_deload_triggers"("p_user_id" "uuid", "p_exercise_id" "uuid") RETURNS TABLE("should_deload" boolean, "reason" "text")
    LANGUAGE "plpgsql"
    AS $$
declare
  v_gate_avg numeric;
  v_trend text;
  v_e1rm numeric;
  v_n int;
begin
  select avg(we.recovery_gate)::numeric into v_gate_avg
  from workout_exercises we
  join workouts w on w.id = we.workout_id
  where w.user_id = p_user_id and we.exercise_id = p_exercise_id;

  select trend_direction, avg_e1rm, sessions_count into v_trend, v_e1rm, v_n
  from get_exercise_trend(p_user_id, p_exercise_id, 14);

  if coalesce(v_gate_avg,0) >= 5 then
    return query select true, format('High recovery gate (%.2f) suggests fatigue/joint issues.', v_gate_avg);
    return;
  end if;

  if v_trend = 'declining' and coalesce(v_n,0) >= 3 then
    return query select true, 'Performance trend declining over recent sessions.';
    return;
  end if;

  return query select false, 'No deload trigger.';
end; $$;


ALTER FUNCTION "public"."check_deload_triggers"("p_user_id" "uuid", "p_exercise_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."debug_user_data"("user_id_param" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'mesocycles', (
            SELECT jsonb_agg(m.*)
            FROM mesocycle m
            WHERE m.user_id = user_id_param
        ),
        'mesocycle_exercises', (
            SELECT jsonb_agg(me.*)
            FROM mesocycle m
            INNER JOIN "mesocycle.exercises" me ON m.id = me.mesocycle_block_id
            WHERE m.user_id = user_id_param
        ),
        'workouts', (
            SELECT jsonb_agg(w.*)
            FROM mesocycle m
            INNER JOIN workouts w ON m.id = w.mesocycle_block_id
            WHERE m.user_id = user_id_param
        ),
        'workout_exercises', (
            SELECT jsonb_agg(we.*)
            FROM mesocycle m
            INNER JOIN workouts w ON m.id = w.mesocycle_block_id
            INNER JOIN workout_exercises we ON w.id = we.workout_id
            WHERE m.user_id = user_id_param
        ),
        'workout_sets', (
            SELECT jsonb_agg(ws.*)
            FROM mesocycle m
            INNER JOIN workouts w ON m.id = w.mesocycle_block_id
            INNER JOIN workout_exercises we ON w.id = we.workout_id
            INNER JOIN workout_sets ws ON we.id = ws.workout_exercise_id
            WHERE m.user_id = user_id_param
        )
    ) INTO result;
    
    RETURN COALESCE(result, '{}'::jsonb);
END;
$$;


ALTER FUNCTION "public"."debug_user_data"("user_id_param" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_user_account"("user_id_to_delete" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $_$
DECLARE
    deletion_results JSONB := '[]'::JSONB;
    table_name TEXT;
    tables_to_clean TEXT[] := ARRAY[
        'user_profiles',
        'user_conditions',
        'user_medications',
        'medication_doses',
        'user_metrics',
        'user_priorities',
        'health_scores',
        'onboarding_progress',
        'screen_analytics',
        'device_connections',
        'sync_conflicts',
        'mesocycle',
        'workouts',
        'workout_exercises',
        'workout_sets',
        'training_profile_configuration',
        'custom_exercises',
        'data_retention_requests'
    ];
    rows_deleted INTEGER;
    error_count INTEGER := 0;
    success_count INTEGER := 0;
BEGIN
    -- Verify the user exists
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = user_id_to_delete) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'User not found',
            'user_id', user_id_to_delete
        );
    END IF;

    -- Delete from all custom tables
    FOREACH table_name IN ARRAY tables_to_clean
    LOOP
        BEGIN
            EXECUTE format('DELETE FROM %I WHERE user_id = $1', table_name) 
            USING user_id_to_delete;
            
            GET DIAGNOSTICS rows_deleted = ROW_COUNT;
            
            deletion_results := deletion_results || jsonb_build_object(
                'table', table_name,
                'success', true,
                'rows_deleted', rows_deleted
            );
            
            success_count := success_count + 1;
            
        EXCEPTION WHEN OTHERS THEN
            deletion_results := deletion_results || jsonb_build_object(
                'table', table_name,
                'success', false,
                'error', SQLERRM
            );
            
            error_count := error_count + 1;
        END;
    END LOOP;

    -- Delete from audit_log (this table might have different column names)
    BEGIN
        DELETE FROM audit_log WHERE user_id = user_id_to_delete;
        GET DIAGNOSTICS rows_deleted = ROW_COUNT;
        
        deletion_results := deletion_results || jsonb_build_object(
            'table', 'audit_log',
            'success', true,
            'rows_deleted', rows_deleted
        );
        
        success_count := success_count + 1;
        
    EXCEPTION WHEN OTHERS THEN
        deletion_results := deletion_results || jsonb_build_object(
            'table', 'audit_log',
            'success', false,
            'error', SQLERRM
        );
        
        error_count := error_count + 1;
    END;

    -- Hard delete the user from auth.users (requires admin privileges)
    BEGIN
        DELETE FROM auth.users WHERE id = user_id_to_delete;
        
        IF FOUND THEN
            RETURN jsonb_build_object(
                'success', true,
                'message', 'User account deleted successfully',
                'user_id', user_id_to_delete,
                'tables_processed', success_count + error_count,
                'tables_successful', success_count,
                'tables_failed', error_count,
                'deletion_results', deletion_results
            );
        ELSE
            RETURN jsonb_build_object(
                'success', false,
                'error', 'Failed to delete user from auth.users',
                'user_id', user_id_to_delete,
                'deletion_results', deletion_results
            );
        END IF;
        
    EXCEPTION WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Failed to delete user from auth.users: ' || SQLERRM,
            'user_id', user_id_to_delete,
            'deletion_results', deletion_results
        );
    END;
END;
$_$;


ALTER FUNCTION "public"."delete_user_account"("user_id_to_delete" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."find_functions_with_text"("search_text" "text") RETURNS TABLE("schema_name" "text", "function_name" "text", "definition" "text")
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT n.nspname::TEXT, p.proname::TEXT, pg_get_functiondef(p.oid)::TEXT
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE p.prosrc ILIKE '%' || search_text || '%'
    AND n.nspname NOT IN ('pg_catalog', 'information_schema')
    ORDER BY n.nspname, p.proname;
END;
$$;


ALTER FUNCTION "public"."find_functions_with_text"("search_text" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_comprehensive_mesocycle_data"("user_id_param" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql"
    AS $$DECLARE
    result JSONB;
BEGIN
    WITH comprehensive_data AS (
        SELECT 
            m.id as mesocycle_id,
            m.name as mesocycle_name,
            m.goal,
            m.status,
            m.start_date,
            m.num_weeks,
            m.days_per_week,
            m.muscle_emphasis,
            m.split_type,
            me.id as mesocycle_exercise_id,
            me.exercise_id,
            me.week_plans,
            el.exercise_canonical_id,
            el.exercise_display_name_en,
            el.exercise_name_aliases,
            el.exercise_status,
            el.exercise_keywords,
            el.exercise_tags,
            el.exercise_primary_movement_pattern,
            el.exercise_mechanics_type,
            el.exercise_kinematic_context,
            w.id as workout_id,
            w.started_at as workout_started_at,
            w.completed_at as workout_completed_at,
            w.notes as workout_notes,
            we.id as workout_exercise_id,
            we.exercise_id as workout_exercise_exercise_id,
            we.order_index,
            we.superset_group,
            we.soreness_from_last,
            we.pump,
            we.effort,
            we.joint_pain,
            we.recovery_gate,
            we.stimulus_score,
            ws.id as workout_set_id,
            ws.set_number,
            ws.target_reps,
            ws.actual_reps,
            ws.weight_kg,
            ws.target_rir_raw,
            ws.achieved_rir_raw,
            ws.e1rm,
            ws.total_volume
        FROM 
            mesocycle m
        LEFT JOIN 
            "mesocycle.exercises" me ON m.id = me.mesocycle_block_id
        LEFT JOIN 
            exercise_library el ON me.exercise_id::text = el.exercise_uid
        LEFT JOIN 
            workouts w ON m.id = w.mesocycle_block_id
        LEFT JOIN 
            workout_exercises we ON w.id = we.workout_id
        LEFT JOIN 
            workout_sets ws ON we.id = ws.workout_exercise_id
        WHERE 
            m.user_id = user_id_param
        ORDER BY 
            m.start_date DESC,
            w.started_at,
            we.order_index,
            ws.set_number
    )
    SELECT jsonb_agg(
        jsonb_build_object(
            'mesocycle_id', mesocycle_id,
            'mesocycle_name', mesocycle_name,
            'goal', goal,
            'status', status,
            'start_date', start_date,
            'num_weeks', num_weeks,
            'days_per_week', days_per_week,
            'muscle_emphasis', muscle_emphasis,
            'split_type', split_type,
            'mesocycle_exercise_id', mesocycle_exercise_id,
            'exercise_id', exercise_id,
            'exercise', jsonb_build_object(
                'canonical_id', exercise_canonical_id,
                'display_name_en', exercise_display_name_en,
                'aliases', exercise_name_aliases,
                'status', exercise_status,
                'keywords', exercise_keywords,
                'tags', exercise_tags,
                'primary_movement_pattern', exercise_primary_movement_pattern,
                'mechanics_type', exercise_mechanics_type,
                'kinematic_context', exercise_kinematic_context
            ),
            'week_plans', week_plans,
            'workout_id', workout_id,
            'workout_started_at', workout_started_at,
            'workout_completed_at', workout_completed_at,
            'workout_notes', workout_notes,
            'workout_exercise_id', workout_exercise_id,
            'workout_exercise_exercise_id', workout_exercise_exercise_id,
            'order_index', order_index,
            'superset_group', superset_group,
            'soreness_from_last', soreness_from_last,
            'pump', pump,
            'effort', effort,
            'joint_pain', joint_pain,
            'recovery_gate', recovery_gate,
            'stimulus_score', stimulus_score,
            'workout_set_id', workout_set_id,
            'set_number', set_number,
            'target_reps', target_reps,
            'actual_reps', actual_reps,
            'weight_kg', weight_kg,
            'target_rir_raw', target_rir_raw,
            'achieved_rir_raw', achieved_rir_raw,
            'e1rm', e1rm,
            'total_volume', total_volume
        )
    ) INTO result
    FROM comprehensive_data;
    
    RETURN COALESCE(result, '[]'::jsonb);
END;$$;


ALTER FUNCTION "public"."get_comprehensive_mesocycle_data"("user_id_param" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_exercise_library_simple"() RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_agg(
        jsonb_build_object(
            'exercise_uid', el.exercise_uid,
            'exercise_display_name_en', el.exercise_display_name_en,
            'exercise_muscle_groups_simple', el.exercise_muscle_groups_simple
        )
        ORDER BY el.exercise_display_name_en
    ) INTO result
    FROM exercise_library el
    WHERE el.exercise_status = 'active';

    RETURN COALESCE(result, '[]'::jsonb);
END;
$$;


ALTER FUNCTION "public"."get_exercise_library_simple"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_exercise_trend"("p_user_id" "uuid", "p_exercise_id" "uuid", "p_days_back" integer DEFAULT 14) RETURNS TABLE("trend_direction" "text", "avg_e1rm" numeric, "sessions_count" integer)
    LANGUAGE "sql"
    AS $$
  with per_session as (
    select
      w.user_id,
      we.exercise_id,
      w.started_at as session_date,
      max(ws.e1rm) as session_best_e1rm
    from workout_sets ws
    join workout_exercises we on we.id = ws.workout_exercise_id
    join workouts w on w.id = we.workout_id
    where w.user_id = p_user_id and we.exercise_id = p_exercise_id
      and ws.is_effective_set = true
    group by w.user_id, we.exercise_id, w.started_at
  ),
  recent as (
    select avg(session_best_e1rm) as a, count(*) as n
    from per_session
    where session_date >= now() - make_interval(days => p_days_back)
  ),
  prior as (
    select avg(session_best_e1rm) as a
    from per_session
    where session_date <  now() - make_interval(days => p_days_back)
      and session_date >= now() - make_interval(days => p_days_back*2)
  )
  select
    case
      when r.a is null then 'insufficient_data'
      when p.a is null then 'maintaining'
      when r.a > p.a then 'improving'
      when r.a < p.a then 'declining'
      else 'maintaining'
    end as trend_direction,
    r.a as avg_e1rm,
    r.n as sessions_count
  from recent r left join prior p on true
$$;


ALTER FUNCTION "public"."get_exercise_trend"("p_user_id" "uuid", "p_exercise_id" "uuid", "p_days_back" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_mesocycle_details"("mesocycle_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql"
    AS $$DECLARE
    result JSONB;
BEGIN
    WITH workout_sets_agg AS (
        SELECT
            workout_exercise_id,
            jsonb_agg(to_jsonb(ws.*) ORDER BY ws.set_number) as sets_data
        FROM workout_sets ws
        GROUP BY workout_exercise_id
    ),
    workout_exercises_agg AS (
        SELECT
            w.id as workout_id,
            jsonb_agg(
                to_jsonb(we.*) || jsonb_build_object(
                    'exercise', COALESCE(to_jsonb(el.*), '{}'::jsonb),
                    'sets', COALESCE(wsa.sets_data, '[]'::jsonb)
                )
                ORDER BY we.order_index
            ) as exercises_data
        FROM workouts w
        LEFT JOIN workout_exercises we ON we.workout_id = w.id
        LEFT JOIN exercise_library el ON we.exercise_id::text = el.exercise_uid
        LEFT JOIN workout_sets_agg wsa ON wsa.workout_exercise_id = we.id
        WHERE w.mesocycle_block_id = mesocycle_id
        GROUP BY w.id
    ),
    workouts_agg AS (
        SELECT
            w.mesocycle_block_id,
            jsonb_agg(
                to_jsonb(w.*) || jsonb_build_object('exercises', COALESCE(wea.exercises_data, '[]'::jsonb))
                ORDER BY w.started_at DESC
            ) as workouts_data
        FROM workouts w
        LEFT JOIN workout_exercises_agg wea ON wea.workout_id = w.id
        WHERE w.mesocycle_block_id = mesocycle_id
        GROUP BY w.mesocycle_block_id
    )
    SELECT jsonb_agg(
        to_jsonb(m.*) || jsonb_build_object('workouts', COALESCE(wa.workouts_data, '[]'::jsonb))
        ORDER BY m.start_date DESC
    ) INTO result
    FROM mesocycle m
    LEFT JOIN workouts_agg wa ON wa.mesocycle_block_id = m.id
    WHERE m.id = mesocycle_id;

    RETURN result;
END;$$;


ALTER FUNCTION "public"."get_mesocycle_details"("mesocycle_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_mesocycle_exercises_only"("user_id_param" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_agg(
        jsonb_build_object(
            'mesocycle_id', m.id,
            'mesocycle_name', m.name,
            'goal', m.goal,
            'status', m.status,
            'start_date', m.start_date,
            'num_weeks', m.num_weeks,
            'days_per_week', m.days_per_week,
            'muscle_emphasis', m.muscle_emphasis,
            'split_type', m.split_type,
            'mesocycle_exercise_id', me.id,
            'exercise_id', me.exercise_id,
            'exercise', jsonb_build_object(
                'canonical_id', el.exercise_canonical_id,
                'display_name_en', el.exercise_display_name_en,
                'aliases', el.exercise_name_aliases,
                'status', el.exercise_status,
                'keywords', el.exercise_keywords,
                'tags', el.exercise_tags,
                'primary_movement_pattern', el.exercise_primary_movement_pattern,
                'mechanics_type', el.exercise_mechanics_type,
                'kinematic_context', el.exercise_kinematic_context
            ),
            'week_plans', me.week_plans,
            'workout_id', NULL,
            'workout_started_at', NULL,
            'workout_completed_at', NULL,
            'workout_notes', NULL,
            'workout_exercise_id', NULL,
            'workout_exercise_exercise_id', NULL,
            'order_index', NULL,
            'superset_group', NULL,
            'soreness_from_last', NULL,
            'pump', NULL,
            'effort', NULL,
            'joint_pain', NULL,
            'recovery_gate', NULL,
            'stimulus_score', NULL,
            'workout_set_id', NULL,
            'set_number', NULL,
            'target_reps', NULL,
            'actual_reps', NULL,
            'weight_kg', NULL,
            'target_rir_raw', NULL,
            'achieved_rir_raw', NULL,
            'e1rm', NULL,
            'total_volume', NULL
        )
    ) INTO result
    FROM 
        mesocycle m
    LEFT JOIN 
        "mesocycle.exercises" me ON m.id = me.mesocycle_block_id
    LEFT JOIN 
        exercise_library el ON me.exercise_id::text = el.exercise_uid
    WHERE 
        m.user_id = user_id_param
        AND me.id IS NOT NULL
    ORDER BY 
        m.start_date DESC,
        me.id;
    
    RETURN COALESCE(result, '[]'::jsonb);
END;
$$;


ALTER FUNCTION "public"."get_mesocycle_exercises_only"("user_id_param" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_mesocycle_templates_and_exercises"() RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    templates_result JSONB;
    exercises_result JSONB;
    final_result JSONB;
BEGIN
    -- Get mesocycle templates
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', mt.id,
            'name', mt.name,
            'start_date', mt.start_date,
            'num_weeks', mt.num_weeks,
            'goal', mt.goal,
            'status', mt.status,
            'deload_week', mt.deload_week,
            'created_at', mt.created_at,
            'last_modified', mt.last_modified,
            'days_per_week', mt.days_per_week,
            'muscle_emphasis', mt.muscle_emphasis,
            'length_weeks', mt.length_weeks,
            'minutes_per_session', mt.minutes_per_session,
            'weight_now', mt.weight_now,
            'joint_pain_now', mt.joint_pain_now,
            'split_type', mt.split_type,
            'exercise_variation', mt.exercise_variation
        )
        ORDER BY mt.created_at DESC
    ) INTO templates_result
    FROM mesocycle.templates mt;

    -- Get exercise library data
    SELECT jsonb_agg(
        jsonb_build_object(
            'exercise_uid', el.exercise_uid,
            'exercise_canonical_id', el.exercise_canonical_id,
            'exercise_display_name_en', el.exercise_display_name_en,
            'exercise_name_aliases', el.exercise_name_aliases,
            'exercise_status', el.exercise_status,
            'exercise_keywords', el.exercise_keywords,
            'exercise_tags', el.exercise_tags,
            'exercise_primary_movement_pattern', el.exercise_primary_movement_pattern,
            'exercise_mechanics_type', el.exercise_mechanics_type,
            'exercise_kinematic_context', el.exercise_kinematic_context,
            'exercise_muscle_groups_simple', el.exercise_muscle_groups_simple,
            'created_at', el.created_at,
            'updated_at', el.updated_at
        )
        ORDER BY el.exercise_display_name_en
    ) INTO exercises_result
    FROM exercise_library el
    WHERE el.exercise_status = 'active';

    -- Combine both results
    SELECT jsonb_build_object(
        'mesocycle_templates', COALESCE(templates_result, '[]'::jsonb),
        'exercise_library', COALESCE(exercises_result, '[]'::jsonb),
        'total_templates', jsonb_array_length(COALESCE(templates_result, '[]'::jsonb)),
        'total_exercises', jsonb_array_length(COALESCE(exercises_result, '[]'::jsonb))
    ) INTO final_result;

    RETURN final_result;
END;
$$;


ALTER FUNCTION "public"."get_mesocycle_templates_and_exercises"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_mesocycle_templates_only"() RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    result JSONB;
BEGIN
    -- Ensure the table exists first
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'mesocycle' AND table_name = 'templates') THEN
        CREATE SCHEMA IF NOT EXISTS mesocycle;
        
        CREATE TABLE mesocycle.templates (
            id uuid NOT NULL DEFAULT gen_random_uuid(),
            name text NOT NULL,
            start_date date NOT NULL,
            num_weeks smallint NOT NULL,
            goal public.mesocycle_goal_enum NOT NULL,
            status public.mesocycle_status_enum NOT NULL DEFAULT 'planning'::mesocycle_status_enum,
            deload_week smallint GENERATED ALWAYS AS (num_weeks) STORED NULL,
            created_at timestamp with time zone NOT NULL DEFAULT now(),
            last_modified timestamp with time zone NOT NULL DEFAULT now(),
            days_per_week numeric NULL,
            muscle_emphasis text[] NULL,
            length_weeks numeric NULL,
            minutes_per_session numeric NULL,
            weight_now numeric NULL,
            joint_pain_now text[] NULL,
            split_type text NULL,
            exercise_variation numeric NULL,
            CONSTRAINT mesocycle_templates_pkey PRIMARY KEY (id),
            CONSTRAINT program_blocks_num_weeks_check CHECK (
                (num_weeks >= 4) AND (num_weeks <= 8)
            )
        ) TABLESPACE pg_default;
    END IF;

    SELECT jsonb_agg(
        jsonb_build_object(
            'id', mt.id,
            'name', mt.name,
            'start_date', mt.start_date,
            'num_weeks', mt.num_weeks,
            'goal', mt.goal,
            'status', mt.status,
            'deload_week', mt.deload_week,
            'created_at', mt.created_at,
            'last_modified', mt.last_modified,
            'days_per_week', mt.days_per_week,
            'muscle_emphasis', mt.muscle_emphasis,
            'length_weeks', mt.length_weeks,
            'minutes_per_session', mt.minutes_per_session,
            'weight_now', mt.weight_now,
            'joint_pain_now', mt.joint_pain_now,
            'split_type', mt.split_type,
            'exercise_variation', mt.exercise_variation
        )
        ORDER BY mt.created_at DESC
    ) INTO result
    FROM mesocycle.templates mt;

    RETURN COALESCE(result, '[]'::jsonb);
END;
$$;


ALTER FUNCTION "public"."get_mesocycle_templates_only"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_mesocycle_templates_with_exercises"() RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    result JSONB;
BEGIN
    -- First, ensure the mesocycle.templates table exists
    -- If it doesn't exist, create it based on the provided schema
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'mesocycle' AND table_name = 'templates') THEN
        -- Create the mesocycle schema if it doesn't exist
        CREATE SCHEMA IF NOT EXISTS mesocycle;
        
        -- Create the mesocycle.templates table
        CREATE TABLE mesocycle.templates (
            id uuid NOT NULL DEFAULT gen_random_uuid(),
            name text NOT NULL,
            start_date date NOT NULL,
            num_weeks smallint NOT NULL,
            goal public.mesocycle_goal_enum NOT NULL,
            status public.mesocycle_status_enum NOT NULL DEFAULT 'planning'::mesocycle_status_enum,
            deload_week smallint GENERATED ALWAYS AS (num_weeks) STORED NULL,
            created_at timestamp with time zone NOT NULL DEFAULT now(),
            last_modified timestamp with time zone NOT NULL DEFAULT now(),
            days_per_week numeric NULL,
            muscle_emphasis text[] NULL,
            length_weeks numeric NULL,
            minutes_per_session numeric NULL,
            weight_now numeric NULL,
            joint_pain_now text[] NULL,
            split_type text NULL,
            exercise_variation numeric NULL,
            CONSTRAINT mesocycle_templates_pkey PRIMARY KEY (id),
            CONSTRAINT program_blocks_num_weeks_check CHECK (
                (num_weeks >= 4) AND (num_weeks <= 8)
            )
        ) TABLESPACE pg_default;
        
        -- Create indexes for performance
        CREATE INDEX idx_mesocycle_templates_goal ON mesocycle.templates(goal);
        CREATE INDEX idx_mesocycle_templates_status ON mesocycle.templates(status);
        CREATE INDEX idx_mesocycle_templates_num_weeks ON mesocycle.templates(num_weeks);
    END IF;

    -- Fetch mesocycle templates with exercise library data
    SELECT jsonb_agg(
        jsonb_build_object(
            'template_id', mt.id,
            'template_name', mt.name,
            'start_date', mt.start_date,
            'num_weeks', mt.num_weeks,
            'goal', mt.goal,
            'status', mt.status,
            'deload_week', mt.deload_week,
            'created_at', mt.created_at,
            'last_modified', mt.last_modified,
            'days_per_week', mt.days_per_week,
            'muscle_emphasis', mt.muscle_emphasis,
            'length_weeks', mt.length_weeks,
            'minutes_per_session', mt.minutes_per_session,
            'weight_now', mt.weight_now,
            'joint_pain_now', mt.joint_pain_now,
            'split_type', mt.split_type,
            'exercise_variation', mt.exercise_variation,
            'exercise_library', exercise_data
        )
        ORDER BY mt.created_at DESC
    ) INTO result
    FROM mesocycle.templates mt
    LEFT JOIN LATERAL (
        SELECT jsonb_agg(
            jsonb_build_object(
                'exercise_uid', el.exercise_uid,
                'exercise_canonical_id', el.exercise_canonical_id,
                'exercise_display_name_en', el.exercise_display_name_en,
                'exercise_name_aliases', el.exercise_name_aliases,
                'exercise_status', el.exercise_status,
                'exercise_keywords', el.exercise_keywords,
                'exercise_tags', el.exercise_tags,
                'exercise_primary_movement_pattern', el.exercise_primary_movement_pattern,
                'exercise_mechanics_type', el.exercise_mechanics_type,
                'exercise_kinematic_context', el.exercise_kinematic_context,
                'exercise_muscle_groups_simple', el.exercise_muscle_groups_simple
            )
            ORDER BY el.exercise_display_name_en
        ) as exercise_data
        FROM exercise_library el
        WHERE el.exercise_status = 'active'
    ) exercises ON true;

    RETURN COALESCE(result, '[]'::jsonb);
END;
$$;


ALTER FUNCTION "public"."get_mesocycle_templates_with_exercises"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_mesocycles_summary"("user_id_param" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql"
    AS $$DECLARE
    result JSONB;
BEGIN
    WITH mesocycle_workout_counts AS (
        SELECT
            m.id as mesocycle_id,
            COUNT(w.id) as total_workouts
        FROM mesocycle m
        LEFT JOIN workouts w ON w.mesocycle_block_id = m.id
        GROUP BY m.id
    )
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', m.id,
            'name', m.name,
            'num_weeks', m.num_weeks,
            'total_workouts', COALESCE(mwc.total_workouts, 0)
        )
        ORDER BY m.start_date DESC
    ) INTO result
    FROM mesocycle m
    LEFT JOIN mesocycle_workout_counts mwc ON mwc.mesocycle_id = m.id
    WHERE m.user_id = user_id_param;

    RETURN COALESCE(result, '[]'::jsonb);
END;$$;


ALTER FUNCTION "public"."get_mesocycles_summary"("user_id_param" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_mesocycles_with_sets"("user_id_param" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql"
    AS $$DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_agg(
        jsonb_build_object(
            'mesocycle_id', m.id,
            'mesocycle_name', m.name,
            'goal', m.goal,
            'status', m.status,
            'start_date', m.start_date,
            'num_weeks', m.num_weeks,
            'days_per_week', m.days_per_week,
            'muscle_emphasis', m.muscle_emphasis,
            'split_type', m.split_type,
            'workouts', workout_data
        )
        ORDER BY m.start_date DESC
    ) INTO result
    FROM mesocycle m
    LEFT JOIN LATERAL (
        SELECT jsonb_agg(
            jsonb_build_object(
                'id', w.id,
                'started_at', w.started_at,
                'completed_at', w.completed_at,
                'notes', w.notes,
                'exercises', exercise_data,
                'workout_day', w.workout_day,
                'workout_week', w.workout_week
            )
            ORDER BY w.started_at DESC
        ) as workout_data
        FROM workouts w
        LEFT JOIN LATERAL (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'exercise_id', we.exercise_id,
                    'exercise', jsonb_build_object(
                        'canonical_id', el.exercise_canonical_id,
                        'display_name_en', el.exercise_display_name_en,
                        'aliases', el.exercise_name_aliases,
                        'status', el.exercise_status,
                        'keywords', el.exercise_keywords,
                        'tags', el.exercise_tags,
                        'primary_movement_pattern', el.exercise_primary_movement_pattern,
                        'mechanics_type', el.exercise_mechanics_type,
                        'kinematic_context', el.exercise_kinematic_context,
                        'muscle_groups', el.exercise_muscle_groups_simple
                    ),
                    'workout_exercise_id', we.id,
                    'order_index', we.order_index,
                    'superset_group', we.superset_group,
                    'soreness_from_last', we.soreness_from_last,
                    'pump', we.pump,
                    'effort', we.effort,
                    'joint_pain', we.joint_pain,
                    'recovery_gate', we.recovery_gate,
                    'stimulus_score', we.stimulus_score,
                    'sets', set_data
                )
                ORDER BY we.order_index
            ) as exercise_data
            FROM workout_exercises we
            LEFT JOIN exercise_library el ON we.exercise_id::text = el.exercise_uid
            LEFT JOIN LATERAL (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'workout_set_id', ws.id,
                        'set_number', ws.set_number,
                        'target_reps', ws.target_reps,
                        'actual_reps', ws.actual_reps,
                        'weight_kg', ws.weight_kg,
                        'target_rir_raw', ws.target_rir_raw,
                        'achieved_rir_raw', ws.achieved_rir_raw,
                        'e1rm', ws.e1rm,
                        'total_volume', ws.total_volume,
                        'status',ws.status
                    )
                    ORDER BY ws.set_number
                ) as set_data
                FROM workout_sets ws
                WHERE ws.workout_exercise_id = we.id
            ) sets ON true
            WHERE we.workout_id = w.id
        ) exercises ON true
        WHERE w.mesocycle_block_id = m.id
    ) workouts ON true
    WHERE m.user_id = user_id_param;
    
    RETURN COALESCE(result, '[]'::jsonb);
END;$$;


ALTER FUNCTION "public"."get_mesocycles_with_sets"("user_id_param" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_mesocycles_with_sets_new"("user_id_param" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql"
    AS $$DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', m.id,
            'name', m.name,
            'goal', m.goal,
            'status', m.status,
            'start_date', m.start_date,
            'num_weeks', m.num_weeks,
            'days_per_week', m.days_per_week,
            'muscle_emphasis', m.muscle_emphasis,
            'split_type', m.split_type,
            'workouts', workout_data
        )
        ORDER BY m.start_date DESC
    ) INTO result
    FROM mesocycle m
    LEFT JOIN LATERAL (
        SELECT jsonb_agg(
            jsonb_build_object(
                'id', w.id,
                'started_at', w.started_at,
                'completed_at', w.completed_at,
                'notes', w.notes,
                'exercises', exercise_data,
                'workout_day', w.workout_day,
                'workout_week', w.workout_week
            )
            ORDER BY w.started_at DESC
        ) as workout_data
        FROM workouts w
        LEFT JOIN LATERAL (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'exercise_id', we.exercise_id,
                    'exercise', jsonb_build_object(
                        'exercise_canonical_id', el.exercise_canonical_id,
                        'exercise_display_name_en', el.exercise_display_name_en,
                        'exercise_name_aliases', el.exercise_name_aliases,
                        'exercise_status', el.exercise_status,
                        'exercise_keywords', el.exercise_keywords,
                        'exercise_tags', el.exercise_tags,
                        'exercise_primary_movement_pattern', el.exercise_primary_movement_pattern,
                        'exercise_mechanics_type', el.exercise_mechanics_type,
                        'exercise_kinematic_context', el.exercise_kinematic_context,
                        'exercise_muscle_groups_simple', el.exercise_muscle_groups_simple
                    ),
                    'workout_exercise_id', we.id,
                    'order_index', we.order_index,
                    'superset_group', we.superset_group,
                    'soreness_from_last', we.soreness_from_last,
                    'pump', we.pump,
                    'effort', we.effort,
                    'joint_pain', we.joint_pain,
                    'recovery_gate', we.recovery_gate,
                    'stimulus_score', we.stimulus_score,
                    'sets', set_data
                )
                ORDER BY we.order_index
            ) as exercise_data
            FROM workout_exercises we
            LEFT JOIN exercise_library el ON we.exercise_id::text = el.exercise_uid
            LEFT JOIN LATERAL (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'id', ws.id,
                        'set_number', ws.set_number,
                        'target_reps', ws.target_reps,
                        'actual_reps', ws.actual_reps,
                        'weight_kg', ws.weight_kg,
                        'target_rir_raw', ws.target_rir_raw,
                        'achieved_rir_raw', ws.achieved_rir_raw,
                        'e1rm', ws.e1rm,
                        'total_volume', ws.total_volume,
                        'status',ws.status
                    )
                    ORDER BY ws.set_number
                ) as set_data
                FROM workout_sets ws
                WHERE ws.workout_exercise_id = we.id
            ) sets ON true
            WHERE we.workout_id = w.id
        ) exercises ON true
        WHERE w.mesocycle_block_id = m.id
    ) workouts ON true
    WHERE m.user_id = user_id_param;
    
    RETURN COALESCE(result, '[]'::jsonb);
END;$$;


ALTER FUNCTION "public"."get_mesocycles_with_sets_new"("user_id_param" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_workouts_with_exercises_and_sets_by_week"("mesocycle_id_param" "uuid", "workout_week_param" integer) RETURNS "jsonb"
    LANGUAGE "plpgsql"
    AS $$DECLARE
    result JSONB;
BEGIN
    WITH workouts AS (
        SELECT *
        FROM workouts
        WHERE mesocycle_block_id = mesocycle_id_param
          AND workout_week = workout_week_param
    ),
    workout_exercises_with_details AS (
        SELECT
            we.*,
            to_jsonb(e.*) as exercise
        FROM workout_exercises we
        INNER JOIN exercise_library e ON e.exercise_uid = we.exercise_id::text
        WHERE we.workout_id IN (SELECT id FROM workouts)
    ),
    workout_sets_by_exercise AS (
        SELECT
            workout_exercise_id,
            jsonb_agg(to_jsonb(ws.*) ORDER BY ws.set_number) as sets
        FROM workout_sets ws
        WHERE ws.workout_exercise_id IN (SELECT id FROM workout_exercises_with_details)
        GROUP BY workout_exercise_id
    ),
    exercises_with_sets AS (
        SELECT
            wed.*,
            COALESCE(wsbe.sets, '[]'::jsonb) as sets
        FROM workout_exercises_with_details wed
        LEFT JOIN workout_sets_by_exercise wsbe ON wsbe.workout_exercise_id = wed.id
    ),
    workouts_with_exercises AS (
        SELECT
            w.*,
            COALESCE(
                jsonb_agg(to_jsonb(ews.*) ORDER BY ews.order_index) FILTER (WHERE ews.id IS NOT NULL),
                '[]'::jsonb
            ) as exercises
        FROM workouts w
        LEFT JOIN exercises_with_sets ews ON ews.workout_id = w.id
        GROUP BY w.id, w.user_id, w.mesocycle_block_id, w.started_at, w.completed_at,
                 w.abandoned_at, w.abandon_reason, w.pre_workout_fatigue, w.location,
                 w.is_public, w.notes, w.created_at, w.last_modified, w.workout_day, w.workout_week
    )
    SELECT jsonb_agg(to_jsonb(wwe.*) ORDER BY wwe.workout_day) INTO result
    FROM workouts_with_exercises wwe;

    RETURN COALESCE(result, '[]'::jsonb);
END;$$;


ALTER FUNCTION "public"."get_workouts_with_exercises_and_sets_by_week"("mesocycle_id_param" "uuid", "workout_week_param" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_calibration_set_progression"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    next_set_record RECORD;
    current_set_type TEXT;
    current_set_number INTEGER;
    current_weight DECIMAL(8,2);
    current_reps INTEGER;
BEGIN
    -- Only proceed if status changed to 'done'
    IF NEW.status != 'done' OR OLD.status = 'done' THEN
        RETURN NEW;
    END IF;
    
    -- Get current set details
    current_set_type := NEW.set_type;
    current_set_number := NEW.set_number;
    current_weight := NEW.weight_kg;
    current_reps := NEW.actual_reps;
    
    -- Handle calibration set (set 1) completion
    IF current_set_type = 'calibration' AND current_set_number = 1 THEN
        -- Find the next set (set 2) for the same exercise
        SELECT * INTO next_set_record
        FROM workout_sets 
        WHERE workout_exercise_id = NEW.workout_exercise_id 
          AND set_number = 2
          AND set_type = 'working'
        LIMIT 1;
        
        -- If next set exists and has no weight/reps set, copy from calibration set
        IF next_set_record.id IS NOT NULL AND 
           (next_set_record.weight_kg IS NULL OR next_set_record.weight_kg = 0) AND
           (next_set_record.actual_reps IS NULL OR next_set_record.actual_reps = 0) THEN
            
            UPDATE workout_sets 
            SET 
                weight_kg = current_weight,
                actual_reps = current_reps,
                last_modified = NOW()
            WHERE id = next_set_record.id;
            
            RAISE NOTICE 'Copied calibration set data to set 2: weight=%, reps=%', current_weight, current_reps;
        END IF;
        
    -- Handle validation set (set 2) completion  
    ELSIF current_set_type = 'validation' AND current_set_number = 2 THEN
        -- Find the next set (set 3) for the same exercise
        SELECT * INTO next_set_record
        FROM workout_sets 
        WHERE workout_exercise_id = NEW.workout_exercise_id 
          AND set_number = 3
          AND set_type = 'working'
        LIMIT 1;
        
        -- If next set exists and has no weight/reps set, apply progression
        IF next_set_record.id IS NOT NULL AND 
           (next_set_record.weight_kg IS NULL OR next_set_record.weight_kg = 0) AND
           (next_set_record.actual_reps IS NULL OR next_set_record.actual_reps = 0) THEN
            
            -- Apply progression: weight + 5kg, reps + 2
            UPDATE workout_sets 
            SET 
                weight_kg = COALESCE(current_weight, 0) + 5,
                actual_reps = COALESCE(current_reps, 0) + 2,
                last_modified = NOW()
            WHERE id = next_set_record.id;
            
            RAISE NOTICE 'Applied validation set progression to set 3: weight=%, reps=%', 
                COALESCE(current_weight, 0) + 5, COALESCE(current_reps, 0) + 2;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_calibration_set_progression"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_delete_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$BEGIN
    DELETE FROM public.profiles WHERE user_id = OLD.id;
    RAISE LOG 'Profile deleted for user: %', OLD.id;
    RETURN OLD;
END;$$;


ALTER FUNCTION "public"."handle_delete_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_deleted_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    user_record RECORD;
BEGIN
    -- Store the OLD record for debugging
    user_record := OLD;
    
    -- Log deletion for debugging
    RAISE LOG 'Deleting user with ID: %', OLD.id;
    
    -- Delete from profiles using the correct ID reference
    DELETE FROM public.profiles WHERE user_id = OLD.id;
    
    -- Log success
    RAISE LOG 'Successfully deleted profile for user ID: %', OLD.id;
    
    RETURN OLD;
END;
$$;


ALTER FUNCTION "public"."handle_deleted_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$BEGIN
    -- Log the record structure for debugging
    RAISE LOG 'NEW record: %', NEW;
    
    -- First check if a profile already exists to avoid duplicates
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = NEW.id) THEN
        INSERT INTO public.profiles (
            user_id, 
            email, 
            timezone,
            onboarding_completed,
            research_consent,
            created_at,
            is_admin,
            last_modified
        )
        VALUES (
            NEW.id,  -- Use NEW.id which is the primary key in auth.users
            COALESCE(NEW.email, ''), -- Ensure email has a fallback value
            00,
            FALSE,
            FALSE,
            NOW(),
            FALSE,
             NOW()
        );
    END IF;
    
    RETURN NEW;
END;$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_simple_calibration"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Only process calibration sets that were just completed
  IF NEW.is_calibration = TRUE 
     AND NEW.actual_reps IS NOT NULL 
     AND NEW.weight_kg IS NOT NULL
     AND (OLD IS NULL OR OLD.actual_reps IS NULL OR OLD.weight_kg IS NULL) THEN
    
    -- Update Set 2 with same weight and reps from Set 1
    UPDATE workout_sets 
    SET 
      weight_kg = NEW.weight_kg,
      target_reps = NEW.actual_reps,
      last_modified = NOW()
    WHERE workout_exercise_id = NEW.workout_exercise_id 
      AND set_number = 2;
    
    -- Log what happened
    RAISE NOTICE 'Calibration: Updated Set 2 with weight % kg and % reps for exercise %', 
                 NEW.weight_kg, NEW.actual_reps, NEW.workout_exercise_id;
    
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_simple_calibration"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    AS $$SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."progressive_overload_algo_v3"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    next_set_record RECORD;
    current_set_type TEXT;
    current_set_number INTEGER;
    current_weight DECIMAL(8,2);
    current_reps INTEGER;
    current_workout_week INTEGER;
    current_workout_day INTEGER;
    current_exercise_id TEXT;
    current_mesocycle_id TEXT;
    week2_set_record RECORD;
    week3_set_record RECORD;
    exercise_mechanics_type TEXT;
    target_reps_min INTEGER;
    target_reps_max INTEGER;
    weekly_progression_rate DECIMAL(5,3);
    mesocycle_weeks INTEGER;
    completed_current_week_sets INTEGER;
    total_current_week_sets INTEGER;
    next_week INTEGER;
BEGIN
    -- Only proceed if status changed to 'done'
    IF NEW.status != 'done' OR OLD.status = 'done' THEN
        RETURN NEW;
    END IF;
    
    -- Get current set details
    current_set_type := NEW.set_type;
    current_set_number := NEW.set_number;
    current_weight := NEW.weight_kg;
    current_reps := NEW.actual_reps;
    
    -- Get workout and exercise context
    SELECT w.workout_week, w.workout_day, we.exercise_id::text, w.mesocycle_block_id::text, el.exercise_mechanics_type
    INTO current_workout_week, current_workout_day, current_exercise_id, current_mesocycle_id, exercise_mechanics_type
    FROM workout_sets ws
    JOIN workout_exercises we ON ws.workout_exercise_id = we.id
    JOIN workouts w ON we.workout_id = w.id
    JOIN exercise_library el ON we.exercise_id::text = el.exercise_uid
    WHERE ws.id = NEW.id;
    
    -- Set target reps based on exercise mechanics type
    IF exercise_mechanics_type = 'compound' THEN
        target_reps_min := 8;
        target_reps_max := 12;
    ELSIF exercise_mechanics_type = 'isolation' THEN
        target_reps_min := 12;
        target_reps_max := 20;
    ELSE
        -- Default to compound if mechanics type is unknown
        target_reps_min := 8;
        target_reps_max := 12;
    END IF;
    
    -- Handle calibration set (set 1) completion
    IF current_set_type = 'calibration' AND current_set_number = 1 THEN
        -- Find the next set (set 2) for the same exercise
        SELECT * INTO next_set_record
        FROM workout_sets 
        WHERE workout_exercise_id = NEW.workout_exercise_id 
          AND set_number = 2
          AND set_type = 'validation'
        LIMIT 1;
        
        -- If next set exists and has no weight/reps set, calculate working weight from calibration
        IF next_set_record.id IS NOT NULL AND 
           (next_set_record.weight_kg IS NULL OR next_set_record.weight_kg = 0) AND
           (next_set_record.actual_reps IS NULL OR next_set_record.actual_reps = 0) THEN
            
            -- Calculate working weight based on calibration reps
            DECLARE
                working_weight DECIMAL(8,2);
                validation_reps INTEGER;
            BEGIN
                IF current_reps >= 11 AND current_reps <= 12 THEN
                    working_weight := current_weight * 0.88;
                ELSIF current_reps = 10 THEN
                    working_weight := current_weight * 0.85;
                ELSIF current_reps >= 8 AND current_reps <= 9 THEN
                    working_weight := current_weight * 0.82;
                ELSE
                    -- Fallback to original weight if reps are outside expected range
                    working_weight := current_weight;
                END IF;
                
                -- Set target reps for validation set based on exercise mechanics
                IF exercise_mechanics_type = 'compound' THEN
                    validation_reps := 10;
                ELSIF exercise_mechanics_type = 'isolation' THEN
                    validation_reps := 15;
                ELSE
                    validation_reps := 10; -- Default to compound
                END IF;
                
                UPDATE workout_sets 
                SET 
                    weight_kg = working_weight,
                    actual_reps = validation_reps,
                    last_modified = NOW()
                WHERE id = next_set_record.id;
                
                RAISE NOTICE 'Calculated validation set weight from calibration: original_weight=%, calibration_reps=%, working_weight=%, validation_reps=%', 
                    current_weight, current_reps, working_weight, validation_reps;
            END;
        END IF;
        
    -- Handle validation set (set 2) completion  
    ELSIF current_set_type = 'validation' AND current_set_number = 2 THEN
        -- Find the next set (set 3) for the same exercise
        SELECT * INTO next_set_record
        FROM workout_sets 
        WHERE workout_exercise_id = NEW.workout_exercise_id 
          AND set_number = 3
          AND set_type = 'working'
        LIMIT 1;
        
        -- If next set exists and has no weight/reps set, calculate working weight based on validation performance
        IF next_set_record.id IS NOT NULL AND 
           (next_set_record.weight_kg IS NULL OR next_set_record.weight_kg = 0) AND
           (next_set_record.actual_reps IS NULL OR next_set_record.actual_reps = 0) THEN
            
            -- Calculate working weight based on validation set performance
            DECLARE
                working_weight DECIMAL(8,2);
                working_reps INTEGER;
            BEGIN
                -- Set target reps for working set based on exercise mechanics
                IF exercise_mechanics_type = 'compound' THEN
                    working_reps := 10;
                ELSIF exercise_mechanics_type = 'isolation' THEN
                    working_reps := 15;
                ELSE
                    working_reps := 10; -- Default to compound
                END IF;
                
                -- Calculate working weight based on validation reps vs target range
                IF current_reps > target_reps_max THEN
                    -- Reps above range: increase weight by 3%
                    working_weight := current_weight * 1.03;
                ELSIF current_reps >= target_reps_min AND current_reps <= target_reps_max THEN
                    -- Reps in range: keep same weight
                    working_weight := current_weight;
                ELSE
                    -- Reps below range: decrease weight by 3%
                    working_weight := current_weight * 0.97;
                END IF;
                
                UPDATE workout_sets 
                SET 
                    weight_kg = working_weight,
                    actual_reps = working_reps,
                    last_modified = NOW()
                WHERE id = next_set_record.id;
                
                RAISE NOTICE 'Calculated working set from validation: validation_weight=%, validation_reps=%, target_range=% to %, working_weight=%, working_reps=%', 
                    current_weight, current_reps, target_reps_min, target_reps_max, working_weight, working_reps;
            END;
        END IF;
        
    -- Handle working set 3 completion in week 1 - copy to all sets in week 2
    ELSIF current_set_type = 'working' AND current_set_number = 3 AND current_workout_week = 1 THEN
        -- Find all sets for the same exercise in week 2
        FOR week2_set_record IN
            SELECT ws.*
            FROM workout_sets ws
            JOIN workout_exercises we ON ws.workout_exercise_id = we.id
            JOIN workouts w ON we.workout_id = w.id
            WHERE w.mesocycle_block_id::text = current_mesocycle_id
              AND w.workout_week = 2
              AND w.workout_day = current_workout_day
              AND we.exercise_id::text = current_exercise_id
              AND ws.set_type = 'working'
        LOOP
            -- Update week 2 sets with the same weight and reps as week 1 set 3
            UPDATE workout_sets 
            SET 
                weight_kg = current_weight,
                actual_reps = current_reps,
                last_modified = NOW()
            WHERE id = week2_set_record.id;
            
            RAISE NOTICE 'Copied week 1 set 3 data to week 2 set %: weight=%, reps=%', 
                week2_set_record.set_number, current_weight, current_reps;
        END LOOP;
        
    -- Handle completion of all working sets in any week - copy to next week with progression
    ELSIF current_set_type = 'working' AND current_workout_week >= 2 THEN
        -- Check if this is the last/complete set for this exercise in current week
        SELECT COUNT(*) INTO total_current_week_sets
        FROM workout_sets ws
        JOIN workout_exercises we ON ws.workout_exercise_id = we.id
        JOIN workouts w ON we.workout_id = w.id
        WHERE w.mesocycle_block_id::text = current_mesocycle_id
          AND w.workout_week = current_workout_week
          AND w.workout_day = current_workout_day
          AND we.exercise_id::text = current_exercise_id
          AND ws.set_type = 'working';
        
        -- Check how many working sets are completed
        SELECT COUNT(*) INTO completed_current_week_sets
        FROM workout_sets ws
        JOIN workout_exercises we ON ws.workout_exercise_id = we.id
        JOIN workouts w ON we.workout_id = w.id
        WHERE w.mesocycle_block_id::text = current_mesocycle_id
          AND w.workout_week = current_workout_week
          AND w.workout_day = current_workout_day
          AND we.exercise_id::text = current_exercise_id
          AND ws.set_type = 'working'
          AND ws.status = 'done';
        
        -- Get weighted average for week 2 sets (using last set completed)
        DECLARE
            weighted_weight DECIMAL(8,2);
            weighted_reps INTEGER;
        BEGIN
            weighted_weight := current_weight;
            weighted_reps := current_reps;
            
            -- Get mesocycle length
            SELECT mc.num_weeks 
            INTO mesocycle_weeks
            FROM mesocycle mc
            WHERE mc.id::text = current_mesocycle_id;
            
            -- If mesocycle length can't be determined, default to 6 weeks (moderate)
            IF mesocycle_weeks IS NULL OR mesocycle_weeks < 4 THEN
                mesocycle_weeks := 6;
            END IF;
            
            -- Determine weekly progression rate based on mesocycle length and exercise mechanics
            IF mesocycle_weeks <= 4 THEN
                -- Aggressive progression for 4-week mesocycle
                IF exercise_mechanics_type = 'compound' THEN
                    weekly_progression_rate := 0.030; -- 3.0% per week
                ELSE
                    weekly_progression_rate := 0.025; -- 2.5% per week
                END IF;
            ELSIF mesocycle_weeks <= 6 THEN
                -- Moderate progression for 5-6 week mesocycle
                IF exercise_mechanics_type = 'compound' THEN
                    weekly_progression_rate := 0.025; -- 2.5% per week
                ELSE
                    weekly_progression_rate := 0.020; -- 2.0% per week
                END IF;
            ELSE
                -- Conservative progression for 7-8 week mesocycle
                IF exercise_mechanics_type = 'compound' THEN
                    weekly_progression_rate := 0.020; -- 2.0% per week
                ELSE
                    weekly_progression_rate := 0.015; -- 1.5% per week
                END IF;
            END IF;
            
            -- Calculate next week number
            next_week := current_workout_week + 1;
            
            -- Only proceed if all working sets of current week are completed
            IF (completed_current_week_sets = total_current_week_sets) AND total_current_week_sets > 0 THEN
                -- Calculate progression-adjusted weight for next week
                DECLARE
                    next_week_weight DECIMAL(8,2);
                    next_week_reps INTEGER;
                    next_week_record RECORD;
                BEGIN
                    next_week_weight := weighted_weight * (1 + weekly_progression_rate);
                    
                    -- Keep same reps as current week (rep progression handled separately if needed)
                    next_week_reps := weighted_reps;
                    
                    -- Find all sets for the same exercise in next week
                    FOR next_week_record IN
                        SELECT ws.*
                        FROM workout_sets ws
                        JOIN workout_exercises we ON ws.workout_exercise_id = we.id
                        JOIN workouts w ON we.workout_id = w.id
                        WHERE w.mesocycle_block_id::text = current_mesocycle_id
                          AND w.workout_week = next_week
                          AND w.workout_day = current_workout_day
                          AND we.exercise_id::text = current_exercise_id
                          AND ws.set_type ='working'
                    LOOP
                        -- Update next week sets with progressive overload applied
                        UPDATE workout_sets 
                        SET 
                            weight_kg = next_week_weight,
                            actual_reps = next_week_reps,
                            last_modified = NOW()
                        WHERE id = next_week_record.id;
                        
                        RAISE NOTICE 'Applied weekly progression to week % set %: original_weight=%, progression_rate=%, next_weight=%, reps=%', 
                            next_week, next_week_record.set_number, weighted_weight, weekly_progression_rate, next_week_weight, next_week_reps;
                    END LOOP;
                    
                    RAISE NOTICE 'Week % to Week % progression completed: mechanics=%, mesocycle_weeks=%, rate=%', 
                        current_workout_week, next_week, exercise_mechanics_type, mesocycle_weeks, weekly_progression_rate;
                END;
            END IF;
        END;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."progressive_overload_algo_v3"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."progressive_overload_algo_v3"() IS 'Handles automatic progression logic: when calibration set (set 1) is done, calculates working weight for set 2. When validation set (set 2) is done, calculates adjusted weight for set 3. When week 1 set 3 is done, copies values to week 2. When all sets in any week >= 2 are completed, applies mesocycle-appropriate progressive overload to next week';



CREATE OR REPLACE FUNCTION "public"."setup_calibration_sets"("p_workout_exercise_id" "uuid", "p_total_sets" integer DEFAULT 3) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Create Set 1: Calibration set
  INSERT INTO workout_sets (
    workout_exercise_id,
    set_number,
    set_type,
    is_calibration,
    target_reps,
    status
  ) VALUES (
    p_workout_exercise_id,
    1,
    'calibration',
    TRUE,
    10,  -- Target 10 reps for calibration
    'not_started'
  );
  
  -- Create remaining sets: Working sets
  FOR i IN 2..p_total_sets LOOP
    INSERT INTO workout_sets (
      workout_exercise_id,
      set_number,
      set_type,
      is_calibration,
      status
    ) VALUES (
      p_workout_exercise_id,
      i,
      'working',
      TRUE,  -- Still part of calibration process
      'not_started'
    );
  END LOOP;
  
  RAISE NOTICE 'Created % calibration sets for workout exercise %', p_total_sets, p_workout_exercise_id;
END;
$$;


ALTER FUNCTION "public"."setup_calibration_sets"("p_workout_exercise_id" "uuid", "p_total_sets" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_training_config_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.last_modified = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_training_config_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."util_actor_id"() RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- Return the current user ID from the JWT token
    -- This is equivalent to auth.uid() but with a more descriptive name
    RETURN auth.uid();
END;
$$;


ALTER FUNCTION "public"."util_actor_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."util_audit_log"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
declare
  _actor uuid := util_actor_id();
  _pk uuid;
begin
  if TG_OP='INSERT' then
    begin _pk := NEW.id; exception when others then _pk := null; end;
    insert into audit_log(table_name,operation,actor_id,row_pk,new_data)
    values (TG_TABLE_NAME,TG_OP,_actor,_pk,to_jsonb(NEW));
    return NEW;
  elsif TG_OP='UPDATE' then
    begin _pk := NEW.id; exception when others then _pk := null; end;
    insert into audit_log(table_name,operation,actor_id,row_pk,old_data,new_data)
    values (TG_TABLE_NAME,TG_OP,_actor,_pk,to_jsonb(OLD),to_jsonb(NEW));
    return NEW;
  else
    begin _pk := OLD.id; exception when others then _pk := null; end;
    insert into audit_log(table_name,operation,actor_id,row_pk,old_data)
    values (TG_TABLE_NAME,TG_OP,_actor,_pk,to_jsonb(OLD));
    return OLD;
  end if;
end; $$;


ALTER FUNCTION "public"."util_audit_log"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."util_touch_last_modified"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.last_modified := now();
  return new;
end; $$;


ALTER FUNCTION "public"."util_touch_last_modified"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_block_week_plans"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
declare
  weeks int;
  last_key text;
  wk jsonb;
  rir int;
  sets int;
begin
  select num_weeks into weeks from program_blocks where id = coalesce(NEW.block_id, OLD.block_id) for update;
  last_key := 'week' || weeks::text;
  wk := NEW.week_plans -> last_key;
  if wk is null then
    raise exception 'week_plans must include key %', last_key;
  end if;
  rir := (wk ->> 'target_rir')::int;
  sets := (wk ->> 'target_sets')::int;
  if rir is null or sets is null then
    raise exception 'Final week must include target_rir and target_sets';
  end if;
  if not (rir >= 3 or sets <= 2) then
    raise exception 'Final week must represent deload (target_rir >= 3 OR target_sets <= 2)';
  end if;
  return NEW;
end; $$;


ALTER FUNCTION "public"."validate_block_week_plans"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "mesocycle"."templates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "start_date" "date" NOT NULL,
    "num_weeks" smallint NOT NULL,
    "goal" "public"."mesocycle_goal_enum" NOT NULL,
    "status" "public"."mesocycle_status_enum" DEFAULT 'planning'::"public"."mesocycle_status_enum" NOT NULL,
    "deload_week" smallint GENERATED ALWAYS AS ("num_weeks") STORED,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "last_modified" timestamp with time zone DEFAULT "now"() NOT NULL,
    "days_per_week" numeric,
    "muscle_emphasis" "text"[],
    "length_weeks" numeric,
    "minutes_per_session" numeric,
    "weight_now" numeric,
    "joint_pain_now" "text"[],
    "split_type" "text",
    "exercise_variation" numeric,
    CONSTRAINT "program_blocks_num_weeks_check" CHECK ((("num_weeks" >= 4) AND ("num_weeks" <= 8)))
);


ALTER TABLE "mesocycle"."templates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."admin_users" (
    "user_id" "uuid" NOT NULL,
    "granted_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "granted_by" "uuid"
);


ALTER TABLE "public"."admin_users" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."audit_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "occurred_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "table_name" "text" NOT NULL,
    "operation" "text" NOT NULL,
    "actor_id" "uuid",
    "row_pk" "uuid",
    "old_data" "jsonb",
    "new_data" "jsonb",
    CONSTRAINT "audit_log_operation_check" CHECK (("operation" = ANY (ARRAY['INSERT'::"text", 'UPDATE'::"text", 'DELETE'::"text"])))
);


ALTER TABLE "public"."audit_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."data_sources" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "connected_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "last_sync_at" timestamp with time zone,
    "permissions_granted" "text"[] DEFAULT '{}'::"text"[],
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "last_modified" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."data_sources" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."exercise_library" (
    "exercise_uid" "text" NOT NULL,
    "exercise_canonical_id" "text",
    "exercise_slug_id" "text" NOT NULL,
    "exercise_display_name_en" "text",
    "exercise_name_aliases" "text",
    "exercise_status" "text",
    "exercise_keywords" "text",
    "exercise_tags" "text",
    "exercise_i18n_translations" "jsonb",
    "exercise_primary_movement_pattern" "text",
    "exercise_mechanics_type" "text",
    "exercise_kinematic_context" "text",
    "exercise_dominant_plane_of_motion" "text",
    "exercise_functional_vector_modifiers" "text",
    "exercise_movement_drivers" "jsonb",
    "exercise_primary_joint_actions" "text",
    "exercise_joint_rom_degrees" "jsonb",
    "exercise_joint_moment_profiles" "text",
    "exercise_length_bias_by_muscle" "jsonb",
    "exercise_execution_laterality" "text",
    "exercise_range_of_motion_variant" "text",
    "exercise_implement_primary" "text",
    "exercise_implement_secondary" "text",
    "exercise_cable_attachment" "text",
    "exercise_external_line_of_action" "text",
    "exercise_machine_brand" "text",
    "exercise_machine_brand_custom_name" "text",
    "exercise_machine_model" "text",
    "exercise_body_orientation" "text",
    "exercise_bench_angle_degrees" boolean,
    "exercise_back_support_required" "text",
    "exercise_stance_type" "text",
    "exercise_stance_width_category" "text",
    "exercise_foot_rotation_category" "text",
    "exercise_stance_code_by_plane" "text",
    "exercise_grip_orientation" "text",
    "exercise_grip_width_category" "text",
    "exercise_thumb_style" "text",
    "exercise_grip_code_by_plane" "jsonb",
    "exercise_foot_orientation_degrees" "text",
    "exercise_muscles_ta2" "text",
    "exercise_muscle_groups_simple" "jsonb",
    "exercise_muscle_roles" "text",
    "exercise_contraindications" "jsonb",
    "exercise_joint_stress_profile" "text",
    "exercise_icf_tags_optional" "text",
    "exercise_impact_rating" "text",
    "exercise_stability_demand" "text",
    "exercise_coordination_complexity" "text",
    "exercise_variant_of" "text",
    "exercise_progressions" "text",
    "exercise_regressions" "text",
    "exercise_prerequisites" "text",
    "exercise_equipment_alternatives" "text",
    "exercise_similarity_fingerprint" "text",
    "exercise_review_status" "text",
    "exercise_reviewed_by" "text",
    "exercise_review_date" "text",
    "exercise_version" "text",
    "coaching_cues" "text"
);


ALTER TABLE "public"."exercise_library" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."exercise_substitutions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_by_user_id" "uuid",
    "from_exercise_id" "uuid" NOT NULL,
    "substitute_exercise_id" "uuid" NOT NULL,
    "reason" "text",
    "priority" smallint DEFAULT 1 NOT NULL,
    "is_public" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "last_modified" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "exercise_substitutions_priority_check" CHECK ((("priority" >= 1) AND ("priority" <= 10)))
);


ALTER TABLE "public"."exercise_substitutions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."exercises_draft" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."exercises_draft" OWNER TO "postgres";


ALTER TABLE "public"."exercises_draft" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."exercises_draft_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."health_metrics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "source_id" "uuid",
    "metric_type" "text" NOT NULL,
    "value" numeric NOT NULL,
    "unit" "text" NOT NULL,
    "start_date" timestamp with time zone NOT NULL,
    "end_date" timestamp with time zone,
    "device_name" "text",
    "source_name" "text",
    "created_date" timestamp with time zone,
    "updated_date" timestamp with time zone,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "deduplication_hash" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "last_modified" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."health_metrics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."heart_rate_samples" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "source_id" "uuid",
    "date" timestamp with time zone NOT NULL,
    "value" numeric NOT NULL,
    "unit" "text" DEFAULT 'count/min'::"text" NOT NULL,
    "motion_context" "text",
    "workout_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "last_modified" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."heart_rate_samples" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mesocycle" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "start_date" "date" NOT NULL,
    "num_weeks" smallint NOT NULL,
    "goal" "public"."mesocycle_goal_enum" NOT NULL,
    "status" "public"."mesocycle_status_enum" DEFAULT 'planning'::"public"."mesocycle_status_enum" NOT NULL,
    "deload_week" smallint GENERATED ALWAYS AS ("num_weeks") STORED,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "last_modified" timestamp with time zone DEFAULT "now"() NOT NULL,
    "days_per_week" numeric,
    "muscle_emphasis" "text"[],
    "length_weeks" numeric,
    "minutes_per_session" numeric,
    "weight_now" numeric,
    "joint_pain_now" "text"[],
    "split_type" "text",
    "exercise_variation" numeric,
    "workout_days" "text"[],
    CONSTRAINT "program_blocks_num_weeks_check" CHECK ((("num_weeks" >= 4) AND ("num_weeks" <= 8)))
);


ALTER TABLE "public"."mesocycle" OWNER TO "postgres";


COMMENT ON COLUMN "public"."mesocycle"."weight_now" IS 'kg';



CREATE TABLE IF NOT EXISTS "public"."mesocycle.templates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "start_date" "date" NOT NULL,
    "num_weeks" smallint NOT NULL,
    "goal" "public"."mesocycle_goal_enum" NOT NULL,
    "status" "public"."mesocycle_status_enum" DEFAULT 'planning'::"public"."mesocycle_status_enum" NOT NULL,
    "deload_week" smallint GENERATED ALWAYS AS ("num_weeks") STORED,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "last_modified" timestamp with time zone DEFAULT "now"() NOT NULL,
    "days_per_week" numeric,
    "muscle_emphasis" "text"[],
    "length_weeks" numeric,
    "minutes_per_session" numeric,
    "weight_now" numeric,
    "joint_pain_now" "text"[],
    "split_type" "text",
    "exercise_variation" numeric,
    CONSTRAINT "program_blocks_num_weeks_check" CHECK ((("num_weeks" >= 4) AND ("num_weeks" <= 8)))
);


ALTER TABLE "public"."mesocycle.templates" OWNER TO "postgres";


COMMENT ON TABLE "public"."mesocycle.templates" IS 'This is a duplicate of mesocycle';



COMMENT ON COLUMN "public"."mesocycle.templates"."weight_now" IS 'kg';



CREATE OR REPLACE VIEW "public"."mesocycle_blocks_runtime" AS
 SELECT "id",
    "user_id",
    "name",
    "start_date",
    "num_weeks",
    "goal",
    "status",
    "deload_week",
    "created_at",
    "last_modified",
    GREATEST(1, LEAST(("num_weeks")::integer, ("floor"(((((("now"())::"date" - "start_date"))::numeric / 7.0) + (1)::numeric)))::integer)) AS "current_week"
   FROM "public"."mesocycle" "mb";


ALTER VIEW "public"."mesocycle_blocks_runtime" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mesocycle_template.exercises" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "mesocycle_block_id" "uuid" NOT NULL,
    "exercise_id" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "last_modified" timestamp with time zone DEFAULT "now"() NOT NULL,
    "day_of_week" numeric,
    "exercise_name" "text"
);


ALTER TABLE "public"."mesocycle_template.exercises" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mesocycle_templates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "goal" "public"."mesocycle_goal_enum" NOT NULL,
    "num_weeks" smallint NOT NULL,
    "deload_week" smallint GENERATED ALWAYS AS ("num_weeks") STORED,
    "description" "text",
    "created_by_user_id" "uuid" NOT NULL,
    "is_public" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "last_modified" timestamp with time zone DEFAULT "now"() NOT NULL,
    "mesocycle_block_id" "uuid",
    CONSTRAINT "program_templates_num_weeks_check" CHECK ((("num_weeks" >= 4) AND ("num_weeks" <= 8)))
);


ALTER TABLE "public"."mesocycle_templates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "user_id" "uuid" NOT NULL,
    "full_name" "text" DEFAULT ''::"text",
    "date_of_birth" "date",
    "height_cm" numeric(5,2) DEFAULT NULL::numeric,
    "weight_kg" numeric(6,2) DEFAULT '80'::numeric,
    "timezone" "text" DEFAULT 'UTC'::"text" NOT NULL,
    "onboarding_completed" boolean DEFAULT false NOT NULL,
    "research_consent" boolean DEFAULT false NOT NULL,
    "terms_accepted_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "last_modified" timestamp with time zone DEFAULT "now"() NOT NULL,
    "email" "text",
    "is_admin" boolean DEFAULT false,
    "role" "text" DEFAULT 'user'::"text",
    "units_preference" "text",
    "biological_sex" "text",
    "desired_body_type" "text",
    "years_of_exercise_experience" "text",
    "equipment" "text"[],
    "warmup_sets_preference" boolean,
    "injury_flags" "jsonb" DEFAULT '[]'::"jsonb",
    "injury_notes" "text",
    "joint_hypermobility" boolean,
    "exercise_blacklist" "text"[] DEFAULT '{}'::"text"[],
    "exercise_favorites" "text"[] DEFAULT '{}'::"text"[],
    "coaching_style" integer,
    "updated_at" "date",
    "warmup_sets" boolean DEFAULT false,
    "current_mesocycle_id" "uuid",
    CONSTRAINT "profiles_biological_sex_check" CHECK (("biological_sex" = ANY (ARRAY['male'::"text", 'female'::"text"]))),
    CONSTRAINT "profiles_coaching_style_check" CHECK ((("coaching_style" >= 0) AND ("coaching_style" <= 10))),
    CONSTRAINT "profiles_desired_body_type_check" CHECK (("desired_body_type" = ANY (ARRAY['masculine'::"text", 'feminine'::"text"]))),
    CONSTRAINT "profiles_equipment_check" CHECK (("array_length"("equipment", 1) > 0)),
    CONSTRAINT "profiles_height_cm_check" CHECK ((("height_cm" IS NULL) OR (("height_cm" >= (50)::numeric) AND ("height_cm" <= (272)::numeric)))),
    CONSTRAINT "profiles_units_preference_check" CHECK (("units_preference" = ANY (ARRAY['metric'::"text", 'imperial'::"text"]))),
    CONSTRAINT "profiles_weight_kg_check" CHECK ((("weight_kg" IS NULL) OR (("weight_kg" >= (20)::numeric) AND ("weight_kg" <= (500)::numeric)))),
    CONSTRAINT "profiles_years_of_exercise_experience_check" CHECK (("years_of_exercise_experience" = ANY (ARRAY['<6_months'::"text", '6-12_months'::"text", '1-3_years'::"text", '3-5_years'::"text", '5+_years'::"text"])))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_follows" (
    "follower_id" "uuid" NOT NULL,
    "followed_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "user_follows_check" CHECK (("follower_id" <> "followed_id"))
);


ALTER TABLE "public"."user_follows" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."workouts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "mesocycle_block_id" "uuid",
    "started_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "completed_at" timestamp with time zone,
    "abandoned_at" timestamp with time zone,
    "abandon_reason" "text",
    "pre_workout_fatigue" smallint,
    "location" "text",
    "is_public" boolean DEFAULT false NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "last_modified" timestamp with time zone DEFAULT "now"() NOT NULL,
    "workout_day" numeric DEFAULT '1'::numeric,
    "workout_week" numeric DEFAULT '1'::numeric,
    CONSTRAINT "check_workout_day" CHECK ((("workout_day" >= (1)::numeric) AND ("workout_day" <= (7)::numeric))),
    CONSTRAINT "check_workout_week" CHECK ((("workout_week" >= (1)::numeric) AND ("workout_week" <= (12)::numeric))),
    CONSTRAINT "workouts_pre_workout_fatigue_check" CHECK ((("pre_workout_fatigue" IS NULL) OR (("pre_workout_fatigue" >= 1) AND ("pre_workout_fatigue" <= 10))))
);


ALTER TABLE "public"."workouts" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."public_following_feed" AS
 SELECT "id",
    "user_id",
    "mesocycle_block_id",
    "started_at",
    "completed_at",
    "abandoned_at",
    "abandon_reason",
    "pre_workout_fatigue",
    "location",
    "is_public",
    "notes",
    "created_at",
    "last_modified"
   FROM "public"."workouts" "w"
  WHERE (("is_public" = true) AND ("user_id" IN ( SELECT "uf"."followed_id"
           FROM "public"."user_follows" "uf"
          WHERE ("uf"."follower_id" = "auth"."uid"()))));


ALTER VIEW "public"."public_following_feed" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."release_notes" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "new_features" "text"[],
    "improvements" "text"[],
    "bug_fixes" "text"[],
    "security_updates" "text"[],
    "app_version" "text"
);


ALTER TABLE "public"."release_notes" OWNER TO "postgres";


ALTER TABLE "public"."release_notes" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."release_notes_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."sleep_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "source_id" "uuid",
    "start_date" timestamp with time zone NOT NULL,
    "end_date" timestamp with time zone NOT NULL,
    "sleep_analysis_value" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "last_modified" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."sleep_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sync_conflicts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "table_name" "text" NOT NULL,
    "record_id" "uuid" NOT NULL,
    "client_version" "jsonb" NOT NULL,
    "server_version" "jsonb" NOT NULL,
    "resolution_status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "resolution" "jsonb",
    "resolved_by" "uuid",
    "resolved_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "sync_conflicts_resolution_status_check" CHECK (("resolution_status" = ANY (ARRAY['pending'::"text", 'auto_resolved'::"text", 'manual_resolved'::"text"])))
);


ALTER TABLE "public"."sync_conflicts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."terra_data_payloads" (
    "user_id" character varying(36) NOT NULL,
    "data_type" "text" NOT NULL,
    "created_at" "text" NOT NULL,
    "payload_id" "text" NOT NULL,
    "start_time" "text",
    "end_time" "text"
);


ALTER TABLE "public"."terra_data_payloads" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."terra_misc_payloads" (
    "user_id" character varying(36) NOT NULL,
    "data_type" "text",
    "payload_type" "text",
    "created_at" "text" NOT NULL,
    "payload_id" "text" NOT NULL
);


ALTER TABLE "public"."terra_misc_payloads" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."terra_users" (
    "user_id" character varying(36) NOT NULL,
    "reference_id" "text",
    "created_at" "text" NOT NULL,
    "granted_scopes" "text",
    "provider" "text" NOT NULL,
    "state" character varying(20)
);


ALTER TABLE "public"."terra_users" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."training_profile_configuration" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "desired_body_type" "text" DEFAULT 'masculine'::"text",
    "years_of_exercise_experience" "text" DEFAULT '<6_months'::"text",
    "equipment_access" "jsonb" DEFAULT '[]'::"jsonb",
    "warmup_sets_preference" boolean DEFAULT true,
    "coaching_style" integer DEFAULT 5,
    "injury_flags" "jsonb" DEFAULT '{"tags": [], "notes": ""}'::"jsonb",
    "exercise_blacklist" "jsonb" DEFAULT '[]'::"jsonb",
    "exercise_favorites" "jsonb" DEFAULT '[]'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "last_modified" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "training_profile_configurati_years_of_exercise_experience_check" CHECK (("years_of_exercise_experience" = ANY (ARRAY['<6_months'::"text", '6-12_months'::"text", '1-3_years'::"text", '3-5_years'::"text", '5+_years'::"text"]))),
    CONSTRAINT "training_profile_configuration_coaching_style_check" CHECK ((("coaching_style" >= 0) AND ("coaching_style" <= 10))),
    CONSTRAINT "training_profile_configuration_desired_body_type_check" CHECK (("desired_body_type" = ANY (ARRAY['masculine'::"text", 'feminine'::"text"])))
);


ALTER TABLE "public"."training_profile_configuration" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_custom_exercises" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "source_exercise_id" "uuid",
    "name" "text" NOT NULL,
    "created_by_user_id" "uuid" NOT NULL,
    "is_compound" boolean DEFAULT false NOT NULL,
    "is_unilateral" boolean DEFAULT false NOT NULL,
    "execution_instructions" "text",
    "breathing_pattern" "text",
    "common_mistakes" "text"[] DEFAULT '{}'::"text"[],
    "coaching_cues" "text"[] DEFAULT '{}'::"text"[],
    "video_url" "text",
    "is_machine" boolean DEFAULT false NOT NULL,
    "stability_requirement" smallint DEFAULT 3 NOT NULL,
    "default_weight_increment_kg" numeric(5,2) DEFAULT 2.5 NOT NULL,
    "preferred_rep_range_min" smallint DEFAULT 8 NOT NULL,
    "preferred_rep_range_max" smallint DEFAULT 12 NOT NULL,
    "default_rest_minutes" numeric(4,2) DEFAULT 2.5 NOT NULL,
    "rir_floor" smallint DEFAULT 1 NOT NULL,
    "set_cap" smallint DEFAULT 6 NOT NULL,
    "minimum_weight_kg" numeric(7,3),
    "maximum_weight_kg" numeric(7,3),
    "requires_spotter" boolean DEFAULT false NOT NULL,
    "tags" "text"[] DEFAULT '{}'::"text"[],
    "review_status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "reviewer_id" "uuid",
    "reviewed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "last_modified" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "custom_exercises_library_default_rest_minutes_check" CHECK ((("default_rest_minutes" >= (0)::numeric) AND ("default_rest_minutes" <= (30)::numeric))),
    CONSTRAINT "custom_exercises_library_default_weight_increment_kg_check" CHECK (("default_weight_increment_kg" > (0)::numeric)),
    CONSTRAINT "custom_exercises_library_maximum_weight_kg_check" CHECK ((("maximum_weight_kg" IS NULL) OR ("maximum_weight_kg" >= (0)::numeric))),
    CONSTRAINT "custom_exercises_library_minimum_weight_kg_check" CHECK ((("minimum_weight_kg" IS NULL) OR ("minimum_weight_kg" >= (0)::numeric))),
    CONSTRAINT "custom_exercises_library_preferred_rep_range_max_check" CHECK ((("preferred_rep_range_max" >= 1) AND ("preferred_rep_range_max" <= 50))),
    CONSTRAINT "custom_exercises_library_preferred_rep_range_min_check" CHECK ((("preferred_rep_range_min" >= 1) AND ("preferred_rep_range_min" <= 50))),
    CONSTRAINT "custom_exercises_library_review_status_check" CHECK (("review_status" = ANY (ARRAY['pending'::"text", 'approved'::"text", 'rejected'::"text"]))),
    CONSTRAINT "custom_exercises_library_rir_floor_check" CHECK ((("rir_floor" >= 0) AND ("rir_floor" <= 6))),
    CONSTRAINT "custom_exercises_library_set_cap_check" CHECK ((("set_cap" >= 1) AND ("set_cap" <= 12))),
    CONSTRAINT "custom_exercises_library_stability_requirement_check" CHECK ((("stability_requirement" >= 1) AND ("stability_requirement" <= 5)))
);


ALTER TABLE "public"."user_custom_exercises" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_warmup_preferences" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "exercise_id" "uuid",
    "scheme_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "last_modified" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_warmup_preferences" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."warmup_schemes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "steps" "jsonb" NOT NULL,
    "is_default" boolean DEFAULT false NOT NULL,
    "created_by_user_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "last_modified" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."warmup_schemes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."workout_exercises" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workout_id" "uuid" NOT NULL,
    "exercise_id" "uuid" NOT NULL,
    "order_index" smallint DEFAULT 1 NOT NULL,
    "superset_group" character(1),
    "soreness_from_last" smallint NOT NULL,
    "pump" smallint,
    "effort" smallint,
    "joint_pain" smallint,
    "recovery_gate" smallint GENERATED ALWAYS AS ((("soreness_from_last" - 1) + COALESCE(("joint_pain")::integer, 0))) STORED,
    "stimulus_score" smallint GENERATED ALWAYS AS ((COALESCE(("pump")::integer, 0) + COALESCE(("effort")::integer, 0))) STORED,
    "substituted_from_exercise_id" "uuid",
    "substitution_reason" "text",
    "auto_generate_warmups" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "last_modified" timestamp with time zone DEFAULT "now"() NOT NULL,
    "workout_day" numeric DEFAULT '1'::numeric,
    "workout_week" numeric DEFAULT '1'::numeric,
    CONSTRAINT "workout_exercises_effort_check" CHECK ((("effort" >= 0) AND ("effort" <= 3))),
    CONSTRAINT "workout_exercises_joint_pain_check" CHECK ((("joint_pain" >= 0) AND ("joint_pain" <= 3))),
    CONSTRAINT "workout_exercises_order_index_check" CHECK (("order_index" >= 1)),
    CONSTRAINT "workout_exercises_pump_check" CHECK ((("pump" >= 0) AND ("pump" <= 3))),
    CONSTRAINT "workout_exercises_soreness_from_last_check" CHECK ((("soreness_from_last" >= 1) AND ("soreness_from_last" <= 5))),
    CONSTRAINT "workout_exercises_superset_group_check" CHECK ((("superset_group" IS NULL) OR ("superset_group" = ANY (ARRAY['A'::"bpchar", 'B'::"bpchar", 'C'::"bpchar"]))))
);


ALTER TABLE "public"."workout_exercises" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."workout_exercises.template" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workout_id" "uuid" NOT NULL,
    "exercise_id" "uuid" NOT NULL,
    "order_index" smallint DEFAULT 1 NOT NULL,
    "superset_group" character(1),
    "soreness_from_last" smallint NOT NULL,
    "pump" smallint,
    "effort" smallint,
    "joint_pain" smallint,
    "recovery_gate" smallint GENERATED ALWAYS AS ((("soreness_from_last" - 1) + COALESCE(("joint_pain")::integer, 0))) STORED,
    "stimulus_score" smallint GENERATED ALWAYS AS ((COALESCE(("pump")::integer, 0) + COALESCE(("effort")::integer, 0))) STORED,
    "substituted_from_exercise_id" "uuid",
    "substitution_reason" "text",
    "auto_generate_warmups" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "last_modified" timestamp with time zone DEFAULT "now"() NOT NULL,
    "workout_day" numeric DEFAULT '1'::numeric,
    "workout_week" numeric DEFAULT '1'::numeric,
    CONSTRAINT "workout_exercises_effort_check" CHECK ((("effort" >= 0) AND ("effort" <= 3))),
    CONSTRAINT "workout_exercises_joint_pain_check" CHECK ((("joint_pain" >= 0) AND ("joint_pain" <= 3))),
    CONSTRAINT "workout_exercises_order_index_check" CHECK (("order_index" >= 1)),
    CONSTRAINT "workout_exercises_pump_check" CHECK ((("pump" >= 0) AND ("pump" <= 3))),
    CONSTRAINT "workout_exercises_soreness_from_last_check" CHECK ((("soreness_from_last" >= 1) AND ("soreness_from_last" <= 5))),
    CONSTRAINT "workout_exercises_superset_group_check" CHECK ((("superset_group" IS NULL) OR ("superset_group" = ANY (ARRAY['A'::"bpchar", 'B'::"bpchar", 'C'::"bpchar"]))))
);


ALTER TABLE "public"."workout_exercises.template" OWNER TO "postgres";


COMMENT ON TABLE "public"."workout_exercises.template" IS 'This is a duplicate of workout_exercises';



CREATE TABLE IF NOT EXISTS "public"."workout_sets" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workout_exercise_id" "uuid" NOT NULL,
    "set_number" smallint NOT NULL,
    "target_reps" smallint,
    "actual_reps" smallint,
    "weight_kg" numeric(7,3),
    "target_rir_raw" numeric(3,1),
    "achieved_rir_raw" numeric(3,1),
    "target_rir_bucket" numeric(3,1) GENERATED ALWAYS AS (LEAST(COALESCE("target_rir_raw", (6)::numeric), (3)::numeric)) STORED,
    "achieved_rir_bucket" numeric(3,1) GENERATED ALWAYS AS (LEAST(COALESCE("achieved_rir_raw", (6)::numeric), (3)::numeric)) STORED,
    "tempo_seconds" smallint,
    "rest_seconds" integer,
    "technique_rating" smallint,
    "range_of_motion_full" boolean,
    "e1rm" numeric(12,4) GENERATED ALWAYS AS (
CASE
    WHEN (("weight_kg" IS NULL) OR ("actual_reps" IS NULL) OR ("achieved_rir_raw" IS NULL)) THEN NULL::numeric
    ELSE ("weight_kg" * ((1)::numeric + ((("actual_reps")::numeric + "achieved_rir_raw") / 30.0)))
END) STORED,
    "total_volume" numeric(12,3) GENERATED ALWAYS AS (
CASE
    WHEN (("weight_kg" IS NULL) OR ("actual_reps" IS NULL)) THEN NULL::numeric
    ELSE ("weight_kg" * ("actual_reps")::numeric)
END) STORED,
    "is_effective_set" boolean GENERATED ALWAYS AS (((COALESCE("achieved_rir_raw", (6)::numeric) <= (3)::numeric) AND (COALESCE(("technique_rating")::integer, 0) >= 2))) STORED,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "last_modified" timestamp with time zone DEFAULT "now"() NOT NULL,
    "status" "public"."exercise_status" DEFAULT 'not_started'::"public"."exercise_status",
    "is_calibration" boolean DEFAULT false NOT NULL,
    "set_type" "text" DEFAULT 'working'::"text",
    "calibration_data" "jsonb",
    CONSTRAINT "check_status_values" CHECK (("status" = ANY (ARRAY['not_started'::"public"."exercise_status", 'done'::"public"."exercise_status", 'skipped'::"public"."exercise_status"]))),
    CONSTRAINT "workout_sets_achieved_rir_raw_check" CHECK ((("achieved_rir_raw" IS NULL) OR (("achieved_rir_raw" >= (0)::numeric) AND ("achieved_rir_raw" <= (6)::numeric)))),
    CONSTRAINT "workout_sets_actual_reps_check" CHECK ((("actual_reps" IS NULL) OR (("actual_reps" >= 0) AND ("actual_reps" <= 100)))),
    CONSTRAINT "workout_sets_rest_seconds_check" CHECK ((("rest_seconds" IS NULL) OR (("rest_seconds" >= 0) AND ("rest_seconds" <= 3600)))),
    CONSTRAINT "workout_sets_set_number_check" CHECK (("set_number" >= 1)),
    CONSTRAINT "workout_sets_set_type_check" CHECK (("set_type" = ANY (ARRAY['warmup'::"text", 'working'::"text", 'calibration'::"text", 'validation'::"text"]))),
    CONSTRAINT "workout_sets_target_reps_check" CHECK ((("target_reps" IS NULL) OR (("target_reps" >= 0) AND ("target_reps" <= 100)))),
    CONSTRAINT "workout_sets_target_rir_raw_check" CHECK ((("target_rir_raw" IS NULL) OR (("target_rir_raw" >= (0)::numeric) AND ("target_rir_raw" <= (6)::numeric)))),
    CONSTRAINT "workout_sets_technique_rating_check" CHECK ((("technique_rating" IS NULL) OR (("technique_rating" >= 0) AND ("technique_rating" <= 3)))),
    CONSTRAINT "workout_sets_tempo_seconds_check" CHECK ((("tempo_seconds" IS NULL) OR (("tempo_seconds" >= 0) AND ("tempo_seconds" <= 600))))
);


ALTER TABLE "public"."workout_sets" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."workouts.templates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "mesocycle_block_id" "uuid",
    "started_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "completed_at" timestamp with time zone,
    "abandoned_at" timestamp with time zone,
    "abandon_reason" "text",
    "pre_workout_fatigue" smallint,
    "location" "text",
    "is_public" boolean DEFAULT false NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "last_modified" timestamp with time zone DEFAULT "now"() NOT NULL,
    "workout_day" numeric DEFAULT '1'::numeric,
    CONSTRAINT "workouts_pre_workout_fatigue_check" CHECK ((("pre_workout_fatigue" IS NULL) OR (("pre_workout_fatigue" >= 1) AND ("pre_workout_fatigue" <= 10))))
);


ALTER TABLE "public"."workouts.templates" OWNER TO "postgres";


COMMENT ON TABLE "public"."workouts.templates" IS 'This is a duplicate of workouts';



ALTER TABLE ONLY "mesocycle"."templates"
    ADD CONSTRAINT "mesocycle_templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."admin_users"
    ADD CONSTRAINT "admin_users_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."audit_log"
    ADD CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_custom_exercises"
    ADD CONSTRAINT "custom_exercises_library_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."data_sources"
    ADD CONSTRAINT "data_sources_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."exercise_library"
    ADD CONSTRAINT "exercise_library_pkey" PRIMARY KEY ("exercise_uid");



ALTER TABLE ONLY "public"."exercise_substitutions"
    ADD CONSTRAINT "exercise_substitutions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."exercises_draft"
    ADD CONSTRAINT "exercises_draft_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."health_metrics"
    ADD CONSTRAINT "health_metrics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."health_metrics"
    ADD CONSTRAINT "health_metrics_user_id_deduplication_hash_key" UNIQUE ("user_id", "deduplication_hash");



ALTER TABLE ONLY "public"."heart_rate_samples"
    ADD CONSTRAINT "heart_rate_samples_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mesocycle.templates"
    ADD CONSTRAINT "mesocycle.templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."mesocycle_template.exercises"
    ADD CONSTRAINT "program_block_exercises_block_id_exercise_id_key" UNIQUE ("mesocycle_block_id", "exercise_id");



ALTER TABLE ONLY "public"."mesocycle_template.exercises"
    ADD CONSTRAINT "program_block_exercises_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mesocycle"
    ADD CONSTRAINT "program_blocks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mesocycle_templates"
    ADD CONSTRAINT "program_templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."release_notes"
    ADD CONSTRAINT "release_notes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sleep_sessions"
    ADD CONSTRAINT "sleep_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sync_conflicts"
    ADD CONSTRAINT "sync_conflicts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."terra_data_payloads"
    ADD CONSTRAINT "terra_data_payloads_pkey" PRIMARY KEY ("user_id", "created_at");



ALTER TABLE ONLY "public"."terra_misc_payloads"
    ADD CONSTRAINT "terra_misc_payloads_pkey" PRIMARY KEY ("user_id", "created_at");



ALTER TABLE ONLY "public"."terra_users"
    ADD CONSTRAINT "terra_users_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."training_profile_configuration"
    ADD CONSTRAINT "training_profile_configuration_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."training_profile_configuration"
    ADD CONSTRAINT "training_profile_configuration_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."user_follows"
    ADD CONSTRAINT "user_follows_pkey" PRIMARY KEY ("follower_id", "followed_id");



ALTER TABLE ONLY "public"."user_warmup_preferences"
    ADD CONSTRAINT "user_warmup_preferences_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_warmup_preferences"
    ADD CONSTRAINT "user_warmup_preferences_user_id_exercise_id_key" UNIQUE ("user_id", "exercise_id");



ALTER TABLE ONLY "public"."warmup_schemes"
    ADD CONSTRAINT "warmup_schemes_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."warmup_schemes"
    ADD CONSTRAINT "warmup_schemes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."workout_exercises.template"
    ADD CONSTRAINT "workout_exercises.template_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."workout_exercises"
    ADD CONSTRAINT "workout_exercises_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."workout_sets"
    ADD CONSTRAINT "workout_sets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."workout_sets"
    ADD CONSTRAINT "workout_sets_workout_exercise_id_set_number_key" UNIQUE ("workout_exercise_id", "set_number");



ALTER TABLE ONLY "public"."workouts.templates"
    ADD CONSTRAINT "workouts.templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."workouts"
    ADD CONSTRAINT "workouts_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_mesocycle_templates_goal" ON "mesocycle"."templates" USING "btree" ("goal");



CREATE INDEX "idx_mesocycle_templates_num_weeks" ON "mesocycle"."templates" USING "btree" ("num_weeks");



CREATE INDEX "idx_mesocycle_templates_status" ON "mesocycle"."templates" USING "btree" ("status");



CREATE INDEX "idx_custom_exercises_creator" ON "public"."user_custom_exercises" USING "btree" ("created_by_user_id");



CREATE INDEX "idx_data_sources_user" ON "public"."data_sources" USING "btree" ("user_id");



CREATE INDEX "idx_ex_subs_from" ON "public"."exercise_substitutions" USING "btree" ("from_exercise_id", "priority");



CREATE INDEX "idx_health_metrics_lookup" ON "public"."health_metrics" USING "btree" ("user_id", "metric_type", "start_date" DESC);



CREATE INDEX "idx_hr_user_date" ON "public"."heart_rate_samples" USING "btree" ("user_id", "date" DESC);



CREATE INDEX "idx_pbe_block" ON "public"."mesocycle_template.exercises" USING "btree" ("mesocycle_block_id");



CREATE INDEX "idx_program_blocks_user" ON "public"."mesocycle" USING "btree" ("user_id", "start_date" DESC);



CREATE INDEX "idx_pt_creator" ON "public"."mesocycle_templates" USING "btree" ("created_by_user_id");



CREATE INDEX "idx_sleep_user_time" ON "public"."sleep_sessions" USING "btree" ("user_id", "start_date" DESC);



CREATE INDEX "idx_sync_conflicts_user" ON "public"."sync_conflicts" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "idx_training_config_created_at" ON "public"."training_profile_configuration" USING "btree" ("created_at");



CREATE INDEX "idx_training_config_user_id" ON "public"."training_profile_configuration" USING "btree" ("user_id");



CREATE INDEX "idx_user_follows_followed" ON "public"."user_follows" USING "btree" ("followed_id");



CREATE INDEX "idx_uwp_user_ex" ON "public"."user_warmup_preferences" USING "btree" ("user_id", "exercise_id");



CREATE INDEX "idx_wex_scores" ON "public"."workout_exercises" USING "btree" ("recovery_gate", "stimulus_score");



CREATE INDEX "idx_wex_workout_order" ON "public"."workout_exercises" USING "btree" ("workout_id", "order_index");



CREATE INDEX "idx_workout_exercises_exercise_date" ON "public"."workout_exercises" USING "btree" ("exercise_id", "created_at" DESC);



CREATE INDEX "idx_workout_sets_calibration_progression" ON "public"."workout_sets" USING "btree" ("workout_exercise_id", "set_number", "set_type") WHERE ("set_type" = ANY (ARRAY['calibration'::"text", 'validation'::"text", 'working'::"text"]));



CREATE INDEX "idx_workout_sets_calibration_validation" ON "public"."workout_sets" USING "btree" ("workout_exercise_id", "set_number", "set_type") WHERE ("set_type" = ANY (ARRAY['calibration'::"text", 'validation'::"text"]));



CREATE INDEX "idx_workout_sets_date_exercise" ON "public"."workout_sets" USING "btree" ("workout_exercise_id", "created_at" DESC) WHERE ("is_effective_set" = true);



CREATE INDEX "idx_workout_sets_status" ON "public"."workout_sets" USING "btree" ("workout_exercise_id", "status", "set_number");



CREATE INDEX "idx_workout_sets_type_status" ON "public"."workout_sets" USING "btree" ("workout_exercise_id", "set_type", "status", "set_number");



CREATE INDEX "idx_workouts_user_time" ON "public"."workouts" USING "btree" ("user_id", "started_at" DESC);



CREATE INDEX "idx_wsets_effective_e1rm" ON "public"."workout_sets" USING "btree" ("e1rm") WHERE ("is_effective_set" = true);



CREATE INDEX "idx_wsets_wex" ON "public"."workout_sets" USING "btree" ("workout_exercise_id");



CREATE INDEX "workout_exercises.template_exercise_id_created_at_idx" ON "public"."workout_exercises.template" USING "btree" ("exercise_id", "created_at" DESC);



CREATE INDEX "workout_exercises.template_recovery_gate_stimulus_score_idx" ON "public"."workout_exercises.template" USING "btree" ("recovery_gate", "stimulus_score");



CREATE INDEX "workout_exercises.template_workout_id_order_index_idx" ON "public"."workout_exercises.template" USING "btree" ("workout_id", "order_index");



CREATE OR REPLACE TRIGGER "progressive_overload_algo_v3_trigger" AFTER UPDATE OF "status" ON "public"."workout_sets" FOR EACH ROW EXECUTE FUNCTION "public"."progressive_overload_algo_v3"();



COMMENT ON TRIGGER "progressive_overload_algo_v3_trigger" ON "public"."workout_sets" IS 'Automatically handles progressive overload algorithm: copies calibration set data to set 2, applies validation set progression to set 3';



CREATE OR REPLACE TRIGGER "training_config_updated_at_trigger" BEFORE UPDATE ON "public"."training_profile_configuration" FOR EACH ROW EXECUTE FUNCTION "public"."update_training_config_updated_at"();



CREATE OR REPLACE TRIGGER "trg_custom_exercises_audit" AFTER INSERT OR DELETE OR UPDATE ON "public"."user_custom_exercises" FOR EACH ROW EXECUTE FUNCTION "public"."util_audit_log"();



CREATE OR REPLACE TRIGGER "trg_custom_exercises_touch" BEFORE UPDATE ON "public"."user_custom_exercises" FOR EACH ROW EXECUTE FUNCTION "public"."util_touch_last_modified"();



CREATE OR REPLACE TRIGGER "trg_data_sources_audit" AFTER INSERT OR DELETE OR UPDATE ON "public"."data_sources" FOR EACH ROW EXECUTE FUNCTION "public"."util_audit_log"();



CREATE OR REPLACE TRIGGER "trg_data_sources_touch" BEFORE UPDATE ON "public"."data_sources" FOR EACH ROW EXECUTE FUNCTION "public"."util_touch_last_modified"();



CREATE OR REPLACE TRIGGER "trg_ex_subs_audit" AFTER INSERT OR DELETE OR UPDATE ON "public"."exercise_substitutions" FOR EACH ROW EXECUTE FUNCTION "public"."util_audit_log"();



CREATE OR REPLACE TRIGGER "trg_ex_subs_touch" BEFORE UPDATE ON "public"."exercise_substitutions" FOR EACH ROW EXECUTE FUNCTION "public"."util_touch_last_modified"();



CREATE OR REPLACE TRIGGER "trg_follows_audit" AFTER INSERT OR DELETE OR UPDATE ON "public"."user_follows" FOR EACH ROW EXECUTE FUNCTION "public"."util_audit_log"();



CREATE OR REPLACE TRIGGER "trg_health_metrics_audit" AFTER INSERT OR DELETE OR UPDATE ON "public"."health_metrics" FOR EACH ROW EXECUTE FUNCTION "public"."util_audit_log"();



CREATE OR REPLACE TRIGGER "trg_health_metrics_touch" BEFORE UPDATE ON "public"."health_metrics" FOR EACH ROW EXECUTE FUNCTION "public"."util_touch_last_modified"();



CREATE OR REPLACE TRIGGER "trg_hr_audit" AFTER INSERT OR DELETE OR UPDATE ON "public"."heart_rate_samples" FOR EACH ROW EXECUTE FUNCTION "public"."util_audit_log"();



CREATE OR REPLACE TRIGGER "trg_hr_touch" BEFORE UPDATE ON "public"."heart_rate_samples" FOR EACH ROW EXECUTE FUNCTION "public"."util_touch_last_modified"();



CREATE OR REPLACE TRIGGER "trg_pbe_audit" AFTER INSERT OR DELETE OR UPDATE ON "public"."mesocycle_template.exercises" FOR EACH ROW EXECUTE FUNCTION "public"."util_audit_log"();



CREATE OR REPLACE TRIGGER "trg_pbe_touch" BEFORE UPDATE ON "public"."mesocycle_template.exercises" FOR EACH ROW EXECUTE FUNCTION "public"."util_touch_last_modified"();



CREATE OR REPLACE TRIGGER "trg_pbe_validate" BEFORE INSERT OR UPDATE ON "public"."mesocycle_template.exercises" FOR EACH ROW EXECUTE FUNCTION "public"."validate_block_week_plans"();

ALTER TABLE "public"."mesocycle_template.exercises" DISABLE TRIGGER "trg_pbe_validate";



CREATE OR REPLACE TRIGGER "trg_profiles_audit" AFTER INSERT OR DELETE OR UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."util_audit_log"();

ALTER TABLE "public"."profiles" DISABLE TRIGGER "trg_profiles_audit";



CREATE OR REPLACE TRIGGER "trg_profiles_touch" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."util_touch_last_modified"();

ALTER TABLE "public"."profiles" DISABLE TRIGGER "trg_profiles_touch";



CREATE OR REPLACE TRIGGER "trg_program_blocks_audit" AFTER INSERT OR DELETE OR UPDATE ON "public"."mesocycle" FOR EACH ROW EXECUTE FUNCTION "public"."util_audit_log"();



CREATE OR REPLACE TRIGGER "trg_program_blocks_touch" BEFORE UPDATE ON "public"."mesocycle" FOR EACH ROW EXECUTE FUNCTION "public"."util_touch_last_modified"();



CREATE OR REPLACE TRIGGER "trg_pt_audit" AFTER INSERT OR DELETE OR UPDATE ON "public"."mesocycle_templates" FOR EACH ROW EXECUTE FUNCTION "public"."util_audit_log"();



CREATE OR REPLACE TRIGGER "trg_pt_touch" BEFORE UPDATE ON "public"."mesocycle_templates" FOR EACH ROW EXECUTE FUNCTION "public"."util_touch_last_modified"();



CREATE OR REPLACE TRIGGER "trg_simple_calibration" AFTER INSERT OR UPDATE ON "public"."workout_sets" FOR EACH ROW EXECUTE FUNCTION "public"."handle_simple_calibration"();



CREATE OR REPLACE TRIGGER "trg_sleep_audit" AFTER INSERT OR DELETE OR UPDATE ON "public"."sleep_sessions" FOR EACH ROW EXECUTE FUNCTION "public"."util_audit_log"();



CREATE OR REPLACE TRIGGER "trg_sleep_touch" BEFORE UPDATE ON "public"."sleep_sessions" FOR EACH ROW EXECUTE FUNCTION "public"."util_touch_last_modified"();



CREATE OR REPLACE TRIGGER "trg_sync_conflicts_audit" AFTER INSERT OR DELETE OR UPDATE ON "public"."sync_conflicts" FOR EACH ROW EXECUTE FUNCTION "public"."util_audit_log"();



CREATE OR REPLACE TRIGGER "trg_uwp_audit" AFTER INSERT OR DELETE OR UPDATE ON "public"."user_warmup_preferences" FOR EACH ROW EXECUTE FUNCTION "public"."util_audit_log"();



CREATE OR REPLACE TRIGGER "trg_uwp_touch" BEFORE UPDATE ON "public"."user_warmup_preferences" FOR EACH ROW EXECUTE FUNCTION "public"."util_touch_last_modified"();



CREATE OR REPLACE TRIGGER "trg_wex_audit" AFTER INSERT OR DELETE OR UPDATE ON "public"."workout_exercises" FOR EACH ROW EXECUTE FUNCTION "public"."util_audit_log"();



CREATE OR REPLACE TRIGGER "trg_wex_touch" BEFORE UPDATE ON "public"."workout_exercises" FOR EACH ROW EXECUTE FUNCTION "public"."util_touch_last_modified"();



CREATE OR REPLACE TRIGGER "trg_workouts_audit" AFTER INSERT OR DELETE OR UPDATE ON "public"."workouts" FOR EACH ROW EXECUTE FUNCTION "public"."util_audit_log"();



CREATE OR REPLACE TRIGGER "trg_workouts_touch" BEFORE UPDATE ON "public"."workouts" FOR EACH ROW EXECUTE FUNCTION "public"."util_touch_last_modified"();



CREATE OR REPLACE TRIGGER "trg_ws_audit" AFTER INSERT OR DELETE OR UPDATE ON "public"."warmup_schemes" FOR EACH ROW EXECUTE FUNCTION "public"."util_audit_log"();



CREATE OR REPLACE TRIGGER "trg_ws_touch" BEFORE UPDATE ON "public"."warmup_schemes" FOR EACH ROW EXECUTE FUNCTION "public"."util_touch_last_modified"();



CREATE OR REPLACE TRIGGER "trg_wsets_audit" AFTER INSERT OR DELETE OR UPDATE ON "public"."workout_sets" FOR EACH ROW EXECUTE FUNCTION "public"."util_audit_log"();



CREATE OR REPLACE TRIGGER "trg_wsets_touch" BEFORE UPDATE ON "public"."workout_sets" FOR EACH ROW EXECUTE FUNCTION "public"."util_touch_last_modified"();



CREATE OR REPLACE TRIGGER "trigger_calibration_set_progression" AFTER UPDATE OF "status" ON "public"."workout_sets" FOR EACH ROW EXECUTE FUNCTION "public"."handle_calibration_set_progression"();



COMMENT ON TRIGGER "trigger_calibration_set_progression" ON "public"."workout_sets" IS 'Automatically handles calibration set progression: copies calibration set data to set 2, applies validation set progression to set 3';



ALTER TABLE ONLY "public"."admin_users"
    ADD CONSTRAINT "admin_users_granted_by_fkey" FOREIGN KEY ("granted_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."admin_users"
    ADD CONSTRAINT "admin_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_custom_exercises"
    ADD CONSTRAINT "custom_exercises_library_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."user_custom_exercises"
    ADD CONSTRAINT "custom_exercises_library_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."data_sources"
    ADD CONSTRAINT "data_sources_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."exercise_substitutions"
    ADD CONSTRAINT "exercise_substitutions_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."health_metrics"
    ADD CONSTRAINT "health_metrics_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "public"."data_sources"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."health_metrics"
    ADD CONSTRAINT "health_metrics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."heart_rate_samples"
    ADD CONSTRAINT "heart_rate_samples_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "public"."data_sources"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."heart_rate_samples"
    ADD CONSTRAINT "heart_rate_samples_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."heart_rate_samples"
    ADD CONSTRAINT "heart_rate_samples_workout_id_fkey" FOREIGN KEY ("workout_id") REFERENCES "public"."workouts"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."mesocycle_template.exercises"
    ADD CONSTRAINT "mesocycle.exercises_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercise_library"("exercise_uid");



ALTER TABLE ONLY "public"."mesocycle_template.exercises"
    ADD CONSTRAINT "mesocycle.exercises_mesocycle_block_id_fkey" FOREIGN KEY ("mesocycle_block_id") REFERENCES "public"."mesocycle.templates"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_current_mesocycle_id_fkey" FOREIGN KEY ("current_mesocycle_id") REFERENCES "public"."mesocycle"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mesocycle"
    ADD CONSTRAINT "program_blocks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mesocycle_templates"
    ADD CONSTRAINT "program_templates_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sleep_sessions"
    ADD CONSTRAINT "sleep_sessions_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "public"."data_sources"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."sleep_sessions"
    ADD CONSTRAINT "sleep_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sync_conflicts"
    ADD CONSTRAINT "sync_conflicts_resolved_by_fkey" FOREIGN KEY ("resolved_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."sync_conflicts"
    ADD CONSTRAINT "sync_conflicts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."training_profile_configuration"
    ADD CONSTRAINT "training_profile_configuration_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_follows"
    ADD CONSTRAINT "user_follows_followed_id_fkey" FOREIGN KEY ("followed_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_follows"
    ADD CONSTRAINT "user_follows_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_warmup_preferences"
    ADD CONSTRAINT "user_warmup_preferences_scheme_id_fkey" FOREIGN KEY ("scheme_id") REFERENCES "public"."warmup_schemes"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."user_warmup_preferences"
    ADD CONSTRAINT "user_warmup_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."warmup_schemes"
    ADD CONSTRAINT "warmup_schemes_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."workout_exercises.template"
    ADD CONSTRAINT "workout_exercises.template_workout_id_fkey" FOREIGN KEY ("workout_id") REFERENCES "public"."workouts.templates"("id");



ALTER TABLE ONLY "public"."workout_exercises"
    ADD CONSTRAINT "workout_exercises_workout_id_fkey" FOREIGN KEY ("workout_id") REFERENCES "public"."workouts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."workout_sets"
    ADD CONSTRAINT "workout_sets_workout_exercise_id_fkey" FOREIGN KEY ("workout_exercise_id") REFERENCES "public"."workout_exercises"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."workouts.templates"
    ADD CONSTRAINT "workouts.templates_mesocycle_block_id_fkey" FOREIGN KEY ("mesocycle_block_id") REFERENCES "public"."mesocycle.templates"("id");



ALTER TABLE ONLY "public"."workouts"
    ADD CONSTRAINT "workouts_mesocycle_block_id_fkey" FOREIGN KEY ("mesocycle_block_id") REFERENCES "public"."mesocycle"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."workouts"
    ADD CONSTRAINT "workouts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Allow profile creation during signup" ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Enable read access for all users" ON "public"."exercise_library" FOR SELECT USING (true);



CREATE POLICY "Users can delete own training config" ON "public"."training_profile_configuration" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own training config" ON "public"."training_profile_configuration" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own training config" ON "public"."training_profile_configuration" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own training config" ON "public"."training_profile_configuration" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."admin_users" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "admin_users_admin" ON "public"."admin_users" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "audit_admin_delete" ON "public"."audit_log" FOR DELETE USING ("public"."is_admin"());



CREATE POLICY "audit_admin_read" ON "public"."audit_log" FOR SELECT USING ("public"."is_admin"());



CREATE POLICY "audit_admin_write" ON "public"."audit_log" FOR UPDATE USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "audit_insert_all" ON "public"."audit_log" FOR INSERT WITH CHECK (true);



ALTER TABLE "public"."audit_log" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "custom_exercises_owner_delete" ON "public"."user_custom_exercises" FOR DELETE USING ((("created_by_user_id" = "auth"."uid"()) OR "public"."is_admin"()));



CREATE POLICY "custom_exercises_owner_read" ON "public"."user_custom_exercises" FOR SELECT USING ((("created_by_user_id" = "auth"."uid"()) OR "public"."is_admin"()));



CREATE POLICY "custom_exercises_owner_update" ON "public"."user_custom_exercises" FOR UPDATE USING ((("created_by_user_id" = "auth"."uid"()) OR "public"."is_admin"())) WITH CHECK ((("created_by_user_id" = "auth"."uid"()) OR "public"."is_admin"()));



CREATE POLICY "custom_exercises_owner_write" ON "public"."user_custom_exercises" FOR INSERT WITH CHECK ((("created_by_user_id" = "auth"."uid"()) OR "public"."is_admin"()));



ALTER TABLE "public"."data_sources" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "ds_owner" ON "public"."data_sources" USING ((("user_id" = "auth"."uid"()) OR "public"."is_admin"())) WITH CHECK ((("user_id" = "auth"."uid"()) OR "public"."is_admin"()));



ALTER TABLE "public"."exercise_library" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."exercise_substitutions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."exercises_draft" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "exsubs_owner_write" ON "public"."exercise_substitutions" USING ((("created_by_user_id" = "auth"."uid"()) OR "public"."is_admin"())) WITH CHECK ((("created_by_user_id" = "auth"."uid"()) OR "public"."is_admin"()));



CREATE POLICY "exsubs_public_read" ON "public"."exercise_substitutions" FOR SELECT USING ((("is_public" = true) OR ("created_by_user_id" = "auth"."uid"()) OR "public"."is_admin"()));



CREATE POLICY "follows_owner_write" ON "public"."user_follows" USING ((("follower_id" = "auth"."uid"()) OR "public"."is_admin"())) WITH CHECK ((("follower_id" = "auth"."uid"()) OR "public"."is_admin"()));



CREATE POLICY "follows_select_all" ON "public"."user_follows" FOR SELECT USING (true);



ALTER TABLE "public"."health_metrics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."heart_rate_samples" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "hm_owner" ON "public"."health_metrics" USING ((("user_id" = "auth"."uid"()) OR "public"."is_admin"())) WITH CHECK ((("user_id" = "auth"."uid"()) OR "public"."is_admin"()));



CREATE POLICY "hr_owner" ON "public"."heart_rate_samples" USING ((("user_id" = "auth"."uid"()) OR "public"."is_admin"())) WITH CHECK ((("user_id" = "auth"."uid"()) OR "public"."is_admin"()));



ALTER TABLE "public"."mesocycle" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."mesocycle_templates" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "pb_owner" ON "public"."mesocycle" USING ((("user_id" = "auth"."uid"()) OR "public"."is_admin"())) WITH CHECK ((("user_id" = "auth"."uid"()) OR "public"."is_admin"()));



CREATE POLICY "pbe_owner" ON "public"."mesocycle_template.exercises" USING ((EXISTS ( SELECT 1
   FROM "public"."mesocycle" "pb"
  WHERE (("pb"."id" = "mesocycle_template.exercises"."mesocycle_block_id") AND (("pb"."user_id" = "auth"."uid"()) OR "public"."is_admin"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."mesocycle" "pb"
  WHERE (("pb"."id" = "mesocycle_template.exercises"."mesocycle_block_id") AND (("pb"."user_id" = "auth"."uid"()) OR "public"."is_admin"())))));



ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "profiles_insert_on_signup" ON "public"."profiles" FOR INSERT WITH CHECK (true);



CREATE POLICY "profiles_policy" ON "public"."profiles" USING ((("user_id" = "auth"."uid"()) OR "public"."is_admin"())) WITH CHECK ((("user_id" = "auth"."uid"()) OR "public"."is_admin"()));



CREATE POLICY "pt_owner_write" ON "public"."mesocycle_templates" USING ((("created_by_user_id" = "auth"."uid"()) OR "public"."is_admin"())) WITH CHECK ((("created_by_user_id" = "auth"."uid"()) OR "public"."is_admin"()));



CREATE POLICY "pt_public_read" ON "public"."mesocycle_templates" FOR SELECT USING ((("is_public" = true) OR ("created_by_user_id" = "auth"."uid"()) OR "public"."is_admin"()));



CREATE POLICY "sc_owner" ON "public"."sync_conflicts" USING ((("user_id" = "auth"."uid"()) OR "public"."is_admin"())) WITH CHECK ((("user_id" = "auth"."uid"()) OR "public"."is_admin"()));



CREATE POLICY "sleep_owner" ON "public"."sleep_sessions" USING ((("user_id" = "auth"."uid"()) OR "public"."is_admin"())) WITH CHECK ((("user_id" = "auth"."uid"()) OR "public"."is_admin"()));



ALTER TABLE "public"."sleep_sessions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sync_conflicts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."training_profile_configuration" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_custom_exercises" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_follows" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_warmup_preferences" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "uwp_owner" ON "public"."user_warmup_preferences" USING ((("user_id" = "auth"."uid"()) OR "public"."is_admin"())) WITH CHECK ((("user_id" = "auth"."uid"()) OR "public"."is_admin"()));



CREATE POLICY "w_owner" ON "public"."workouts" USING ((("user_id" = "auth"."uid"()) OR "public"."is_admin"())) WITH CHECK ((("user_id" = "auth"."uid"()) OR "public"."is_admin"()));



ALTER TABLE "public"."warmup_schemes" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "wex_owner" ON "public"."workout_exercises" USING ((EXISTS ( SELECT 1
   FROM "public"."workouts" "w"
  WHERE (("w"."id" = "workout_exercises"."workout_id") AND (("w"."user_id" = "auth"."uid"()) OR "public"."is_admin"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."workouts" "w"
  WHERE (("w"."id" = "workout_exercises"."workout_id") AND (("w"."user_id" = "auth"."uid"()) OR "public"."is_admin"())))));



ALTER TABLE "public"."workouts" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "workouts_public_select" ON "public"."workouts" FOR SELECT USING (("is_public" = true));



CREATE POLICY "ws_owner_write" ON "public"."warmup_schemes" USING ((("created_by_user_id" = "auth"."uid"()) OR "public"."is_admin"())) WITH CHECK ((("created_by_user_id" = "auth"."uid"()) OR "public"."is_admin"()));



CREATE POLICY "ws_public_read" ON "public"."warmup_schemes" FOR SELECT USING (true);



CREATE POLICY "wset_owner" ON "public"."workout_sets" USING ((EXISTS ( SELECT 1
   FROM ("public"."workout_exercises" "we"
     JOIN "public"."workouts" "w" ON (("w"."id" = "we"."workout_id")))
  WHERE (("we"."id" = "workout_sets"."workout_exercise_id") AND (("w"."user_id" = "auth"."uid"()) OR "public"."is_admin"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."workout_exercises" "we"
     JOIN "public"."workouts" "w" ON (("w"."id" = "we"."workout_id")))
  WHERE (("we"."id" = "workout_sets"."workout_exercise_id") AND (("w"."user_id" = "auth"."uid"()) OR "public"."is_admin"())))));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."calculate_next_workout_targets"("p_user_id" "uuid", "p_exercise_id" "uuid", "p_block_week" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_next_workout_targets"("p_user_id" "uuid", "p_exercise_id" "uuid", "p_block_week" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_next_workout_targets"("p_user_id" "uuid", "p_exercise_id" "uuid", "p_block_week" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."check_deload_triggers"("p_user_id" "uuid", "p_exercise_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."check_deload_triggers"("p_user_id" "uuid", "p_exercise_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_deload_triggers"("p_user_id" "uuid", "p_exercise_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."debug_user_data"("user_id_param" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."debug_user_data"("user_id_param" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."debug_user_data"("user_id_param" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_user_account"("user_id_to_delete" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."delete_user_account"("user_id_to_delete" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_user_account"("user_id_to_delete" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."find_functions_with_text"("search_text" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."find_functions_with_text"("search_text" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."find_functions_with_text"("search_text" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_comprehensive_mesocycle_data"("user_id_param" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_comprehensive_mesocycle_data"("user_id_param" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_comprehensive_mesocycle_data"("user_id_param" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_exercise_library_simple"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_exercise_library_simple"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_exercise_library_simple"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_exercise_trend"("p_user_id" "uuid", "p_exercise_id" "uuid", "p_days_back" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_exercise_trend"("p_user_id" "uuid", "p_exercise_id" "uuid", "p_days_back" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_exercise_trend"("p_user_id" "uuid", "p_exercise_id" "uuid", "p_days_back" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_mesocycle_details"("mesocycle_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_mesocycle_details"("mesocycle_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_mesocycle_details"("mesocycle_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_mesocycle_exercises_only"("user_id_param" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_mesocycle_exercises_only"("user_id_param" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_mesocycle_exercises_only"("user_id_param" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_mesocycle_templates_and_exercises"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_mesocycle_templates_and_exercises"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_mesocycle_templates_and_exercises"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_mesocycle_templates_only"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_mesocycle_templates_only"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_mesocycle_templates_only"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_mesocycle_templates_with_exercises"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_mesocycle_templates_with_exercises"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_mesocycle_templates_with_exercises"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_mesocycles_summary"("user_id_param" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_mesocycles_summary"("user_id_param" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_mesocycles_summary"("user_id_param" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_mesocycles_with_sets"("user_id_param" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_mesocycles_with_sets"("user_id_param" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_mesocycles_with_sets"("user_id_param" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_mesocycles_with_sets_new"("user_id_param" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_mesocycles_with_sets_new"("user_id_param" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_mesocycles_with_sets_new"("user_id_param" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_workouts_with_exercises_and_sets_by_week"("mesocycle_id_param" "uuid", "workout_week_param" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_workouts_with_exercises_and_sets_by_week"("mesocycle_id_param" "uuid", "workout_week_param" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_workouts_with_exercises_and_sets_by_week"("mesocycle_id_param" "uuid", "workout_week_param" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_calibration_set_progression"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_calibration_set_progression"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_calibration_set_progression"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_delete_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_delete_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_delete_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_deleted_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_deleted_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_deleted_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_simple_calibration"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_simple_calibration"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_simple_calibration"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."progressive_overload_algo_v3"() TO "anon";
GRANT ALL ON FUNCTION "public"."progressive_overload_algo_v3"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."progressive_overload_algo_v3"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "postgres";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "anon";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "service_role";



GRANT ALL ON FUNCTION "public"."setup_calibration_sets"("p_workout_exercise_id" "uuid", "p_total_sets" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."setup_calibration_sets"("p_workout_exercise_id" "uuid", "p_total_sets" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."setup_calibration_sets"("p_workout_exercise_id" "uuid", "p_total_sets" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."show_limit"() TO "postgres";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "anon";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "service_role";



GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_training_config_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_training_config_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_training_config_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."util_actor_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."util_actor_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."util_actor_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."util_audit_log"() TO "anon";
GRANT ALL ON FUNCTION "public"."util_audit_log"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."util_audit_log"() TO "service_role";



GRANT ALL ON FUNCTION "public"."util_touch_last_modified"() TO "anon";
GRANT ALL ON FUNCTION "public"."util_touch_last_modified"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."util_touch_last_modified"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_block_week_plans"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_block_week_plans"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_block_week_plans"() TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "service_role";


















GRANT ALL ON TABLE "public"."admin_users" TO "anon";
GRANT ALL ON TABLE "public"."admin_users" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_users" TO "service_role";



GRANT ALL ON TABLE "public"."audit_log" TO "anon";
GRANT ALL ON TABLE "public"."audit_log" TO "authenticated";
GRANT ALL ON TABLE "public"."audit_log" TO "service_role";



GRANT ALL ON TABLE "public"."data_sources" TO "anon";
GRANT ALL ON TABLE "public"."data_sources" TO "authenticated";
GRANT ALL ON TABLE "public"."data_sources" TO "service_role";



GRANT ALL ON TABLE "public"."exercise_library" TO "anon";
GRANT ALL ON TABLE "public"."exercise_library" TO "authenticated";
GRANT ALL ON TABLE "public"."exercise_library" TO "service_role";



GRANT ALL ON TABLE "public"."exercise_substitutions" TO "anon";
GRANT ALL ON TABLE "public"."exercise_substitutions" TO "authenticated";
GRANT ALL ON TABLE "public"."exercise_substitutions" TO "service_role";



GRANT ALL ON TABLE "public"."exercises_draft" TO "anon";
GRANT ALL ON TABLE "public"."exercises_draft" TO "authenticated";
GRANT ALL ON TABLE "public"."exercises_draft" TO "service_role";



GRANT ALL ON SEQUENCE "public"."exercises_draft_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."exercises_draft_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."exercises_draft_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."health_metrics" TO "anon";
GRANT ALL ON TABLE "public"."health_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."health_metrics" TO "service_role";



GRANT ALL ON TABLE "public"."heart_rate_samples" TO "anon";
GRANT ALL ON TABLE "public"."heart_rate_samples" TO "authenticated";
GRANT ALL ON TABLE "public"."heart_rate_samples" TO "service_role";



GRANT ALL ON TABLE "public"."mesocycle" TO "anon";
GRANT ALL ON TABLE "public"."mesocycle" TO "authenticated";
GRANT ALL ON TABLE "public"."mesocycle" TO "service_role";



GRANT ALL ON TABLE "public"."mesocycle.templates" TO "anon";
GRANT ALL ON TABLE "public"."mesocycle.templates" TO "authenticated";
GRANT ALL ON TABLE "public"."mesocycle.templates" TO "service_role";



GRANT ALL ON TABLE "public"."mesocycle_blocks_runtime" TO "anon";
GRANT ALL ON TABLE "public"."mesocycle_blocks_runtime" TO "authenticated";
GRANT ALL ON TABLE "public"."mesocycle_blocks_runtime" TO "service_role";



GRANT ALL ON TABLE "public"."mesocycle_template.exercises" TO "anon";
GRANT ALL ON TABLE "public"."mesocycle_template.exercises" TO "authenticated";
GRANT ALL ON TABLE "public"."mesocycle_template.exercises" TO "service_role";



GRANT ALL ON TABLE "public"."mesocycle_templates" TO "anon";
GRANT ALL ON TABLE "public"."mesocycle_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."mesocycle_templates" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."user_follows" TO "anon";
GRANT ALL ON TABLE "public"."user_follows" TO "authenticated";
GRANT ALL ON TABLE "public"."user_follows" TO "service_role";



GRANT ALL ON TABLE "public"."workouts" TO "anon";
GRANT ALL ON TABLE "public"."workouts" TO "authenticated";
GRANT ALL ON TABLE "public"."workouts" TO "service_role";



GRANT ALL ON TABLE "public"."public_following_feed" TO "anon";
GRANT ALL ON TABLE "public"."public_following_feed" TO "authenticated";
GRANT ALL ON TABLE "public"."public_following_feed" TO "service_role";



GRANT ALL ON TABLE "public"."release_notes" TO "anon";
GRANT ALL ON TABLE "public"."release_notes" TO "authenticated";
GRANT ALL ON TABLE "public"."release_notes" TO "service_role";



GRANT ALL ON SEQUENCE "public"."release_notes_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."release_notes_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."release_notes_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."sleep_sessions" TO "anon";
GRANT ALL ON TABLE "public"."sleep_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."sleep_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."sync_conflicts" TO "anon";
GRANT ALL ON TABLE "public"."sync_conflicts" TO "authenticated";
GRANT ALL ON TABLE "public"."sync_conflicts" TO "service_role";



GRANT ALL ON TABLE "public"."terra_data_payloads" TO "anon";
GRANT ALL ON TABLE "public"."terra_data_payloads" TO "authenticated";
GRANT ALL ON TABLE "public"."terra_data_payloads" TO "service_role";



GRANT ALL ON TABLE "public"."terra_misc_payloads" TO "anon";
GRANT ALL ON TABLE "public"."terra_misc_payloads" TO "authenticated";
GRANT ALL ON TABLE "public"."terra_misc_payloads" TO "service_role";



GRANT ALL ON TABLE "public"."terra_users" TO "anon";
GRANT ALL ON TABLE "public"."terra_users" TO "authenticated";
GRANT ALL ON TABLE "public"."terra_users" TO "service_role";



GRANT ALL ON TABLE "public"."training_profile_configuration" TO "anon";
GRANT ALL ON TABLE "public"."training_profile_configuration" TO "authenticated";
GRANT ALL ON TABLE "public"."training_profile_configuration" TO "service_role";



GRANT ALL ON TABLE "public"."user_custom_exercises" TO "anon";
GRANT ALL ON TABLE "public"."user_custom_exercises" TO "authenticated";
GRANT ALL ON TABLE "public"."user_custom_exercises" TO "service_role";



GRANT ALL ON TABLE "public"."user_warmup_preferences" TO "anon";
GRANT ALL ON TABLE "public"."user_warmup_preferences" TO "authenticated";
GRANT ALL ON TABLE "public"."user_warmup_preferences" TO "service_role";



GRANT ALL ON TABLE "public"."warmup_schemes" TO "anon";
GRANT ALL ON TABLE "public"."warmup_schemes" TO "authenticated";
GRANT ALL ON TABLE "public"."warmup_schemes" TO "service_role";



GRANT ALL ON TABLE "public"."workout_exercises" TO "anon";
GRANT ALL ON TABLE "public"."workout_exercises" TO "authenticated";
GRANT ALL ON TABLE "public"."workout_exercises" TO "service_role";



GRANT ALL ON TABLE "public"."workout_exercises.template" TO "anon";
GRANT ALL ON TABLE "public"."workout_exercises.template" TO "authenticated";
GRANT ALL ON TABLE "public"."workout_exercises.template" TO "service_role";



GRANT ALL ON TABLE "public"."workout_sets" TO "anon";
GRANT ALL ON TABLE "public"."workout_sets" TO "authenticated";
GRANT ALL ON TABLE "public"."workout_sets" TO "service_role";



GRANT ALL ON TABLE "public"."workouts.templates" TO "anon";
GRANT ALL ON TABLE "public"."workouts.templates" TO "authenticated";
GRANT ALL ON TABLE "public"."workouts.templates" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























RESET ALL;
