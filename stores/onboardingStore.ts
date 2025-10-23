import { create } from 'zustand';
import { OnboardingFormData } from '../types/onboarding';

interface OnboardingStore {
  formData: Partial<OnboardingFormData>;
  updateFormData: (data: Partial<OnboardingFormData>) => void;
  resetFormData: () => void;
}

const initialFormData: Partial<OnboardingFormData> = {
  expertise: 'beginner',
  goal: 'improve_health',
  notifications_enabled: false,
  interests: [],
  reason: '',
};

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  formData: initialFormData,
  updateFormData: (data) => 
    set((state) => ({ 
      formData: { ...state.formData, ...data } 
    })),
  resetFormData: () => set({ formData: initialFormData }),
}));