/*
  # Health Coins and Badges System

  1. New Tables
    - health_coins
      - Tracks user's coin balance and total earnings
      - One record per user
    - badges
      - Stores available badges that users can unlock
      - Includes name, description, cost, and requirements
    - user_badges
      - Tracks which badges users have unlocked
      - Links users to their badges with unlock timestamp

  2. Functions
    - purchase_badge: Handles badge purchase logic with coins
    - award_coins: Safely awards coins to users

  3. Security
    - RLS policies for all tables
    - Secure functions with proper permissions
*/

-- Create health_coins table
CREATE TABLE IF NOT EXISTS health_coins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  balance integer NOT NULL DEFAULT 0,
  total_earned integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT positive_balance CHECK (balance >= 0),
  CONSTRAINT positive_total CHECK (total_earned >= 0)
);

-- Create badges table
CREATE TABLE IF NOT EXISTS badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  cost integer NOT NULL,
  category text NOT NULL CHECK (category IN ('fitness', 'nutrition', 'wellness')),
  requirements jsonb,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT positive_cost CHECK (cost >= 0)
);

-- Create user_badges table
CREATE TABLE IF NOT EXISTS user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  badge_id uuid REFERENCES badges(id) ON DELETE CASCADE NOT NULL,
  unlocked_at timestamptz DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Enable RLS
ALTER TABLE health_coins ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own coins"
  ON health_coins
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view all badges"
  ON badges
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view their own badges"
  ON user_badges
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create function to purchase badge
CREATE OR REPLACE FUNCTION purchase_badge(badge_id uuid, badge_cost integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_coins integer;
BEGIN
  -- Get user's current coin balance
  SELECT balance INTO user_coins
  FROM health_coins
  WHERE user_id = auth.uid();

  -- Check if user has enough coins
  IF user_coins < badge_cost THEN
    RAISE EXCEPTION 'Insufficient coins';
  END IF;

  -- Begin transaction
  BEGIN
    -- Deduct coins
    UPDATE health_coins
    SET balance = balance - badge_cost,
        updated_at = now()
    WHERE user_id = auth.uid();

    -- Add badge to user's collection
    INSERT INTO user_badges (user_id, badge_id)
    VALUES (auth.uid(), badge_id);
  EXCEPTION
    WHEN OTHERS THEN
      RAISE EXCEPTION 'Failed to purchase badge';
  END;
END;
$$;

-- Create function to award coins
CREATE OR REPLACE FUNCTION award_coins(user_id uuid, amount integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO health_coins (user_id, balance, total_earned)
  VALUES (user_id, amount, amount)
  ON CONFLICT (user_id) DO UPDATE
  SET balance = health_coins.balance + amount,
      total_earned = health_coins.total_earned + amount,
      updated_at = now();
END;
$$;

-- Insert some default badges
INSERT INTO badges (name, description, icon, cost, category, requirements) VALUES
  ('Early Bird', 'Complete 5 morning workouts', 'https://example.com/icons/early-bird.png', 100, 'fitness', '{"min_workouts": 5}'),
  ('Nutrition Master', 'Log 50 healthy meals', 'https://example.com/icons/nutrition.png', 200, 'nutrition', '{"min_healthy_meals": 50}'),
  ('Zen Master', 'Complete 10 hours of meditation', 'https://example.com/icons/zen.png', 300, 'wellness', '{"min_meditation_minutes": 600}'),
  ('Workout Warrior', 'Complete 20 workouts', 'https://example.com/icons/warrior.png', 400, 'fitness', '{"min_workouts": 20}'),
  ('Health Pioneer', 'First badge achievement', 'https://example.com/icons/pioneer.png', 50, 'wellness', '{}')
ON CONFLICT DO NOTHING;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_health_coins_updated_at
  BEFORE UPDATE ON health_coins
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();