import * as Notifications from 'expo-notifications';
import { useMutation, useQueryClient } from 'react-query';

import { useAuth } from './useAuth';
import { useHealthCoins } from './useHealthCoins';
import { supabase } from '../lib/supabase';
import { useOnboardingStore } from '../stores/onboardingStore';
import { OnboardingFormData } from '../types/onboarding';

export function useOnboardingSubmit() {
  const { user } = useAuth();
  const { earnCoins } = useHealthCoins();
  const queryClient = useQueryClient();
  const setCompleted = useOnboardingStore((state) => state.setCompleted);
  return useMutation(
    async (formData: OnboardingFormData) => {
      // Get the current session directly from Supabase to ensure we have the latest auth state
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error(`Session error: ${sessionError.message}`);
      }

      if (!session?.user) {
        console.error('No session or user found');
        throw new Error('Not authenticated - no session found');
      }

      const currentUser = session.user;
      console.log('Onboarding submission for user:', currentUser.id);

      // Save onboarding data
      const { error } = await supabase.from('user_onboarding').upsert({
        user_id: currentUser.id,
        ...formData,
        completed: true,
      });

      if (error) {
        console.error('Database error:', error);
        throw error;
      }
      console.log('Onboarding data saved successfully');

      // Invalidate queries to ensure fresh data is fetched
      await queryClient.invalidateQueries(['onboarding', currentUser.id]);
      // Update the onboarding store to reflect completion
      setCompleted(true);

      // Send welcome notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Welcome to MealPlanner! 🎉',
          body: "Thanks for completing onboarding! Let's start your health journey together.",
          sound: 'notification.wav',
          data: { type: 'welcome' },
        },
        trigger: null, // Show immediately
      });

      // Wait a moment before awarding coins
      await new Promise((resolve) => setTimeout(resolve, 2000));

      try {
        // Award coins
        await earnCoins.mutateAsync({
          amount: 500,
          reason: 'completing onboarding',
        });
      } catch (error) {
        console.error('Error awarding coins:', error);
        // Still consider onboarding successful even if coin awarding fails
      }
    },
    {
      onError: (error) => {
        console.error('Onboarding error:', error);
      },
    }
  );
}
