import * as Notifications from 'expo-notifications';
import { useMutation, useQueryClient } from 'react-query';

import { useAuth } from './useAuth';
import { useHealthCoins } from './useHealthCoins';
import { supabase } from '../lib/supabase';
import { useOnboardingStore } from '../stores/onboardingStore';
import { useThemeStore } from '../stores/themeStore';
import { OnboardingFormData } from '../types/onboarding';

export function useOnboardingSubmit() {
  const { user } = useAuth();
  const { earnCoins } = useHealthCoins();
  const queryClient = useQueryClient();
  const setCompleted = useOnboardingStore((state) => state.setCompleted);
  const resetFormData = useOnboardingStore((state) => state.resetFormData);
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

      // Save username to profiles table if provided
      if (formData.username) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ username: formData.username })
          .eq('id', currentUser.id);

        if (profileError) {
          console.error('Profile update error:', profileError);
          // Don't throw - username update failure shouldn't block onboarding
        } else {
          console.log('Username updated successfully');
        }
      }

      // Save onboarding data (exclude username as it's saved in profiles)
      const { username, ...onboardingData } = formData;
      const { error } = await supabase.from('user_onboarding').upsert({
        user_id: currentUser.id,
        ...onboardingData,
        completed: true,
      });

      if (error) {
        console.error('Database error:', error);
        throw error;
      }
      console.log('Onboarding data saved successfully');

      // 🎨 Sync theme with gender immediately
      if (formData.gender) {
        const { setGender } = useThemeStore.getState();
        console.log('🎨 Syncing theme after onboarding completion, gender:', formData.gender);
        setGender(formData.gender as 'male' | 'female');
      }

      // Invalidate queries to ensure fresh data is fetched
      await queryClient.invalidateQueries(['onboarding', currentUser.id]);
      // Update the onboarding store to reflect completion
      setCompleted(true);
      
      // 🧹 Clear onboarding form data after successful completion
      console.log('🧹 Clearing onboarding form data for next user');
      resetFormData();
      
      // 🎨 Reset theme to default (male/green) for next user
      const { setGender } = useThemeStore.getState();
      setGender('male');
      console.log('🎨 Theme reset to default (green) for next user');

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
