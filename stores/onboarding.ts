import { observable } from '@legendapp/state';

import { OnboardingFormData } from '../types/onboarding';

interface OnboardingStore {
  formData: Partial<OnboardingFormData>;
  completed: boolean | null;
  updateFormData: (data: Partial<OnboardingFormData>) => void;
  resetFormData: () => void;
  setCompleted: (status: boolean) => void;
}

const initialFormData: Partial<OnboardingFormData> = {
  expertise: 'beginner',
  goal: 'improve_health',
  notifications_enabled: false,
  interests: [],
  reason: '',
};

export const onboarding$ = observable<OnboardingStore>({
  formData: initialFormData,
  completed: null,
  
  updateFormData: (data: Partial<OnboardingFormData>) => {
    onboarding$.formData.assign(data);
  },
  
  resetFormData: () => {
    onboarding$.formData.set(initialFormData);
  },
  
  setCompleted: (status: boolean) => {
    onboarding$.completed.set(status);
  },
});
