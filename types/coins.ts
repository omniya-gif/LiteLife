export interface HealthCoins {
  id: string;
  user_id: string;
  balance: number;
  total_earned: number;
  created_at: string;
  updated_at: string;
}

export interface Badge {
  id: string; // UUID string
  name: string;
  description: string;
  cost: number;
  image_url: string;
  created_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  unlocked_at: string;
}
