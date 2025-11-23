import { useRouter } from 'expo-router';
import { ArrowLeft, Bell, Zap, PersonStanding } from 'lucide-react-native';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useQueryClient } from 'react-query';

import { useOnboardingSubmit } from '../../../hooks/useOnboardingSubmit';
import { useOnboardingStore } from '../../../stores/onboardingStore';
import { useTheme } from '../../../hooks/useTheme';

export default function NotificationsPage() {
  const router = useRouter();
  const { formData, updateFormData } = useOnboardingStore();
  const onboardingSubmit = useOnboardingSubmit();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const theme = useTheme();

  const features = [
    {
      icon: <Bell size={20} color={theme.primary} />,
      title: 'New weekly healthy reminder',
      description: 'Get weekly updates on your progress',
    },
    {
      icon: <Zap size={20} color={theme.primary} />,
      title: 'Motivational reminder',
      description: 'Stay motivated with daily quotes',
    },
    {
      icon: <PersonStanding size={20} color={theme.primary} />,
      title: 'Personalised program',
      description: 'Get customized workout plans',
    },
  ];
  const handleSubmit = async (notificationsEnabled: boolean) => {
    if (isSubmitting) return;

    // Show loading immediately to cover theme reset
    setIsSubmitting(true);
    
    try {
      const updatedData = { ...formData, notifications_enabled: notificationsEnabled };

      console.log('📤 NOTIFICATIONS PAGE - Final submission payload:', JSON.stringify(updatedData, null, 2));
      console.log('📤 daily_calories in payload:', updatedData.daily_calories);

      // First update local state
      updateFormData({ notifications_enabled: notificationsEnabled });

      // Submit onboarding data (this will reset theme and clear state)
      await onboardingSubmit.mutateAsync(updatedData as any);

      // Keep loading screen visible during navigation
      // The theme reset happens here, but user sees loading screen
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Navigate to main app (loading screen still visible)
      router.replace('/(main)/home');
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      setIsSubmitting(false);
      // Optionally revert the form data if submission failed
      updateFormData({ notifications_enabled: formData.notifications_enabled });
    }
    // Don't set isSubmitting to false - let the next screen handle it
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
          <View className="h-2 w-full rounded-full" style={{ backgroundColor: theme.primary }} />
        </View>
        <Text className="font-medium" style={{ color: theme.primary }}>STEP 8/8</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200)} className="mt-12 px-6">
        <Animated.Text
          entering={FadeInDown.delay(200)}
          className="mb-4 text-4xl font-bold"
          style={{ color: theme.primary }}>
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
            <View className="h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: `${theme.primary}10` }}>
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
          className="h-14 w-full items-center justify-center rounded-2xl"
          style={{ backgroundColor: theme.primary, opacity: isSubmitting ? 0.7 : 1 }}>
          <Text className="text-lg font-semibold text-[#1A1B1E]">
            {isSubmitting ? 'Setting up...' : 'Allow'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleSubmit(false)}
          disabled={isSubmitting}
          className="mt-4 h-14 w-full items-center justify-center rounded-2xl">
          <Text className={`font-semibold ${isSubmitting ? 'text-gray-600' : 'text-gray-400'}`}>
            {isSubmitting ? 'Please wait...' : 'Skip for now'}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Full-screen loading overlay to hide theme reset */}
      {isSubmitting && (
        <Animated.View
          entering={FadeIn.duration(200)}
          className="absolute inset-0 items-center justify-center"
          style={{ backgroundColor: '#1A1B1E' }}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text className="mt-4 text-lg text-white">Setting up your account...</Text>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}
