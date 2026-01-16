-- Execute this in SQL Editor to CLEAN UP duplicates and fix the error

-- 1. Drop both versions to avoid ambiguity
DROP FUNCTION IF EXISTS distribute_fight_points(bigint, bigint, text, integer);
DROP FUNCTION IF EXISTS distribute_fight_points(bigint, text, text, integer);

-- 2. Re-create ONLY the correct version (with text for winner_id)
CREATE OR REPLACE FUNCTION distribute_fight_points(
  p_fight_id bigint,
  p_winner_id text,
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
  FOR pred IN SELECT * FROM event_predictions WHERE fight_id = p_fight_id
  LOOP
    points_calc := 0;
    -- Comparison using text
    IF pred.selected_winner_id::text = p_winner_id THEN
      points_calc := points_calc + 100;
      IF pred.method = p_method THEN points_calc := points_calc + 50; END IF;
      IF pred.round = p_round THEN points_calc := points_calc + 50; END IF;
    END IF;

    UPDATE event_predictions SET points = points_calc WHERE id = pred.id;
  END LOOP;
END;
$$;
