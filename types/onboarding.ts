export type Gender = 'male' | 'female';
export type Expertise = 'beginner' | 'intermediate' | 'advanced';
export type Interest = 'nutrition' | 'sleep' | 'mindfulness' | 'fitness' | 'cooking';
export type Goal = 'weight_loss' | 'muscle_gain' | 'maintain' | 'improve_health';

export interface OnboardingFormData {
  // Required fields
  username?: string;
  age: number;
  gender: Gender;
  goal: Goal;
  height: number;
  current_weight: number;
  target_weight?: number;
  // Optional fields
  daily_calories?: number;
  water_target?: number; // Daily water intake goal in ml
  expertise?: Expertise;
  interests?: Interest[];
  notifications_enabled?: boolean;
  reason?: string;
  referral_source?: string;
}

export interface UserOnboarding extends OnboardingFormData {
  id: string;
  user_id: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}