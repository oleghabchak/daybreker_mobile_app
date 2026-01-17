set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_mesocycles_with_sets_new_by_id(id_param uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$DECLARE
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
            'minutes_per_session', m.minutes_per_session,
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
    WHERE m.id = id_param;
    
    RETURN COALESCE(result, '[]'::jsonb);
END;$function$
;


