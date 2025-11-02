-- Public profiles query
SELECT id, username, avatar_url, updated_at
FROM profiles
WHERE id = :user_id;

-- User onboarding data query
SELECT 
  id,
  user_id,
  goal,
  reason,
  age,
  gender,
  current_weight,
  target_weight,
  height,
  expertise,
  notifications_enabled,
  completed,
  updated_at
FROM user_onboarding
WHERE user_id = :user_id;
