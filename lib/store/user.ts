import { observable } from '@legendapp/state';
import { syncObservable } from '@legendapp/state/sync';

import { supabase } from '../supabase';
import { Profile, UserOnboarding } from '../types/database';
import { theme$ } from '../../stores/theme';
import { persistOptions } from '../legend-config';

interface UserStore {
  profile: Profile | null;
  onboarding: UserOnboarding | null;
  isLoading: boolean;
  error: string | null;
  fetchUserData: (userId: string) => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  updateOnboarding: (data: Partial<UserOnboarding>) => Promise<void>;
  clearUserData: () => Promise<void>;
}

export const user$ = observable<UserStore>({
  profile: null,
  onboarding: null,
  isLoading: false,
  error: null,

  fetchUserData: async (userId: string) => {
    // Check if we already have valid cached data for this user
    const profile = user$.profile.peek();
    const onboarding = user$.onboarding.peek();
    
    if (profile?.id === userId && onboarding?.user_id === userId) {
      console.log('✅ Using cached profile data for user:', userId);
      return;
    }

    user$.isLoading.set(true);
    user$.error.set(null);

    try {
      console.log('📥 Fetching user data from database for ID:', userId);

      // Try to fetch profile
      let profileData: Profile | null = null;
      const { data: profileResult, error: profileError } = await supabase
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
        profileData = profileResult;
      }

      // Try to fetch onboarding data
      let onboardingData: UserOnboarding | null = null;
      const { data: onboardingResult, error: onboardingError } = await supabase
        .from('user_onboarding')
        .select(`
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
          daily_calories,
          notifications_enabled,
          completed,
          updated_at
        `)
        .eq('user_id', userId)
        .single();

      console.log('Onboarding Query Result:', { onboarding: onboardingResult, onboardingError });

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
        onboardingData = onboardingResult;
      }

      user$.profile.set(profileData);
      user$.onboarding.set(onboardingData);
      user$.isLoading.set(false);
      
      console.log('State updated with:', { profile: profileData, onboarding: onboardingData });

      // 🎨 Sync theme with gender from database
      if (onboardingData?.gender) {
        console.log('🎨 Syncing theme with database gender:', onboardingData.gender);
        theme$.setGender(onboardingData.gender as 'male' | 'female');
      }
    } catch (error) {
      console.error('Query Error:', error);
      user$.error.set((error as Error).message);
      user$.isLoading.set(false);
    }
  },

  updateProfile: async (data: Partial<Profile>) => {
    const profile = user$.profile.peek();
    if (!profile?.id) return;

    try {
      const { data: updatedProfile, error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', profile.id)
        .select()
        .single();

      if (error) throw error;
      user$.profile.set(updatedProfile);
    } catch (error) {
      user$.error.set((error as Error).message);
    }
  },

  updateOnboarding: async (data: Partial<UserOnboarding>) => {
    const onboarding = user$.onboarding.peek();
    if (!onboarding?.id) return;

    try {
      const { data: updatedOnboarding, error } = await supabase
        .from('user_onboarding')
        .update(data)
        .eq('id', onboarding.id)
        .select()
        .single();

      if (error) throw error;
      user$.onboarding.set(updatedOnboarding);

      // 🎨 Sync theme when gender is updated
      if (data.gender) {
        console.log('🎨 Syncing theme after onboarding update, gender:', data.gender);
        theme$.setGender(data.gender as 'male' | 'female');
      }
    } catch (error) {
      user$.error.set((error as Error).message);
    }
  },

  clearUserData: async () => {
    console.log('🧹 Clearing user data from store and AsyncStorage');
    
    user$.profile.set(null);
    user$.onboarding.set(null);
    user$.isLoading.set(false);
    user$.error.set(null);
    
    // AsyncStorage is cleared automatically by syncObservable
    console.log('✅ User data cleared successfully');
  },
});

// Set up persistence with AsyncStorage
syncObservable(user$, persistOptions({
  persist: {
    name: 'user-storage-v2',
    // Only persist profile and onboarding, not loading states
    transform: {
      save: (value) => ({
        profile: value.profile,
        onboarding: value.onboarding,
      }),
      load: (persisted: any) => ({
        profile: persisted?.profile || null,
        onboarding: persisted?.onboarding || null,
        isLoading: false,
        error: null,
      }),
    },
  },
}));
