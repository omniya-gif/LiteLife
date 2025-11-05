import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Slider } from '@miblanchard/react-native-slider';
import { ArrowLeft } from 'lucide-react-native';
import { useOnboardingStore } from '../../../stores/onboardingStore';

export default function HeightSelection() {
  const router = useRouter();
  const updateFormData = useOnboardingStore(state => state.updateFormData);
  const formData = useOnboardingStore(state => state.formData);
  const [height, setHeight] = useState(formData.height || 170);

  const handleNext = () => {
    updateFormData({ height });
    router.push('/onboarding/weight');
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
          <View className="h-2 w-[50%] bg-[#4ADE80] rounded-full" />
        </View>
        <Text className="text-[#4ADE80] font-medium">STEP 4/8</Text>
      </Animated.View>

      <View className="flex-1 px-6 pt-12">
        <Animated.Text 
          entering={FadeInDown.delay(200)}
          className="text-4xl font-bold text-[#4ADE80] mb-4"
        >
          How tall are you?
        </Animated.Text>
        
        <Animated.Text 
          entering={FadeInDown.delay(300)}
          className="text-gray-400 text-lg mb-12"
        >
          This helps us create a plan that's tailored to your height
        </Animated.Text>

        <Animated.View 
          entering={FadeInDown.delay(400)}
          className="items-center mb-12"
        >
          <Text className="text-7xl font-bold text-white mb-2">
            {height}
          </Text>
          <Text className="text-gray-400 text-xl">
            cm
          </Text>
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.delay(500)}
          className="px-4"
        >
          <Slider
            value={height}
            onValueChange={value => setHeight(Math.round(value[0]))}
            minimumValue={100}
            maximumValue={250}
            step={1}
            minimumTrackTintColor="#4ADE80"
            maximumTrackTintColor="#2C2D32"
            renderThumbComponent={SliderThumb}
          />
          
          <View className="flex-row justify-between mt-2">
            <Text className="text-gray-400">100</Text>
            <Text className="text-gray-400">250</Text>
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