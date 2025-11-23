import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Droplets, Plus, TrendingUp } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useTheme } from '../../../hooks/useTheme';
import { useHealthConnect, readHydrationData } from '../../../hooks/useHealthConnect';
import { useUserStore } from '../../../stores/userStore';

export default function HydrationTracker() {
  const router = useRouter();
  const theme = useTheme();
  const { onboarding } = useUserStore();
  const [waterConsumed, setWaterConsumed] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const healthConnect = useHealthConnect([
    { accessType: 'read', recordType: 'Hydration' },
    { accessType: 'write', recordType: 'Hydration' },
  ]);

  useEffect(() => {
    const fetchHydration = async () => {
      if (!healthConnect.hasPermissions) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        const water = await readHydrationData(
          startOfDay.toISOString(),
          endOfDay.toISOString()
        );
        console.log('💧 Setting water consumed from Health Connect:', water);
        setWaterConsumed(water);
      } catch (error) {
        console.error('Error fetching hydration:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHydration();
  }, [healthConnect.hasPermissions]);

  const waterGoal = onboarding?.water_target || 2000;
  const percentage = Math.min((waterConsumed / waterGoal) * 100, 100);
  const glassesConsumed = Math.floor(waterConsumed / 250); // 250ml per glass
  const totalGlasses = Math.ceil(waterGoal / 250);

  const handleRequestPermission = async () => {
    const granted = await healthConnect.requestHealthPermissions();
    if (granted) {
      // Reload data after permission granted
      window.location.reload();
    }
  };

  if (!healthConnect.isAvailable) {
    return (
      <SafeAreaView className="flex-1 bg-[#1A1B1E]">
        <View className="flex-1 items-center justify-center px-6">
          <Droplets size={64} color={theme.primary} />
          <Text className="mt-6 text-center text-xl font-bold text-white">
            Health Connect Not Available
          </Text>
          <Text className="mt-2 text-center text-gray-400">
            Health Connect is required to track your hydration
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#1A1B1E]">
      {/* Header */}
      <Animated.View 
        entering={FadeInDown.springify()}
        className="flex-row items-center justify-between px-6 pt-4"
      >
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-white">Hydration Tracker</Text>
        <View style={{ width: 24 }} />
      </Animated.View>

      <View className="flex-1 px-6 pt-8">
        {!healthConnect.hasPermissions ? (
          <View className="flex-1 items-center justify-center">
            <Droplets size={64} color={theme.primary} />
            <Text className="mt-6 text-center text-xl font-bold text-white">
              Permission Required
            </Text>
            <Text className="mt-2 text-center text-gray-400">
              Grant access to track your daily water intake
            </Text>
            <TouchableOpacity
              onPress={handleRequestPermission}
              className="mt-6 rounded-2xl px-8 py-4"
              style={{ backgroundColor: theme.primary }}
            >
              <Text className="text-lg font-semibold text-[#1A1B1E]">
                Grant Permission
              </Text>
            </TouchableOpacity>
          </View>
        ) : isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={theme.primary} />
            <Text className="mt-4 text-gray-400">Loading hydration data...</Text>
          </View>
        ) : (
          <>
            {/* Main Card */}
            <Animated.View 
              entering={FadeInDown.delay(200)}
              className="overflow-hidden rounded-3xl"
              style={{ backgroundColor: `${theme.primary}08` }}
            >
              <View className="p-8">
                {/* Water Drop Icon */}
                <View className="items-center">
                  <View 
                    className="mb-6 h-32 w-32 items-center justify-center rounded-full"
                    style={{ backgroundColor: theme.primary }}
                  >
                    <Droplets size={64} color="white" />
                  </View>
                </View>

                {/* Water Consumed */}
                <View className="items-center">
                  <Text className="text-6xl font-bold" style={{ color: theme.primary }}>
                    {waterConsumed}
                  </Text>
                  <Text className="mt-2 text-2xl text-gray-400">/ {waterGoal} ml</Text>
                  <Text className="mt-4 text-lg text-gray-400">
                    {(waterConsumed / 1000).toFixed(1)}L / {(waterGoal / 1000).toFixed(1)}L
                  </Text>
                </View>

                {/* Progress Bar */}
                <View className="mt-8 h-4 overflow-hidden rounded-full bg-[#2C2D32]">
                  <View 
                    className="h-full rounded-full"
                    style={{ 
                      width: `${percentage}%`,
                      backgroundColor: theme.primary
                    }}
                  />
                </View>

                {/* Percentage & Status */}
                <View className="mt-6 items-center">
                  <Text className="text-3xl font-bold text-white">
                    {Math.round(percentage)}%
                  </Text>
                  <Text className="mt-2 text-sm text-gray-400">of daily goal</Text>
                </View>
              </View>

              {/* Stats Row */}
              <View className="flex-row border-t" style={{ borderTopColor: `${theme.primary}15` }}>
                <View className="flex-1 items-center border-r py-5" style={{ borderRightColor: `${theme.primary}15` }}>
                  <Text className="text-2xl font-bold" style={{ color: theme.primary }}>
                    {glassesConsumed}
                  </Text>
                  <Text className="mt-1 text-xs text-gray-500">Glasses</Text>
                  <Text className="text-xs text-gray-600">({glassesConsumed}/{totalGlasses})</Text>
                </View>
                <View className="flex-1 items-center border-r py-5" style={{ borderRightColor: `${theme.primary}15` }}>
                  <Text className="text-2xl font-bold text-white">
                    {waterGoal - waterConsumed > 0 ? waterGoal - waterConsumed : 0}
                  </Text>
                  <Text className="mt-1 text-xs text-gray-500">ml Left</Text>
                </View>
                <View className="flex-1 items-center py-5">
                  <Text className="text-2xl font-bold" style={{ color: theme.primary }}>
                    {percentage >= 100 ? '🎉' : '💧'}
                  </Text>
                  <Text className="mt-1 text-xs text-gray-500">
                    {percentage >= 100 ? 'Goal Met!' : 'Keep Going'}
                  </Text>
                </View>
              </View>
            </Animated.View>

            {/* Quick Add Buttons */}
            <Animated.View 
              entering={FadeInDown.delay(400)}
              className="mt-6"
            >
              <Text className="mb-4 text-lg font-semibold text-white">Quick Add</Text>
              <View className="flex-row space-x-3">
                {[250, 500, 750, 1000].map((amount) => (
                  <TouchableOpacity
                    key={amount}
                    onPress={() => {
                      // TODO: Implement quick add to Health Connect
                      Alert.alert('Coming Soon', `Add ${amount}ml water tracking`);
                    }}
                    className="flex-1 items-center rounded-2xl bg-[#2C2D32] py-4"
                  >
                    <Plus size={20} color={theme.primary} />
                    <Text className="mt-2 font-semibold text-white">{amount}ml</Text>
                    <Text className="text-xs text-gray-400">{amount / 1000}L</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>

            {/* Tips Card */}
            <Animated.View 
              entering={FadeInDown.delay(600)}
              className="mt-6 rounded-2xl bg-[#25262B] p-5"
            >
              <View className="flex-row items-center space-x-2">
                <TrendingUp size={20} color={theme.primary} />
                <Text className="text-base font-semibold text-white">Hydration Tip</Text>
              </View>
              <Text className="mt-2 leading-6 text-sm text-gray-400">
                {percentage < 50
                  ? "You're behind on your hydration goal! Drink water regularly throughout the day."
                  : percentage < 80
                  ? "Great progress! Keep sipping water to reach your daily goal."
                  : percentage >= 100
                  ? "Excellent! You've met your hydration goal today. Stay consistent! 💪"
                  : "Almost there! A few more glasses and you'll hit your target."}
              </Text>
            </Animated.View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
