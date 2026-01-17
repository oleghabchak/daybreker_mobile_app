-- Script to create device_connections table
-- Run this in your Supabase SQL editor

-- Drop table if exists (for testing)
DROP TABLE IF EXISTS device_connections CASCADE;

-- Create device_connections table
CREATE TABLE device_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider TEXT NOT NULL, -- 'APPLE_HEALTH', 'GOOGLE_FIT', etc.
  terra_reference_id TEXT, -- Terra's reference ID for this user
  is_active BOOLEAN DEFAULT true,
  sync_status TEXT DEFAULT 'inactive', -- 'active', 'inactive', 'error'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one active connection per user per provider
  UNIQUE(user_id, provider)
);

-- Create indexes for better performance
CREATE INDEX idx_device_connections_user_id ON device_connections(user_id);
CREATE INDEX idx_device_connections_provider ON device_connections(provider);
CREATE INDEX idx_device_connections_active ON device_connections(is_active, sync_status);

-- Enable RLS (Row Level Security)
ALTER TABLE device_connections ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own device connections" ON device_connections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own device connections" ON device_connections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own device connections" ON device_connections
  FOR UPDATE USING (auth.uid() = user_id);

-- Insert a test record (replace with your actual user_id)
-- You can get your user_id from: SELECT auth.uid();
-- INSERT INTO device_connections (
--   user_id, 
--   provider, 
--   terra_reference_id, 
--   is_active, 
--   sync_status
-- ) VALUES (
--   'your-user-id-here',
--   'APPLE_HEALTH',
--   'test-ref-12345',
--   true,
--   'active'
-- );

-- Verify table creation
SELECT 'device_connections table created successfully!' as status;
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'device_connections' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
