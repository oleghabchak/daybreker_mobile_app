
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
                        'status',ws.status,
                        'is_user_value', ws.is_user_value
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
END;
