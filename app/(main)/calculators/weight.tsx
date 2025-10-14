import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, MoreVertical, Camera, Plus } from 'lucide-react-native';
import { LineChart } from 'react-native-chart-kit';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function WeightTrackerPage() {
  const router = useRouter();
  const weightData = {
    labels: ['21 Feb', '28 May', '16 Jul', '19 Aug', '24 Aug', '25 Nov'],
    datasets: [{
      data: [56, 54, 59, 62, 65, 58],
      color: () => '#4ADE80',
      strokeWidth: 3
    }]
  };

  return (
    <SafeAreaView className="flex-1 bg-[#1A1B1E]">
      <Animated.View 
        entering={FadeInDown.springify()}
        className="flex-row items-center justify-between px-6 pt-4 pb-6"
      >
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-white">Weight</Text>
        <TouchableOpacity>
          <MoreVertical size={24} color="white" />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View 
        entering={FadeIn.delay(300).springify()}
        className="flex-row justify-between px-12 py-8"
      >
        <View>
          <Text className="text-sm font-medium text-gray-400">CURRENT</Text>
          <Text className="text-5xl font-bold text-[#4ADE80]">58<Text className="text-2xl">kg</Text></Text>
        </View>
        <View className="items-center justify-center">
          <View className="h-20 w-20 items-center justify-center rounded-full border-4 border-[#4ADE80]/30">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-[#4ADE80]/20">
              <Camera size={24} color="#4ADE80" />
            </View>
          </View>
        </View>
        <View>
          <Text className="text-sm font-medium text-gray-400">TARGET</Text>
          <Text className="text-5xl font-bold text-[#4ADE80]">64<Text className="text-2xl">kg</Text></Text>
        </View>
      </Animated.View>

      <Animated.View 
        entering={FadeInUp.delay(400).springify()}
        className="flex-1 rounded-t-[32px] bg-[#25262B] px-6 pt-6"
      >
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-white">My Progress</Text>
          <TouchableOpacity className="rounded-full bg-[#4ADE80]/10 px-6 py-2">
            <Text className="font-medium text-[#4ADE80]">Weekly</Text>
          </TouchableOpacity>
        </View>

        <View className="mt-6">
          <LineChart
            data={weightData}
            width={width - 48}
            height={220}
            chartConfig={{
              backgroundColor: '#25262B',
              backgroundGradientFrom: '#25262B',
              backgroundGradientTo: '#25262B',
              decimalPlaces: 0,
              color: () => '#4ADE80',
              labelColor: () => '#9CA3AF',
              style: {
                borderRadius: 16
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: '#4ADE80'
              }
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16
            }}
          />
        </View>

        {/* Timeline */}
        <View className="mt-6">
          <View className="flex-row items-center justify-between">
            <Text className="text-2xl font-bold text-white">Timeline</Text>
            <TouchableOpacity>
              <MoreVertical size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View className="mt-4 space-y-4">
            {[
              { weight: 58.7, date: '24 Feb 2023' },
              { weight: 60.2, date: '24 Feb 2023' }
            ].map((item, index) => (
              <View key={index} className="flex-row items-center space-x-4">
                <View className="h-3 w-3 rounded-full bg-[#4ADE80]" />
                <View className="flex-1 rounded-xl bg-[#2C2D32] p-4">
                  <Text className="text-2xl font-bold text-[#4ADE80]">
                    {item.weight}<Text className="text-lg">kg</Text>
                  </Text>
                  <Text className="text-sm text-gray-400">{item.date}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </Animated.View>

      <Animated.View 
        entering={FadeInUp.delay(500).springify()}
        className="absolute bottom-8 right-8"
      >
        <TouchableOpacity 
          className="h-16 w-16 items-center justify-center rounded-full bg-[#4ADE80] shadow-lg"
        >
          <Plus size={24} color="white" />
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}