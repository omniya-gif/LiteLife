import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Profile } from '../types/supabase';

interface UserStore {
  profile: Profile | null;
  setProfile: (profile: Profile | null) => void;
  hasReceivedWelcomeCoins: boolean;
  setHasReceivedWelcomeCoins: (value: boolean) => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      profile: null,
      hasReceivedWelcomeCoins: false,
      setProfile: (profile) => set({ profile }),
      setHasReceivedWelcomeCoins: (value) => set({ hasReceivedWelcomeCoins: value }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);