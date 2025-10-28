export interface HealthCoins {
  id: string;
  user_id: string;
  balance: number;
  total_earned: number;
  created_at: string;
  updated_at: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  cost: number;
  category: 'fitness' | 'nutrition' | 'wellness';
  requirements?: {
    min_workouts?: number;
    min_healthy_meals?: number;
    min_meditation_minutes?: number;
  };
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  unlocked_at: string;
}
