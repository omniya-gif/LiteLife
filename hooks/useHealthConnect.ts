import { useState, useEffect } from 'react';
import { Platform, Alert, Linking } from 'react-native';
import {
  initialize,
  requestPermission,
  getSdkStatus,
  SdkAvailabilityStatus,
  openHealthConnectSettings,
  getGrantedPermissions,
  readRecords,
} from 'react-native-health-connect';

export interface HealthConnectPermission {
  accessType: 'read' | 'write';
  recordType: string;
}

export interface HealthConnectState {
  isAvailable: boolean;
  isInitialized: boolean;
  hasPermissions: boolean;
  isChecking: boolean;
  error: string | null;
}

export const useHealthConnect = (requiredPermissions: HealthConnectPermission[]) => {
  const [state, setState] = useState<HealthConnectState>({
    isAvailable: false,
    isInitialized: false,
    hasPermissions: false,
    isChecking: true,
    error: null,
  });

  useEffect(() => {
    if (Platform.OS === 'android') {
      checkHealthConnectStatus();
    } else {
      setState({
        isAvailable: false,
        isInitialized: false,
        hasPermissions: false,
        isChecking: false,
        error: 'Health Connect is only available on Android',
      });
    }
  }, []);

  const checkHealthConnectStatus = async () => {
    try {
      setState((prev) => ({ ...prev, isChecking: true, error: null }));

      // Check SDK availability
      const status = await getSdkStatus();
      console.log('🏥 Health Connect SDK Status:', status);

      if (status === SdkAvailabilityStatus.SDK_UNAVAILABLE) {
        console.log('❌ Health Connect is NOT AVAILABLE on this device');
        setState({
          isAvailable: false,
          isInitialized: false,
          hasPermissions: false,
          isChecking: false,
          error: 'Health Connect is not installed',
        });
        return;
      }

      if (status === SdkAvailabilityStatus.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED) {
        setState({
          isAvailable: false,
          isInitialized: false,
          hasPermissions: false,
          isChecking: false,
          error: 'Health Connect needs to be updated',
        });
        return;
      }

      // Initialize Health Connect
      const isInitialized = await initialize();
      if (!isInitialized) {
        setState({
          isAvailable: true,
          isInitialized: false,
          hasPermissions: false,
          isChecking: false,
          error: 'Failed to initialize Health Connect',
        });
        return;
      }

      // Check granted permissions
      const grantedPermissions = await getGrantedPermissions();
      console.log('✅ Health Connect initialized successfully');
      console.log('📋 Granted permissions:', grantedPermissions);
      console.log('📋 Required permissions:', requiredPermissions);

      const hasAllPermissions = requiredPermissions.every((required) =>
        grantedPermissions.some(
          (granted) =>
            granted.accessType === required.accessType && granted.recordType === required.recordType
        )
      );

      console.log('🔐 Has all permissions:', hasAllPermissions);

      setState({
        isAvailable: true,
        isInitialized: true,
        hasPermissions: hasAllPermissions,
        isChecking: false,
        error: null,
      });
    } catch (error) {
      console.error('❌ Health Connect status check error:', error);
      setState({
        isAvailable: false,
        isInitialized: false,
        hasPermissions: false,
        isChecking: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const requestHealthPermissions = async (forceDialog: boolean = true): Promise<boolean> => {
    try {
      console.log('🔓 Requesting Health Connect permissions...');
      console.log('📋 Permissions to request:', requiredPermissions);
      console.log('🎯 Force dialog mode:', forceDialog);

      if (!state.isInitialized) {
        console.log('⚠️ Health Connect not initialized, initializing now...');
        const isInitialized = await initialize();
        if (!isInitialized) {
          console.log('❌ Failed to initialize Health Connect');
          Alert.alert(
            'Health Connect Error',
            'Failed to initialize Health Connect. Please try again.'
          );
          return false;
        }
        console.log('✅ Health Connect initialized');
      }

      // Force show permission dialog by requesting permissions directly
      console.log('🚀 Triggering permission dialog...');
      const granted = await requestPermission(requiredPermissions as any);
      console.log('🔐 Permission request result:', granted);
      console.log('🔐 Result type:', typeof granted, 'Is array:', Array.isArray(granted));

      // Always re-check status after permission request
      await checkHealthConnectStatus();

      // Check if any permissions were actually granted
      const hasGrantedPermissions = Array.isArray(granted) && granted.length > 0;

      if (hasGrantedPermissions) {
        console.log('✅ Permissions granted!', granted);
        return true;
      } else {
        console.log('⚠️ Permission dialog not shown or dismissed - likely blocked/denied');

        // If no dialog appeared (empty result), guide user to Health Connect settings
        Alert.alert(
          'Health Connect Permissions',
          'LiteLife needs access to your fitness data through Health Connect.\n\nSince the permission dialog cannot be shown automatically, please:\n\n1. Open Health Connect settings\n2. Search for "LiteLife" or find it in the apps list\n3. Enable the fitness permissions you want to share',
          [
            {
              text: 'Open Health Connect',
              onPress: () => {
                try {
                  openHealthConnectSettings();
                } catch (error) {
                  console.error('❌ Failed to open settings:', error);
                  Alert.alert(
                    'Cannot Open Settings',
                    'Please manually open the Health Connect app from your device and look for LiteLife in the connected apps section.',
                    [{ text: 'OK' }]
                  );
                }
              },
            },
            {
              text: 'Cancel',
              style: 'cancel',
            },
          ]
        );
        return false;
      }
    } catch (error) {
      console.error('Health Connect permission request error:', error);

      // Always show the permission dialog option first
      Alert.alert(
        'Health Connect Permissions',
        'Would you like to grant Health Connect permissions to sync your fitness data?',
        [
          {
            text: 'Grant Permissions',
            onPress: async () => {
              try {
                // Try requesting permissions again
                await requestPermission(requiredPermissions);
                await checkHealthConnectStatus();
              } catch (retryError) {
                console.log('🔧 Fallback to settings after retry failed');
                openHealthConnectSettings();
              }
            },
          },
          {
            text: 'Open Settings',
            onPress: () => openHealthConnectSettings(),
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
      return false;
    }
  };

  const installHealthConnect = () => {
    Alert.alert(
      'Health Connect Required',
      'Health Connect is required to track your fitness data. Would you like to install it?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Install',
          onPress: () => {
            const url =
              'https://play.google.com/store/apps/details?id=com.google.android.apps.healthdata';
            Linking.openURL(url);
          },
        },
      ]
    );
  };

  const updateHealthConnect = () => {
    Alert.alert('Update Required', 'Health Connect needs to be updated to the latest version.', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Update',
        onPress: () => {
          const url =
            'https://play.google.com/store/apps/details?id=com.google.android.apps.healthdata';
          Linking.openURL(url);
        },
      },
    ]);
  };

  return {
    ...state,
    requestHealthPermissions,
    installHealthConnect,
    updateHealthConnect,
    openSettings: openHealthConnectSettings,
    checkStatus: checkHealthConnectStatus,
  };
};

// Helper function to read steps data
export const readStepsData = async (startTime: string, endTime: string) => {
  try {
    const timeRangeFilter = {
      operator: 'between' as const,
      startTime,
      endTime,
    };

    interface StepsRecord {
      count: number;
    }

    const stepsRecords = await readRecords('Steps', { timeRangeFilter });
    const totalSteps = (stepsRecords.records as StepsRecord[]).reduce(
      (sum: number, record) => sum + record.count,
      0
    );
    return totalSteps;
  } catch (error) {
    // Return 0 if permissions aren't granted (handle gracefully)
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('lacks the following permissions')) {
      console.log('⚠️ No permission to read steps data, returning 0');
      return 0;
    }
    console.error('Error reading steps data:', error);
    return 0;
  }
};

// Helper function to read distance data
export const readDistanceData = async (startTime: string, endTime: string) => {
  try {
    const timeRangeFilter = {
      operator: 'between' as const,
      startTime,
      endTime,
    };

    interface DistanceRecord {
      distance: {
        inMeters: number;
      };
    }

    const distanceRecords = await readRecords('Distance', { timeRangeFilter });
    const totalDistance = (distanceRecords.records as DistanceRecord[]).reduce(
      (sum: number, record) => sum + record.distance.inMeters,
      0
    );
    return totalDistance;
  } catch (error) {
    // Return 0 if permissions aren't granted (handle gracefully)
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('lacks the following permissions')) {
      console.log('⚠️ No permission to read distance data, returning 0');
      return 0;
    }
    console.error('Error reading distance data:', error);
    return 0;
  }
};

// Helper function to read floors climbed data
export const readFloorsData = async (startTime: string, endTime: string) => {
  try {
    const timeRangeFilter = {
      operator: 'between' as const,
      startTime,
      endTime,
    };

    interface FloorsRecord {
      floors: number;
    }

    const floorsRecords = await readRecords('FloorsClimbed', { timeRangeFilter });
    const totalFloors = (floorsRecords.records as FloorsRecord[]).reduce(
      (sum: number, record) => sum + record.floors,
      0
    );
    return totalFloors;
  } catch (error) {
    // Return 0 if permissions aren't granted (handle gracefully)
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('lacks the following permissions')) {
      console.log('⚠️ No permission to read floors data, returning 0');
      return 0;
    }
    console.error('Error reading floors data:', error);
    return 0;
  }
};

