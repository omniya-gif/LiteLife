import { useMutation } from 'react-query';
import { supabase } from '../lib/supabase';
import { OnboardingFormData } from '../types/onboarding';
import { useAuth } from './useAuth';

export function useOnboardingSubmit() {
  const { user } = useAuth();

  return useMutation(
    async (formData: OnboardingFormData) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_onboarding')
        .upsert({
          user_id: user.id,
          ...formData,
          completed: true
        });

      if (error) throw error;
    }
  );
}