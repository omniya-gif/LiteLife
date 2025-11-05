import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, MoreVertical, Camera, Plus } from 'lucide-react-native';
import { LineChart } from 'react-native-chart-kit';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useTheme } from '../../../hooks/useTheme';

const { width } = Dimensions.get('window');

export default function WeightTrackerPage() {
  const router = useRouter();
  const theme = useTheme();
  const weightData = {
    labels: ['21 Feb', '28 May', '16 Jul', '19 Aug', '24 Aug', '25 Nov'],
    datasets: [{
      data: [56, 54, 59, 62, 65, 58],
      color: () => theme.primary,
      strokeWidth: 3
    }]
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }}>
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
          <Text className="text-5xl font-bold" style={{ color: theme.primary }}>
            58<Text className="text-2xl">kg</Text>
          </Text>
        </View>
        <View className="items-center justify-center">
          <View 
            className="h-20 w-20 items-center justify-center rounded-full border-4"
            style={{ borderColor: `${theme.primary}30` }}
          >
            <View 
              className="h-16 w-16 items-center justify-center rounded-full"
              style={{ backgroundColor: `${theme.primary}20` }}
            >
              <Camera size={24} color={theme.primary} />
            </View>
          </View>
        </View>
        <View>
          <Text className="text-sm font-medium text-gray-400">TARGET</Text>
          <Text className="text-5xl font-bold" style={{ color: theme.primary }}>
            64<Text className="text-2xl">kg</Text>
          </Text>
        </View>
      </Animated.View>

      <Animated.View 
        entering={FadeInUp.delay(400).springify()}
        className="flex-1 rounded-t-[32px] px-6 pt-6"
        style={{ backgroundColor: theme.backgroundLight }}
      >
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-white">My Progress</Text>
          <TouchableOpacity className="rounded-full px-6 py-2" style={{ backgroundColor: `${theme.primary}10` }}>
            <Text className="font-medium" style={{ color: theme.primary }}>Weekly</Text>
          </TouchableOpacity>
        </View>

        <View className="mt-6">
          <LineChart
            data={weightData}
            width={width - 48}
            height={220}
            chartConfig={{
              backgroundColor: theme.backgroundLight,
              backgroundGradientFrom: theme.backgroundLight,
              backgroundGradientTo: theme.backgroundLight,
              decimalPlaces: 0,
              color: () => theme.primary,
              labelColor: () => '#9CA3AF',
              style: {
                borderRadius: 16
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: theme.primary
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
                <View className="h-3 w-3 rounded-full" style={{ backgroundColor: theme.primary }} />
                <View className="flex-1 rounded-xl p-4" style={{ backgroundColor: theme.backgroundDark }}>
                  <Text className="text-2xl font-bold" style={{ color: theme.primary }}>
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
          className="h-16 w-16 items-center justify-center rounded-full shadow-lg"
          style={{ backgroundColor: theme.primary }}
        >
          <Plus size={24} color="white" />
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}