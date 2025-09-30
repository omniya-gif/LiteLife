import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Plus } from 'lucide-react-native';
import { WaveAnimation } from '../../../components/WaveAnimation';
import { CircularProgress } from '../../../components/CircularProgress';

const { width } = Dimensions.get('window');

export default function WaterTrackerPage() {
  const router = useRouter();
  const [waterLeft, setWaterLeft] = useState(2.7);
  const [goal] = useState(2932);
  const progress = 0.65; // Calculate based on waterLeft and goal

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 pt-4 pb-2">
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Wave Container */}
      <View className="relative" style={{ height: width }}>
        {/* Goal Display */}
        <View className="absolute top-8 left-0 right-0 z-10 items-center">
          <View className="rounded-xl bg-white/20 px-6 py-2">
            <Text className="text-xl font-bold text-white">
              Goal <Text className="text-2xl">2932</Text>
            </Text>
          </View>
        </View>

        {/* Circular Progress with Water Amount Display */}
        <View className="absolute left-0 right-0 top-1/4 z-10 items-center">
          <View className="relative items-center justify-center">
            <CircularProgress
              size={width * 0.6}
              strokeWidth={4}
              progress={progress}
            />
            <View className="absolute items-center">
              <Text className="text-5xl font-bold text-white">
                {waterLeft} L
              </Text>
              <Text className="mt-2 text-lg text-white/90">
                left to drink
              </Text>
            </View>
          </View>
        </View>

        {/* Wave Animation */}
        <WaveAnimation />
      </View>

      {/* Weather Section */}
      <View className="px-6 pt-8">
        <Text className="text-3xl font-bold text-gray-800">Weather</Text>
        <View className="mt-4 flex-row items-center space-x-4">
          <View className="h-16 w-16 items-center justify-center rounded-xl bg-[#0043F9]">
            <View className="h-6 w-8">
              <View className="mb-1 h-[2px] w-full bg-white" />
              <View className="mb-1 h-[2px] w-full bg-white" />
              <View className="h-[2px] w-full bg-white" />
            </View>
          </View>
          <View>
            <Text className="text-xl font-semibold text-gray-800">
              It's today!
            </Text>
            <Text className="text-base text-gray-600">
              Don't forget to take the water bottle with you.
            </Text>
          </View>
        </View>
      </View>

      {/* Add Water Button */}
      <View className="absolute bottom-8 right-8">
        <TouchableOpacity 
          onPress={() => setWaterLeft(prev => Math.max(0, prev - 0.2))}
          className="h-14 w-14 items-center justify-center rounded-xl bg-[#0043F9]"
        >
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}