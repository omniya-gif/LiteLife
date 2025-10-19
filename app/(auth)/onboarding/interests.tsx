import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';

const interests = [
  { id: 'nutrition', icon: '🍉', label: 'Nutrition' },
  { id: 'organic', icon: '🌾', label: 'Organic' },
  { id: 'meditation', icon: '🍃', label: 'Meditation' },
  { id: 'sports', icon: '⚽', label: 'Sports' },
  { id: 'smokeFree', icon: '🚭', label: 'Smoke Free' },
  { id: 'sleep', icon: '🛏️', label: 'Sleep' },
  { id: 'health', icon: '💪', label: 'Health' },
  { id: 'running', icon: '👟', label: 'Running' },
  { id: 'vegan', icon: '🥕', label: 'Vegan' },
];

export default function InterestsPage() {
  const router = useRouter();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const toggleInterest = (id: string) => {
    setSelectedInterests(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#1A1B1E]">
      {/* Header */}
      <Animated.View 
        entering={FadeInDown.springify()}
        className="flex-row items-center justify-between px-6 pt-4"
      >
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <View className="h-2 flex-1 mx-4 rounded-full bg-[#2C2D32]">
          <View className="h-2 w-[87.5%] rounded-full bg-[#4ADE80]" />
        </View>
        <TouchableOpacity>
          <Text className="text-[#4ADE80] font-medium">Skip</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Title Section */}
      <Animated.View 
        entering={FadeInDown.delay(200)}
        className="px-6 mt-12"
      >
        <Text className="text-[#4ADE80] text-center font-medium">
          STEP 7/8
        </Text>
        <Text className="text-white text-center text-2xl font-bold mt-4">
          Time to customize your interest
        </Text>
      </Animated.View>

      {/* Interests Grid */}
      <ScrollView className="flex-1 px-6 mt-12">
        <View className="flex-row flex-wrap justify-between">
          {interests.map((interest, index) => (
            <Animated.View
              key={interest.id}
              entering={FadeInDown.delay(300 + index * 100)}
              className="w-[30%] mb-6"
            >
              <TouchableOpacity
                onPress={() => toggleInterest(interest.id)}
                className="items-center"
              >
                <View className={`w-20 h-20 rounded-2xl items-center justify-center mb-2 ${
                  selectedInterests.includes(interest.id)
                    ? 'bg-[#4ADE80]/20 border-2 border-[#4ADE80]'
                    : 'bg-[#25262B]'
                }`}>
                  <Text className="text-3xl">{interest.icon}</Text>
                </View>
                <Text className="text-white text-sm text-center">
                  {interest.label}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </ScrollView>

      {/* Continue Button */}
      <Animated.View 
        entering={FadeIn.delay(800)}
        className="p-6"
      >
        <TouchableOpacity
          onPress={() => router.push('/onboarding/notifications')}
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