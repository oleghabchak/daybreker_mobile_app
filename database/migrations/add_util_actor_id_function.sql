-- Migration: Add util_actor_id function
-- This function provides a utility to get the current user ID for audit trails

-- Utility function to get the current actor (user) ID
CREATE OR REPLACE FUNCTION util_actor_id()
RETURNS UUID AS $$
BEGIN
    -- Return the current user ID from the JWT token
    -- This is equivalent to auth.uid() but with a more descriptive name
    RETURN auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION util_actor_id() TO authenticated;
