-- Execute this in Supabase SQL Editor

-- Enable RLS (just in case)
ALTER TABLE fans ENABLE ROW LEVEL SECURITY;

-- Create Policy for Public Read Access
DROP POLICY IF EXISTS "Public Read Access" ON fans;
CREATE POLICY "Public Read Access" 
ON fans FOR SELECT 
USING (true);

-- Also Ensure Public Read for Athletes (if not already)
DROP POLICY IF EXISTS "Public Read Access" ON atletas;
CREATE POLICY "Public Read Access" 
ON atletas FOR SELECT 
USING (true);
