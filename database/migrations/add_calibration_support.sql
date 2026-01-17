-- Migration: Add calibration support to workout_sets
-- This ensures proper set numbering and calibration tracking

-- Add calibration-specific columns
ALTER TABLE workout_sets 
ADD COLUMN IF NOT EXISTS set_type TEXT DEFAULT 'working' CHECK (set_type IN ('warmup', 'working', 'calibration', 'validation')),
ADD COLUMN IF NOT EXISTS calibration_data JSONB DEFAULT NULL;

-- Add constraint to ensure set_number starts at 1 and is sequential per exercise
-- This prevents gaps that could break calibration logic
CREATE OR REPLACE FUNCTION validate_set_numbering()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure set_number starts at 1
  IF NEW.set_number < 1 THEN
    RAISE EXCEPTION 'set_number must be >= 1, got %', NEW.set_number;
  END IF;
  
  -- For the same exercise, ensure no gaps in set numbering
  -- This is a soft constraint - we'll handle renumbering in the application
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for set number validation
DROP TRIGGER IF EXISTS trigger_validate_set_numbering ON workout_sets;
CREATE TRIGGER trigger_validate_set_numbering
  BEFORE INSERT OR UPDATE ON workout_sets
  FOR EACH ROW
  EXECUTE FUNCTION validate_set_numbering();

-- Add index for calibration queries
CREATE INDEX IF NOT EXISTS idx_workout_sets_calibration 
ON workout_sets(workout_exercise_id, set_number, set_type) 
WHERE set_type = 'calibration';

-- Add index for week-based queries
CREATE INDEX IF NOT EXISTS idx_workouts_week 
ON workouts(mesocycle_block_id, workout_week);
