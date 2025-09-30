import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, MoreVertical, Camera, Plus } from 'lucide-react-native';
import { LineChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

export default function WeightTrackerPage() {
  const router = useRouter();
  const weightData = {
    labels: ['21 Feb', '28 May', '16 Jul', '19 Aug', '24 Aug', '25 Nov'],
    datasets: [{
      data: [56, 54, 59, 62, 65, 58],
      color: () => '#7C3AED',
      strokeWidth: 3
    }]
  };

  return (
    <SafeAreaView className="flex-1 bg-[#7C3AED]">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-4 pb-6">
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-white">Weight</Text>
        <TouchableOpacity>
          <MoreVertical size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Weight Stats */}
      <View className="flex-row justify-between px-12 py-8">
        <View>
          <Text className="text-sm font-medium text-white/80">CURRENT</Text>
          <Text className="text-5xl font-bold text-white">58<Text className="text-2xl">kg</Text></Text>
        </View>
        <View className="items-center justify-center">
          <View className="h-20 w-20 items-center justify-center rounded-full border-4 border-white/30">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-white/20">
              <Camera size={24} color="white" />
            </View>
          </View>
        </View>
        <View>
          <Text className="text-sm font-medium text-white/80">TARGET</Text>
          <Text className="text-5xl font-bold text-white">64<Text className="text-2xl">kg</Text></Text>
        </View>
      </View>

      {/* Chart Section */}
      <View className="flex-1 rounded-t-[32px] bg-white px-6 pt-6">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-gray-800">My Progress</Text>
          <TouchableOpacity className="rounded-full bg-[#7C3AED]/10 px-6 py-2">
            <Text className="font-medium text-[#7C3AED]">Weekly</Text>
          </TouchableOpacity>
        </View>

        <View className="mt-6">
          <LineChart
            data={weightData}
            width={width - 48}
            height={220}
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 0,
              color: () => '#7C3AED',
              labelColor: () => '#9CA3AF',
              style: {
                borderRadius: 16
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: '#7C3AED'
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
            <Text className="text-2xl font-bold text-gray-800">Timeline</Text>
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
                <View className="h-3 w-3 rounded-full bg-[#7C3AED]" />
                <View className="flex-1 rounded-xl bg-gray-50 p-4">
                  <Text className="text-2xl font-bold text-[#7C3AED]">
                    {item.weight}<Text className="text-lg">kg</Text>
                  </Text>
                  <Text className="text-sm text-[#7C3AED]">{item.date}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Add Weight Button */}
      <TouchableOpacity 
        className="absolute bottom-8 right-8 h-16 w-16 items-center justify-center rounded-full bg-[#7C3AED] shadow-lg"
      >
        <Plus size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}