export interface Profile {
  id: string;
  created_at: string;
  updated_at: string;
  username: string | null;
  avatar_url: string | null;
  spoonacular_username: string | null;
  spoonacular_hash: string | null;
  expo_push_token: string | null;
}

export interface UserOnboarding {
  id: string;
  user_id: string;
  reason: string | null;
  goal: string;
  referral_source: string | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
  gender: string | null;
  age: number | null;
  current_weight: number | null;
  target_weight: number | null;
  height: number | null;
  daily_calories: number | null;
  expertise: string | null;
  interests: string[];
  notifications_enabled: boolean;
}
