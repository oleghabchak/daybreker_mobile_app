-- Real-time Calibration Data Monitoring
-- Run this after completing calibration sets to verify data storage

-- 1. Check for calibration sets
SELECT 
    'Calibration Sets Created' as metric,
    COUNT(*) as count,
    COUNT(CASE WHEN calibration_data IS NOT NULL THEN 1 END) as with_calibration_data
FROM workout_sets 
WHERE set_type = 'calibration';

-- 2. Sample calibration data
SELECT 
    'Sample Calibration Data' as metric,
    ws.set_type,
    ws.calibration_data,
    ws.weight_kg,
    ws.actual_reps,
    ws.target_reps
FROM workout_sets ws
WHERE ws.set_type = 'calibration'
AND ws.calibration_data IS NOT NULL
LIMIT 3;

-- 3. Check Week 1, Set 1 status
SELECT 
    'Week 1 Set 1 Status' as metric,
    ws.set_type,
    COUNT(*) as count
FROM workout_sets ws
JOIN workout_exercises we ON ws.workout_exercise_id = we.id
JOIN workouts w ON we.workout_id = w.id
WHERE w.workout_week = 1 AND ws.set_number = 1
GROUP BY ws.set_type;

-- 4. Recent calibration activity
SELECT 
    'Recent Calibration Activity' as metric,
    ws.created_at,
    ws.set_type,
    ws.calibration_data IS NOT NULL as has_calibration_data
FROM workout_sets ws
WHERE ws.set_type = 'calibration'
ORDER BY ws.created_at DESC
LIMIT 5;
