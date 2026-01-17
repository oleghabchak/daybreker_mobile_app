-- Function to hard delete a user account and all related data
-- This function requires admin privileges to delete from auth.users
CREATE OR REPLACE FUNCTION delete_user_account(user_id_to_delete UUID)
RETURNS JSONB AS $$
DECLARE
    deletion_results JSONB := '[]'::JSONB;
    table_name TEXT;
    tables_to_clean TEXT[] := ARRAY[
        'user_profiles',
        'user_conditions',
        'user_medications',
        'medication_doses',
        'user_metrics',
        'user_priorities',
        'health_scores',
        'onboarding_progress',
        'screen_analytics',
        'device_connections',
        'sync_conflicts',
        'mesocycle',
        'workouts',
        'workout_exercises',
        'workout_sets',
        'training_profile_configuration',
        'custom_exercises',
        'data_retention_requests'
    ];
    rows_deleted INTEGER;
    error_count INTEGER := 0;
    success_count INTEGER := 0;
BEGIN
    -- Verify the user exists
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = user_id_to_delete) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'User not found',
            'user_id', user_id_to_delete
        );
    END IF;

    -- Delete from all custom tables
    FOREACH table_name IN ARRAY tables_to_clean
    LOOP
        BEGIN
            EXECUTE format('DELETE FROM %I WHERE user_id = $1', table_name) 
            USING user_id_to_delete;
            
            GET DIAGNOSTICS rows_deleted = ROW_COUNT;
            
            deletion_results := deletion_results || jsonb_build_object(
                'table', table_name,
                'success', true,
                'rows_deleted', rows_deleted
            );
            
            success_count := success_count + 1;
            
        EXCEPTION WHEN OTHERS THEN
            deletion_results := deletion_results || jsonb_build_object(
                'table', table_name,
                'success', false,
                'error', SQLERRM
            );
            
            error_count := error_count + 1;
        END;
    END LOOP;

    -- Delete from audit_log (this table might have different column names)
    BEGIN
        DELETE FROM audit_log WHERE user_id = user_id_to_delete;
        GET DIAGNOSTICS rows_deleted = ROW_COUNT;
        
        deletion_results := deletion_results || jsonb_build_object(
            'table', 'audit_log',
            'success', true,
            'rows_deleted', rows_deleted
        );
        
        success_count := success_count + 1;
        
    EXCEPTION WHEN OTHERS THEN
        deletion_results := deletion_results || jsonb_build_object(
            'table', 'audit_log',
            'success', false,
            'error', SQLERRM
        );
        
        error_count := error_count + 1;
    END;

    -- Hard delete the user from auth.users (requires admin privileges)
    BEGIN
        DELETE FROM auth.users WHERE id = user_id_to_delete;
        
        IF FOUND THEN
            RETURN jsonb_build_object(
                'success', true,
                'message', 'User account deleted successfully',
                'user_id', user_id_to_delete,
                'tables_processed', success_count + error_count,
                'tables_successful', success_count,
                'tables_failed', error_count,
                'deletion_results', deletion_results
            );
        ELSE
            RETURN jsonb_build_object(
                'success', false,
                'error', 'Failed to delete user from auth.users',
                'user_id', user_id_to_delete,
                'deletion_results', deletion_results
            );
        END IF;
        
    EXCEPTION WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Failed to delete user from auth.users: ' || SQLERRM,
            'user_id', user_id_to_delete,
            'deletion_results', deletion_results
        );
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user_account(UUID) TO authenticated;

-- Create a policy to ensure users can only delete their own accounts
CREATE POLICY "Users can delete own account" ON auth.users
    FOR DELETE USING (auth.uid() = id);
