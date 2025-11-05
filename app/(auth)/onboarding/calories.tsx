import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Calculator, Flame } from 'lucide-react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Slider } from '@miblanchard/react-native-slider';
import { useTheme } from '../../../hooks/useTheme';

export default function CaloriesPage() {
  const router = useRouter();
  const theme = useTheme();
  const [calories, setCalories] = useState(2000);
  const [mode, setMode] = useState<'manual' | 'auto'>('manual');

  return (
    <SafeAreaView className="flex-1 bg-[#1A1B1E]">
      {/* Header */}
      <Animated.View 
        entering={FadeInDown.springify()}
        className="flex-row items-center justify-between px-6 pt-4"
      >
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <View className="h-2 flex-1 mx-4 rounded-full bg-[#2C2D32]">
          <View className="h-2 w-[50%] rounded-full" style={{ backgroundColor: theme.primary }} />
        </View>
        <Text className="font-medium" style={{ color: theme.primary }}>STEP 4/8</Text>
      </Animated.View>

      {/* Title Section */}
      <Animated.View 
        entering={FadeInDown.delay(200)}
        className="px-6 mt-12"
      >
        <Animated.Text 
          entering={FadeInDown.delay(200)}
          className="text-4xl font-bold mb-4"
          style={{ color: theme.primary }}
        >
          Set your daily calorie goal
        </Animated.Text>
        
        <Animated.Text 
          entering={FadeInDown.delay(300)}
          className="text-gray-400 text-lg mb-8"
        >
          This helps us create your personalized meal plan
        </Animated.Text>
      </Animated.View>

      {/* Mode Selection */}
      <Animated.View 
        entering={FadeInDown.delay(300)}
        className="flex-row justify-center space-x-4 mt-12 px-6"
      >
        <TouchableOpacity
          onPress={() => setMode('manual')}
          className={`flex-1 h-14 rounded-2xl items-center justify-center ${
            mode === 'manual' ? '' : 'bg-[#25262B]'
          }`}
          style={mode === 'manual' ? { backgroundColor: theme.primary } : {}}
        >
          <Text className={mode === 'manual' ? 'text-[#1A1B1E]' : 'text-white'}>
            Manual
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setMode('auto')}
          className={`flex-1 h-14 rounded-2xl items-center justify-center ${
            mode === 'auto' ? '' : 'bg-[#25262B]'
          }`}
          style={mode === 'auto' ? { backgroundColor: theme.primary } : {}}
        >
          <Text className={mode === 'auto' ? 'text-[#1A1B1E]' : 'text-white'}>
            Auto Calculate
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {mode === 'manual' ? (
        <Animated.View 
          entering={FadeInDown.delay(400)}
          className="px-6 mt-12"
        >
          <View className="items-center mb-12">
            <View className="w-32 h-32 rounded-full items-center justify-center" style={{ backgroundColor: `${theme.primary}10` }}>
              <Flame size={48} color={theme.primary} />
              <Text className="text-2xl font-bold text-white mt-2">
                {calories}
              </Text>
              <Text className="text-gray-400">calories/day</Text>
            </View>
          </View>
          
          <Slider
            value={calories}
            onValueChange={value => setCalories(Math.round(value[0]))}
            minimumValue={1200}
            maximumValue={4000}
            step={50}
            minimumTrackTintColor={theme.primary}
            maximumTrackTintColor="#2C2D32"
            thumbTintColor={theme.primary}
          />
        </Animated.View>
      ) : (
        <Animated.View 
          entering={FadeInDown.delay(400)}
          className="px-6 mt-12 items-center"
        >
          <View className="w-32 h-32 rounded-full items-center justify-center mb-8" style={{ backgroundColor: `${theme.primary}10` }}>
            <Calculator size={48} color={theme.primary} />
          </View>
          <Text className="text-white text-center">
            We'll calculate your daily calorie needs based on your age, gender, weight, and activity level
          </Text>
        </Animated.View>
      )}

      {/* Continue Button */}
      <Animated.View 
        entering={FadeIn.delay(700)}
        className="px-6 mt-auto mb-6"
      >
        <TouchableOpacity
          onPress={() => router.push('/onboarding/goal')} // Changed from gender to goal
          className="w-full h-14 rounded-2xl items-center justify-center"
          style={{ backgroundColor: theme.primary }}
        >
          <Text className="text-[#1A1B1E] font-semibold text-lg">
            Continue
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}