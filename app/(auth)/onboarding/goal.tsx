import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Target, Activity } from 'lucide-react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useOnboardingStore } from '../../../stores/onboardingStore';
import { useTheme } from '../../../hooks/useTheme';
import { Goal } from '../../../types/onboarding';

export default function GoalSelection() {
  const router = useRouter();
  const theme = useTheme();
  const updateFormData = useOnboardingStore(state => state.updateFormData);
  const formData = useOnboardingStore(state => state.formData);
  const selectedGoal = formData.goal || 'improve_health';

  const goals: { id: Goal; label: string; icon: React.ReactNode; description: string }[] = [
    {
      id: 'weight_loss',
      label: 'Lose Weight',
      icon: <Target size={24} color={theme.primary} />,
      description: 'Burn fat and get lean'
    },
    {
      id: 'muscle_gain',
      label: 'Build Muscle',
      icon: <Activity size={24} color={theme.primary} />,
      description: 'Gain strength and size'
    },
    {
      id: 'maintain',
      label: 'Maintain Weight',
      icon: <Target size={24} color={theme.primary} />,
      description: 'Stay at current weight'
    },
    {
      id: 'improve_health',
      label: 'Improve Health',
      icon: <Activity size={24} color={theme.primary} />,
      description: 'Focus on overall wellness'
    }
  ];

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
          <View className="h-2 w-[75%] rounded-full" style={{ backgroundColor: theme.primary }} />
        </View>
        <Text className="font-medium" style={{ color: theme.primary }}>STEP 6/8</Text>
      </Animated.View>

      <View className="flex-1 px-6 pt-12">
        <Animated.Text 
          entering={FadeInDown.delay(200)}
          className="text-4xl font-bold mb-4"
          style={{ color: theme.primary }}
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
                    ? 'bg-[#4ADE80]/10'
                    : 'border-[#2C2D32] bg-[#25262B]'
                }`}
                style={selectedGoal === goal.id ? { borderColor: theme.primary, backgroundColor: `${theme.primary}10` } : {}}
              >
                <View className="flex-row items-center">
                  <View className="h-12 w-12 rounded-full items-center justify-center" style={{ backgroundColor: `${theme.primary}10` }}>
                    {goal.icon}
                  </View>
                  <View className="ml-4">
                    <Text className={`text-lg font-medium ${
                      selectedGoal === goal.id ? '' : 'text-white'
                    }`}
                    style={selectedGoal === goal.id ? { color: theme.primary } : {}}>
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
          className="w-full h-14 rounded-2xl items-center justify-center"
          style={{ backgroundColor: theme.primary }}
        >
          <Text className="text-[#1A1B1E] font-semibold text-lg">
            Continue
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}