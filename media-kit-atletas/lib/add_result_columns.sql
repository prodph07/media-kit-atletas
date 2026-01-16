-- Run this in Supabase SQL Editor to fix the missing column error

ALTER TABLE eventos_lutas 
ADD COLUMN IF NOT EXISTS round_vitoria INTEGER,
ADD COLUMN IF NOT EXISTS metodo_vitoria TEXT;
