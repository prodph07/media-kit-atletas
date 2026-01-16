-- Execute this in Supabase SQL Editor

ALTER TABLE fans 
ADD COLUMN IF NOT EXISTS weekly_stats JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS xp_weekly_snapshot INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS xp_monthly_snapshot INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_weekly_xp_reset TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_monthly_xp_reset TIMESTAMPTZ;

-- Allow public read of these new columns (policy handles rows, but column security is rare, usually row based)
-- But ensuring the column exists is the key.
