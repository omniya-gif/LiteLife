import { Slider } from '@miblanchard/react-native-slider';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useUserStore } from '../../../lib/store/userStore';
import { useTheme } from '../../../hooks/useTheme';

export default function BMRCalculator() {
  const router = useRouter();
  const { onboarding } = useUserStore();
  const theme = useTheme();
  
  const [age, setAge] = useState(onboarding?.age || 25);
  const [height, setHeight] = useState(onboarding?.height || 170);
  const [weight, setWeight] = useState(onboarding?.current_weight || 70);
  const [gender, setGender] = useState(onboarding?.gender || 'male');

  useEffect(() => {
    if (onboarding) {
      if (onboarding.age) setAge(onboarding.age);
      if (onboarding.height) setHeight(onboarding.height);
      if (onboarding.current_weight) setWeight(onboarding.current_weight);
      if (onboarding.gender) setGender(onboarding.gender);
    }
  }, [onboarding]);

  const calculateBMR = useCallback(() => {
    let bmr;
    if (gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }
    return Math.round(bmr);
  }, [weight, height, age, gender]);

  const SliderThumb = () => (
    <View 
      className="h-6 w-6 rounded-full shadow-lg" 
      style={{ backgroundColor: theme.primary, shadowColor: theme.primary }}
    />
  );

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }}>
      <Animated.View
        entering={FadeInDown.springify()}
        className="flex-row items-center justify-between px-6 pt-4">
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white">BMR Calculator</Text>
        <View className="w-6" />
      </Animated.View>

      <View className="flex-1">
        <Animated.View
          entering={FadeIn.delay(300)}
          className="items-center justify-center px-6 py-12">
          <View 
            className="h-48 w-48 items-center justify-center rounded-full border-8"
            style={{ borderColor: `${theme.primary}20` }}
          >
            <Text className="text-4xl font-bold" style={{ color: theme.primary }}>{calculateBMR()}</Text>
            <Text className="mt-2 text-gray-400">calories/day</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(400)} className="flex-1 px-6">
          <View className="mb-8 flex-row justify-center space-x-4">
            <TouchableOpacity
              onPress={() => setGender('male')}
              className="rounded-xl px-6 py-3"
              style={{ 
                backgroundColor: gender === 'male' ? theme.primary : theme.backgroundLight 
              }}>
              <Text className="text-white">Male</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setGender('female')}
              className="rounded-xl px-6 py-3"
              style={{ 
                backgroundColor: gender === 'female' ? theme.primary : theme.backgroundLight 
              }}>
              <Text className="text-white">Female</Text>
            </TouchableOpacity>
          </View>

          <View className="space-y-8">
            <View>
              <View className="flex-row items-center justify-between">
                <Text className="text-lg text-white">Age</Text>
                <Text className="text-lg" style={{ color: theme.primary }}>{age} years</Text>
              </View>
              <Slider
                value={age}
                onValueChange={(value) => setAge(Math.round(value[0]))}
                minimumValue={15}
                maximumValue={80}
                step={1}
                minimumTrackTintColor={theme.primary}
                maximumTrackTintColor="#2D2F34"
                renderThumbComponent={SliderThumb}
              />
            </View>

            <View>
              <View className="flex-row items-center justify-between">
                <Text className="text-lg text-white">Height</Text>
                <Text className="text-lg" style={{ color: theme.primary }}>{height} cm</Text>
              </View>
              <Slider
                value={height}
                onValueChange={(value) => setHeight(Math.round(value[0]))}
                minimumValue={120}
                maximumValue={220}
                step={1}
                minimumTrackTintColor={theme.primary}
                maximumTrackTintColor="#2D2F34"
                renderThumbComponent={SliderThumb}
              />
            </View>

            {/* Weight Slider */}
            <View>
              <View className="flex-row items-center justify-between">
                <Text className="text-lg text-white">Weight</Text>
                <Text className="text-lg" style={{ color: theme.primary }}>{weight} kg</Text>
              </View>
              <Slider
                value={weight}
                onValueChange={(value) => setWeight(Math.round(value[0]))}
                minimumValue={30}
                maximumValue={150}
                step={1}
                minimumTrackTintColor={theme.primary}
                maximumTrackTintColor="#2D2F34"
                renderThumbComponent={SliderThumb}
              />
            </View>
          </View>

          <View className="mt-8 space-y-4 rounded-xl p-6" style={{ backgroundColor: theme.backgroundLight }}>
            <Text className="text-lg font-semibold text-white">What is BMR?</Text>
            <Text className="text-gray-400">
              Basal Metabolic Rate (BMR) is the number of calories your body burns while performing
              basic life-sustaining functions like breathing, circulation, and cell production.
            </Text>
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
