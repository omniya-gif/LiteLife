import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { CircularProgress } from '../../../components/CircularProgress';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { initialize, requestPermission, readRecords } from 'react-native-health-connect';
import { Platform } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';

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
      <Text className="text-lg text-white">{amount}</Text>
      <Text className="w-12 text-right text-lg text-white">{percentage}%</Text>
    </View>
  </Animated.View>
);

export default function CalorieTrackerPage() {
  const router = useRouter();
  const theme = useTheme();
  const [steps, setSteps] = useState(0);
  const [distance, setDistance] = useState(0);
  const [floors, setFloors] = useState(0);
  const [estimatedCalories, setEstimatedCalories] = useState(0);
  const [dailyGoal] = useState(2500);

  const percentage = Math.round((estimatedCalories / dailyGoal) * 100);

  useEffect(() => {
    const initializeHealthConnect = async () => {
      if (Platform.OS !== 'android') return;

      try {
        const isInitialized = await initialize();
        if (!isInitialized) return;

        const granted = await requestPermission([
          { accessType: 'read', recordType: 'Steps' },
          { accessType: 'read', recordType: 'Distance' },
          { accessType: 'read', recordType: 'FloorsClimbed' }
        ]);

        if (granted) {
          const now = new Date();
          const startOfDay = new Date(now.setHours(0, 0, 0, 0));
          const endOfDay = new Date(now.setHours(23, 59, 59, 999));

          const timeRangeFilter = {
            operator: 'between',
            startTime: startOfDay.toISOString(),
            endTime: endOfDay.toISOString(),
          };

          // Get steps
          const stepsRecords = await readRecords('Steps', { timeRangeFilter });
          const totalSteps = stepsRecords.reduce((sum, record) => sum + record.count, 0);
          setSteps(totalSteps);

          // Get distance
          const distanceRecords = await readRecords('Distance', { timeRangeFilter });
          const totalDistance = distanceRecords.reduce((sum, record) => 
            sum + record.distance.inMeters, 0);
          setDistance(totalDistance);

          // Get floors climbed
          const floorsRecords = await readRecords('FloorsClimbed', { timeRangeFilter });
          const totalFloors = floorsRecords.reduce((sum, record) => sum + record.floors, 0);
          setFloors(totalFloors);

          // Estimate calories based on activity
          // Rough estimation: 
          // - 0.04 calories per step
          // - 0.17 calories per meter
          // - 0.17 calories per floor climbed
          const estimatedCals = Math.round(
            (totalSteps * 0.04) + 
            (totalDistance * 0.17) + 
            (totalFloors * 0.17)
          );
          setEstimatedCalories(estimatedCals);

        }
      } catch (error) {
        console.error('Health Connect error:', error);
      }
    };

    initializeHealthConnect();
  }, []);

  const metrics = [
    { 
      name: 'Steps', 
      amount: steps.toLocaleString(), 
      percentage: Math.round((steps / 10000) * 100), 
      color: '#3B82F6' 
    },
    { 
      name: 'Distance', 
      amount: `${(distance / 1000).toFixed(2)} km`, 
      percentage: Math.round((distance / 5000) * 100), 
      color: theme.primary 
    },
    { 
      name: 'Floors', 
      amount: floors.toString(), 
      percentage: Math.round((floors / 10) * 100), 
      color: '#06B6D4' 
    }
  ];

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }}>
      {/* Header */}
      <Animated.View 
        entering={FadeInDown.springify()}
        className="flex-row items-center justify-between px-6 pt-4"
        style={{ backgroundColor: theme.backgroundLight }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => router.push('/journal')} 
          className="rounded-full px-6 py-2"
          style={{ backgroundColor: `${theme.primary}10` }}
        >
          <Text className="font-medium" style={{ color: theme.primary }}>Journal</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Daily Activity */}
      <Animated.View 
        entering={FadeIn.delay(300).springify()}
        className="px-6 pt-12"
      >
        <Text className="text-center text-lg font-medium" style={{ color: theme.primary }}>DAILY ACTIVITY</Text>
        <Text className="mt-4 text-center text-3xl font-bold text-white">
          Estimated calories burned{' '}
          <Text style={{ color: theme.primary }}>{estimatedCalories}</Text>
          <Text style={{ color: theme.primary }}> cal</Text>
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
            colors={['#3B82F6', theme.primary, '#06B6D4']}
          />
          <View className="absolute inset-0 items-center justify-center">
            <Text className="text-4xl font-bold text-white">{percentage}%</Text>
            <Text className="text-gray-500">of daily goal</Text>
          </View>
        </View>
      </Animated.View>

      {/* Metrics */}
      <View className="flex-1 px-6">
        {metrics.map((metric, index) => (
          <MacroRow key={index} {...metric} index={index} />
        ))}
      </View>

      {/* Add Activity Button */}
      <Animated.View 
        entering={FadeInUp.delay(600).springify()}
        className="p-6"
      >
        <TouchableOpacity 
          onPress={() => router.push('/journal')}
          className="w-full rounded-xl py-4"
          style={{ backgroundColor: theme.primary }}
        >
          <Text className="text-center text-lg font-semibold text-white">
            Add Manual Activity
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}