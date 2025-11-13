import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { supabase } from '../supabase';
import { Profile, UserOnboarding } from '../types/database';
import { useThemeStore } from '../../stores/themeStore';

interface UserStore {
  profile: Profile | null;
  onboarding: UserOnboarding | null;
  isLoading: boolean;
  error: string | null;
  fetchUserData: (userId: string) => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  updateOnboarding: (data: Partial<UserOnboarding>) => Promise<void>;
  clearUserData: () => void;
}

export const useUserStore = create(
  persist<UserStore>(
    (set, get) => ({
      profile: null,
      onboarding: null,
      isLoading: false,
      error: null,
      fetchUserData: async (userId: string) => {
        // Check if we already have valid cached data for this user
        const { profile, onboarding } = get();
        if (profile?.id === userId && onboarding?.user_id === userId) {
          console.log('✅ Using cached profile data for user:', userId);
          return; // Data already loaded for this user
        }

        set({ isLoading: true, error: null });
        try {
          console.log('📥 Fetching user data from database for ID:', userId);

          // Try to fetch profile
          let profileData: Profile | null = null;
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, username, avatar_url, updated_at')
            .eq('id', userId)
            .single();

          // If profile doesn't exist, create it
          if (profileError?.code === 'PGRST116') {
            console.log('Creating new profile for user:', userId);
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .upsert([
                {
                  id: userId,
                  username: 'User',
                  avatar_url: null,
                  updated_at: new Date().toISOString(),
                },
              ])
              .select()
              .single();

            if (createError) {
              console.error('Profile creation error:', createError);
              throw createError;
            }
            profileData = newProfile;
          } else if (profileError) {
            console.error('Profile fetch error:', profileError);
            throw profileError;
          } else {
            profileData = profile;
          }

          // Try to fetch onboarding data
          let onboardingData: UserOnboarding | null = null;
          const { data: onboarding, error: onboardingError } = await supabase
            .from('user_onboarding')
            .select(
              `
              id,
              user_id,
              goal,
              reason,
              age,
              gender,
              current_weight,
              target_weight,
              height,
              expertise,
              notifications_enabled,
              completed,
              updated_at
            `
            )
            .eq('user_id', userId)
            .single();

          // Log the actual query result
          console.log('Onboarding Query Result:', { onboarding, onboardingError });

          // If onboarding doesn't exist, create it
          if (onboardingError?.code === 'PGRST116') {
            console.log('Creating new onboarding for user:', userId);
            const { data: newOnboarding, error: createError } = await supabase
              .from('user_onboarding')
              .upsert([
                {
                  user_id: userId,
                  goal: 'improve_health',
                  completed: false,
                  notifications_enabled: false,
                  interests: [],
                  updated_at: new Date().toISOString(),
                },
              ])
              .select()
              .single();

            if (createError) {
              console.error('Onboarding creation error:', createError);
              throw createError;
            }
            onboardingData = newOnboarding;
          } else if (onboardingError && onboardingError.code !== 'PGRST116') {
            console.error('Onboarding fetch error:', onboardingError);
            throw onboardingError;
          } else {
            onboardingData = onboarding;
          }

          set({ profile: profileData, onboarding: onboardingData, isLoading: false });
          console.log('State updated with:', { profile: profileData, onboarding: onboardingData });

          // 🎨 Sync theme with gender from database
          if (onboardingData?.gender) {
            const { setGender } = useThemeStore.getState();
            console.log('🎨 Syncing theme with database gender:', onboardingData.gender);
            setGender(onboardingData.gender as 'male' | 'female');
          }
        } catch (error) {
          console.error('Query Error:', error);
          set({ error: (error as Error).message, isLoading: false });
        }
      },

      updateProfile: async (data: Partial<Profile>) => {
        const { profile } = get();
        if (!profile?.id) return;

        try {
          const { data: updatedProfile, error } = await supabase
            .from('profiles')
            .update(data)
            .eq('id', profile.id)
            .select()
            .single();

          if (error) throw error;
          set({ profile: updatedProfile });
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },
      updateOnboarding: async (data: Partial<UserOnboarding>) => {
        const { onboarding } = get();
        if (!onboarding?.id) return;

        try {
          const { data: updatedOnboarding, error } = await supabase
            .from('user_onboarding')
            .update(data)
            .eq('id', onboarding.id)
            .select()
            .single();

          if (error) throw error;
          set({ onboarding: updatedOnboarding });

          // 🎨 Sync theme when gender is updated
          if (data.gender) {
            const { setGender } = useThemeStore.getState();
            console.log('🎨 Syncing theme after onboarding update, gender:', data.gender);
            setGender(data.gender as 'male' | 'female');
          }
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },

      clearUserData: async () => {
        console.log('🧹 Clearing user data from store and AsyncStorage');
        
        // Clear the state
        set({
          profile: null,
          onboarding: null,
          isLoading: false,
          error: null,
        });
        
        // Also clear from AsyncStorage to prevent stale data
        try {
          await AsyncStorage.removeItem('user-storage-v2');
          await AsyncStorage.removeItem('user-storage'); // Clear old key too
          console.log('✅ AsyncStorage cleared successfully');
        } catch (error) {
          console.error('❌ Error clearing AsyncStorage:', error);
        }
      },
    }),
    {
      name: 'user-storage-v2', // Changed version to force fresh storage
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        profile: state.profile,
        onboarding: state.onboarding,
      }),
    }
  )
);
