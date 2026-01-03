import * as Notifications from 'expo-notifications';
import { useMutation, useQueryClient } from 'react-query';

import { useAuth } from './useAuth';
import { useHealthCoins } from './useHealthCoins';
import { supabase } from '../lib/supabase';
import { user$ } from '../lib/store/user';
import { onboarding$ } from '../stores/onboarding';
import { theme$ } from '../stores/theme';
import { OnboardingFormData } from '../types/onboarding';
import { calculateDailyCalories } from '../utils/calorieCalculator';

export function useOnboardingSubmit() {
  const { user } = useAuth();
  const { earnCoins } = useHealthCoins();
  const queryClient = useQueryClient();
  const setCompleted = onboarding$.setCompleted;
  const resetFormData = onboarding$.resetFormData;
  const fetchUserData = user$.fetchUserData;
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

      console.log('🔥 SUBMIT HOOK - Received formData:', JSON.stringify(formData, null, 2));
      console.log('🔥 SUBMIT HOOK - onboardingData.daily_calories:', onboardingData.daily_calories);

      // 🔥 Calculate daily calorie goal if not already set by user
      // (User may have set it manually or via auto-calculate in the calorie onboarding step)
      let dailyCalories = onboardingData.daily_calories;
      
      if (
        !dailyCalories &&
        onboardingData.current_weight &&
        onboardingData.height &&
        onboardingData.age &&
        onboardingData.gender
      ) {
        // Only calculate if user didn't set it themselves
        dailyCalories = calculateDailyCalories(
          onboardingData.current_weight,
          onboardingData.height,
          onboardingData.age,
          onboardingData.gender,
          onboardingData.expertise || 'beginner',
          onboardingData.goal || 'maintain'
        );
        console.log('📊 Auto-calculated daily calorie goal (fallback):', dailyCalories);
      } else if (dailyCalories) {
        console.log('📊 Using user-selected daily calorie goal:', dailyCalories);
      }

      const dataToInsert = {
        user_id: currentUser.id,
        ...onboardingData,
        daily_calories: dailyCalories,
        completed: true,
      };

      console.log('📊 SUBMIT HOOK - Final data being sent to database:', JSON.stringify(dataToInsert, null, 2));
      console.log('📊 SUBMIT HOOK - daily_calories field value:', dataToInsert.daily_calories);

      const { error } = await supabase.from('user_onboarding').upsert(dataToInsert);

      if (error) {
        console.error('Database error:', error);
        throw error;
      }
      console.log('✅ Onboarding data saved successfully');

      // 🎨 Sync theme with gender immediately
      if (formData.gender) {
        console.log('🎨 Syncing theme after onboarding completion, gender:', formData.gender);
        theme$.setGender(formData.gender as 'male' | 'female');
      }

      // ✅ IMMEDIATELY fetch and cache user data after onboarding
      console.log('📥 Fetching user profile data immediately after onboarding...');
      await fetchUserData(currentUser.id);
      console.log('✅ User profile data cached successfully');

      // Invalidate queries to ensure fresh data is fetched
      await queryClient.invalidateQueries(['onboarding', currentUser.id]);
      // Update the onboarding store to reflect completion
      setCompleted(true);
      
      // 🧹 Clear onboarding form data (for memory, not for next user)
      console.log('🧹 Clearing onboarding form data from memory');
      resetFormData();

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
