import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Slider } from '@miblanchard/react-native-slider';
import { useOnboardingStore } from '../../../stores/onboardingStore';

export default function WeightSelection() {
  const router = useRouter();
  const updateFormData = useOnboardingStore(state => state.updateFormData);
  const formData = useOnboardingStore(state => state.formData);
  const [currentWeight, setCurrentWeight] = useState(formData.current_weight || 70);
  const [targetWeight, setTargetWeight] = useState(formData.target_weight || 65);

  const handleNext = () => {
    updateFormData({ 
      current_weight: currentWeight,
      target_weight: targetWeight 
    });
    router.push('/onboarding/gender'); // Changed from calories to gender
  };

  const SliderThumb = () => (
    <View className="h-6 w-6 rounded-full bg-[#4ADE80] shadow-lg shadow-green-500" />
  );

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
          <View className="h-2 w-[50%] rounded-full bg-[#4ADE80]" />
        </View>
        <Text className="text-[#4ADE80] font-medium">STEP 4/8</Text>
      </Animated.View>

      <View className="flex-1 px-6 pt-12">
        <Animated.Text 
          entering={FadeInDown.delay(200)}
          className="text-4xl font-bold text-[#4ADE80] mb-4"
        >
          Let's talk weight
        </Animated.Text>
        
        <Animated.Text 
          entering={FadeInDown.delay(300)}
          className="text-gray-400 text-lg mb-8"
        >
          Set your current weight and your target weight
        </Animated.Text>

        <Animated.View 
          entering={FadeInDown.delay(400)}
          className="mb-8"
        >
          <Text className="text-white text-xl mb-4">Current Weight</Text>
          <View className="items-center mb-4">
            <View className="flex-row items-baseline">
              <Text className="text-5xl font-bold text-white">
                {currentWeight}
              </Text>
              <Text className="text-xl text-gray-400 ml-2">kg</Text>
            </View>
          </View>
          <View className="px-4">
            <Slider
              value={currentWeight}
              onValueChange={value => setCurrentWeight(Math.round(value[0]))}
              minimumValue={40}
              maximumValue={150}
              step={1}
              minimumTrackTintColor="#4ADE80"
              maximumTrackTintColor="#2C2D32"
              renderThumbComponent={SliderThumb}
            />
          </View>
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.delay(500)}
          className="mb-8"
        >
          <Text className="text-white text-xl mb-4">Target Weight</Text>
          <View className="items-center mb-4">
            <View className="flex-row items-baseline">
              <Text className="text-5xl font-bold text-white">
                {targetWeight}
              </Text>
              <Text className="text-xl text-gray-400 ml-2">kg</Text>
            </View>
          </View>
          <View className="px-4">
            <Slider
              value={targetWeight}
              onValueChange={value => setTargetWeight(Math.round(value[0]))}
              minimumValue={40}
              maximumValue={150}
              step={1}
              minimumTrackTintColor="#4ADE80"
              maximumTrackTintColor="#2C2D32"
              renderThumbComponent={SliderThumb}
            />
          </View>
        </Animated.View>
      </View>

      <Animated.View 
        entering={FadeInDown.delay(700)}
        className="p-6"
      >
        <TouchableOpacity
          onPress={handleNext}
          className="w-full bg-[#4ADE80] p-4 rounded-2xl"
        >
          <Text className="text-center text-[#1A1B1E] font-semibold text-lg">
            Next
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}