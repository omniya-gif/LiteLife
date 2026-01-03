import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Dimensions, TextInput, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, MoreVertical, Camera, Plus, AlertCircle } from 'lucide-react-native';
import { LineChart } from 'react-native-chart-kit';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useValue } from '@legendapp/state/react';
import { useTheme } from '../../../hooks/useTheme';
import { user$ } from '../../../lib/store/user';
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
  const onboarding = useValue(user$.onboarding);
  const fetchUserData = user$.fetchUserData;
  
  const [currentWeight, setCurrentWeight] = useState<number | null>(null);
  const [weightHistory, setWeightHistory] = useState<Array<{ weight: number; date: string }>>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [showAddWeight, setShowAddWeight] = useState(false);
  const [newWeight, setNewWeight] = useState('');

  // Health Connect setup for Weight (with write permission for marker-based auto-delete)
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

  // Handle permission request with marker check
  const handleRequestPermission = async () => {
    await healthConnect.requestHealthPermissions();
    
    // After permission granted, check marker for user switching detection
    if (user?.email && healthConnect.handleWeightPermissionGranted) {
      await healthConnect.handleWeightPermissionGranted(user.email);
    }
  };

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

      // Fetch weight history (filtered by current user)
      const weights = await readWeightData(sixMonthsAgo.toISOString(), now.toISOString(), user?.email);
      
      // Check if we need to sync onboarding weight with Health Connect
      if (onboarding?.current_weight && onboarding?.updated_at) {
        const onboardingDate = new Date(onboarding.updated_at);
        
        // Filter out any weights that are OLDER than the onboarding date
        // This removes outdated baseline weights from previous onboarding sessions
        const recentWeights = weights.filter(w => new Date(w.date) >= onboardingDate);
        
        // Check if onboarding weight already exists
        const hasOnboardingWeight = recentWeights.some(w => 
          Math.abs(w.weight - onboarding.current_weight) < 0.1 && 
          Math.abs(new Date(w.date).getTime() - onboardingDate.getTime()) < 5000
        );
        
        if (!hasOnboardingWeight) {
          console.log('⚖️ Adding onboarding weight to Health Connect:', onboarding.current_weight);
          try {
            await writeWeightData(onboarding.current_weight, user?.email, onboardingDate);
            
            // Re-fetch and filter again
            const allWeights = await readWeightData(sixMonthsAgo.toISOString(), now.toISOString(), user?.email);
            const filteredWeights = allWeights.filter(w => new Date(w.date) >= onboardingDate);
            
            setWeightHistory(filteredWeights);
            const current = await getCurrentWeight(user?.email);
            setCurrentWeight(current);
            console.log('⚖️ Onboarding weight added successfully:', current);
          } catch (writeError) {
            console.error('⚖️ Error adding onboarding weight:', writeError);
            setCurrentWeight(onboarding.current_weight);
          }
        } else {
          // Use filtered weight data (only from onboarding date forward)
          setWeightHistory(recentWeights);
          const current = await getCurrentWeight(user?.email);
          setCurrentWeight(current);
          console.log('⚖️ Weight data loaded for user:', { current, historyCount: recentWeights.length });
        }
      } else {
        // No onboarding data, just use Health Connect data
        setWeightHistory(weights);
        const current = await getCurrentWeight(user?.email);
        setCurrentWeight(current);
        console.log('⚖️ Weight data loaded for user:', { current, historyCount: weights.length });
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

  // Check marker and fetch data on load (detect user switching)
  useEffect(() => {
    const checkMarkerAndFetch = async () => {
      if (!user?.email) return;
      
      if (Platform.OS === 'android' && 
          healthConnect.isAvailable && 
          healthConnect.isInitialized &&
          healthConnect.hasPermissions &&
          !healthConnect.isChecking) {
        
        // Check marker on every load to detect user switching
        if (healthConnect.handleWeightPermissionGranted) {
          await healthConnect.handleWeightPermissionGranted(user.email);
        }
        
        fetchWeightData();
      }
    };
    
    checkMarkerAndFetch();
  }, [user?.email, healthConnect.isAvailable, healthConnect.isInitialized, healthConnect.hasPermissions, healthConnect.isChecking]);

  // Handle adding new weight
  const handleAddWeight = async () => {
    const weight = parseFloat(newWeight);
    
    if (isNaN(weight) || weight <= 0 || weight > 500) {
      Alert.alert('Invalid Weight', 'Please enter a valid weight between 1 and 500 kg');
      return;
    }

    try {
      // Write to Health Connect with user email for filtering
      await writeWeightData(weight, user?.email);
      
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
            onPress={handleRequestPermission}
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