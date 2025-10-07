import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Plus, Minus, GlassWater } from 'lucide-react-native';
import { CircularProgress } from '../../../components/CircularProgress';

const { width } = Dimensions.get('window');

const waterCups = [
  { id: 1, amount: 0.2, label: '200ml' },
  { id: 2, amount: 0.5, label: '500ml' },
  { id: 3, amount: 1.0, label: '1L' },
];

export default function WaterTrackerPage() {
  const router = useRouter();
  const [waterAmount, setWaterAmount] = useState(750);
  const [selectedAmount, setSelectedAmount] = useState(0.2); // Default to 200ml
  const [goal] = useState(2500);
  const progress = waterAmount / goal;

  const handleCupSelection = (amount) => {
    setSelectedAmount(amount);
  };

  const addWater = () => {
    setWaterAmount((prev) => Math.min(goal, prev + selectedAmount * 1000));
  };

  const removeWater = () => {
    setWaterAmount((prev) => Math.max(0, prev - selectedAmount * 1000));
  };

  return (
    <SafeAreaView className="flex-1 bg-[#1A1B1E]">
      {/* Header */}
      <View className="px-6 pt-4 pb-2 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text className="text-lg font-medium text-[#4ADE80] ml-4">HYDRATION</Text>
      </View>

      {/* Main Content */}
      <View className="flex-1 px-6 justify-center">
        {/* Water Intake Summary */}
        <View className="items-center">
          <Text className="text-3xl font-bold text-white text-center">
            You drank{' '}
            <Text className="text-[#4ADE80]">{waterAmount}ml</Text>
            {' '}of{' '}
            <Text className="text-gray-400">{goal}ml</Text>
          </Text>
          <Text className="text-gray-400 mt-2">
            {progress < 0.5
              ? 'Keep going!'
              : progress < 0.8
              ? 'Almost there!'
              : 'Great job!'}
          </Text>
        </View>

        {/* Progress Circle */}
        <View className="items-center py-8">
          <View className="relative">
            <CircularProgress
              size={width * 0.6}
              strokeWidth={16}
              progress={progress}
              colors={['#4ADE80', '#4ADE80', '#4ADE80']}
            />
            <View className="absolute inset-0 items-center justify-center">
              <Text className="text-4xl font-bold text-white">
                {Math.round(progress * 100)}%
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Add Buttons */}
        <View>
          <Text className="text-xl font-bold text-white mb-4 text-center">
            Quick Add
          </Text>
          <View className="flex-row justify-around">
            {waterCups.map((cup) => (
              <TouchableOpacity
                key={cup.id}
                onPress={() => handleCupSelection(cup.amount)}
                className={`h-16 w-16 items-center justify-center rounded-full ${
                  selectedAmount === cup.amount ? 'bg-[#4ADE80]' : 'bg-[#25262B]'
                }`}
              >
                <GlassWater size={24} color="white" />
                <Text className="text-white text-xs mt-1">{cup.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Bottom Controls */}
      <View className="bg-[#1A1B1E] px-6 pb-8 pt-4">
        <View className="flex-row justify-between items-center bg-[#25262B] p-4 rounded-2xl">
          <TouchableOpacity
            onPress={removeWater}
            className="h-12 w-12 items-center justify-center rounded-full bg-[#2C2D32]"
          >
            <Minus size={24} color="#4ADE80" />
          </TouchableOpacity>
          <View className="items-center">
            <Text className="text-white text-lg">
              Add {selectedAmount * 1000}ml
            </Text>
          </View>
          <TouchableOpacity
            onPress={addWater}
            className="h-12 w-12 items-center justify-center rounded-full bg-[#2C2D32]"
          >
            <Plus size={24} color="#4ADE80" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
