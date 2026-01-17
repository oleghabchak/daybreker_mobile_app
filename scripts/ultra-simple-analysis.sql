-- Ultra Simple Database Analysis
-- This avoids all complex JOINs that might cause type errors

-- 1. Check if calibration columns already exist
SELECT 
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'workout_sets' 
AND column_name IN ('set_type', 'calibration_data');

-- 2. Basic table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'workout_sets' 
ORDER BY ordinal_position;

-- 3. Simple counts
SELECT 
    COUNT(*) as total_sets,
    MIN(set_number) as min_set_number,
    MAX(set_number) as max_set_number
FROM workout_sets;

-- 4. Check workout weeks
SELECT 
    workout_week,
    COUNT(*) as workout_count
FROM workouts 
GROUP BY workout_week
ORDER BY workout_week;

-- 5. Check if we have any Week 1 workouts
SELECT 
    COUNT(*) as week_1_workouts
FROM workouts 
WHERE workout_week = 1;
