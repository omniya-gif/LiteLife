import { useQuery } from 'react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { UserOnboarding } from '../types/onboarding';
import { useOnboardingStore } from '../stores/onboardingStore';
import { useThemeStore } from '../stores/themeStore';

export function useOnboarding() {
  const { user } = useAuth();
  const setCompleted = useOnboardingStore(state => state.setCompleted);
  const initializeFromProfile = useThemeStore(state => state.initializeFromProfile);

  return useQuery<UserOnboarding | null>(
    ['onboarding', user?.id],
    async () => {
      if (!user) {
        console.log('[useOnboarding] No user found, returning null');
        return null;
      }

      console.log('[useOnboarding] Fetching onboarding data for user:', user.id);
      const { data, error } = await supabase
        .from('user_onboarding')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('[useOnboarding] Error fetching data:', error);
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      console.log('[useOnboarding] Fetched onboarding data:', data);
      if (data) {
        setCompleted(data.completed);
        // Initialize theme based on user's gender from database
        if (data.gender) {
          console.log('[useOnboarding] Initializing theme with gender:', data.gender);
          initializeFromProfile(data.gender as 'male' | 'female');
        }
      }
      return data;
    },
    {
      enabled: !!user,
      staleTime: 1000, // Reduce stale time to ensure fresher data
      cacheTime: 0, // Disable caching to always get fresh data
      retry: 2,
      onError: (error) => {
        console.error('[useOnboarding] Query error:', error);
        setCompleted(false);
      }
    }
  );
}