-- Complete migration: Apply calibration set progression system
-- This script applies all necessary changes to implement automatic set progression

-- Step 1: Ensure status column has proper constraint
-- Add constraint for valid status values if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_status_values') THEN
        ALTER TABLE workout_sets 
        ADD CONSTRAINT check_status_values 
        CHECK (status IN ('not_started', 'done', 'skipped'));
    END IF;
END $$;

-- Step 2: Verify required columns and constraints exist
-- Note: These columns already exist in your schema based on the table definitions provided
-- workout_sets already has: target_rir_bucket, achieved_rir_bucket, tempo_seconds, rest_seconds, 
--                         technique_rating, range_of_motion_full, is_calibration, status, set_type
-- workouts already has: workout_week, workout_day, mesocycle_block_id
-- All required constraints are also already in place

-- Step 3: Create the progressive overload algorithm function with Week 2 to Week 3 progression
CREATE OR REPLACE FUNCTION progressive_overload_algo_v3()
RETURNS TRIGGER AS $$
DECLARE
    next_set_record RECORD;
    current_set_type TEXT;
    current_set_number INTEGER;
    current_weight DECIMAL(8,2);
    current_reps INTEGER;
    current_workout_week INTEGER;
    current_workout_day INTEGER;
    current_exercise_id TEXT;
    current_mesocycle_id TEXT;
    week2_set_record RECORD;
    week3_set_record RECORD;
    exercise_mechanics_type TEXT;
    target_reps_min INTEGER;
    target_reps_max INTEGER;
    weekly_progression_rate DECIMAL(5,3);
    mesocycle_weeks INTEGER;
    completed_current_week_sets INTEGER;
    total_current_week_sets INTEGER;
    next_week INTEGER;
