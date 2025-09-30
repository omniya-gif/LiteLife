import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { CircularProgress } from '../../../components/CircularProgress';

const MacroRow = ({ name, amount, percentage, color }) => (
  <View className="flex-row items-center justify-between border-b border-gray-100 py-4">
    <View className="flex-row items-center space-x-3">
      <View className={`h-3 w-3 rounded-full`} style={{ backgroundColor: color }} />
      <Text className="text-lg font-medium text-gray-800">{name}</Text>
    </View>
    <View className="flex-row items-center space-x-6">
      <Text className="text-lg text-gray-600">{amount}g</Text>
      <Text className="w-12 text-right text-lg text-gray-600">{percentage}%</Text>
    </View>
  </View>
);

export default function CalorieTrackerPage() {
  const router = useRouter();
  const [calories] = React.useState(500);
  const [dailyGoal] = React.useState(1250);
  const percentage = Math.round((calories / dailyGoal) * 100);

  const macros = [
    { name: 'Carbs', amount: 100, percentage: 32, color: '#3B82F6' },
    { name: 'Protein', amount: 100, percentage: 32, color: '#7C3AED' },
    { name: 'Fat', amount: 100, percentage: 32, color: '#06B6D4' }
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-4">
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity className="rounded-full bg-[#7C3AED]/10 px-6 py-2">
          <Text className="font-medium text-[#7C3AED]">Journal</Text>
        </TouchableOpacity>
      </View>

      {/* Daily Intake */}
      <View className="px-6 pt-12">
        <Text className="text-center text-lg font-medium text-[#7C3AED]">DAILY INTAKE</Text>
        <Text className="mt-4 text-center text-3xl font-bold text-gray-900">
          Today you have consumed{' '}
          <Text className="text-[#7C3AED]">{calories}</Text>
          <Text className="text-[#7C3AED]"> cal</Text>
        </Text>
      </View>

      {/* Progress Circle */}
      <View className="items-center justify-center py-12">
        <View className="relative">
          <CircularProgress
            size={240}
            strokeWidth={24}
            progress={percentage / 100}
            colors={['#3B82F6', '#7C3AED', '#06B6D4']}
          />
          <View className="absolute inset-0 items-center justify-center">
            <Text className="text-4xl font-bold text-gray-900">{percentage}%</Text>
            <Text className="text-gray-500">of daily goal</Text>
          </View>
        </View>
      </View>

      {/* Macros */}
      <View className="flex-1 px-6">
        {macros.map((macro, index) => (
          <MacroRow key={index} {...macro} />
        ))}
      </View>

      {/* Add Meal Button */}
      <View className="p-6">
        <TouchableOpacity className="w-full rounded-xl bg-[#7C3AED] py-4">
          <Text className="text-center text-lg font-semibold text-white">Add Meal</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}