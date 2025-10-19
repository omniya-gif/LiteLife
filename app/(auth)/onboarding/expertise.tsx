import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

const levels = [
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
];

export default function ExpertiseLevel() {
  const router = useRouter();
  const [selectedLevel, setSelectedLevel] = useState('beginner');

  return (
    <SafeAreaView className="flex-1 bg-[#1A1B1E]">
      {/* Progress Bar */}
      <Animated.View 
        entering={FadeIn}
        className="h-1.5 bg-[#2C2D32] mx-8 mt-6 rounded-full overflow-hidden"
      >
        <View className="h-full w-[12.5%] bg-[#4ADE80]" />
      </Animated.View>

      <View className="flex-1 px-8 pt-12">
        {/* Question */}
        <Animated.Text 
          entering={FadeInDown.delay(200)}
          className="text-4xl font-bold text-[#4ADE80] mb-6"
        >
          Your expertise level?
        </Animated.Text>
        
        <Animated.Text 
          entering={FadeInDown.delay(300)}
          className="text-gray-400 text-lg mb-16"
        >
          For the better experience and personalized plans for you we need to know your expertise level
        </Animated.Text>

        {/* Options with improved spacing */}
        <View className="space-y-6">
          {levels.map((level, index) => (
            <Animated.View 
              key={level.id}
              entering={FadeInDown.delay(400 + (index * 100))}
            >
              <TouchableOpacity
                onPress={() => setSelectedLevel(level.id)}
                className={`p-6 rounded-2xl border-2 ${
                  selectedLevel === level.id
                    ? 'border-[#4ADE80] bg-[#4ADE80]/10'
                    : 'border-[#2C2D32] bg-[#25262B]'
                }`}
              >
                <Text className={`text-xl text-center font-semibold ${
                  selectedLevel === level.id ? 'text-[#4ADE80]' : 'text-white'
                }`}>
                  {level.label}
                </Text>
                {selectedLevel === level.id && (
                  <Text className="text-[#4ADE80]/60 text-center text-sm mt-2">
                    {level.id === 'beginner' && "New to fitness or returning after a long break"}
                    {level.id === 'intermediate' && "Regular workout routine for 6+ months"}
                    {level.id === 'advanced' && "Consistent training for 2+ years"}
                  </Text>
                )}
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </View>

      {/* Next Button with improved positioning */}
      <Animated.View 
        entering={FadeInDown.delay(700)}
        className="p-8"
      >
        <Text className="text-[#4ADE80] text-center font-medium">
          STEP 1/8
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/onboarding/age')}
          className="w-full bg-[#4ADE80] p-4 rounded-2xl"
        >
          <Text className="text-center text-[#1A1B1E] font-semibold text-lg">
            Continue
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}