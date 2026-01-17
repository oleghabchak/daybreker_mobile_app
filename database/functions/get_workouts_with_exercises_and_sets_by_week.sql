DECLARE
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
END;