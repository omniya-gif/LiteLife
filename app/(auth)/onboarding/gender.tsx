import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useOnboardingStore } from '../../../stores/onboardingStore';
import { Gender } from '../../../types/onboarding';

const genders: { id: Gender; label: string; icon: string }[] = [
  { id: 'male', label: 'Male', icon: '👨' },
  { id: 'female', label: 'Female', icon: '👩' }
];

export default function GenderPage() {
  const router = useRouter();
  const updateFormData = useOnboardingStore(state => state.updateFormData);
  const formData = useOnboardingStore(state => state.formData);
  const selectedGender = formData.gender || 'male';

  const handleNext = () => {
    updateFormData({ gender: selectedGender });
    router.push('/onboarding/goal');
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
          <View className="h-2 w-[62.5%] rounded-full bg-[#4ADE80]" />
        </View>
        <Text className="text-[#4ADE80] font-medium">STEP 5/8</Text>
      </Animated.View>

      <View className="flex-1 justify-center px-6">
        {genders.map((gender, index) => (
          <Animated.View
            key={gender.id}
            entering={FadeInDown.delay(300 + index * 100)}
          >
            <TouchableOpacity
              onPress={() => updateFormData({ gender: gender.id })}
              className={`flex-row items-center p-8 rounded-2xl mb-6 ${
                selectedGender === gender.id ? 'bg-[#4ADE80]' : 'bg-[#25262B]'
              }`}
            >
              <View className="w-16 h-16 rounded-full bg-white/10 items-center justify-center">
                <Text className="text-3xl">{gender.icon}</Text>
              </View>
              <Text className={`ml-4 text-xl font-medium ${
                selectedGender === gender.id ? 'text-[#1A1B1E]' : 'text-white'
              }`}>
                {gender.label}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>

      <Animated.View 
        entering={FadeIn.delay(700)}
        className="px-6 mb-6"
      >
        <TouchableOpacity
          onPress={handleNext}
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