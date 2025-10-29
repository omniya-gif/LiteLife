import { useMutation } from 'react-query';
import { supabase } from '../lib/supabase';
import { OnboardingFormData } from '../types/onboarding';
import { useAuth } from './useAuth';
import { useHealthCoins } from './useHealthCoins';
import * as Notifications from 'expo-notifications';

export function useOnboardingSubmit() {
  const { user } = useAuth();
  const { earnCoins } = useHealthCoins();

  return useMutation(
    async (formData: OnboardingFormData) => {
      if (!user) throw new Error('Not authenticated');

      // Save onboarding data
      const { error } = await supabase
        .from('user_onboarding')
        .upsert({
          user_id: user.id,
          ...formData,
          completed: true
        });

      if (error) throw error;

      // Send welcome notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Welcome to MealPlanner! 🎉",
          body: "Thanks for completing onboarding! Let's start your health journey together.",
          sound: 'notification.wav',
          data: { type: 'welcome' },
        },
        trigger: null, // Show immediately
      });

      // Wait a moment before awarding coins
      await new Promise(resolve => setTimeout(resolve, 2000));

      try {
        // Award coins
        await earnCoins.mutateAsync({
          amount: 500,
          reason: 'completing onboarding'
        });
      } catch (error) {
        console.error('Error awarding coins:', error);
        // Still consider onboarding successful even if coin awarding fails
      }
    },
    {
      onError: (error) => {
        console.error('Onboarding error:', error);
      }
    }
  );
}