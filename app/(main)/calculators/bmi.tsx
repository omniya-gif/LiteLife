import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Slider } from '@miblanchard/react-native-slider';

const BMICategory = ({ bmi }) => {
  let category = '';
  let color = '';

  if (bmi < 18.5) {
    category = 'Underweight';
    color = '#3B82F6'; // blue
  } else if (bmi >= 18.5 && bmi < 25) {
    category = 'Normal';
    color = '#4ADE80'; // green
  } else if (bmi >= 25 && bmi < 30) {
    category = 'Overweight';
    color = '#FBBF24'; // yellow
  } else {
    category = 'Obese';
    color = '#EF4444'; // red
  }

  return (
    <View className="items-center">
      <Text className="text-lg text-gray-400">Your BMI indicates</Text>
      <Text className="text-2xl font-bold" style={{ color }}>
        {category}
      </Text>
    </View>
  );
};

export default function BMICalculator() {
  const router = useRouter();
  const [height, setHeight] = useState(170);
  const [weight, setWeight] = useState(70);

  const calculateBMI = useCallback(() => {
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    return bmi.toFixed(1);
  }, [height, weight]);

  const bmi = calculateBMI();

  const SliderThumb = () => (
    <View className="h-6 w-6 rounded-full bg-[#4ADE80] shadow-lg shadow-green-500" />
  );

  return (
    <SafeAreaView className="flex-1 bg-[#1A1B1E]">
      <Animated.View
        entering={FadeInDown.springify()}
        className="flex-row items-center justify-between px-6 pt-4">
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white">BMI Calculator</Text>
        <View className="w-6" /> {/* Spacer for alignment */}
      </Animated.View>

      <View className="flex-1">
        <Animated.View 
          entering={FadeIn.delay(300)}
          className="items-center justify-center px-6 py-12">
          <View className="h-48 w-48 items-center justify-center rounded-full border-8 border-[#4ADE80]/20">
            <Text className="text-5xl font-bold text-[#4ADE80]">{bmi}</Text>
            <Text className="mt-2 text-gray-400">BMI</Text>
          </View>
          <View className="mt-6">
            <BMICategory bmi={parseFloat(bmi)} />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(400)} className="flex-1 px-6">
          <View className="space-y-8">
            {/* Height Slider */}
            <View>
              <View className="flex-row items-center justify-between">
                <Text className="text-lg text-white">Height</Text>
                <Text className="text-lg text-[#4ADE80]">{height} cm</Text>
              </View>
              <Slider
                value={height}
                onValueChange={(value) => setHeight(Math.round(value[0]))}
                minimumValue={120}
                maximumValue={220}
                step={1}
                minimumTrackTintColor="#4ADE80"
                maximumTrackTintColor="#2D2F34"
                renderThumbComponent={SliderThumb}
              />
            </View>

            {/* Weight Slider */}
            <View>
              <View className="flex-row items-center justify-between">
                <Text className="text-lg text-white">Weight</Text>
                <Text className="text-lg text-[#4ADE80]">{weight} kg</Text>
              </View>
              <Slider
                value={weight}
                onValueChange={(value) => setWeight(Math.round(value[0]))}
                minimumValue={30}
                maximumValue={150}
                step={1}
                minimumTrackTintColor="#4ADE80"
                maximumTrackTintColor="#2D2F34"
                renderThumbComponent={SliderThumb}
              />
            </View>
          </View>

          <View className="mt-8 space-y-4 rounded-xl bg-[#25262B] p-6">
            <Text className="text-lg font-semibold text-white">BMI Categories:</Text>
            <View className="space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-gray-400">Underweight</Text>
                <Text className="text-[#3B82F6]">&lt; 18.5</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-400">Normal</Text>
                <Text className="text-[#4ADE80]">18.5 - 24.9</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-400">Overweight</Text>
                <Text className="text-[#FBBF24]">25 - 29.9</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-400">Obese</Text>
                <Text className="text-[#EF4444]">&gt; 30</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(500)} className="p-6">
          <TouchableOpacity
            className="w-full rounded-xl bg-[#4ADE80] py-4"
            onPress={() => {
              // Add logic to save BMI history
            }}>
            <Text className="text-center text-lg font-semibold text-white">Save to History</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
