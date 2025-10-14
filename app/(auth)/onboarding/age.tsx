import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Slider } from '@miblanchard/react-native-slider';

export default function AgeSelection() {
  const router = useRouter();
  const [age, setAge] = useState(25);

  const SliderThumb = () => (
    <View className="h-6 w-6 rounded-full bg-[#4ADE80] shadow-lg shadow-green-500" />
  );

  return (
    <SafeAreaView className="flex-1 bg-[#1A1B1E]">
      {/* Progress Bar */}
      <Animated.View 
        entering={FadeIn}
        className="h-1 bg-[#2C2D32] mx-6 mt-4 rounded-full overflow-hidden"
      >
        <View className="h-full w-2/4 bg-[#4ADE80]" />
      </Animated.View>

      <View className="flex-1 px-6 pt-12">
        {/* Question */}
        <Animated.Text 
          entering={FadeInDown.delay(200)}
          className="text-4xl font-bold text-[#4ADE80] mb-4"
        >
          How old are you?
        </Animated.Text>
        
        <Animated.Text 
          entering={FadeInDown.delay(300)}
          className="text-gray-400 text-lg mb-12"
        >
          This helps us create a plan that's safe and effective for your age group
        </Animated.Text>

        {/* Age Display */}
        <Animated.View 
          entering={FadeInDown.delay(400)}
          className="items-center mb-12"
        >
          <Text className="text-7xl font-bold text-white mb-2">
            {age}
          </Text>
          <Text className="text-gray-400 text-xl">
            years old
          </Text>
        </Animated.View>

        {/* Slider */}
        <Animated.View 
          entering={FadeInDown.delay(500)}
          className="px-4"
        >
          <Slider
            value={age}
            onValueChange={value => setAge(Math.round(value[0]))}
            minimumValue={15}
            maximumValue={80}
            step={1}
            minimumTrackTintColor="#4ADE80"
            maximumTrackTintColor="#2C2D32"
            renderThumbComponent={SliderThumb}
          />
          
          <View className="flex-row justify-between mt-2">
            <Text className="text-gray-400">15</Text>
            <Text className="text-gray-400">80</Text>
          </View>
        </Animated.View>
      </View>

      {/* Next Button */}
      <Animated.View 
        entering={FadeInDown.delay(700)}
        className="p-6"
      >
        <TouchableOpacity
          onPress={() => router.push('/onboarding/weight')}
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