import { create } from 'zustand';
import { supabase } from '../supabase';

interface BMIRecord {
  id: string;
  weight: number;
  created_at: string;
  bmi: number;
  category: string;
}

interface UserOnboarding {
  height: number;
}

interface BMIStore {
  isLoading: boolean;
  records: BMIRecord[];
  userHeight: number | null;
  currentWeight: number | null;
  error: string | null;
  fetchBMIHistory: (userId: string) => Promise<void>;
  saveWeight: (userId: string, weight: number) => Promise<void>;
  updateHeight: (userId: string, height: number) => Promise<void>;
}

const calculateBMI = (weight: number, height: number) => {
  if (!weight || !height || height < 100 || weight < 30) return 0;
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);
  return Number(bmi.toFixed(1));
};

const getBMICategory = (bmi: number) => {
  if (!bmi || bmi < 1) return 'Unknown';
  if (bmi < 18.5) return 'Underweight';
  if (bmi >= 18.5 && bmi < 25) return 'Normal';
  if (bmi >= 25 && bmi < 30) return 'Overweight';
  return 'Obese';
};

export const useBMIStore = create<BMIStore>((set, get) => ({
  isLoading: false,
  records: [],
  userHeight: null,
  currentWeight: null,
  error: null,

  fetchBMIHistory: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      // First get the user's height from onboarding
      const { data: onboardingData, error: onboardingError } = await supabase
        .from('user_onboarding')
        .select('height, current_weight')
        .eq('user_id', userId)
        .single();

      if (onboardingError) throw onboardingError;
      
      console.log('Onboarding data:', onboardingData);
      const userHeight = onboardingData?.height || null;
      const initialWeight = onboardingData?.current_weight || null;
      
      // Then get weight history
      const { data: weightData, error: weightError } = await supabase
        .from('weight_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (weightError) throw weightError;
      
      console.log('Weight history data:', weightData);
      console.log('Initial weight from onboarding:', initialWeight);

      // Calculate BMI for each weight record if we have height
      let bmiRecords = [];
      const calculateAndLog = (weight: number, height: number) => {
        const bmi = calculateBMI(weight, height);
        console.log('BMI Calculation:', { weight, height, bmi });
        return bmi;
      };

      if (weightData && weightData.length > 0) {
        bmiRecords = weightData.map(record => {
          const bmi = userHeight ? calculateAndLog(record.weight, userHeight) : 0;
          return {
            ...record,
            bmi,
            category: userHeight ? getBMICategory(bmi) : 'Unknown'
          };
        });
      } else if (initialWeight && userHeight) {
        const bmi = calculateAndLog(initialWeight, userHeight);
        // Create a record from onboarding data
        bmiRecords = [{
          id: 'initial',
          user_id: userId,
          weight: initialWeight,
          created_at: new Date().toISOString(),
          bmi,
          category: getBMICategory(bmi)
        }];
      }

      set({ 
        records: bmiRecords, 
        userHeight,
        currentWeight: initialWeight,
        isLoading: false 
      });
    } catch (error) {
      console.error('Error fetching BMI history:', error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  saveWeight: async (userId: string, weight: number) => {
    try {
      set({ isLoading: true, error: null });

      const { error } = await supabase
        .from('weight_history')
        .insert([
          {
            user_id: userId,
            weight
          }
        ]);

      if (error) throw error;

      // Update current weight in onboarding
      const { error: updateError } = await supabase
        .from('user_onboarding')
        .update({ current_weight: weight })
        .eq('user_id', userId);

      if (updateError) throw updateError;

      // Refresh the BMI history after saving
      await get().fetchBMIHistory(userId);
    } catch (error) {
      console.error('Error saving weight record:', error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateHeight: async (userId: string, height: number) => {
    try {
      set({ isLoading: true, error: null });

      const { error } = await supabase
        .from('user_onboarding')
        .update({ height })
        .eq('user_id', userId);

      if (error) throw error;

      // Update the local state
      set(state => ({ 
        userHeight: height,
        isLoading: false,
        error: null 
      }));

      // Refresh BMI history to update calculations
      await get().fetchBMIHistory(userId);
    } catch (error) {
      console.error('Error updating height:', error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },
}));