BEGIN
    -- Only proceed if status changed to 'done'
    IF NEW.status != 'done' OR OLD.status = 'done' THEN
        RETURN NEW;
    END IF;
    
    -- Get current set details
    current_set_type := NEW.set_type;
    current_set_number := NEW.set_number;
    current_weight := NEW.weight_kg;
    current_reps := NEW.actual_reps;
    
    -- Get workout and exercise context
    SELECT w.workout_week, w.workout_day, we.exercise_id::text, w.mesocycle_block_id::text, el.exercise_mechanics_type
    INTO current_workout_week, current_workout_day, current_exercise_id, current_mesocycle_id, exercise_mechanics_type
    FROM workout_sets ws
    JOIN workout_exercises we ON ws.workout_exercise_id = we.id
    JOIN workouts w ON we.workout_id = w.id
    JOIN exercise_library el ON we.exercise_id::text = el.exercise_uid
    WHERE ws.id = NEW.id;
    
    -- Set target reps based on exercise mechanics type
    IF exercise_mechanics_type = 'compound' THEN
        target_reps_min := 8;
        target_reps_max := 12;
    ELSIF exercise_mechanics_type = 'isolation' THEN
        target_reps_min := 12;
        target_reps_max := 20;
    ELSE
        -- Default to compound if mechanics type is unknown
        target_reps_min := 8;
        target_reps_max := 12;
    END IF;
    
    -- Handle calibration set (set 1) completion
    IF current_set_type = 'calibration' AND current_set_number = 1 THEN
        -- Find the next set (set 2) for the same exercise
        SELECT * INTO next_set_record
        FROM workout_sets 
        WHERE workout_exercise_id = NEW.workout_exercise_id 
          AND set_number = 2
          AND set_type = 'validation'
        LIMIT 1;
        
        -- If next set exists and has no weight/reps set, calculate working weight from calibration
        IF next_set_record.id IS NOT NULL AND 
           (next_set_record.weight_kg IS NULL OR next_set_record.weight_kg = 0) AND
           (next_set_record.actual_reps IS NULL OR next_set_record.actual_reps = 0) THEN
            
            -- Calculate working weight based on calibration reps
            DECLARE
                working_weight DECIMAL(8,2);
                validation_reps INTEGER;
            BEGIN
                IF current_reps >= 11 AND current_reps <= 12 THEN
                    working_weight := current_weight * 0.88;
                ELSIF current_reps = 10 THEN
                    working_weight := current_weight * 0.85;
                ELSIF current_reps >= 8 AND current_reps <= 9 THEN
                    working_weight := current_weight * 0.82;
                ELSE
                    -- Fallback to original weight if reps are outside expected range
                    working_weight := current_weight;
                END IF;
                
                -- Set target reps for validation set based on exercise mechanics
                IF exercise_mechanics_type = 'compound' THEN
                    validation_reps := 10;
                ELSIF exercise_mechanics_type = 'isolation' THEN
                    validation_reps := 15;
                ELSE
                    validation_reps := 10; -- Default to compound
                END IF;
                
                UPDATE workout_sets 
                SET 
                    weight_kg = working_weight,
                    actual_reps = validation_reps,
                    last_modified = NOW()
                WHERE id = next_set_record.id;
                
                RAISE NOTICE 'Calculated validation set weight from calibration: original_weight=%, calibration_reps=%, working_weight=%, validation_reps=%', 
                    current_weight, current_reps, working_weight, validation_reps;
            END;
        END IF;
        
    -- Handle validation set (set 2) completion  
    ELSIF current_set_type = 'validation' AND current_set_number = 2 THEN
        -- Find the next set (set 3) for the same exercise
        SELECT * INTO next_set_record
        FROM workout_sets 
        WHERE workout_exercise_id = NEW.workout_exercise_id 
          AND set_number = 3
          AND set_type = 'working'
        LIMIT 1;
        
        -- If next set exists and has no weight/reps set, calculate working weight based on validation performance
        IF next_set_record.id IS NOT NULL AND 
           (next_set_record.weight_kg IS NULL OR next_set_record.weight_kg = 0) AND
           (next_set_record.actual_reps IS NULL OR next_set_record.actual_reps = 0) THEN
            
            -- Calculate working weight based on validation set performance
            DECLARE
                working_weight DECIMAL(8,2);
                working_reps INTEGER;
            BEGIN
                -- Set target reps for working set based on exercise mechanics
                IF exercise_mechanics_type = 'compound' THEN
                    working_reps := 10;
                ELSIF exercise_mechanics_type = 'isolation' THEN
                    working_reps := 15;
                ELSE
                    working_reps := 10; -- Default to compound
                END IF;
                
                -- Calculate working weight based on validation reps vs target range
                IF current_reps > target_reps_max THEN
                    -- Reps above range: increase weight by 3%
                    working_weight := current_weight * 1.03;
                ELSIF current_reps >= target_reps_min AND current_reps <= target_reps_max THEN
                    -- Reps in range: keep same weight
                    working_weight := current_weight;
                ELSE
                    -- Reps below range: decrease weight by 3%
                    working_weight := current_weight * 0.97;
                END IF;
                
                UPDATE workout_sets 
                SET 
                    weight_kg = working_weight,
                    actual_reps = working_reps,
                    last_modified = NOW()
                WHERE id = next_set_record.id;
                
                RAISE NOTICE 'Calculated working set from validation: validation_weight=%, validation_reps=%, target_range=% to %, working_weight=%, working_reps=%', 
                    current_weight, current_reps, target_reps_min, target_reps_max, working_weight, working_reps;
            END;
        END IF;
        
    -- Handle working set 3 completion in week 1 - copy to all sets in week 2
    ELSIF current_set_type = 'working' AND current_set_number = 3 AND current_workout_week = 1 THEN
        -- Find all sets for the same exercise in week 2
        FOR week2_set_record IN
            SELECT ws.*
            FROM workout_sets ws
            JOIN workout_exercises we ON ws.workout_exercise_id = we.id
            JOIN workouts w ON we.workout_id = w.id
            WHERE w.mesocycle_block_id::text = current_mesocycle_id
              AND w.workout_week = 2
              AND w.workout_day = current_workout_day
              AND we.exercise_id::text = current_exercise_id
              AND ws.set_type = 'working'
        LOOP
            -- Update week 2 sets with the same weight and reps as week 1 set 3
            UPDATE workout_sets 
            SET 
                weight_kg = current_weight,
                actual_reps = current_reps,
                last_modified = NOW()
            WHERE id = week2_set_record.id;
            
            RAISE NOTICE 'Copied week 1 set 3 data to week 2 set %: weight=%, reps=%', 
                week2_set_record.set_number, current_weight, current_reps;
        END LOOP;
        
    -- Handle completion of all working sets in any week - copy to next week with progression
    ELSIF current_set_type = 'working' AND current_workout_week >= 2 THEN
        -- Check if this is the last/complete set for this exercise in current week
        SELECT COUNT(*) INTO total_current_week_sets
        FROM workout_sets ws
        JOIN workout_exercises we ON ws.workout_exercise_id = we.id
        JOIN workouts w ON we.workout_id = w.id
        WHERE w.mesocycle_block_id::text = current_mesocycle_id
          AND w.workout_week = current_workout_week
          AND w.workout_day = current_workout_day
          AND we.exercise_id::text = current_exercise_id
          AND ws.set_type = 'working';
        
        -- Check how many working sets are completed
        SELECT COUNT(*) INTO completed_current_week_sets
        FROM workout_sets ws
        JOIN workout_exercises we ON ws.workout_exercise_id = we.id
        JOIN workouts w ON we.workout_id = w.id
        WHERE w.mesocycle_block_id::text = current_mesocycle_id
          AND w.workout_week = current_workout_week
          AND w.workout_day = current_workout_day
          AND we.exercise_id::text = current_exercise_id
          AND ws.set_type = 'working'
          AND ws.status = 'done';
        
        -- Get weighted average for week 2 sets (using last set completed)
        DECLARE
            weighted_weight DECIMAL(8,2);
            weighted_reps INTEGER;
        BEGIN
            weighted_weight := current_weight;
            weighted_reps := current_reps;
            
            -- Get mesocycle length
            SELECT mc.num_weeks 
            INTO mesocycle_weeks
            FROM mesocycle mc
            WHERE mc.id::text = current_mesocycle_id;
            
            -- If mesocycle length can't be determined, default to 6 weeks (moderate)
            IF mesocycle_weeks IS NULL OR mesocycle_weeks < 4 THEN
                mesocycle_weeks := 6;
            END IF;
            
            -- Determine weekly progression rate based on mesocycle length and exercise mechanics
            IF mesocycle_weeks <= 4 THEN
                -- Aggressive progression for 4-week mesocycle
                IF exercise_mechanics_type = 'compound' THEN
                    weekly_progression_rate := 0.030; -- 3.0% per week
                ELSE
                    weekly_progression_rate := 0.025; -- 2.5% per week
                END IF;
            ELSIF mesocycle_weeks <= 6 THEN
                -- Moderate progression for 5-6 week mesocycle
                IF exercise_mechanics_type = 'compound' THEN
                    weekly_progression_rate := 0.025; -- 2.5% per week
                ELSE
                    weekly_progression_rate := 0.020; -- 2.0% per week
                END IF;
            ELSE
                -- Conservative progression for 7-8 week mesocycle
                IF exercise_mechanics_type = 'compound' THEN
                    weekly_progression_rate := 0.020; -- 2.0% per week
                ELSE
                    weekly_progression_rate := 0.015; -- 1.5% per week
                END IF;
            END IF;
            
            -- Calculate next week number
            next_week := current_workout_week + 1;
            
            -- Only proceed if all working sets of current week are completed
            IF (completed_current_week_sets = total_current_week_sets) AND total_current_week_sets > 0 THEN
                -- Calculate progression-adjusted weight for next week
                DECLARE
                    next_week_weight DECIMAL(8,2);
                    next_week_reps INTEGER;
                    next_week_record RECORD;
                BEGIN
                    next_week_weight := weighted_weight * (1 + weekly_progression_rate);
                    
                    -- Keep same reps as current week (rep progression handled separately if needed)
                    next_week_reps := weighted_reps;
                    
                    -- Find all sets for the same exercise in next week
                    FOR next_week_record IN
                        SELECT ws.*
                        FROM workout_sets ws
                        JOIN workout_exercises we ON ws.workout_exercise_id = we.id
                        JOIN workouts w ON we.workout_id = w.id
                        WHERE w.mesocycle_block_id::text = current_mesocycle_id
                          AND w.workout_week = next_week
                          AND w.workout_day = current_workout_day
                          AND we.exercise_id::text = current_exercise_id
                          AND ws.set_type ='working'
                    LOOP
                        -- Update next week sets with progressive overload applied
                        UPDATE workout_sets 
                        SET 
                            weight_kg = next_week_weight,
                            actual_reps = next_week_reps,
                            last_modified = NOW()
                        WHERE id = next_week_record.id;
                        
                        RAISE NOTICE 'Applied weekly progression to week % set %: original_weight=%, progression_rate=%, next_weight=%, reps=%', 
                            next_week, next_week_record.set_number, weighted_weight, weekly_progression_rate, next_week_weight, next_week_reps;
                    END LOOP;
                    
                    RAISE NOTICE 'Week % to Week % progression completed: mechanics=%, mesocycle_weeks=%, rate=%', 
                        current_workout_week, next_week, exercise_mechanics_type, mesocycle_weeks, weekly_progression_rate;
                END;
            END IF;
        END;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Create the trigger
