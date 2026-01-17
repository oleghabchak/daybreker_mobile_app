-- Trigger: progressive_overload_algo_v3_trigger
-- This trigger automatically calls the progressive overload algorithm function
-- when a workout set status is updated to 'done'

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS progressive_overload_algo_v3_trigger ON workout_sets;

-- Create the trigger
CREATE TRIGGER progressive_overload_algo_v3_trigger
    AFTER UPDATE OF status ON workout_sets
    FOR EACH ROW
    EXECUTE FUNCTION progressive_overload_algo_v3();

-- Add comment for documentation
COMMENT ON TRIGGER progressive_overload_algo_v3_trigger ON workout_sets IS 
'Automatically handles progressive overload algorithm: copies calibration set data to set 2, applies validation set progression to set 3';
