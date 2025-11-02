import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: any | null;
  loading: boolean;
  onboardingCompleted: boolean | null;
  setUser: (user: any) => void;
  setOnboardingStatus: (status: boolean) => void;
  checkOnboardingStatus: (userId: string) => Promise<boolean>;
  setLoading: (status: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  onboardingCompleted: null,
  setUser: (user) => set({ user }),
  setOnboardingStatus: (status) => set({ onboardingCompleted: status }),
  setLoading: (status) => set({ loading: status }),
  checkOnboardingStatus: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_onboarding')
        .select('completed')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      const status = data?.completed ?? false;
      set({ onboardingCompleted: status });
      return status;
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  },
}));
