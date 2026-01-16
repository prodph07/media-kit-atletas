-- Execute this in Supabase SQL Editor to enable Level Up Logic

CREATE OR REPLACE FUNCTION handle_prediction_points_update()
RETURNS TRIGGER AS $$
DECLARE
    points_diff INTEGER;
    current_fan RECORD;
    new_xp INTEGER;
    new_level INTEGER;
    xp_target INTEGER;
BEGIN
    -- 1. Calculate the difference in points
    points_diff := NEW.points - COALESCE(OLD.points, 0);
    
    -- If no difference, do nothing
    IF points_diff = 0 THEN
        RETURN NEW;
    END IF;

    -- 2. Fetch current Fan data
    SELECT * INTO current_fan FROM fans WHERE user_id = NEW.user_id;
    
    IF current_fan IS NULL THEN
        RETURN NEW; -- Should not happen if foreign keys are correct
    END IF;

    -- 3. Initialize Variables
    new_xp := COALESCE(current_fan.xp, 0) + points_diff;
    new_level := COALESCE(current_fan.level, 1);

    -- 4. Level Up Loop (Matches lib/gamification.js logic)
    -- Logic: While XP >= Target, Level Up and Subtract Target
    LOOP
        -- Formula: floor(100 * (level ^ 1.5))
        xp_target := FLOOR(100 * POWER(new_level, 1.5));
        
        IF new_xp >= xp_target THEN
            new_level := new_level + 1;
            new_xp := new_xp - xp_target;
        ELSE
            EXIT; -- Break loop when XP is less than target
        END IF;
    END LOOP;

    -- 5. Handle Negative XP (Optional safety if points are removed)
    -- If removing points causes level down (Complex, simplified here to just min 0)
    IF new_xp < 0 THEN
       -- Ideally we would "Level Down", but for now let's just clamp to 0 
       -- or keep it negative? Let's check previous level logic?
       -- For simplicity in this version, let's just allow it (it might look weird) 
       -- or clamp to 0. Let's clamp to 0 to be safe.
       new_xp := 0; 
    END IF;

    -- 6. Update the Fan Profile
    UPDATE fans
    SET 
        xp = new_xp,
        level = new_level
    WHERE id = current_fan.id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create the Trigger (Ensure it uses the new function)
DROP TRIGGER IF EXISTS on_prediction_points_change ON event_predictions;
CREATE TRIGGER on_prediction_points_change
AFTER UPDATE OF points ON event_predictions
FOR EACH ROW
EXECUTE FUNCTION handle_prediction_points_update();
