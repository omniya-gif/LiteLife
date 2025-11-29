import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Dimensions, TextInput, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, MoreVertical, Camera, Plus, AlertCircle } from 'lucide-react-native';
import { LineChart } from 'react-native-chart-kit';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useTheme } from '../../../hooks/useTheme';
import { useUserStore } from '../../../lib/store/userStore';
import { useAuth } from '../../../hooks/useAuth';
import {
  useHealthConnect,
  readWeightData,
  getCurrentWeight,
  writeWeightData,
} from '../../../hooks/useHealthConnect';

const { width } = Dimensions.get('window');

export default function WeightTrackerPage() {
  const router = useRouter();
  const theme = useTheme();
  const { user } = useAuth();
  const { onboarding, fetchUserData } = useUserStore();
  
  const [currentWeight, setCurrentWeight] = useState<number | null>(null);
  const [weightHistory, setWeightHistory] = useState<Array<{ weight: number; date: string }>>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [showAddWeight, setShowAddWeight] = useState(false);
  const [newWeight, setNewWeight] = useState('');

  // Health Connect setup for Weight
  const healthConnect = useHealthConnect([
    { accessType: 'read', recordType: 'Weight' },
    { accessType: 'write', recordType: 'Weight' },
  ]);

  // Fetch onboarding data (for target weight)
  useEffect(() => {
    if (user?.id && !onboarding) {
      fetchUserData(user.id);
    }
  }, [user?.id]);

  // Fetch weight data from Health Connect
  const fetchWeightData = async () => {
    if (Platform.OS !== 'android') return;
    
    if (!healthConnect.isAvailable || !healthConnect.isInitialized) {
      console.log('⚖️ Health Connect not available or not initialized');
      return;
    }

    try {
      setIsLoadingData(true);
      const now = new Date();
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(now.getMonth() - 6);

      // Fetch weight history
      const weights = await readWeightData(sixMonthsAgo.toISOString(), now.toISOString());
      
      // If no Google Fit data exists and we have onboarding current_weight, add it as initial entry
      if (weights.length === 0 && onboarding?.current_weight && onboarding?.updated_at) {
        console.log('⚖️ No Google Fit data found. Adding initial weight from onboarding:', onboarding.current_weight);
        try {
          // Use the onboarding update time as the initial weight entry timestamp
          const onboardingDate = new Date(onboarding.updated_at);
          await writeWeightData(onboarding.current_weight, onboardingDate);
          
          // Re-fetch to get the newly added weight
          const updatedWeights = await readWeightData(sixMonthsAgo.toISOString(), now.toISOString());
          setWeightHistory(updatedWeights);
          
          const current = await getCurrentWeight();
          setCurrentWeight(current);
          console.log('⚖️ Initial weight added successfully:', current);
        } catch (writeError) {
          console.error('⚖️ Error adding initial weight:', writeError);
          // If write fails, still show the onboarding weight
          setCurrentWeight(onboarding.current_weight);
        }
      } else {
        // Google Fit data exists, use it
        setWeightHistory(weights);
        const current = await getCurrentWeight();
        setCurrentWeight(current);
        console.log('⚖️ Weight data loaded from Google Fit:', { current, historyCount: weights.length });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (!errorMessage.includes('lacks the following permissions')) {
        console.error('⚖️ Error fetching weight data:', error);
        Alert.alert(
          'Error Loading Data',
          'Unable to load weight data. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setIsLoadingData(false);
    }
  };

  // Fetch data on mount and when permissions change
  useEffect(() => {
    if (Platform.OS === 'android' && 
        healthConnect.isAvailable && 
        healthConnect.isInitialized &&
        healthConnect.hasPermissions &&
        !healthConnect.isChecking) {
      fetchWeightData();
    }
  }, [healthConnect.isAvailable, healthConnect.isInitialized, healthConnect.hasPermissions, healthConnect.isChecking]);

  // Handle adding new weight
  const handleAddWeight = async () => {
    const weight = parseFloat(newWeight);
    
    if (isNaN(weight) || weight <= 0 || weight > 500) {
      Alert.alert('Invalid Weight', 'Please enter a valid weight between 1 and 500 kg');
      return;
    }

    try {
      // Write to Health Connect
      await writeWeightData(weight);
      
      // Refresh data
      await fetchWeightData();
      
      // Reset form
      setNewWeight('');
      setShowAddWeight(false);
      
      Alert.alert('Success', 'Weight added successfully!');
    } catch (error) {
      console.error('Error adding weight:', error);
      Alert.alert('Error', 'Failed to add weight. Please try again.');
    }
  };

  const targetWeight = onboarding?.target_weight || 0;
  
  // Prepare chart data
  const prepareChartData = () => {
    if (weightHistory.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{ data: [0], color: () => theme.primary, strokeWidth: 3 }],
      };
    }

    // Sort by date and take last 6 entries
    const sorted = [...weightHistory].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const recent = sorted.slice(-6);

    return {
      labels: recent.map(item => {
        const date = new Date(item.date);
        return `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}`;
      }),
      datasets: [{
        data: recent.map(item => item.weight),
        color: () => theme.primary,
        strokeWidth: 3,
      }],
    };
  };

  const chartData = prepareChartData();

  // Show loading while checking permissions
  if (Platform.OS === 'android' && healthConnect.isChecking) {
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
          <View style={{ width: 24 }} />
        </Animated.View>
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-400">Checking permissions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show permission request if Health Connect not available
  if (Platform.OS === 'android' && !healthConnect.isAvailable) {
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
          <View style={{ width: 24 }} />
        </Animated.View>
        <View className="flex-1 items-center justify-center px-6">
          <AlertCircle size={64} color={theme.primary} />
          <Text className="mt-6 text-center text-xl font-bold text-white">
            Health Connect Not Available
          </Text>
          <Text className="mt-2 text-center text-gray-400">
            Health Connect is required to track your weight
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

  // Show permission request if no permissions
  if (Platform.OS === 'android' && !healthConnect.hasPermissions) {
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
          <View style={{ width: 24 }} />
        </Animated.View>
        <View className="flex-1 items-center justify-center px-6">
          <AlertCircle size={64} color={theme.primary} />
          <Text className="mt-6 text-center text-xl font-bold text-white">
            Permission Required
          </Text>
          <Text className="mt-2 text-center text-gray-400">
            Grant access to track your weight progress
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
      </SafeAreaView>
    );
  }

  // Main content
  // Main content
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
        <TouchableOpacity onPress={() => setShowAddWeight(!showAddWeight)}>
          <Plus size={24} color={theme.primary} />
        </TouchableOpacity>
      </Animated.View>

      {/* Add Weight Input */}
      {showAddWeight && (
        <Animated.View 
          entering={FadeIn.duration(200)}
          className="mx-6 mb-4 rounded-2xl p-4"
          style={{ backgroundColor: theme.backgroundLight }}
        >
          <Text className="mb-2 text-lg font-semibold text-white">Add New Weight</Text>
          <View className="flex-row items-center space-x-3">
            <TextInput
              value={newWeight}
              onChangeText={setNewWeight}
              placeholder="Enter weight (kg)"
              placeholderTextColor="#666"
              keyboardType="decimal-pad"
              className="flex-1 rounded-xl px-4 py-3 text-white"
              style={{ backgroundColor: theme.backgroundDark }}
            />
            <TouchableOpacity
              onPress={handleAddWeight}
              className="rounded-xl px-6 py-3"
              style={{ backgroundColor: theme.primary }}
            >
              <Text className="font-semibold text-[#1A1B1E]">Add</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      <Animated.View 
        entering={FadeIn.delay(300).springify()}
        className="flex-row justify-between px-4 py-8"
      >
        <View className="flex-1 items-start">
          <Text className="text-sm font-medium text-gray-400">CURRENT</Text>
          <View className="flex-row items-end">
            <Text className="text-5xl font-bold" style={{ color: theme.primary }}>
              {currentWeight ? currentWeight.toFixed(1) : '--'}
            </Text>
            <Text className="mb-2 ml-1 text-2xl font-bold" style={{ color: theme.primary }}>kg</Text>
          </View>
          <Text className="mt-1 text-xs text-gray-500">
            {currentWeight ? 'From Health Connect' : 'No data'}
          </Text>
        </View>
        <View className="items-center justify-center px-2">
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
        <View className="flex-1 items-end">
          <Text className="text-sm font-medium text-gray-400">TARGET</Text>
          <View className="flex-row items-end">
            <Text className="text-5xl font-bold" style={{ color: theme.primary }}>
              {targetWeight ? targetWeight.toFixed(0) : '--'}
            </Text>
            <Text className="mb-2 ml-1 text-2xl font-bold" style={{ color: theme.primary }}>kg</Text>
          </View>
          <Text className="mt-1 text-xs text-gray-500">
            {targetWeight ? 'From your profile' : 'Set in profile'}
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
            <Text className="font-medium" style={{ color: theme.primary }}>Last 6</Text>
          </TouchableOpacity>
        </View>

        <View className="mt-6">
          <LineChart
            data={chartData}
            width={width - 48}
            height={220}
            chartConfig={{
              backgroundColor: theme.backgroundLight,
              backgroundGradientFrom: theme.backgroundLight,
              backgroundGradientTo: theme.backgroundLight,
              decimalPlaces: 1,
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
            <Text className="text-sm text-gray-400">
              {weightHistory.length} {weightHistory.length === 1 ? 'entry' : 'entries'}
            </Text>
          </View>

          <View className="mt-4 space-y-4">
            {weightHistory.length === 0 ? (
              <View className="items-center py-8">
                <Text className="text-gray-400">No weight history yet</Text>
                <Text className="mt-1 text-sm text-gray-500">Add your first weight entry above</Text>
              </View>
            ) : (
              weightHistory
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 10)
                .map((item, index) => {
                  const date = new Date(item.date);
                  const formattedDate = date.toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  });
                  
                  return (
                    <View key={index} className="flex-row items-center space-x-4">
                      <View className="h-3 w-3 rounded-full" style={{ backgroundColor: theme.primary }} />
                      <View className="flex-1 rounded-xl p-4" style={{ backgroundColor: theme.backgroundDark }}>
                        <Text className="text-2xl font-bold" style={{ color: theme.primary }}>
                          {item.weight.toFixed(1)}<Text className="text-lg">kg</Text>
                        </Text>
                        <Text className="text-sm text-gray-400">{formattedDate}</Text>
                      </View>
                    </View>
                  );
                })
            )}
          </View>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}