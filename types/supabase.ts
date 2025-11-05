export interface Profile {
  id: string;
  username: string;
  avatar_url?: string;
  spoonacular_username?: string;
  spoonacular_hash?: string;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id'>>;
      };
      user_onboarding: {
        Row: {
          id: string;
          user_id: string;
          age: number;
          gender: 'male' | 'female';
          goal: string;
          height: number;
          current_weight: number;
          target_weight?: number;
          daily_calories?: number;
          expertise?: 'beginner' | 'intermediate' | 'advanced';
          interests?: string[];
          notifications_enabled: boolean;
          reason?: string;
          referral_source?: string;
          completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['user_onboarding']['Row'],
          'id' | 'created_at' | 'updated_at'
        >;
        Update: Partial<Omit<Database['public']['Tables']['user_onboarding']['Row'], 'id'>>;
      };
      exercise_progress: {
        Row: {
          id: string;
          user_id: string;
          exercise_id: string;
          reps: number;
          weight_lifted: number;
          duration_minutes: number;
          calories_burned: number;
          intensity: 'light' | 'moderate' | 'vigorous';
          notes?: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['exercise_progress']['Row'], 'id' | 'created_at'>;
        Update: Partial<Omit<Database['public']['Tables']['exercise_progress']['Row'], 'id'>>;
      };
      weight_history: {
        Row: {
          id: string;
          user_id: string;
          weight: number;
          notes?: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['weight_history']['Row'], 'id' | 'created_at'>;
        Update: Partial<Omit<Database['public']['Tables']['weight_history']['Row'], 'id'>>;
      };
      recipe_favorites: {
        Row: {
          id: string;
          user_id: string;
          recipe_id: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['recipe_favorites']['Row'], 'id' | 'created_at'>;
        Update: Partial<Omit<Database['public']['Tables']['recipe_favorites']['Row'], 'id'>>;
      };
      bmi_history: {
        Row: {
          id: string;
          user_id: string;
          bmi: number;
          height: number;
          weight: number;
          category: string;
          notes?: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['bmi_history']['Row'], 'id' | 'created_at'>;
        Update: Partial<Omit<Database['public']['Tables']['bmi_history']['Row'], 'id'>>;
      };
    };
    Functions: {
      connect_spoonacular_user: {
        Args: {
          p_username: string;
        };
        Returns: {
          user_id: string;
          email: string;
          username: string;
        };
      };
    };
  };
}