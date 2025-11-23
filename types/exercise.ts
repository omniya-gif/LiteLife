// Exercise API Types (ExerciseDB)
export interface Exercise {
  id: string;
  name: string;
  target: string;
  bodyPart: string;
  equipment: string;
  gifUrl: string;
  secondaryMuscles?: string[];
  instructions?: string[];
}

// Database Types (Supabase exercise_progress table)
export interface ExerciseProgress {
  id?: string;
  user_id?: string;
  exercise_id: string;
  reps?: number;
  weight_lifted?: number;
  duration_minutes?: number;
  calories_burned?: number;
  intensity?: 'light' | 'moderate' | 'vigorous';
  notes?: string;
  created_at?: string;
}

// Statistics Types
export interface ExerciseStats {
  totalSessions: number;
  totalReps: number;
  totalWeightLifted: number;
  totalMinutes: number;
  totalCaloriesBurned: number;
  lastSession?: ExerciseProgress;
}

// Weight History
export interface WeightHistory {
  id: string;
  user_id: string;
  weight: number;
  notes?: string;
  created_at: string;
}

// Filter Types
export interface ExerciseFilters {
  bodyPart?: string;
  equipment?: string;
  target?: string;
  search?: string;
}
