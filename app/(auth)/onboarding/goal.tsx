import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { TrendingUp, TrendingDown, Scale } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

const goals = [
  { 
    id: 'lose',
    label: 'Lose Weight',
    icon: <TrendingDown size={24} color="#4ADE80" />,
    description: 'Burn fat and get lean'
  },
  { 
    id: 'maintain',
    label: 'Maintain Weight',
    icon: <Scale size={24} color="#4ADE80" />,
    description: 'Stay healthy and fit'
  },
  { 
    id: 'gain',
    label: 'Gain Weight',
    icon: <TrendingUp size={24} color="#4ADE80" />,
    description: 'Build muscle and strength'
  }
];

export default function GoalSelection() {
  const router = useRouter();
  const [selectedGoal, setSelectedGoal] = useState('lose');

  return (
    <SafeAreaView className="flex-1 bg-[#1A1B1E]">
      {/* Progress Bar */}
      <Animated.View 
        entering={FadeIn}
        className="h-1 bg-[#2C2D32] mx-6 mt-4 rounded-full overflow-hidden"
      >
        <View className="h-full w-full bg-[#4ADE80]" />
      </Animated.View>

      <View className="flex-1 px-6 pt-12">
        {/* Question */}
        <Animated.Text 
          entering={FadeInDown.delay(200)}
          className="text-4xl font-bold text-[#4ADE80] mb-4"
        >
          What's your goal?
        </Animated.Text>
        
        <Animated.Text 
          entering={FadeInDown.delay(300)}
          className="text-gray-400 text-lg mb-12"
        >
          This helps us create a personalized plan to achieve your fitness goals
        </Animated.Text>

        {/* Options */}
        <View className="space-y-4">
          {goals.map((goal, index) => (
            <Animated.View 
              key={goal.id}
              entering={FadeInDown.delay(400 + (index * 100))}
            >
              <TouchableOpacity
                onPress={() => setSelectedGoal(goal.id)}
                className={`p-4 rounded-2xl border ${
                  selectedGoal === goal.id
                    ? 'border-[#4ADE80] bg-[#4ADE80]/10'
                    : 'border-[#2C2D32] bg-[#25262B]'
                }`}
              >
                <View className="flex-row items-center">
                  <View className="h-12 w-12 rounded-full bg-[#2C2D32] items-center justify-center">
                    {goal.icon}
                  </View>
                  <View className="ml-4">
                    <Text className={`text-lg font-semibold ${
                      selectedGoal === goal.id ? 'text-[#4ADE80]' : 'text-white'
                    }`}>
                      {goal.label}
                    </Text>
                    <Text className="text-gray-400">
                      {goal.description}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </View>

      {/* Next Button */}
      <Animated.View 
        entering={FadeInDown.delay(700)}
        className="p-6"
      >
        <TouchableOpacity
          onPress={() => router.push('/(main)/home')}
          className="w-full bg-[#4ADE80] p-4 rounded-2xl"
        >
          <Text className="text-center text-[#1A1B1E] font-semibold text-lg">
            Get Started
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}