// Helper function to read active calories burned data
export const readActiveCaloriesData = async (startTime: string, endTime: string) => {
  try {
    const timeRangeFilter = {
      operator: 'between' as const,
      startTime,
      endTime,
    };

    interface CaloriesRecord {
      energy: {
        inKilocalories: number;
      };
    }

    const caloriesRecords = await readRecords('ActiveCaloriesBurned', { timeRangeFilter });
    const totalCalories = (caloriesRecords.records as CaloriesRecord[]).reduce(
      (sum: number, record) => sum + record.energy.inKilocalories,
      0
    );
    console.log('🔥 Active Calories Burned from Health Connect:', totalCalories);
    return Math.round(totalCalories);
  } catch (error) {
    // Return 0 if permissions aren't granted (handle gracefully)
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('lacks the following permissions')) {
      console.log('⚠️ No permission to read calories data, returning 0');
      return 0;
    }
    console.error('Error reading calories data:', error);
    return 0;
  }
};

// Helper function to read nutrition (calories consumed) data
export const readNutritionData = async (startTime: string, endTime: string) => {
  try {
    console.log('🍽️ Reading nutrition data from', startTime, 'to', endTime);
    const timeRangeFilter = {
      operator: 'between' as const,
      startTime,
      endTime,
    };

    interface NutritionRecord {
      energy: {
        inKilocalories: number;
        inKilojoules: number;
        inJoules: number;
        inCalories: number;
      };
    }

    const nutritionRecords = await readRecords('Nutrition', { timeRangeFilter });
    console.log('🍽️ Nutrition records fetched:', nutritionRecords);
    console.log('🍽️ Number of nutrition records:', nutritionRecords.records?.length || 0);
    console.log('🍽️ Raw nutrition records:', JSON.stringify(nutritionRecords.records, null, 2));

    const totalCalories = (nutritionRecords.records as NutritionRecord[]).reduce(
      (sum: number, record) => {
        console.log('🍽️ Processing record:', record);
        // Health Connect returns energy in a different format when reading
        // It uses inKilocalories, not { value, unit }
        const calories = record.energy?.inKilocalories || 0;
        console.log('🍽️ Calories from this record:', calories);
        return sum + calories;
      },
      0
    );
    console.log('🍽️ TOTAL Calories Consumed from Health Connect:', totalCalories);
    return Math.round(totalCalories);
  } catch (error) {
    // Return 0 if permissions aren't granted (handle gracefully)
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('lacks the following permissions')) {
      console.log('⚠️ No permission to read nutrition data, returning 0');
      return 0;
    }
    console.error('❌ Error reading nutrition data:', error);
    return 0;
  }
};

