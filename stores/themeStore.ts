import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface ThemeStore {
  gender: 'male' | 'female';
  setGender: (gender: 'male' | 'female') => void;
  getPrimaryColor: () => string;
  initializeFromProfile: (gender: 'male' | 'female' | null | undefined) => void;
}

export const useThemeStore = create(
  persist<ThemeStore>(
    (set, get) => ({
      gender: 'male',
      setGender: (gender) => {
        console.log('🎨 Theme: Setting gender to', gender);
        set({ gender });
      },
      getPrimaryColor: () => {
        const { gender } = get();
        return gender === 'female' ? '#FF69B4' : '#4ADE80';
      },
      initializeFromProfile: (gender) => {
        if (gender === 'male' || gender === 'female') {
          console.log('🎨 Theme: Initializing from profile, gender:', gender);
          set({ gender });
        }
      },
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
