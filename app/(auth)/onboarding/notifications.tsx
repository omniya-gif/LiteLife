import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Bell, Zap, PersonStanding } from 'lucide-react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useOnboardingStore } from '../../../stores/onboardingStore';
import { useOnboardingSubmit } from '../../../hooks/useOnboardingSubmit';

const features = [
  {
    icon: <Bell size={20} color="#4ADE80" />,
    title: 'New weekly healthy reminder',
    description: 'Get weekly updates on your progress'
  },
  {
    icon: <Zap size={20} color="#4ADE80" />,
    title: 'Motivational reminder',
    description: 'Stay motivated with daily quotes'
  },
  {
    icon: <PersonStanding size={20} color="#4ADE80" />,
    title: 'Personalised program',
    description: 'Get customized workout plans'
  }
];

export default function NotificationsPage() {
  const router = useRouter();
  const { formData, updateFormData } = useOnboardingStore();
  const onboardingSubmit = useOnboardingSubmit();

  const handleSubmit = async () => {
    try {
      await onboardingSubmit.mutateAsync(formData as any);
      router.push('/(main)/home');
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      // Handle error appropriately
    }
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
          <View className="h-2 w-full rounded-full bg-[#4ADE80]" />
        </View>
        <Text className="text-[#4ADE80] font-medium">STEP 8/8</Text>
      </Animated.View>

      <Animated.View 
        entering={FadeInDown.delay(200)}
        className="px-6 mt-12"
      >
        <Animated.Text 
          entering={FadeInDown.delay(200)}
          className="text-4xl font-bold text-[#4ADE80] mb-4"
        >
          Turn on notifications?
        </Animated.Text>
        
        <Animated.Text 
          entering={FadeInDown.delay(300)}
          className="text-gray-400 text-lg mb-8"
        >
          Get updates and reminders to stay on track
        </Animated.Text>
      </Animated.View>

      <View className="flex-1 px-6">
        {features.map((feature, index) => (
          <Animated.View
            key={index}
            entering={FadeInDown.delay(400 + index * 100)}
            className="flex-row items-center space-x-4 mb-6"
          >
            <View className="h-12 w-12 rounded-full bg-[#4ADE80]/10 items-center justify-center">
              {feature.icon}
            </View>
            <View className="flex-1">
              <Text className="text-lg font-medium text-white">{feature.title}</Text>
              <Text className="text-gray-400">{feature.description}</Text>
            </View>
          </Animated.View>
        ))}
      </View>

      <Animated.View 
        entering={FadeIn.delay(700)}
        className="px-6 mt-auto mb-6"
      >
        <TouchableOpacity
          onPress={() => {
            updateFormData({ notifications_enabled: true });
            handleSubmit();
          }}
          className="w-full h-14 rounded-2xl items-center justify-center bg-[#4ADE80]"
        >
          <Text className="text-[#1A1B1E] font-semibold text-lg">
            Allow
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            updateFormData({ notifications_enabled: false });
            handleSubmit();
          }}
          className="w-full h-14 rounded-2xl items-center justify-center mt-4"
        >
          <Text className="text-gray-400 font-semibold">
            Skip for now
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}