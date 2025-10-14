import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { CircularProgress } from '../../../components/CircularProgress';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';

const MacroRow = ({ name, amount, percentage, color, index }) => (
  <Animated.View 
    entering={FadeInUp.delay(index * 200)}
    className="flex-row items-center justify-between border-b border-gray-100 py-4"
  >
    <View className="flex-row items-center space-x-3">
      <View className={`h-3 w-3 rounded-full`} style={{ backgroundColor: color }} />
      <Text className="text-lg font-medium text-white">{name}</Text>
    </View>
    <View className="flex-row items-center space-x-6">
      <Text className="text-lg text-white">{amount}g</Text>
      <Text className="w-12 text-right text-lg text-white">{percentage}%</Text>
    </View>
  </Animated.View>
);

export default function CalorieTrackerPage() {
  const router = useRouter();
  const [calories] = React.useState(500);
  const [dailyGoal] = React.useState(1250);
  const percentage = Math.round((calories / dailyGoal) * 100);

  const macros = [
    { name: 'Carbs', amount: 100, percentage: 32, color: '#3B82F6' },
    { name: 'Protein', amount: 100, percentage: 32, color: '#4ADE80' },
    { name: 'Fat', amount: 100, percentage: 32, color: '#06B6D4' }
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#1A1B1E]">
      {/* Header */}
      <Animated.View 
        entering={FadeInDown.springify()}
        className="flex-row items-center justify-between px-6 pt-4 bg-[#25262B]"
      >
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => router.push('/journal')} 
          className="rounded-full bg-[#4ADE80]/10 px-6 py-2"
        >
          <Text className="font-medium text-[#4ADE80]">Journal</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Daily Intake */}
      <Animated.View 
        entering={FadeIn.delay(300).springify()}
        className="px-6 pt-12"
      >
        <Text className="text-center text-lg font-medium text-[#4ADE80]">DAILY INTAKE</Text>
        <Text className="mt-4 text-center text-3xl font-bold text-white">
          Today you have consumed{' '}
          <Text className="text-[#4ADE80]">{calories}</Text>
          <Text className="text-[#4ADE80]"> cal</Text>
        </Text>
      </Animated.View>

      {/* Progress Circle */}
      <Animated.View 
        entering={FadeInUp.delay(400).springify()}
        className="items-center justify-center py-12"
      >
        <View className="relative">
          <CircularProgress
            size={240}
            strokeWidth={24}
            progress={percentage / 100}
            colors={['#3B82F6', '#4ADE80', '#06B6D4']}
          />
          <View className="absolute inset-0 items-center justify-center">
            <Text className="text-4xl font-bold text-white">{percentage}%</Text>
            <Text className="text-gray-500">of daily goal</Text>
          </View>
        </View>
      </Animated.View>

      {/* Macros */}
      <View className="flex-1 px-6">
        {macros.map((macro, index) => (
          <MacroRow key={index} {...macro} index={index} />
        ))}
      </View>

      {/* Add Meal Button */}
      <Animated.View 
        entering={FadeInUp.delay(600).springify()}
        className="p-6"
      >
        <TouchableOpacity className="w-full rounded-xl bg-[#4ADE80] py-4">
          <Text className="text-center text-lg font-semibold text-white">Add Meal</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}