set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_user_profile_for_ai(p_user_id uuid, p_muscle_groups text[] DEFAULT ARRAY[]::text[])
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_person JSONB;
  v_exercises JSONB;
  v_result JSONB;
BEGIN
  -- Build person object from profiles and training_profile_configuration
  SELECT jsonb_build_object(
    'date_of_birth', p.date_of_birth,
    'height_cm', p.height_cm,
    'weight_kg', p.weight_kg,
    'biological_sex', p.biological_sex,
    'desired_body_type', tpc.desired_body_type,
    'years_of_exercise_experience', tpc.years_of_exercise_experience,
    'equipment_access', tpc.equipment_access,
    'warmup_sets_preference', tpc.warmup_sets_preference,
    'coaching_style', tpc.coaching_style,
    'injury_flags', tpc.injury_flags,
    'exercise_blacklist', tpc.exercise_blacklist,
    'exercise_favorites', tpc.exercise_favorites
  ) INTO v_person
  FROM profiles p
  LEFT JOIN training_profile_configuration tpc ON tpc.user_id = p.user_id
  WHERE p.user_id = p_user_id;

  -- If no person data found, return error
  IF v_person IS NULL THEN
    RETURN jsonb_build_object(
      'error', 'User not found',
      'person', NULL,
      'exercises', '[]'::jsonb
    );
  END IF;

  -- Get exercises filtered by muscle groups if provided
  IF array_length(p_muscle_groups, 1) > 0 THEN
    SELECT jsonb_agg(
      jsonb_build_object(
        'exercise_uid', el.exercise_uid,
        'exercise_display_name_en', el.exercise_display_name_en,
        'exercise_muscle_groups_simple', el.exercise_muscle_groups_simple
      )
      ORDER BY el.exercise_display_name_en
    ) INTO v_exercises
    FROM exercise_library el
    WHERE el.exercise_status = 'active'
      AND el.exercise_muscle_groups_simple->'primary' 
          ?| p_muscle_groups;
  ELSE
    -- Return all active exercises if no muscle groups specified
    SELECT jsonb_agg(
      jsonb_build_object(
        'exercise_uid', el.exercise_uid,
        'exercise_display_name_en', el.exercise_display_name_en,
        'exercise_muscle_groups_simple', el.exercise_muscle_groups_simple
      )
      ORDER BY el.exercise_display_name_en
    ) INTO v_exercises
    FROM exercise_library el
    WHERE el.exercise_status = 'active';
  END IF;

  -- Build final result
  v_result := jsonb_build_object(
    'person', v_person,
    'exercises', COALESCE(v_exercises, '[]'::jsonb)
  );

  RETURN v_result;
END;
$function$
;


