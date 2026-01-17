-- Simple Database Analysis Before Calibration Migration
-- Run this in your Supabase SQL Editor

-- 1. Check if set_type and calibration_data columns already exist
SELECT 
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'workout_sets' 
AND column_name IN ('set_type', 'calibration_data');

-- 2. Basic workout_sets table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'workout_sets' 
ORDER BY ordinal_position;

-- 3. Count total sets and check set numbering
SELECT 
    COUNT(*) as total_sets,
    MIN(set_number) as min_set_number,
    MAX(set_number) as max_set_number
FROM workout_sets;

-- 4. Check workout_week data
SELECT 
    workout_week,
    COUNT(*) as workout_count
FROM workouts 
GROUP BY workout_week
ORDER BY workout_week;

-- 5. Sample Week 1, Set 1 data (what will become calibration sets)
SELECT 
    w.workout_week,
    ws.set_number,
    e.exercise_display_name_en,
    ws.target_reps,
    ws.weight_kg
FROM workout_sets ws
JOIN workout_exercises we ON ws.workout_exercise_id = we.id
JOIN workouts w ON we.workout_id = w.id
JOIN exercise_library e ON we.exercise_id::text = e.exercise_uid
WHERE w.workout_week = 1 AND ws.set_number = 1
LIMIT 10;
