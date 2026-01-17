-- Insert test device connection
-- Run this in your Supabase SQL Editor

-- First, let's see what users exist
SELECT id, email FROM auth.users LIMIT 5;

-- Insert a test connection (replace 'your-user-id' with actual user ID from above)
-- You can also use auth.uid() if you're authenticated
INSERT INTO device_connections (
  user_id, 
  provider, 
  terra_reference_id, 
  is_active, 
  sync_status
) VALUES (
  auth.uid(), -- This will use the current authenticated user
  'APPLE_HEALTH',
  'test-ref-' || substr(auth.uid()::text, 1, 8),
  true,
  'active'
) ON CONFLICT (user_id, provider) DO UPDATE SET
  terra_reference_id = EXCLUDED.terra_reference_id,
  is_active = EXCLUDED.is_active,
  sync_status = EXCLUDED.sync_status,
  updated_at = NOW();

-- Verify the insert
SELECT * FROM device_connections WHERE user_id = auth.uid();
