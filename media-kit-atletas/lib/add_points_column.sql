-- Execute this in Supabase SQL Editor

ALTER TABLE event_predictions 
ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;
