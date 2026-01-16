-- Execute this in Supabase SQL Editor

-- 1. Create the Trigger Function
CREATE OR REPLACE FUNCTION handle_prediction_points_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate the difference in points (New - Old)
    -- This handles initial scoring (+), corrections (+/-), and undoing results (-)
    IF NEW.points IS DISTINCT FROM OLD.points THEN
        UPDATE fans
        SET xp = xp + (NEW.points - COALESCE(OLD.points, 0))
        WHERE user_id = NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the Trigger
DROP TRIGGER IF EXISTS on_prediction_points_change ON event_predictions;
CREATE TRIGGER on_prediction_points_change
AFTER UPDATE OF points ON event_predictions
FOR EACH ROW
EXECUTE FUNCTION handle_prediction_points_update();
