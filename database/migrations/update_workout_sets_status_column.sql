-- Migration: Update workout_sets.status from BOOLEAN to TEXT
-- This aligns the database schema with the actual data structure

-- First, add a new TEXT column for status
ALTER TABLE workout_sets 
ADD COLUMN IF NOT EXISTS status_text TEXT DEFAULT 'not_started';

-- Update the new column with converted values from the old boolean column
UPDATE workout_sets 
SET status_text = CASE 
    WHEN status = TRUE THEN 'done'
    WHEN status = FALSE THEN 'not_started'
    ELSE 'not_started'
END;

-- Add constraint for valid status values
ALTER TABLE workout_sets 
ADD CONSTRAINT check_status_text 
CHECK (status_text IN ('not_started', 'done', 'skipped'));

-- Drop the old boolean column
ALTER TABLE workout_sets 
DROP COLUMN IF EXISTS status;

-- Rename the new column to status
ALTER TABLE workout_sets 
RENAME COLUMN status_text TO status;

-- Add index for status queries
CREATE INDEX IF NOT EXISTS idx_workout_sets_status 
ON workout_sets(workout_exercise_id, status, set_number);

-- Add index for set type and status combinations
CREATE INDEX IF NOT EXISTS idx_workout_sets_type_status 
ON workout_sets(workout_exercise_id, set_type, status, set_number);
