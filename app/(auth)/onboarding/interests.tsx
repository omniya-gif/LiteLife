import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useOnboardingStore } from '../../../stores/onboardingStore';
import { useTheme } from '../../../hooks/useTheme';
import { Interest } from '../../../types/onboarding';

const interests: { id: Interest; icon: string; label: string }[] = [
  { id: 'nutrition', icon: '🍉', label: 'Nutrition' },
  { id: 'sleep', icon: '🛏️', label: 'Sleep' },
  { id: 'mindfulness', icon: '🍃', label: 'Meditation' },
  { id: 'fitness', icon: '💪', label: 'Fitness' },
  { id: 'cooking', icon: '👨‍🍳', label: 'Cooking' }
];

export default function InterestsPage() {
  const router = useRouter();
  const theme = useTheme();
  const { formData, updateFormData } = useOnboardingStore();
  const selectedInterests = formData.interests || [];
  const [showError, setShowError] = useState(false);

  const toggleInterest = (interest: Interest) => {
    const newInterests = selectedInterests.includes(interest)
      ? selectedInterests.filter(i => i !== interest)
      : [...selectedInterests, interest];
    updateFormData({ interests: newInterests });
    setShowError(false);
  };

  const handleContinue = () => {
    if (selectedInterests.length === 0) {
      setShowError(true);
      return;
    }
    router.push('/onboarding/notifications');
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
          <View className="h-2 w-[87.5%] rounded-full" style={{ backgroundColor: theme.primary }} />
        </View>
        <Text className="font-medium" style={{ color: theme.primary }}>STEP 7/8</Text>
      </Animated.View>

      <View className="flex-1 px-6 pt-12">
        <Animated.Text 
          entering={FadeInDown.delay(200)}
          className="text-4xl font-bold mb-4"
          style={{ color: theme.primary }}
        >
          Time to customize your interest
        </Animated.Text>
        
        <Animated.Text 
          entering={FadeInDown.delay(300)}
          className="text-gray-400 text-lg mb-8"
        >
          Select the topics that interest you the most
        </Animated.Text>

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
                    ? 'border-2'
                    : 'bg-[#2C2D32]'
                }`}
                style={selectedInterests.includes(interest.id) ? { 
                  backgroundColor: `${theme.primary}20`, 
                  borderColor: theme.primary 
                } : {}}>
                  <Text className="text-3xl">{interest.icon}</Text>
                </View>
                <Text className="text-white text-sm text-center">
                  {interest.label}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        {showError && (
          <Animated.Text
            entering={FadeIn}
            className="text-red-500 text-center mb-4"
          >
            Please select at least one interest
          </Animated.Text>
        )}
      </View>

      <Animated.View 
        entering={FadeIn.delay(800)}
        className="p-6"
      >
        <TouchableOpacity
          onPress={handleContinue}
          disabled={selectedInterests.length === 0}
          className="w-full h-14 rounded-2xl items-center justify-center"
          style={{ 
            backgroundColor: selectedInterests.length > 0 ? theme.primary : `${theme.primary}80`,
            opacity: selectedInterests.length > 0 ? 1 : 0.5 
          }}
        >
          <Text className={`font-semibold text-lg ${
            selectedInterests.length > 0 
              ? 'text-[#1A1B1E]'
              : 'text-[#1A1B1E]/50'
          }`}>
            Continue
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}