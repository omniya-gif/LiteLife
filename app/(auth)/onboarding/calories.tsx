import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Calculator, Flame } from 'lucide-react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Slider } from '@miblanchard/react-native-slider';

export default function CaloriesPage() {
  const router = useRouter();
  const [calories, setCalories] = useState(2000);
  const [mode, setMode] = useState<'manual' | 'auto'>('manual');

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
          <View className="h-2 w-[50%] rounded-full bg-[#4ADE80]" />
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
          STEP 4/8
        </Text>
        <Text className="text-white text-center text-2xl font-bold mt-4">
          Set your daily calorie goal
        </Text>
      </Animated.View>

      {/* Mode Selection */}
      <Animated.View 
        entering={FadeInDown.delay(300)}
        className="flex-row justify-center space-x-4 mt-12 px-6"
      >
        <TouchableOpacity
          onPress={() => setMode('manual')}
          className={`flex-1 h-14 rounded-2xl items-center justify-center ${
            mode === 'manual' ? 'bg-[#4ADE80]' : 'bg-[#25262B]'
          }`}
        >
          <Text className={mode === 'manual' ? 'text-[#1A1B1E]' : 'text-white'}>
            Manual
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setMode('auto')}
          className={`flex-1 h-14 rounded-2xl items-center justify-center ${
            mode === 'auto' ? 'bg-[#4ADE80]' : 'bg-[#25262B]'
          }`}
        >
          <Text className={mode === 'auto' ? 'text-[#1A1B1E]' : 'text-white'}>
            Auto Calculate
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {mode === 'manual' ? (
        <Animated.View 
          entering={FadeInDown.delay(400)}
          className="px-6 mt-12"
        >
          <View className="items-center mb-12">
            <View className="w-32 h-32 rounded-full bg-[#4ADE80]/10 items-center justify-center">
              <Flame size={48} color="#4ADE80" />
              <Text className="text-2xl font-bold text-white mt-2">
                {calories}
              </Text>
              <Text className="text-gray-400">calories/day</Text>
            </View>
          </View>
          
          <Slider
            value={calories}
            onValueChange={value => setCalories(Math.round(value[0]))}
            minimumValue={1200}
            maximumValue={4000}
            step={50}
            minimumTrackTintColor="#4ADE80"
            maximumTrackTintColor="#2C2D32"
            thumbTintColor="#4ADE80"
          />
        </Animated.View>
      ) : (
        <Animated.View 
          entering={FadeInDown.delay(400)}
          className="px-6 mt-12 items-center"
        >
          <View className="w-32 h-32 rounded-full bg-[#4ADE80]/10 items-center justify-center mb-8">
            <Calculator size={48} color="#4ADE80" />
          </View>
          <Text className="text-white text-center">
            We'll calculate your daily calorie needs based on your age, gender, weight, and activity level
          </Text>
        </Animated.View>
      )}

      {/* Continue Button */}
      <Animated.View 
        entering={FadeIn.delay(700)}
        className="px-6 mt-auto mb-6"
      >
        <TouchableOpacity
          onPress={() => router.push('/onboarding/gender')}
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