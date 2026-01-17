-- Test script for device_connections table
-- Run this in your Supabase SQL editor

-- 1. Check if table exists
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_name = 'device_connections' 
      AND table_schema = 'public'
    ) 
    THEN '✅ device_connections table exists'
    ELSE '❌ device_connections table does NOT exist'
  END as table_status;

-- 2. Check table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'device_connections' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'device_connections';

-- 4. Get your current user ID (for testing)
SELECT 
  auth.uid() as current_user_id,
  CASE 
    WHEN auth.uid() IS NOT NULL 
    THEN '✅ User is authenticated'
    ELSE '❌ User is NOT authenticated (auth.uid() is null)'
  END as auth_status;

-- 5. Test insert (only works if you're authenticated)
-- Uncomment and run this if you want to test inserting a record
/*
INSERT INTO device_connections (
  user_id, 
  provider, 
  terra_reference_id, 
  is_active, 
  sync_status
) VALUES (
  auth.uid(),
  'APPLE_HEALTH',
  'test-ref-' || substr(auth.uid()::text, 1, 8),
  true,
  'active'
) ON CONFLICT (user_id, provider) DO UPDATE SET
  terra_reference_id = EXCLUDED.terra_reference_id,
  is_active = EXCLUDED.is_active,
  sync_status = EXCLUDED.sync_status,
  updated_at = NOW();
*/

-- 6. View existing connections (if any)
SELECT 
  id,
  user_id,
  provider,
  terra_reference_id,
  is_active,
  sync_status,
  created_at
FROM device_connections
ORDER BY created_at DESC;
