import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, AlertCircle } from 'lucide-react-native';
import { CircularProgress } from '../../../components/CircularProgress';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Platform } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { useUserStore } from '../../../lib/store/userStore';
import { 
  useHealthConnect, 
  readStepsData, 
  readDistanceData, 
  readFloorsData,
  readNutritionData
} from '../../../hooks/useHealthConnect';

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
  const onboarding = useUserStore((state) => state.onboarding);
  const [steps, setSteps] = useState(0);
  const [distance, setDistance] = useState(0);
  const [floors, setFloors] = useState(0);
  const [caloriesConsumed, setCaloriesConsumed] = useState(0);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Use calculated daily_calories from onboarding data
  const dailyGoal = onboarding?.daily_calories || 2000;
  const percentage = Math.round((caloriesConsumed / dailyGoal) * 100);

  // Debug logging to check onboarding data
  useEffect(() => {
    console.log('📊 CALORIE PAGE - onboarding:', onboarding);
    console.log('📊 CALORIE PAGE - daily_calories:', onboarding?.daily_calories);
    console.log('📊 CALORIE PAGE - dailyGoal being used:', dailyGoal);
  }, [onboarding, dailyGoal]);

  // Health Connect setup
  const healthConnect = useHealthConnect([
    { accessType: 'read', recordType: 'Steps' },
    { accessType: 'read', recordType: 'Distance' },
    { accessType: 'read', recordType: 'FloorsClimbed' },
    { accessType: 'read', recordType: 'Nutrition' },
  ]);

  const fetchHealthData = async () => {
    if (Platform.OS !== 'android') return;
    
    // Don't fetch if we don't have permissions yet
    if (!healthConnect.hasPermissions) {
      return;
    }

    try {
      setIsLoadingData(true);
      const now = new Date();
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      const endOfDay = new Date(now.setHours(23, 59, 59, 999));

      // Fetch all health data including nutrition (calories consumed)
      const [totalSteps, totalDistance, totalFloors, nutritionCalories] = await Promise.all([
        readStepsData(startOfDay.toISOString(), endOfDay.toISOString()),
        readDistanceData(startOfDay.toISOString(), endOfDay.toISOString()),
        readFloorsData(startOfDay.toISOString(), endOfDay.toISOString()),
        readNutritionData(startOfDay.toISOString(), endOfDay.toISOString()),
      ]);

      setSteps(totalSteps);
      setDistance(totalDistance);
      setFloors(totalFloors);
      
      // Use calories consumed from nutrition data (meals eaten)
      setCaloriesConsumed(nutritionCalories);
      console.log('🍽️ Setting calories consumed from Health Connect:', nutritionCalories);
    } catch (error) {
      // Only log and show alert if it's not a permission error
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (!errorMessage.includes('lacks the following permissions')) {
        console.error('Health Connect error:', error);
        Alert.alert(
          'Error Loading Data',
          'Unable to load health data. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    // Only fetch data when we have confirmed permissions
    if (Platform.OS === 'android' && 
        healthConnect.isAvailable && 
        healthConnect.isInitialized && 
        healthConnect.hasPermissions &&
        !healthConnect.isChecking) {
      fetchHealthData();
    }
  }, [healthConnect.isAvailable, healthConnect.isInitialized, healthConnect.hasPermissions, healthConnect.isChecking]);

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

  // Handle permission screen
  if (!healthConnect.isAvailable) {
    return (
      <SafeAreaView className="flex-1 bg-[#1A1B1E]">
        <View className="flex-1 items-center justify-center px-6">
          <AlertCircle size={64} color={theme.primary} />
          <Text className="mt-6 text-center text-xl font-bold text-white">
            Health Connect Not Available
          </Text>
          <Text className="mt-2 text-center text-gray-400">
            Health Connect is required to track your nutrition
          </Text>
          <TouchableOpacity
            onPress={healthConnect.installHealthConnect}
            className="mt-6 rounded-2xl px-8 py-4"
            style={{ backgroundColor: theme.primary }}
          >
            <Text className="text-lg font-semibold text-[#1A1B1E]">
              Install Health Connect
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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

      {/* Full Screen Permission State */}
      {Platform.OS === 'android' && !healthConnect.hasPermissions && (
        <View className="flex-1 items-center justify-center px-6">
          <AlertCircle size={64} color={theme.primary} />
          <Text className="mt-6 text-center text-xl font-bold text-white">
            Permission Required
          </Text>
          <Text className="mt-2 text-center text-gray-400">
            Grant access to track your daily nutrition and calories
          </Text>
          <TouchableOpacity
            onPress={healthConnect.requestHealthPermissions}
            className="mt-6 rounded-2xl px-8 py-4"
            style={{ backgroundColor: theme.primary }}
          >
            <Text className="text-lg font-semibold text-[#1A1B1E]">
              Grant Permission
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Main Content - Only show when permissions granted */}
      {Platform.OS === 'android' && healthConnect.hasPermissions && (
        <>
          {/* Daily Activity */}
          <Animated.View 
            entering={FadeIn.delay(300).springify()}
            className="px-6 pt-12"
          >
        <Text className="text-center text-lg font-medium" style={{ color: theme.primary }}>CALORIES CONSUMED</Text>
        <Text className="mt-4 text-center text-3xl font-bold text-white">
          <Text style={{ color: theme.primary }}>{caloriesConsumed}</Text>
          <Text className="text-gray-400"> / </Text>
          <Text className="text-gray-500">{dailyGoal}</Text>
          <Text style={{ color: theme.primary }}> cal</Text>
        </Text>
        <Text className="mt-2 text-center text-sm text-gray-400">
          {onboarding?.daily_calories 
            ? 'Based on your profile & fitness goal' 
            : 'Default goal (complete profile for personalized goal)'}
        </Text>
      </Animated.View>

      {/* Progress Circle */}
      <Animated.View 
        entering={FadeInUp.delay(400).springify()}
        className="items-center justify-center py-12"
      >
        <View className="relative" style={{ width: 240, height: 240 }}>
          <CircularProgress
            size={240}
            strokeWidth={24}
            progress={percentage / 100}
            colors={['#3B82F6', theme.primary, '#06B6D4']}
          />
          <View 
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
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
        </>
      )}
    </SafeAreaView>
  );
}