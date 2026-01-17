-- Calibration Feature Validation Script
-- Run this to verify the calibration feature is working correctly

-- 1. Check migration success
SELECT 'Migration Status' as test_name, 
       CASE 
         WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workout_sets' AND column_name = 'set_type')
         AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workout_sets' AND column_name = 'calibration_data')
         THEN '✅ SUCCESS: All columns added'
         ELSE '❌ FAILED: Missing columns'
       END as result;

-- 2. Check Week 1, Set 1 data availability
SELECT 'Week 1 Set 1 Data' as test_name,
       COUNT(*) as total_week1_set1,
       COUNT(CASE WHEN set_type = 'calibration' THEN 1 END) as calibration_sets,
       COUNT(CASE WHEN set_type = 'working' THEN 1 END) as working_sets
FROM workout_sets ws
JOIN workout_exercises we ON ws.workout_exercise_id = we.id
JOIN workouts w ON we.workout_id = w.id
WHERE w.workout_week = 1 AND ws.set_number = 1;

-- 3. Check set_type distribution
SELECT 'Set Type Distribution' as test_name,
       set_type,
       COUNT(*) as count
FROM workout_sets
GROUP BY set_type
ORDER BY count DESC;

-- 4. Check for any calibration_data
SELECT 'Calibration Data' as test_name,
       COUNT(*) as total_sets,
       COUNT(CASE WHEN calibration_data IS NOT NULL THEN 1 END) as sets_with_calibration_data
FROM workout_sets;

-- 5. Sample Week 1, Set 1 records (what should be calibration sets)
SELECT 'Sample Week 1 Set 1' as test_name,
       w.workout_week,
       ws.set_number,
       ws.set_type,
       ws.is_calibration,
       ws.target_reps,
       ws.weight_kg,
       ws.status
FROM workout_sets ws
JOIN workout_exercises we ON ws.workout_exercise_id = we.id
JOIN workouts w ON we.workout_id = w.id
WHERE w.workout_week = 1 AND ws.set_number = 1
LIMIT 5;
