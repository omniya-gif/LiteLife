import { useRouter } from 'expo-router';
import { ArrowLeft, Footprints } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';

import { useHealthConnect, readStepsData } from '../../../hooks/useHealthConnect';
import { useTheme } from '../../../hooks/useTheme';

const { width } = Dimensions.get('window');

type ViewMode = 'DAY' | 'WEEK' | 'MONTH';

export default function StepsHistory() {
  const router = useRouter();
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState<ViewMode>('WEEK');
  const [steps, setSteps] = useState(0);

  const healthConnect = useHealthConnect([
    { accessType: 'read', recordType: 'Steps' },
  ]);

  useEffect(() => {
    const fetchSteps = async () => {
      if (!healthConnect.hasPermissions) return;

      try {
        const now = new Date();
        const startOfDay = new Date(now.setHours(0, 0, 0, 0));
        const endOfDay = new Date(now.setHours(23, 59, 59, 999));

        const totalSteps = await readStepsData(startOfDay.toISOString(), endOfDay.toISOString());
        setSteps(totalSteps);
      } catch (error) {
        console.error('Error fetching steps:', error);
      }
    };

    fetchSteps();
  }, [healthConnect.hasPermissions]);

  // Sample data for the line chart
  const data = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [6000, 7500, 5000, 8000, steps, 0, 0],
        color: () => theme.primary,
        strokeWidth: 2
      },
      {
        data: [5000, 6500, 4000, 7000, steps - 1000, 0, 0],
        color: () => theme.primaryDark,
        strokeWidth: 2
      }
    ]
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }}>
      <Animated.View
        entering={FadeInDown.springify()}
        className="flex-row items-center justify-between px-6 pt-4 pb-6">
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-white">Steps Insights</Text>
        <View style={{ width: 24 }} />
      </Animated.View>

      <View className="flex-1 px-6">
        {/* Tab Selector */}
        <View className="flex-row justify-between mb-6">
          {(['DAY', 'WEEK', 'MONTH'] as ViewMode[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              className="flex-1 mx-1 rounded-xl py-3"
              style={{ backgroundColor: activeTab === tab ? theme.primary : theme.backgroundLight }}
            >
              <Text className={`text-center font-semibold ${activeTab === tab ? 'text-[#1A1B1E]' : 'text-white'}`}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Chart */}
        <Animated.View
          entering={FadeIn.delay(300)}
          className="rounded-2xl p-4"
          style={{ backgroundColor: theme.backgroundLight }}
        >
          <LineChart
            data={data}
            width={width - 80}
            height={220}
            chartConfig={{
              backgroundColor: theme.backgroundLight,
              backgroundGradientFrom: theme.backgroundLight,
              backgroundGradientTo: theme.backgroundLight,
              decimalPlaces: 0,
              color: () => theme.primary,
              labelColor: () => '#9CA3AF',
              style: { borderRadius: 16 },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: theme.primary
              }
            }}
            bezier
            style={{
              borderRadius: 16
            }}
          />
        </Animated.View>

        {/* Summary Stats */}
        <Animated.View
          entering={FadeIn.delay(500)}
          className="mt-6 rounded-2xl p-6"
          style={{ backgroundColor: theme.backgroundLight }}
        >
          <View className="flex-row items-center mb-4">
            <Footprints size={24} color={theme.primary} />
            <Text className="ml-3 text-xl font-bold text-white">Weekly Summary</Text>
          </View>
          
          <View className="flex-row justify-between mb-3">
            <Text className="text-gray-400">Average Daily Steps</Text>
            <Text className="font-semibold text-white">{Math.round(steps / 7).toLocaleString()}</Text>
          </View>
          
          <View className="flex-row justify-between mb-3">
            <Text className="text-gray-400">Total Steps</Text>
            <Text className="font-semibold text-white">{steps.toLocaleString()}</Text>
          </View>
          
          <View className="flex-row justify-between">
            <Text className="text-gray-400">Goal Achievement</Text>
            <Text className="font-semibold" style={{ color: theme.primary }}>
              {Math.round((steps / 70000) * 100)}%
            </Text>
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
