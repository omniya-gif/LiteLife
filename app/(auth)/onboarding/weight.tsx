import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Slider } from '@miblanchard/react-native-slider';

export default function WeightSelection() {
  const router = useRouter();
  const [currentWeight, setCurrentWeight] = useState(70);
  const [targetWeight, setTargetWeight] = useState(65);

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
        <View className="h-full w-[37.5%] bg-[#4ADE80]" />
      </Animated.View>

      <View className="flex-1 px-6 pt-12">
        {/* Question */}
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

        {/* Current Weight Section */}
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

        {/* Target Weight Section */}
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

      {/* Next Button */}
      <Animated.View 
        entering={FadeInDown.delay(700)}
        className="p-6"
      >
        <Text className="text-[#4ADE80] text-center font-medium">
          STEP 3/8
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/onboarding/calories')}
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