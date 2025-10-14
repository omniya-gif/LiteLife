import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

const ActivityLevels = {
  sedentary: { label: 'Sedentary', multiplier: 1.2, description: 'Little or no exercise' },
  light: { label: 'Light', multiplier: 1.375, description: '1-3 times/week' },
  moderate: { label: 'Moderate', multiplier: 1.55, description: '3-5 times/week' },
  active: { label: 'Active', multiplier: 1.725, description: '6-7 times/week' },
  extreme: { label: 'Extreme', multiplier: 1.9, description: '2x per day' },
};

export default function TDEECalculator() {
  const router = useRouter();
  const [bmr, setBmr] = useState(2000);
  const [activity, setActivity] = useState('sedentary');

  const calculateTDEE = useCallback(() => {
    return Math.round(bmr * ActivityLevels[activity].multiplier);
  }, [bmr, activity]);

  const renderActivityButton = (key, data) => (
    <TouchableOpacity
      key={key}
      onPress={() => setActivity(key)}
      className={`mb-4 rounded-xl p-4 ${
        activity === key ? 'bg-[#A78BFA]' : 'bg-[#25262B]'
      }`}>
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-lg font-semibold text-white">{data.label}</Text>
          <Text className="text-sm text-gray-300">{data.description}</Text>
        </View>
        <View className="items-end">
          <Text className="text-sm text-gray-400">Multiplier</Text>
          <Text className="text-lg font-bold text-white">×{data.multiplier}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#1A1B1E]">
      <Animated.View
        entering={FadeInDown.springify()}
        className="flex-row items-center justify-between px-6 pt-4">
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white">TDEE Calculator</Text>
        <View className="w-6" />
      </Animated.View>

      <ScrollView className="flex-1">
        <Animated.View 
          entering={FadeIn.delay(300)}
          className="p-6">
          <View className="mb-8 rounded-2xl bg-[#25262B] p-6">
            <Text className="text-center text-lg font-semibold text-white">
              Your BMR
            </Text>
            <View className="my-4 flex-row items-center justify-center space-x-2">
              <Text className="text-4xl font-bold text-[#A78BFA]">{bmr}</Text>
              <Text className="text-lg text-gray-400">calories/day</Text>
            </View>
            <View className="flex-row justify-center space-x-4">
              <TouchableOpacity
                onPress={() => setBmr(prev => prev - 50)}
                className="rounded-lg bg-[#1A1B1E] px-4 py-2">
                <Text className="text-lg text-white">-50</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setBmr(prev => prev + 50)}
                className="rounded-lg bg-[#1A1B1E] px-4 py-2">
                <Text className="text-lg text-white">+50</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text className="mb-4 text-lg font-semibold text-white">
            Select Activity Level
          </Text>
          {Object.entries(ActivityLevels).map(([key, data]) =>
            renderActivityButton(key, data)
          )}

          <View className="mt-8 rounded-2xl bg-[#25262B] p-6">
            <Text className="text-center text-lg font-semibold text-white">
              Your TDEE
            </Text>
            <View className="my-4 items-center">
              <Text className="text-5xl font-bold text-[#A78BFA]">
                {calculateTDEE()}
              </Text>
              <Text className="mt-2 text-gray-400">calories/day</Text>
            </View>
            <Text className="text-center text-sm text-gray-400">
              This is the estimated number of calories you burn daily
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
