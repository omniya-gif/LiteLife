import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Footprints, Heart, Clock, Navigation2, Activity, AlertCircle } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { readRecords } from 'react-native-health-connect';
import { format } from 'date-fns';
import { useHealthConnect } from '../../../../hooks/useHealthConnect';
import { useTheme } from '../../../../hooks/useTheme';

interface ActivityEntry {
  id: string;
  type: string;
  startTime: string;
  endTime: string;
  distance?: number;
  steps?: number;
  heartPoints?: number;
  calories?: number;
  pace?: number;
  moveMinutes?: number;
}

export default function JournalPage() {
  const router = useRouter();
  const theme = useTheme();
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Health Connect setup
  const healthConnect = useHealthConnect([
    { accessType: 'read', recordType: 'Steps' },
    { accessType: 'read', recordType: 'Distance' },
    { accessType: 'read', recordType: 'ExerciseRoute' },
    { accessType: 'read', recordType: 'TotalCaloriesBurned' },
    { accessType: 'read', recordType: 'Speed' }
  ]);

  useEffect(() => {
    if (Platform.OS === 'android' && 
        healthConnect.isAvailable && 
        healthConnect.isInitialized && 
        healthConnect.hasPermissions &&
        !healthConnect.isChecking) {
      fetchActivities();
    }
  }, [healthConnect.isAvailable, healthConnect.isInitialized, healthConnect.hasPermissions, healthConnect.isChecking]);

  const fetchActivities = async () => {
    if (Platform.OS !== 'android' || !healthConnect.hasPermissions) {
      return;
    }

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);

    const timeRangeFilter = {
      operator: 'between',
      startTime: startOfWeek.toISOString(),
      endTime: now.toISOString(),
    };

    try {
      setIsLoading(true);
      const [exerciseData, stepsData, distanceData, caloriesData] = await Promise.all([
        readRecords('ExerciseRoute', { timeRangeFilter }), // Changed from 'Exercise'
        readRecords('Steps', { timeRangeFilter }),
        readRecords('Distance', { timeRangeFilter }),
        readRecords('TotalCaloriesBurned', { timeRangeFilter })
      ]);

      // Process exercise records with ExerciseRoute structure
      const activities: ActivityEntry[] = exerciseData.map(record => {
        const duration = new Date(record.endTime).getTime() - new Date(record.startTime).getTime();
        const moveMinutes = Math.round(duration / 1000 / 60);
        
        return {
          id: record.startTime,
          type: record.route?.name || 'Exercise', // Updated to use route name
          startTime: record.startTime,
          endTime: record.endTime,
          moveMinutes,
          heartPoints: Math.round(moveMinutes * 2), // Simplified calculation
          calories: 0, // Will be updated with matching calorie record
          distance: 0, // Will be updated with matching distance record
          steps: 0 // Will be updated with matching steps record
        };
      });

      // Match and add calories data
      caloriesData.forEach(record => {
        const matchingActivity = activities.find(
          activity => activity.startTime === record.startTime
        );
        if (matchingActivity) {
          matchingActivity.calories = Math.round(record.energy.inKilocalories);
        }
      });

      // Match and add distance data
      distanceData.forEach(record => {
        const matchingActivity = activities.find(
          activity => activity.startTime === record.startTime
        );
        if (matchingActivity) {
          matchingActivity.distance = record.distance.inMeters / 1000; // Convert to km
          if (matchingActivity.moveMinutes) {
            matchingActivity.pace = matchingActivity.moveMinutes / matchingActivity.distance;
          }
        }
      });

      // Match and add steps data
      stepsData.forEach(record => {
        const matchingActivity = activities.find(
          activity => activity.startTime === record.startTime
        );
        if (matchingActivity) {
          matchingActivity.steps = record.count;
        }
      });

      // Sort by date descending
      activities.sort((a, b) => 
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      );

      setActivities(activities);
    } catch (error) {
      // Only log and show alert if it's not a permission error
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (!errorMessage.includes('lacks the following permissions')) {
        console.error('Error fetching activities:', error);
        Alert.alert(
          'Error Loading Activities',
          'Unable to load activity data. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (startTime: string, endTime: string) => {
    const duration = new Date(endTime).getTime() - new Date(startTime).getTime();
    const minutes = Math.round(duration / 1000 / 60);
    return `${minutes} min`;
  };

  const groupActivitiesByDate = () => {
    const grouped: { [key: string]: ActivityEntry[] } = {};
    
    activities.forEach(activity => {
      const date = format(new Date(activity.startTime), 'EEE, d MMM');
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(activity);
    });

    return grouped;
  };

  return (
    <SafeAreaView className="flex-1 bg-[#1A1B1E]">
      {/* Header */}
      <Animated.View 
        entering={FadeInDown.springify()}
        className="flex-row items-center justify-between px-6 pt-4 pb-6"
      >
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white">Activity Journal</Text>
        <View className="w-8" />
      </Animated.View>

      {/* Health Connect Status Banner */}
      {Platform.OS === 'android' && (!healthConnect.isAvailable || !healthConnect.hasPermissions) && (
        <Animated.View
          entering={FadeInDown.delay(200)}
          className="mx-6 mb-4 rounded-2xl p-4"
          style={{ backgroundColor: '#F59E0B20' }}>
          <View className="flex-row items-center">
            <AlertCircle size={24} color="#F59E0B" />
            <View className="ml-3 flex-1">
              <Text className="font-semibold text-white">
                {!healthConnect.isAvailable
                  ? 'Health Connect Not Installed'
                  : 'Permission Required'}
              </Text>
              <Text className="mt-1 text-xs text-gray-400">
                {!healthConnect.isAvailable
                  ? 'Install Health Connect to view your activities'
                  : 'Grant permission to read your activity data'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => {
              if (!healthConnect.isAvailable) {
                healthConnect.installHealthConnect();
              } else {
                healthConnect.requestHealthPermissions();
              }
            }}
            className="mt-3 rounded-xl py-2"
            style={{ backgroundColor: '#F59E0B' }}>
            <Text className="text-center font-medium text-white">
              {!healthConnect.isAvailable ? 'Install Now' : 'Grant Permission'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      <ScrollView className="flex-1">
        {Object.entries(groupActivitiesByDate()).map(([date, dayActivities], index) => (
          <View key={date} className="mb-6">
            <View className="flex-row items-center justify-between px-6 pb-2">
              <Text className="text-lg font-bold text-white">{date}</Text>
              <View className="flex-row items-center space-x-2">
                <Footprints size={16} color="#4ADE80" />
                <Text className="text-[#4ADE80]">
                  {dayActivities.reduce((sum, act) => sum + (act.steps || 0), 0)} steps
                </Text>
              </View>
            </View>

            {dayActivities.map((activity, actIndex) => (
              <Animated.View
                key={`${activity.id}-${actIndex}`}
                entering={FadeInDown.delay(index * 100 + actIndex * 50)}
                className="mx-6 mb-2 rounded-xl bg-[#25262B] p-4"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <View className="h-12 w-12 items-center justify-center rounded-full bg-[#4ADE80]/20">
                      <Footprints size={24} color="#4ADE80" />
                    </View>
                    <View className="ml-4">
                      <Text className="text-lg font-medium text-white">{activity.type}</Text>
                      <Text className="text-sm text-gray-400">
                        {format(new Date(activity.startTime), 'HH:mm')} • {formatDuration(activity.startTime, activity.endTime)}
                      </Text>
                    </View>
                  </View>
                  {activity.heartPoints && (
                    <View className="flex-row items-center">
                      <Heart size={16} color="#4ADE80" />
                      <Text className="ml-1 text-[#4ADE80]">{activity.heartPoints}</Text>
                    </View>
                  )}
                </View>

                <View className="mt-4 flex-row flex-wrap justify-between">
                  {activity.steps && (
                    <View className="mb-2 w-1/2">
                      <Text className="text-sm text-gray-400">Steps</Text>
                      <Text className="text-lg font-medium text-white">{activity.steps}</Text>
                    </View>
                  )}
                  {activity.distance && (
                    <View className="mb-2 w-1/2">
                      <Text className="text-sm text-gray-400">Distance</Text>
                      <Text className="text-lg font-medium text-white">
                        {activity.distance.toFixed(2)} km
                      </Text>
                    </View>
                  )}
                  {activity.calories && (
                    <View className="mb-2 w-1/2">
                      <Text className="text-sm text-gray-400">Calories</Text>
                      <Text className="text-lg font-medium text-white">
                        {activity.calories} cal
                      </Text>
                    </View>
                  )}
                  {activity.pace && (
                    <View className="mb-2 w-1/2">
                      <Text className="text-sm text-gray-400">Pace</Text>
                      <Text className="text-lg font-medium text-white">
                        {activity.pace.toFixed(2)} min/km
                      </Text>
                    </View>
                  )}
                </View>
              </Animated.View>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}