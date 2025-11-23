-- Add water_target column to onboarding table
ALTER TABLE onboarding
ADD COLUMN IF NOT EXISTS water_target INTEGER DEFAULT 2000;

-- Update existing records with default value (2000ml = 2 liters)
UPDATE onboarding
SET water_target = 2000
WHERE water_target IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN onboarding.water_target IS 'Daily water intake goal in milliliters (ml)';
