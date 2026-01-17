-- Migration: Fix calibration trigger idempotency
-- Issue: Trigger wouldn't re-fire if user toggled checkbox multiple times
-- Fix: Remove OLD.status = 'done' check to allow re-triggering

CREATE OR REPLACE FUNCTION progressive_overload_algo_v3()
RETURNS TRIGGER AS $$
DECLARE
    next_set_record RECORD;
    current_set_type TEXT;
    current_set_number INTEGER;
    current_weight DECIMAL(8,2);
    current_reps INTEGER;
BEGIN
    -- Only proceed if status is 'done' (allow re-triggering for idempotency)
    IF NEW.status != 'done' THEN
        RETURN NEW;
    END IF;
    
    -- Get current set details
    current_set_type := NEW.set_type;
    current_set_number := NEW.set_number;
    current_weight := NEW.weight_kg;
    current_reps := NEW.actual_reps;
    
    -- Handle calibration set (set 1) completion
    IF current_set_type = 'calibration' AND current_set_number = 1 THEN
        -- Find the next set (set 2) for the same exercise
        SELECT * INTO next_set_record
        FROM workout_sets 
        WHERE workout_exercise_id = NEW.workout_exercise_id 
          AND set_number = 2
          AND set_type = 'validation'
        LIMIT 1;
        
        -- If next set exists and has no weight/reps set, copy from calibration set
        IF next_set_record.id IS NOT NULL AND 
           (next_set_record.weight_kg IS NULL OR next_set_record.weight_kg = 0) AND
           (next_set_record.actual_reps IS NULL OR next_set_record.actual_reps = 0) THEN
            
            UPDATE workout_sets 
            SET 
                weight_kg = current_weight,
                actual_reps = current_reps,
                last_modified = NOW()
            WHERE id = next_set_record.id;
            
            RAISE NOTICE 'Copied calibration set data to set 2: weight=%, reps=%', current_weight, current_reps;
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
        
        -- If next set exists and has no weight/reps set, apply progression
        IF next_set_record.id IS NOT NULL AND 
           (next_set_record.weight_kg IS NULL OR next_set_record.weight_kg = 0) AND
           (next_set_record.actual_reps IS NULL OR next_set_record.actual_reps = 0) THEN
            
            -- Apply progression: weight + 5kg, reps + 2
            UPDATE workout_sets 
            SET 
                weight_kg = COALESCE(current_weight, 0) + 5,
                actual_reps = COALESCE(current_reps, 0) + 2,
                last_modified = NOW()
            WHERE id = next_set_record.id;
            
            RAISE NOTICE 'Applied validation set progression to set 3: weight=%, reps=%', 
                COALESCE(current_weight, 0) + 5, COALESCE(current_reps, 0) + 2;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;



