-- Function to provide database context for AI assistance
CREATE OR REPLACE FUNCTION get_database_context()
RETURNS JSONB AS $$
DECLARE
    context JSONB;
BEGIN
    SELECT jsonb_build_object(
        'user_count', (SELECT COUNT(*) FROM user_profiles),
        'active_mesocycles', (SELECT COUNT(*) FROM mesocycle WHERE status = 'active'),
        'total_workouts', (SELECT COUNT(*) FROM workouts),
        'exercise_library_size', (SELECT COUNT(*) FROM exercise_library),
        'recent_workouts', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'mesocycle_name', m.mesocycle_name,
                    'started_at', w.started_at,
                    'exercise_count', COUNT(DISTINCT we.id)
                )
            )
            FROM workouts w
            JOIN mesocycle m ON w.mesocycle_block_id = m.id
            JOIN workout_exercises we ON w.id = we.workout_id
            WHERE w.started_at > NOW() - INTERVAL '7 days'
            GROUP BY m.mesocycle_name, w.started_at
            ORDER BY w.started_at DESC
            LIMIT 5
        ),
        'common_exercises', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'exercise_name', el.exercise_display_name_en,
                    'usage_count', COUNT(*)
                )
            )
            FROM workout_exercises we
            JOIN exercise_library el ON we.exercise_id = el.exercise_uid
            GROUP BY el.exercise_display_name_en
            ORDER BY COUNT(*) DESC
            LIMIT 10
        )
    ) INTO context;
    
    RETURN context;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
