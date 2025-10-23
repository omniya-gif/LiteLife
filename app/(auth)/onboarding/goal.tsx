import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Target, Activity } from 'lucide-react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useOnboardingStore } from '../../../stores/onboardingStore';
import { Goal } from '../../../types/onboarding';

const goals: { id: Goal; label: string; icon: React.ReactNode; description: string }[] = [
  {
    id: 'weight_loss',
    label: 'Lose Weight',
    icon: <Target size={24} color="#4ADE80" />,
    description: 'Burn fat and get lean'
  },
  {
    id: 'muscle_gain',
    label: 'Build Muscle',
    icon: <Activity size={24} color="#4ADE80" />,
    description: 'Gain strength and size'
  },
  {
    id: 'maintain',
    label: 'Maintain Weight',
    icon: <Target size={24} color="#4ADE80" />,
    description: 'Stay at current weight'
  },
  {
    id: 'improve_health',
    label: 'Improve Health',
    icon: <Activity size={24} color="#4ADE80" />,
    description: 'Focus on overall wellness'
  }
];

export default function GoalSelection() {
  const router = useRouter();
  const updateFormData = useOnboardingStore(state => state.updateFormData);
  const formData = useOnboardingStore(state => state.formData);
  const selectedGoal = formData.goal || 'improve_health';

  const handleNext = () => {
    updateFormData({ goal: selectedGoal });
    router.push('/onboarding/interests');
  };

  return (
    <SafeAreaView className="flex-1 bg-[#1A1B1E]">
      <Animated.View 
        entering={FadeInDown.springify()}
        className="flex-row items-center justify-between px-6 pt-4"
      >
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <View className="h-2 flex-1 mx-4 rounded-full bg-[#2C2D32]">
          <View className="h-2 w-[75%] rounded-full bg-[#4ADE80]" />
        </View>
        <Text className="text-[#4ADE80] font-medium">STEP 6/8</Text>
      </Animated.View>

      <View className="flex-1 px-6 pt-12">
        <Animated.Text 
          entering={FadeInDown.delay(200)}
          className="text-4xl font-bold text-[#4ADE80] mb-4"
        >
          What's your goal?
        </Animated.Text>
        
        <Animated.Text 
          entering={FadeInDown.delay(300)}
          className="text-gray-400 text-lg mb-8"
        >
          This helps us create a personalized plan for you
        </Animated.Text>

        <View className="space-y-4">
          {goals.map((goal, index) => (
            <Animated.View
              key={goal.id}
              entering={FadeInDown.delay(400 + index * 100)}
            >
              <TouchableOpacity
                onPress={() => updateFormData({ goal: goal.id })}
                className={`p-6 rounded-2xl border-2 ${
                  selectedGoal === goal.id
                    ? 'border-[#4ADE80] bg-[#4ADE80]/10'
                    : 'border-[#2C2D32] bg-[#25262B]'
                }`}
              >
                <View className="flex-row items-center">
                  <View className="h-12 w-12 rounded-full bg-[#4ADE80]/10 items-center justify-center">
                    {goal.icon}
                  </View>
                  <View className="ml-4">
                    <Text className={`text-lg font-medium ${
                      selectedGoal === goal.id ? 'text-[#4ADE80]' : 'text-white'
                    }`}>
                      {goal.label}
                    </Text>
                    <Text className="text-gray-400 text-sm">
                      {goal.description}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </View>

      <Animated.View 
        entering={FadeIn.delay(700)}
        className="p-6"
      >
        <TouchableOpacity
          onPress={handleNext}
          className="w-full bg-[#4ADE80] h-14 rounded-2xl items-center justify-center"
        >
          <Text className="text-[#1A1B1E] font-semibold text-lg">
            Continue
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}