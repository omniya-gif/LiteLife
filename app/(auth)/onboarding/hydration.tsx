import { Slider } from '@miblanchard/react-native-slider';
import { useRouter } from 'expo-router';
import { ArrowLeft, Calculator, Droplets } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';

import { useTheme } from '../../../hooks/useTheme';
import { useOnboardingStore } from '../../../stores/onboardingStore';

// Auto-calculate water intake based on weight and activity level
const calculateDailyWater = (
  weight: number,
  activityLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner',
  gender: 'male' | 'female' = 'male'
): number => {
  // Base calculation: 30-35ml per kg of body weight
  let waterPerKg = gender === 'male' ? 35 : 30;

  // Adjust for activity level
  if (activityLevel === 'intermediate') waterPerKg += 5;
  if (activityLevel === 'advanced') waterPerKg += 10;

  const totalWater = Math.round((weight * waterPerKg) / 100) * 100; // Round to nearest 100ml

  // Clamp between 1500ml and 5000ml
  return Math.max(1500, Math.min(5000, totalWater));
};

export default function HydrationPage() {
  const router = useRouter();
  const theme = useTheme();
  const { formData, updateFormData } = useOnboardingStore();
  const [waterTarget, setWaterTarget] = useState(formData.water_target || 2000);
  const [mode, setMode] = useState<'manual' | 'auto'>('manual');
  const [autoWater, setAutoWater] = useState<number | null>(null);

  // Calculate water automatically when in auto mode
  useEffect(() => {
    console.log('💧 HYDRATION PAGE - useEffect triggered');
    console.log('💧 Mode:', mode);

    if (mode === 'auto' && formData.current_weight) {
      const calculated = calculateDailyWater(
        formData.current_weight,
        formData.expertise || 'beginner',
        formData.gender
      );
      setAutoWater(calculated);
      console.log('💧 Auto-calculated daily water:', calculated, 'ml');
    }
  }, [mode, formData]);

  const handleContinue = () => {
    const finalWater = mode === 'auto' ? autoWater : waterTarget;

    console.log('💧 HYDRATION PAGE - handleContinue called');
    console.log('💧 Mode:', mode);
    console.log('💧 Manual water:', waterTarget);
    console.log('💧 Auto water:', autoWater);
    console.log('💧 Final water to save:', finalWater);

    if (finalWater) {
      updateFormData({ water_target: finalWater });
      console.log('💾 Saving water_target to onboarding store:', finalWater);
    }

    router.push('/onboarding/goal');
  };

  const formatLiters = (ml: number) => {
    return (ml / 1000).toFixed(1);
  };

  const formatGlasses = (ml: number) => {
    return Math.round(ml / 250); // 250ml per glass
  };

  return (
    <SafeAreaView className="flex-1 bg-[#1A1B1E]">
      {/* Header */}
      <Animated.View
        entering={FadeInDown.springify()}
        className="flex-row items-center justify-between px-6 pt-4">
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <View className="mx-4 h-2 flex-1 rounded-full bg-[#2C2D32]">
          <View className="h-2 w-[62.5%] rounded-full" style={{ backgroundColor: theme.primary }} />
        </View>
        <Text className="font-medium" style={{ color: theme.primary }}>
          STEP 5/8
        </Text>
      </Animated.View>

      {/* Title Section */}
      <Animated.View entering={FadeInDown.delay(200)} className="mt-12 px-6">
        <Animated.Text
          entering={FadeInDown.delay(200)}
          className="mb-4 text-4xl font-bold"
          style={{ color: theme.primary }}>
          Set your daily water goal
        </Animated.Text>

        <Animated.Text entering={FadeInDown.delay(300)} className="mb-8 text-lg text-gray-400">
          Stay hydrated to boost energy, mood, and overall health
        </Animated.Text>
      </Animated.View>

      {/* Mode Selection */}
      <Animated.View
        entering={FadeInDown.delay(300)}
        className="mt-12 flex-row justify-center space-x-4 px-6">
        <TouchableOpacity
          onPress={() => setMode('manual')}
          className={`h-14 flex-1 items-center justify-center rounded-2xl ${
            mode === 'manual' ? '' : 'bg-[#25262B]'
          }`}
          style={mode === 'manual' ? { backgroundColor: theme.primary } : {}}>
          <Text className={mode === 'manual' ? 'text-[#1A1B1E]' : 'text-white'}>Manual</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setMode('auto')}
          className={`h-14 flex-1 items-center justify-center rounded-2xl ${
            mode === 'auto' ? '' : 'bg-[#25262B]'
          }`}
          style={mode === 'auto' ? { backgroundColor: theme.primary } : {}}>
          <Text className={mode === 'auto' ? 'text-[#1A1B1E]' : 'text-white'}>Auto Calculate</Text>
        </TouchableOpacity>
      </Animated.View>

      {mode === 'manual' ? (
        <Animated.View entering={FadeInDown.delay(400)} className="mt-12 px-6">
          <View className="mb-12 items-center">
            <View
              className="h-32 w-32 items-center justify-center rounded-full"
              style={{ backgroundColor: `${theme.primary}10` }}>
              <Droplets size={48} color={theme.primary} />
              <Text className="mt-2 text-2xl font-bold text-white">{waterTarget} ml</Text>
              <Text className="text-gray-400">
                {formatLiters(waterTarget)}L • {formatGlasses(waterTarget)} glasses
              </Text>
            </View>
          </View>

          <Slider
            value={waterTarget}
            onValueChange={(value) => setWaterTarget(Math.round(value[0]))}
            minimumValue={1000}
            maximumValue={5000}
            step={100}
            minimumTrackTintColor={theme.primary}
            maximumTrackTintColor="#2C2D32"
            thumbTintColor={theme.primary}
          />

          {/* Quick Presets */}
          <View className="mt-8 flex-row justify-between">
            {[1500, 2000, 2500, 3000].map((preset) => (
              <TouchableOpacity
                key={preset}
                onPress={() => setWaterTarget(preset)}
                className="rounded-xl bg-[#2C2D32] px-4 py-3"
                style={
                  waterTarget === preset
                    ? {
                        backgroundColor: `${theme.primary}20`,
                        borderWidth: 1,
                        borderColor: theme.primary,
                      }
                    : {}
                }>
                <Text className="text-center text-white">{formatLiters(preset)}L</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      ) : (
        <Animated.View entering={FadeInDown.delay(400)} className="mt-12 items-center px-6">
          <View
            className="mb-8 h-32 w-32 items-center justify-center rounded-full"
            style={{ backgroundColor: `${theme.primary}10` }}>
            <Calculator size={48} color={theme.primary} />
            {autoWater && (
              <View className="mt-4">
                <Text className="text-center text-3xl font-bold text-white">{autoWater} ml</Text>
                <Text className="text-center text-gray-400">
                  {formatLiters(autoWater)}L • {formatGlasses(autoWater)} glasses
                </Text>
              </View>
            )}
          </View>
          <Text className="mb-4 text-center text-lg text-white">Based on your profile:</Text>
          <View className="w-full rounded-2xl bg-[#2C2D32] p-4">
            <Text className="text-center text-gray-400">
              {formData.current_weight}kg body weight
            </Text>
            <Text className="mt-2 text-center text-gray-400">
              Activity: {formData.expertise} • {formData.gender}
            </Text>
          </View>

          {/* Info Card */}
          <View className="mt-6 w-full rounded-2xl bg-[#25262B] p-4">
            <Text className="text-center text-sm text-gray-400">
              💧 Recommended: 30-35ml per kg body weight
            </Text>
            <Text className="mt-1 text-center text-sm text-gray-400">
              Adjusted for your activity level
            </Text>
          </View>
        </Animated.View>
      )}

      {/* Continue Button */}
      <Animated.View entering={FadeIn.delay(700)} className="mb-6 mt-auto px-6">
        <TouchableOpacity
          onPress={handleContinue}
          className="h-14 w-full items-center justify-center rounded-2xl"
          style={{ backgroundColor: theme.primary }}>
          <Text className="text-lg font-semibold text-[#1A1B1E]">Continue</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}