// Helper function to read hydration data
export const readHydrationData = async (startTime: string, endTime: string) => {
  try {
    console.log('💧 Reading hydration data from', startTime, 'to', endTime);
    const timeRangeFilter = {
      operator: 'between' as const,
      startTime,
      endTime,
    };

    interface HydrationRecord {
      volume: {
        inLiters: number;
        inMilliliters: number;
      };
    }

    const hydrationRecords = await readRecords('Hydration', { timeRangeFilter });
    console.log('💧 Hydration records fetched:', hydrationRecords);
    console.log('💧 Number of hydration records:', hydrationRecords.records?.length || 0);

    const totalWater = (hydrationRecords.records as HydrationRecord[]).reduce(
      (sum: number, record) => {
        const ml = record.volume?.inMilliliters || 0;
        console.log('💧 Water from this record:', ml, 'ml');
        return sum + ml;
      },
      0
    );
    console.log('💧 TOTAL Water Consumed from Health Connect:', totalWater, 'ml');
    return Math.round(totalWater);
  } catch (error) {
    // Return 0 if permissions aren't granted (handle gracefully)
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('lacks the following permissions')) {
      console.log('⚠️ No permission to read hydration data, returning 0');
      return 0;
    }
    console.error('❌ Error reading hydration data:', error);
    return 0;
  }
};