DROP TRIGGER IF EXISTS progressive_overload_algo_v3_trigger ON workout_sets;
CREATE TRIGGER progressive_overload_algo_v3_trigger
    AFTER UPDATE OF status ON workout_sets
    FOR EACH ROW
    EXECUTE FUNCTION progressive_overload_algo_v3();

-- Step 5: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_workout_sets_status 
ON workout_sets(workout_exercise_id, status, set_number);

CREATE INDEX IF NOT EXISTS idx_workout_sets_type_status 
ON workout_sets(workout_exercise_id, set_type, status, set_number);

CREATE INDEX IF NOT EXISTS idx_workout_sets_calibration_progression 
ON workout_sets(workout_exercise_id, set_number, set_type) 
WHERE set_type IN ('calibration', 'validation', 'working');

-- Step 6: Add comments for documentation
COMMENT ON TRIGGER progressive_overload_algo_v3_trigger ON workout_sets IS 
'Automatically handles progressive overload algorithm: copies calibration set data to set 2, applies validation set progression to set 3';

COMMENT ON FUNCTION progressive_overload_algo_v3() IS 
'Handles automatic progression logic: when calibration set (set 1) is done, calculates working weight for set 2. When validation set (set 2) is done, calculates adjusted weight for set 3. When week 1 set 3 is done, copies values to week 2. When all sets in any week >= 2 are completed, applies mesocycle-appropriate progressive overload to next week';

-- Step 7: Verify the setup
DO $$
BEGIN
    RAISE NOTICE 'Progressive overload algorithm v3 has been successfully installed!';
    RAISE NOTICE 'The system will now automatically:';
    RAISE NOTICE '1. Calculate working weight for validation set (set 2) when calibration set (set 1) is done';
    RAISE NOTICE '2. Calculate adjusted weight for working set (set 3) when validation set (set 2) is done';
    RAISE NOTICE '3. Copy week 1 set 3 values to all sets in week 2 when week 1 set 3 is completed';
    RAISE NOTICE '4. Apply weekly progression to next week when all current week sets are completed';
    RAISE NOTICE '5. Progression rates: 4w mesocycle=3%%/2.5%%, 5-6w=2.5%%/2%%, 7-8w=2%%/1.5%% (compound/isolation)';
END $$;
