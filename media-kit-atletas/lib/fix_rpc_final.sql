-- Execute this in SQL Editor to FIX ALL TYPE ERRORS

-- 1. Clean up potential old versions with different signatures
DROP FUNCTION IF EXISTS distribute_fight_points(bigint, bigint, text, integer);
DROP FUNCTION IF EXISTS distribute_fight_points(bigint, text, text, integer);
DROP FUNCTION IF EXISTS distribute_fight_points(text, text, text, integer);
DROP FUNCTION IF EXISTS distribute_fight_points(uuid, text, text, integer);

-- 2. Create the UNIVERSAL version using TEXT for IDs
CREATE OR REPLACE FUNCTION distribute_fight_points(
  p_fight_id text,    -- Receives Text (works for UUID or Stringified Int)
  p_winner_id text,   -- Receives Text
  p_method text,
  p_round integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  pred record;
  points_calc integer;
BEGIN
  -- Loop casting column to text to ensure match with parameter
  FOR pred IN SELECT * FROM event_predictions WHERE fight_id::text = p_fight_id
  LOOP
    points_calc := 0;
    
    -- Check Winner
    IF pred.selected_winner_id::text = p_winner_id THEN
      points_calc := points_calc + 100;
      IF pred.method = p_method THEN points_calc := points_calc + 50; END IF;
      IF pred.round = p_round THEN points_calc := points_calc + 50; END IF;
    END IF;

    UPDATE event_predictions SET points = points_calc WHERE id = pred.id;
  END LOOP;
END;
$$;