// Helper function to read weight data
export const readWeightData = async (startTime: string, endTime: string) => {
  try {
    console.log('⚖️ Reading weight data from', startTime, 'to', endTime);
    const timeRangeFilter = {
      operator: 'between' as const,
      startTime,
      endTime,
    };

    interface WeightRecord {
      weight: {
        inKilograms: number;
        inPounds: number;
        inGrams: number;
      };
      time: string;
    }

    const weightRecords = await readRecords('Weight', { timeRangeFilter });
    console.log('⚖️ Weight records fetched:', weightRecords);
    console.log('⚖️ Number of weight records:', weightRecords.records?.length || 0);

    // Return all weight records with timestamps for history
    const weights = (weightRecords.records as WeightRecord[]).map((record) => ({
      weight: record.weight?.inKilograms || 0,
      date: record.time,
    }));

    console.log('⚖️ Weight history from Health Connect:', weights);
    return weights;
  } catch (error) {
    // Return empty array if permissions aren't granted (handle gracefully)
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('lacks the following permissions')) {
      console.log('⚠️ No permission to read weight data, returning empty array');
      return [];
    }
    console.error('❌ Error reading weight data:', error);
    return [];
  }
};

// Helper function to get the most recent weight
export const getCurrentWeight = async () => {
  try {
    const now = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(now.getFullYear() - 1);

    const weights = await readWeightData(oneYearAgo.toISOString(), now.toISOString());

    if (weights.length === 0) {
      return null;
    }

    // Sort by date descending and get the most recent
    const sortedWeights = weights.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return sortedWeights[0].weight;
  } catch (error) {
    console.error('❌ Error getting current weight:', error);
    return null;
  }
};

// Helper function to write weight data to Health Connect
export const writeWeightData = async (weightInKg: number, time?: string) => {
  try {
    const { insertRecords } = require('react-native-health-connect');

    const recordTime = time || new Date().toISOString();

    console.log('⚖️ Writing weight to Health Connect:', weightInKg, 'kg at', recordTime);

    const weightRecord = {
      recordType: 'Weight' as const,
      weight: {
        value: weightInKg,
        unit: 'kilograms' as const,
      },
      time: recordTime,
    };

    const result = await insertRecords([weightRecord]);
    console.log('✅ Weight written to Health Connect:', result);
    return true;
  } catch (error) {
    console.error('❌ Error writing weight data:', error);
    throw error;
  }
};

// Helper function to read sleep session data
export const readSleepData = async (startTime: string, endTime: string) => {
  try {
    console.log('😴 Reading sleep data from', startTime, 'to', endTime);
    const timeRangeFilter = {
      operator: 'between' as const,
      startTime,
      endTime,
    };

    interface SleepRecord {
      startTime: string;
      endTime: string;
    }

    const sleepRecords = await readRecords('SleepSession', { timeRangeFilter });
    console.log('😴 Sleep records fetched:', sleepRecords);
    console.log('😴 Number of sleep records:', sleepRecords.records?.length || 0);

    // Return all sleep sessions with duration in minutes
    const sleepSessions = (sleepRecords.records as SleepRecord[]).map((record) => {
      const start = new Date(record.startTime);
      const end = new Date(record.endTime);
      const durationMs = end.getTime() - start.getTime();
      const durationMinutes = Math.round(durationMs / (1000 * 60));

      return {
        bedtime: record.startTime,
        wakeTime: record.endTime,
        duration: durationMinutes, // in minutes
      };
    });

    console.log('😴 Sleep history from Health Connect:', sleepSessions);
    return sleepSessions;
  } catch (error) {
    // Return empty array if permissions aren't granted (handle gracefully)
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('lacks the following permissions')) {
      console.log('⚠️ No permission to read sleep data, returning empty array');
      return [];
    }
    console.error('❌ Error reading sleep data:', error);
    return [];
  }
};

// Helper function to get the most recent sleep session
export const getCurrentSleep = async () => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const sleepSessions = await readSleepData(thirtyDaysAgo.toISOString(), now.toISOString());

    if (sleepSessions.length === 0) {
      return null;
    }

    // Sort by wake time descending and get the most recent
    const sortedSleep = sleepSessions.sort(
      (a, b) => new Date(b.wakeTime).getTime() - new Date(a.wakeTime).getTime()
    );

    return sortedSleep[0];
  } catch (error) {
    console.error('❌ Error getting current sleep:', error);
    return null;
  }
};

// Helper function to write sleep session data to Health Connect
export const writeSleepData = async (startTime: string, endTime: string) => {
  try {
    const { insertRecords } = require('react-native-health-connect');

    console.log('😴 Writing sleep to Health Connect:', startTime, 'to', endTime);

    const sleepRecord = {
      recordType: 'SleepSession' as const,
      startTime,
      endTime,
    };

    const result = await insertRecords([sleepRecord]);
    console.log('✅ Sleep written to Health Connect:', result);
    return true;
  } catch (error) {
    console.error('❌ Error writing sleep data:', error);
    throw error;
  }
};
