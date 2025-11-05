import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Expertise } from '../../../types/onboarding';
import { useOnboardingStore } from '../../../stores/onboardingStore';

// Hard-coded green color for pages BEFORE gender selection (Steps 1-4)
const PRIMARY_COLOR = '#4ADE80';

const levels: { id: Expertise; label: string; description: string }[] = [
  { 
    id: 'beginner', 
    label: 'Beginner', 
    description: 'New to fitness or returning after a long break'
  },
  { 
    id: 'intermediate', 
    label: 'Intermediate', 
    description: 'Regular workout routine for 6+ months'
  },
  { 
    id: 'advanced', 
    label: 'Advanced', 
    description: 'Consistent training for 2+ years'
  }
];

export default function ExpertiseLevel() {
  const router = useRouter();
  const updateFormData = useOnboardingStore(state => state.updateFormData);
  const [selectedLevel, setSelectedLevel] = useState<Expertise>('beginner');

  const handleNext = () => {
    updateFormData({ expertise: selectedLevel });
    router.push('/onboarding/username');
  };

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
          <View className="h-2 w-[12.5%] rounded-full" style={{ backgroundColor: PRIMARY_COLOR }} />
        </View>
        <Text className="font-medium" style={{ color: PRIMARY_COLOR }}>STEP 1/8</Text>
      </Animated.View>

      <View className="flex-1 px-6 pt-12">
        <Animated.Text 
          entering={FadeInDown.delay(200)}
          className="text-4xl font-bold mb-6"
          style={{ color: PRIMARY_COLOR }}
        >
          Your expertise level?
        </Animated.Text>
        
        <Animated.Text 
          entering={FadeInDown.delay(300)}
          className="text-gray-400 text-lg mb-16"
        >
          For the better experience and personalized plans for you we need to know your expertise level
        </Animated.Text>

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
                    ? ''
                    : 'border-[#2C2D32] bg-[#25262B]'
                }`}
                style={selectedLevel === level.id ? {
                  borderColor: PRIMARY_COLOR,
                  backgroundColor: `${PRIMARY_COLOR}19` // 10% opacity
                } : {}}
              >
                <Text className={`text-xl text-center font-semibold ${
                  selectedLevel !== level.id ? 'text-white' : ''
                }`}
                style={selectedLevel === level.id ? { color: PRIMARY_COLOR } : {}}
                >
                  {level.label}
                </Text>
                {selectedLevel === level.id && (
                  <Text className="text-center text-sm mt-2" style={{ color: `${PRIMARY_COLOR}99` }}>
                    {level.description}
                  </Text>
                )}
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </View>

      <Animated.View 
        entering={FadeInDown.delay(700)}
        className="p-6"
      >
        <TouchableOpacity
          onPress={handleNext}
          className="w-full p-4 rounded-2xl"
          style={{ backgroundColor: PRIMARY_COLOR }}
        >
          <Text className="text-center text-[#1A1B1E] font-semibold text-lg">
            Next
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}