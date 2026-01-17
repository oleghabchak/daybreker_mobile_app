-- Database Analysis Before Calibration Migration
-- Run this in your Supabase SQL Editor to understand current state

-- 1. Check current workout_sets table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'workout_sets' 
ORDER BY ordinal_position;

-- 2. Check if set_type or calibration_data columns already exist
SELECT 
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'workout_sets' 
AND column_name IN ('set_type', 'calibration_data');

-- 3. Analyze current workout_sets data patterns
SELECT 
    COUNT(*) as total_sets,
    MIN(set_number) as min_set_number,
    MAX(set_number) as max_set_number,
    COUNT(DISTINCT workout_exercise_id) as unique_exercises,
    COUNT(DISTINCT w.workout_week) as unique_weeks
FROM workout_sets ws
JOIN workout_exercises we ON ws.workout_exercise_id = we.id
JOIN workouts w ON we.workout_id = w.id;

-- 4. Check for any set_number gaps that could affect calibration logic
SELECT 
    ws.workout_exercise_id,
    ws.set_number,
    COUNT(*) as count
FROM workout_sets ws
GROUP BY ws.workout_exercise_id, ws.set_number
HAVING COUNT(*) > 1
ORDER BY ws.workout_exercise_id, ws.set_number;

-- 5. Analyze set_number distribution to understand current patterns
SELECT 
    ws.set_number,
    COUNT(*) as frequency
FROM workout_sets ws
GROUP BY ws.set_number
ORDER BY ws.set_number;

-- 6. Check current workout_week data availability
SELECT 
    w.workout_week,
    COUNT(DISTINCT w.id) as workout_count,
    COUNT(ws.id) as total_sets
FROM workouts w
LEFT JOIN workout_exercises we ON w.id = we.workout_id
LEFT JOIN workout_sets ws ON we.id = ws.workout_exercise_id
GROUP BY w.workout_week
ORDER BY w.workout_week;

-- 7. Check for any existing constraints or triggers on workout_sets
SELECT 
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_name = 'workout_sets';

-- 8. Check existing indexes on workout_sets
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'workout_sets';

-- 9. Sample some actual workout_sets data to understand current structure
SELECT 
    ws.id,
    ws.set_number,
    ws.target_reps,
    ws.weight_kg,
    ws.status,
    w.workout_week,
    e.exercise_display_name_en
FROM workout_sets ws
JOIN workout_exercises we ON ws.workout_exercise_id = we.id
JOIN workouts w ON we.workout_id = w.id
JOIN exercise_library e ON we.exercise_id = e.exercise_uid
ORDER BY w.workout_week, we.order_index, ws.set_number
LIMIT 20;

-- 10. Check if there are any Week 1 sets that would become calibration sets
SELECT 
    w.workout_week,
    ws.set_number,
    COUNT(*) as set_count,
    e.exercise_display_name_en
FROM workout_sets ws
JOIN workout_exercises we ON ws.workout_exercise_id = we.id
JOIN workouts w ON we.workout_id = w.id
JOIN exercise_library e ON we.exercise_id = e.exercise_uid
WHERE w.workout_week = 1 AND ws.set_number = 1
GROUP BY w.workout_week, ws.set_number, e.exercise_display_name_en
ORDER BY set_count DESC;
