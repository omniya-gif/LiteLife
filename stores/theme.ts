import { observable } from '@legendapp/state'
import { syncObservable } from '@legendapp/state/sync'
import { persistOptions } from '../lib/legend-config'

interface ThemeStore {
  gender: 'male' | 'female'
  setGender: (gender: 'male' | 'female') => void
  getPrimaryColor: () => string
  initializeFromProfile: (gender: 'male' | 'female' | null | undefined) => void
}

export const theme$ = observable<ThemeStore>({
  gender: 'male',
  
  setGender: (gender: 'male' | 'female') => {
    console.log('🎨 Theme: Setting gender to', gender)
    theme$.gender.set(gender)
  },
  
  getPrimaryColor: () => {
    const gender = theme$.gender.get()
    return gender === 'female' ? '#FF69B4' : '#4ADE80'
  },
  
  initializeFromProfile: (gender: 'male' | 'female' | null | undefined) => {
    if (gender === 'male' || gender === 'female') {
      console.log('🎨 Theme: Initializing from profile, gender:', gender)
      theme$.gender.set(gender)
    }
  }
})

// Set up persistence with MMKV
syncObservable(theme$, persistOptions({
  persist: {
    name: 'theme-storage'
  }
}))
