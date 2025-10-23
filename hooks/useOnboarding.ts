import { useQuery } from 'react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { UserOnboarding } from '../types/onboarding';

export function useOnboarding() {
  const { user } = useAuth();

  return useQuery<UserOnboarding | null>(
    ['onboarding', user?.id],
    async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_onboarding')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    {
      enabled: !!user,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}