import { useRouter } from 'expo-router';
import { ArrowLeft, Bell, Zap, PersonStanding } from 'lucide-react-native';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useQueryClient } from 'react-query';

import { useOnboardingSubmit } from '../../../hooks/useOnboardingSubmit';
import { useOnboardingStore } from '../../../stores/onboardingStore';

const features = [
  {
    icon: <Bell size={20} color="#4ADE80" />,
    title: 'New weekly healthy reminder',
    description: 'Get weekly updates on your progress',
  },
  {
    icon: <Zap size={20} color="#4ADE80" />,
    title: 'Motivational reminder',
    description: 'Stay motivated with daily quotes',
  },
  {
    icon: <PersonStanding size={20} color="#4ADE80" />,
    title: 'Personalised program',
    description: 'Get customized workout plans',
  },
];

export default function NotificationsPage() {
  const router = useRouter();
  const { formData, updateFormData } = useOnboardingStore();
  const onboardingSubmit = useOnboardingSubmit();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async (notificationsEnabled: boolean) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const updatedData = { ...formData, notifications_enabled: notificationsEnabled };

      // First update local state
      updateFormData({ notifications_enabled: notificationsEnabled });

      // Submit onboarding data
      await onboardingSubmit.mutateAsync(updatedData as any);

      // Add extra delay to ensure all state updates are complete
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Navigate to main app
      router.replace('/(main)/home');
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      setIsSubmitting(false);
      // Optionally revert the form data if submission failed
      updateFormData({ notifications_enabled: formData.notifications_enabled });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#1A1B1E]">
      <Animated.View
        entering={FadeInDown.springify()}
        className="flex-row items-center justify-between px-6 pt-4">
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <View className="mx-4 h-2 flex-1 rounded-full bg-[#2C2D32]">
          <View className="h-2 w-full rounded-full bg-[#4ADE80]" />
        </View>
        <Text className="font-medium text-[#4ADE80]">STEP 8/8</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200)} className="mt-12 px-6">
        <Animated.Text
          entering={FadeInDown.delay(200)}
          className="mb-4 text-4xl font-bold text-[#4ADE80]">
          Turn on notifications?
        </Animated.Text>

        <Animated.Text entering={FadeInDown.delay(300)} className="mb-8 text-lg text-gray-400">
          Get updates and reminders to stay on track
        </Animated.Text>
      </Animated.View>

      <View className="flex-1 px-6">
        {features.map((feature, index) => (
          <Animated.View
            key={index}
            entering={FadeInDown.delay(400 + index * 100)}
            className="mb-6 flex-row items-center space-x-4">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-[#4ADE80]/10">
              {feature.icon}
            </View>
            <View className="flex-1">
              <Text className="text-lg font-medium text-white">{feature.title}</Text>
              <Text className="text-gray-400">{feature.description}</Text>
            </View>
          </Animated.View>
        ))}
      </View>

      <Animated.View entering={FadeIn.delay(700)} className="mb-6 mt-auto px-6">
        <TouchableOpacity
          onPress={() => handleSubmit(true)}
          disabled={isSubmitting}
          className={`h-14 w-full items-center justify-center rounded-2xl ${
            isSubmitting ? 'bg-[#4ADE80]/50' : 'bg-[#4ADE80]'
          }`}>
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#1A1B1E" />
          ) : (
            <Text className="text-lg font-semibold text-[#1A1B1E]">Allow</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleSubmit(false)}
          disabled={isSubmitting}
          className={`mt-4 h-14 w-full items-center justify-center rounded-2xl ${
            isSubmitting ? 'opacity-50' : 'opacity-100'
          }`}>
          <Text className={`font-semibold ${isSubmitting ? 'text-gray-600' : 'text-gray-400'}`}>
            Skip for now
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}
