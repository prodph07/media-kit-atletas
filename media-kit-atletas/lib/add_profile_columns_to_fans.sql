-- Execute this in Supabase SQL Editor

ALTER TABLE fans 
ADD COLUMN IF NOT EXISTS nickname TEXT,
ADD COLUMN IF NOT EXISTS foto_url TEXT;
