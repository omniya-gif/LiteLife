import { useState, useEffect } from 'react';
import { Platform, Alert, Linking } from 'react-native';
import {
  initialize,
  requestPermission,
  getSdkStatus,
  SdkAvailabilityStatus,
  openHealthConnectSettings,
  openHealthConnectDataManagement,
  getGrantedPermissions,
  readRecords,
  deleteRecordsByUuids,
  deleteRecordsByTimeRange,
} from 'react-native-health-connect';

import {
  getHealthConnectMarker,
  setHealthConnectMarker,
  checkHealthConnectMarkerMatch,
  showHealthConnectMismatchAlert,
  showExistingDataAlert,
} from '../utils/healthConnectMarker';

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

  /**
   * Check for existing Health Connect steps data
   * Returns true if data exists, false otherwise
   */
  const checkExistingStepsData = async (): Promise<boolean> => {
    try {
      // Check last 30 days for any steps data
      const endTime = new Date();
      const startTime = new Date();
      startTime.setDate(startTime.getDate() - 30);

      const timeRangeFilter = {
        operator: 'between' as const,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      };

      const stepsRecords = await readRecords('Steps', { timeRangeFilter });
      const hasData = stepsRecords.records && stepsRecords.records.length > 0;
      console.log(
        `📊 Existing steps data check: ${hasData ? 'Found' : 'None'} (${stepsRecords.records?.length || 0} records)`
      );
      return hasData;
    } catch (error) {
      console.error('Error checking existing steps data:', error);
      return false;
    }
  };

  /**
   * Clear all Health Connect steps data
   */
  const clearStepsData = async (): Promise<void> => {
    try {
      console.log('🗑️ Clearing all steps data from Health Connect...');
      // Get all steps records from last year
      const endTime = new Date();
      const startTime = new Date();
      startTime.setFullYear(startTime.getFullYear() - 1);

      const timeRangeFilter = {
        operator: 'between' as const,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      };

      const stepsRecords = await readRecords('Steps', { timeRangeFilter });
      if (stepsRecords.records && stepsRecords.records.length > 0) {
        const recordIds = stepsRecords.records.map((record: any) => record.metadata.id);
        await deleteRecordsByUuids('Steps', recordIds, []);
        console.log(`✅ Cleared ${recordIds.length} steps records`);
      } else {
        console.log('ℹ️ No steps data to clear');
      }
    } catch (error) {
      console.error('❌ Error clearing steps data:', error);
      throw error;
    }
  };

  /**
   * Handle Health Connect marker check for steps permission
   * Call this after granting permissions
   */
  const handleStepsPermissionGranted = async (userEmail: string): Promise<void> => {
    try {
      console.log('🔍 Checking Health Connect marker for steps permission...');

      // First check if marker exists and matches
      const markerMatch = await checkHealthConnectMarkerMatch(userEmail);
      const marker = await getHealthConnectMarker();

      if (!marker) {
        // No marker exists - check if there's existing data
        console.log('📝 No marker found, checking for existing data...');
        const hasExistingData = await checkExistingStepsData();

        if (hasExistingData) {
          // Show alert for existing data - can't auto-delete data from other apps
          let shouldOpenSettings = false;
          await showExistingDataAlert(
            userEmail,
            'steps',
            async () => {
              // User wants to open settings to manually clear
              shouldOpenSettings = true;
            },
            async () => {
              // User chose to continue with existing data
              console.log('✅ User confirmed to use existing steps data');
            }
          );

          if (shouldOpenSettings) {
            openHealthConnectDataManagement();
          }
        } else {
          // No existing data, just set the marker
          await setHealthConnectMarker(userEmail, false);
          console.log('✅ No existing data, marker set for new user');
        }
      } else if (!markerMatch) {
        // Marker exists but doesn't match - different user
        console.log('⚠️ Marker mismatch detected!');
        let shouldOpenSettings = false;
        await showHealthConnectMismatchAlert(
          userEmail,
          async () => {
            // User wants to open settings
            shouldOpenSettings = true;
          },
          async () => {
            console.log('✅ User confirmed to use previous user data');
          }
        );

        if (shouldOpenSettings) {
          openHealthConnectDataManagement();
        }
      } else {
        // Marker matches - same user
        console.log('✅ Marker matches current user, no action needed');
      }
    } catch (error) {
      console.error('❌ Error handling steps permission marker:', error);
    }
  };

  /**
   * Check if there's existing nutrition data in Health Connect
   * Returns the number of records found
   */
  const checkExistingNutritionData = async (): Promise<number> => {
    try {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const timeRangeFilter = {
        operator: 'between' as const,
        startTime: thirtyDaysAgo.toISOString(),
        endTime: now.toISOString(),
      };

      const nutritionRecords = await readRecords('Nutrition', { timeRangeFilter });
      const recordCount = nutritionRecords.records?.length || 0;

      console.log(`📊 Found ${recordCount} nutrition records in last 30 days`);
      return recordCount;
    } catch (error) {
      console.error('❌ Error checking existing nutrition data:', error);
      return 0;
    }
  };

  /**
   * Attempt to delete nutrition data
   * This will only work for data created by our app
   */
  const clearNutritionData = async (): Promise<boolean> => {
    try {
      console.log('🗑️ Attempting to clear nutrition data...');

      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const timeRangeFilter = {
        operator: 'between' as const,
        startTime: thirtyDaysAgo.toISOString(),
        endTime: now.toISOString(),
      };

      // Try to delete records by time range
      await deleteRecordsByTimeRange('Nutrition', timeRangeFilter);
      console.log('✅ Successfully deleted nutrition data');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ Error deleting nutrition data:', errorMessage);

      // If error indicates we don't own the data, return false
      if (errorMessage.includes("doesn't own") || errorMessage.includes('not own')) {
        console.log('⚠️ Cannot delete nutrition data from other apps');
        return false;
      }

      return false;
    }
  };

  /**
   * Handle Health Connect marker check for nutrition permission
   * Just sets the marker - data filtering happens in read operations via clientRecordId
   */
  const handleNutritionPermissionGranted = async (userEmail: string): Promise<void> => {
    try {
      console.log('🔍 Setting Health Connect marker for nutrition...');

      // Simply set the marker for the current user
      // Each user's nutrition data persists on device, filtered by clientRecordId during reads
      await setHealthConnectMarker(userEmail, false);
      console.log('✅ Nutrition marker set for user:', userEmail);
    } catch (error) {
      console.error('❌ Error setting nutrition marker:', error);
    }
  };

  /**
   * Check if there's existing hydration data in Health Connect
   * Returns the number of records found
   */
  const checkExistingHydrationData = async (): Promise<number> => {
    try {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const timeRangeFilter = {
        operator: 'between' as const,
        startTime: thirtyDaysAgo.toISOString(),
        endTime: now.toISOString(),
      };

      const hydrationRecords = await readRecords('Hydration', { timeRangeFilter });
      const recordCount = hydrationRecords.records?.length || 0;

      console.log(`💧 Found ${recordCount} hydration records in last 30 days`);
      return recordCount;
    } catch (error) {
      console.error('❌ Error checking existing hydration data:', error);
      return 0;
    }
  };

  /**
   * Attempt to delete hydration data
   * This will only work for data created by our app
   */
  const clearHydrationData = async (): Promise<boolean> => {
    try {
      console.log('🗑️ Attempting to clear hydration data...');

      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const timeRangeFilter = {
        operator: 'between' as const,
        startTime: thirtyDaysAgo.toISOString(),
        endTime: now.toISOString(),
      };

      // Try to delete records by time range
      await deleteRecordsByTimeRange('Hydration', timeRangeFilter);
      console.log('✅ Successfully deleted hydration data');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ Error deleting hydration data:', errorMessage);

      // If error indicates we don't own the data, return false
      if (errorMessage.includes("doesn't own") || errorMessage.includes('not own')) {
        console.log('⚠️ Cannot delete hydration data from other apps');
        return false;
      }

      return false;
    }
  };

  /**
   * Handle Health Connect marker check for hydration permission
   * Call this after granting permissions
   * Hydration is manually logged by us, so try auto-delete first
   */
  const handleHydrationPermissionGranted = async (userEmail: string): Promise<void> => {
    try {
      console.log('🔍 Checking Health Connect marker for hydration permission...');

      // First check if marker exists and matches
      const markerMatch = await checkHealthConnectMarkerMatch(userEmail);
      const marker = await getHealthConnectMarker();

      if (!marker) {
        // No marker exists - check if there's existing data
        console.log('📝 No marker found, checking for existing data...');
        const hasExistingData = await checkExistingHydrationData();

        if (hasExistingData) {
          // Try to auto-delete first (hydration is usually our own data)
          console.log('🗑️ Attempting to auto-delete hydration data...');
          const deleted = await clearHydrationData();

          if (deleted) {
            // Successfully deleted, set marker
            await setHealthConnectMarker(userEmail, false);
            console.log('✅ Hydration data deleted, marker set');
          } else {
            // Couldn't delete (might be from other apps)
            // Show alert to let user decide
            let shouldOpenSettings = false;
            await showExistingDataAlert(
              userEmail,
              'hydration',
              async () => {
                shouldOpenSettings = true;
              },
              async () => {
                console.log('✅ User confirmed to use existing hydration data');
              }
            );

            if (shouldOpenSettings) {
              openHealthConnectDataManagement();
            }
          }
        } else {
          // No existing data, just set the marker
          await setHealthConnectMarker(userEmail, false);
          console.log('✅ No existing hydration data, marker set for new user');
        }
      } else if (!markerMatch) {
        // Marker exists but doesn't match - different user
        console.log('⚠️ Marker mismatch detected!');

        // Try to auto-delete the previous user's data
        const deleted = await clearHydrationData();

        if (deleted) {
          // Successfully deleted, set new marker
          await setHealthConnectMarker(userEmail, false);
          console.log('✅ Previous user hydration data deleted, new marker set');
        } else {
          // Couldn't delete, show alert
          let shouldOpenSettings = false;
          await showHealthConnectMismatchAlert(
            userEmail,
            async () => {
              shouldOpenSettings = true;
            },
            async () => {
              console.log('✅ User confirmed to use previous user hydration data');
            }
          );

          if (shouldOpenSettings) {
            openHealthConnectDataManagement();
          }
        }
      } else {
        // Marker matches - same user
        console.log('✅ Marker matches current user, no action needed');
      }
    } catch (error) {
      console.error('❌ Error handling hydration permission marker:', error);
    }
  };

  /**
   * Generic handler for manually-logged data types (sleep, weight)
   * Just sets the marker - data filtering happens in read operations via clientRecordId
   */
  const handleManualDataPermissionGranted = async (
    userEmail: string,
    dataType: 'SleepSession' | 'Weight',
    displayName: string
  ): Promise<void> => {
    try {
      console.log(`🔍 Setting Health Connect marker for ${displayName}...`);

      // Simply set the marker for the current user
      // Each user's data persists on device, filtered by clientRecordId during reads
      await setHealthConnectMarker(userEmail, false);
      console.log(`✅ ${displayName} marker set for user:`, userEmail);
    } catch (error) {
      console.error(`❌ Error setting ${displayName} marker:`, error);
    }
  };

  // Specific handlers for each data type
  const handleSleepPermissionGranted = (userEmail: string) =>
    handleManualDataPermissionGranted(userEmail, 'SleepSession', 'sleep');

  const handleWeightPermissionGranted = (userEmail: string) =>
    handleManualDataPermissionGranted(userEmail, 'Weight', 'weight');

  return {
    ...state,
    requestHealthPermissions,
    installHealthConnect,
    updateHealthConnect,
    openSettings: openHealthConnectSettings,
    handleStepsPermissionGranted,
    checkExistingStepsData,
    clearStepsData,
    handleNutritionPermissionGranted,
    checkExistingNutritionData,
    clearNutritionData,
    handleHydrationPermissionGranted,
    checkExistingHydrationData,
    clearHydrationData,
    handleSleepPermissionGranted,
    handleWeightPermissionGranted,
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

// Helper function to read macronutrient data (calories, protein, fat, carbs, sugar)
export const readMacronutrientData = async (
  startTime: string,
  endTime: string,
  userEmail?: string
) => {
  try {
    console.log(
      '🥗 Reading macronutrient data from',
      startTime,
      'to',
      endTime,
      'for user:',
      userEmail
    );
    const timeRangeFilter = {
      operator: 'between' as const,
      startTime,
      endTime,
    };

    interface NutritionRecord {
      energy: {
        inKilocalories: number;
      };
      protein?: {
        inGrams: number;
      };
      totalFat?: {
        inGrams: number;
      };
      totalCarbohydrate?: {
        inGrams: number;
      };
      sugar?: {
        inGrams: number;
      };
      metadata?: {
        clientRecordId?: string;
      };
    }

    const nutritionRecords = await readRecords('Nutrition', { timeRangeFilter });
    console.log('🥗 Nutrition records fetched:', nutritionRecords);

    // Filter records to only include current user's data if userEmail provided
    let filteredRecords = nutritionRecords.records as NutritionRecord[];
    if (userEmail) {
      filteredRecords = filteredRecords.filter((record) => {
        const clientRecordId = record.metadata?.clientRecordId || '';
        // Match records that were created with this user's email in clientRecordId
        return clientRecordId.includes(userEmail) || !clientRecordId; // Include old records without clientRecordId for backward compatibility
      });
      console.log(
        `🥗 Filtered to ${filteredRecords.length} nutrition records for user ${userEmail}`
      );
    }

    const macros = filteredRecords.reduce(
      (totals, record) => {
        return {
          calories: totals.calories + (record.energy?.inKilocalories || 0),
          protein: totals.protein + (record.protein?.inGrams || 0),
          fat: totals.fat + (record.totalFat?.inGrams || 0),
          carbs: totals.carbs + (record.totalCarbohydrate?.inGrams || 0),
          sugar: totals.sugar + (record.sugar?.inGrams || 0),
        };
      },
      { calories: 0, protein: 0, fat: 0, carbs: 0, sugar: 0 }
    );

    console.log('🥗 Total Macronutrients:', macros);
    return {
      calories: Math.round(macros.calories),
      protein: Math.round(macros.protein),
      fat: Math.round(macros.fat),
      carbs: Math.round(macros.carbs),
      sugar: Math.round(macros.sugar),
    };
  } catch (error) {
    // Return 0s if permissions aren't granted (handle gracefully)
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('lacks the following permissions')) {
      console.log('⚠️ No permission to read macronutrient data, returning 0s');
      return { calories: 0, protein: 0, fat: 0, carbs: 0, sugar: 0 };
    }
    console.error('❌ Error reading macronutrient data:', error);
    return { calories: 0, protein: 0, fat: 0, carbs: 0, sugar: 0 };
  }
};

// Helper function to read calories by meal type
export const readCaloriesByMealType = async (
  startTime: string,
  endTime: string,
  userEmail?: string
) => {
  try {
    console.log(
      '🍽️ Reading calories by meal type from',
      startTime,
      'to',
      endTime,
      'for user:',
      userEmail
    );
    const timeRangeFilter = {
      operator: 'between' as const,
      startTime,
      endTime,
    };

    interface NutritionRecord {
      energy: {
        inKilocalories: number;
      };
      mealType?: number; // 1=breakfast, 2=lunch, 3=dinner, 4=snack, 0=unknown
      name?: string;
      metadata?: {
        recordingMethod?: number;
        clientRecordId?: string;
      };
    }

    const nutritionRecords = await readRecords('Nutrition', { timeRangeFilter });

    console.log('🍽️ Raw nutrition records count:', nutritionRecords.records?.length || 0);

    // DEBUG: Log first record's metadata to see structure
    if (nutritionRecords.records && nutritionRecords.records.length > 0) {
      const firstRecord = nutritionRecords.records[0] as any;
      console.log('🔍 Sample record metadata:', JSON.stringify(firstRecord.metadata, null, 2));
      console.log('🔍 Sample record name:', firstRecord.name);
    }

    // Filter records to only include current user's data if userEmail provided
    let filteredRecords = nutritionRecords.records as NutritionRecord[];
    if (userEmail) {
      const beforeFilterCount = filteredRecords.length;
      filteredRecords = filteredRecords.filter((record) => {
        const clientRecordId = record.metadata?.clientRecordId || '';
        const isUserRecord = clientRecordId.includes(userEmail);
        const isLegacyRecord = !clientRecordId; // Old records without user tagging

        // Log each record for debugging
        console.log(`📝 Record: ${record.name || 'unnamed'}`);
        console.log(`   clientRecordId: ${clientRecordId || 'NONE (legacy)'}`);
        console.log(`   isUserRecord: ${isUserRecord}, isLegacyRecord: ${isLegacyRecord}`);

        if (clientRecordId && !isUserRecord) {
          console.log(`   🚫 FILTERED OUT - belongs to different user`);
          return false;
        }

        if (isLegacyRecord) {
          console.log(`   ⚠️ INCLUDED - legacy record without user tag`);
        } else {
          console.log(`   ✅ INCLUDED - matches current user`);
        }

        return isUserRecord || isLegacyRecord;
      });
      console.log(
        `🍽️ Filtered nutrition records: ${beforeFilterCount} total → ${filteredRecords.length} for user ${userEmail}`
      );
    }

    const mealCalories = {
      breakfast: 0,
      lunch: 0,
      dinner: 0,
      snack: 0,
    };

    filteredRecords.forEach((record) => {
      const calories = record.energy?.inKilocalories || 0;
      // mealType is a number: 1=breakfast, 2=lunch, 3=dinner, 4=snack, 0=unknown
      const mealTypeNum = typeof record.mealType === 'number' ? record.mealType : 0;

      if (mealTypeNum === 1) {
        mealCalories.breakfast += calories;
      } else if (mealTypeNum === 2) {
        mealCalories.lunch += calories;
      } else if (mealTypeNum === 3) {
        mealCalories.dinner += calories;
      } else if (mealTypeNum === 4) {
        mealCalories.snack += calories;
      }
    });

    console.log('🍽️ Calories by meal type:', mealCalories);
    return {
      breakfast: Math.round(mealCalories.breakfast),
      lunch: Math.round(mealCalories.lunch),
      dinner: Math.round(mealCalories.dinner),
      snack: Math.round(mealCalories.snack),
    };
  } catch (error) {
    // Return 0s if permissions aren't granted (handle gracefully)
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('lacks the following permissions')) {
      console.log('⚠️ No permission to read meal type data, returning 0s');
      return { breakfast: 0, lunch: 0, dinner: 0, snack: 0 };
    }
    console.error('❌ Error reading calories by meal type:', error);
    return { breakfast: 0, lunch: 0, dinner: 0, snack: 0 };
  }
};

// Helper function to read actual meals from Health Connect by meal type
export const readMealsByType = async (
  startTime: string,
  endTime: string,
  mealType: number,
  userEmail?: string
) => {
  try {
    console.log(
      `🍽️ Reading ${mealType} meals from`,
      startTime,
      'to',
      endTime,
      'for user:',
      userEmail
    );
    const timeRangeFilter = {
      operator: 'between' as const,
      startTime,
      endTime,
    };

    interface NutritionRecord {
      energy: {
        inKilocalories: number;
      };
      protein?: {
        inGrams: number;
      };
      totalFat?: {
        inGrams: number;
      };
      totalCarbohydrate?: {
        inGrams: number;
      };
      sugar?: {
        inGrams: number;
      };
      mealType?: number;
      name?: string;
      startTime: string;
      metadata?: {
        clientRecordId?: string;
      };
    }

    const nutritionRecords = await readRecords('Nutrition', { timeRangeFilter });

    // Filter by meal type AND user email
    const meals = (nutritionRecords.records as NutritionRecord[])
      .filter((record) => {
        const recordMealType = typeof record.mealType === 'number' ? record.mealType : 0;
        const mealTypeMatch = recordMealType === mealType;

        if (!mealTypeMatch) return false;

        if (userEmail) {
          const clientRecordId = record.metadata?.clientRecordId || '';
          return clientRecordId.includes(userEmail) || !clientRecordId;
        }

        return true;
      })
      .map((record) => {
        const fullName = record.name || 'Meal';
        // Extract recipe ID if embedded in format "Recipe Name #12345"
        const idMatch = fullName.match(/#(\d+)$/);
        const recipeId = idMatch ? parseInt(idMatch[1], 10) : undefined;
        const cleanName = idMatch ? fullName.replace(/#\d+$/, '').trim() : fullName;

        return {
          name: cleanName,
          recipeId,
          calories: Math.round(record.energy?.inKilocalories || 0),
          protein: Math.round(record.protein?.inGrams || 0),
          fat: Math.round(record.totalFat?.inGrams || 0),
          carbs: Math.round(record.totalCarbohydrate?.inGrams || 0),
          sugar: Math.round(record.sugar?.inGrams || 0),
          timestamp: record.startTime,
        };
      });

    console.log(`🍽️ Found ${meals.length} meals for type ${mealType}`);
    return meals;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('lacks the following permissions')) {
      console.log('⚠️ No permission to read meals data, returning empty array');
      return [];
    }
    console.error('❌ Error reading meals by type:', error);
    return [];
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
export const readWeightData = async (startTime: string, endTime: string, userEmail?: string) => {
  try {
    console.log('⚖️ Reading weight data from', startTime, 'to', endTime, 'for user:', userEmail);
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
      metadata?: {
        clientRecordId?: string;
      };
    }

    const weightRecords = await readRecords('Weight', { timeRangeFilter });
    console.log('⚖️ Weight records fetched:', weightRecords);
    console.log('⚖️ Number of weight records:', weightRecords.records?.length || 0);

    // Filter records to only include current user's data if userEmail provided
    let filteredRecords = weightRecords.records as WeightRecord[];
    if (userEmail) {
      filteredRecords = filteredRecords.filter((record) => {
        const clientRecordId = record.metadata?.clientRecordId || '';
        // Match records that were created with this user's email in clientRecordId
        return clientRecordId.includes(userEmail) || !clientRecordId; // Include old records without clientRecordId for backward compatibility
      });
      console.log(`⚖️ Filtered to ${filteredRecords.length} records for user ${userEmail}`);
    }

    // Return all weight records with timestamps for history
    const weights = filteredRecords.map((record) => ({
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
export const writeWeightData = async (
  weightInKg: number,
  userEmail?: string,
  time?: string | Date
) => {
  try {
    const { insertRecords } = require('react-native-health-connect');

    // Convert time to ISO string if it's a Date object, otherwise use provided string or current time
    const recordTime = time instanceof Date ? time.toISOString() : time || new Date().toISOString();

    console.log(
      '⚖️ Writing weight to Health Connect:',
      weightInKg,
      'kg at',
      recordTime,
      'for user:',
      userEmail
    );

    const weightRecord = {
      recordType: 'Weight' as const,
      weight: {
        value: weightInKg,
        unit: 'kilograms' as const,
      },
      time: recordTime,
      metadata: userEmail
        ? {
            clientRecordId: `weight_${userEmail}_${recordTime}`,
          }
        : undefined,
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

    // Filter out invalid sleep sessions (duration > 24 hours or negative)
    const validSessions = sleepSessions.filter((session) => {
      const hours = session.duration / 60;
      return hours > 0 && hours <= 24;
    });

    console.log(
      '✅ Valid sleep sessions (filtered):',
      validSessions.length,
      'out of',
      sleepSessions.length
    );

    if (validSessions.length === 0) {
      console.log('⚠️ No valid sleep sessions found');
      return null;
    }

    // Sort by BEDTIME (not wake time) descending to get the most recent sleep session
    const sortedSleep = validSessions.sort(
      (a, b) => new Date(b.bedtime).getTime() - new Date(a.bedtime).getTime()
    );

    console.log('📊 Most recent valid sleep:', {
      bedtime: sortedSleep[0].bedtime,
      wakeTime: sortedSleep[0].wakeTime,
      duration: `${Math.floor(sortedSleep[0].duration / 60)}h ${sortedSleep[0].duration % 60}m`,
    });

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

    console.log('\n============ WRITING SLEEP TO HEALTH CONNECT ============');
    console.log('📥 Input startTime:', startTime);
    console.log('📥 Input endTime:', endTime);

    // Validate times
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMs = end.getTime() - start.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);

    console.log('⏰ Start Date:', start.toString());
    console.log('⏰ End Date:', end.toString());
    console.log('⏱️ Duration:', durationHours.toFixed(2), 'hours');

    if (durationMs <= 0) {
      console.error('❌ Invalid duration: End time must be after start time');
      throw new Error('End time must be after start time');
    }

    if (durationHours > 24) {
      console.warn('⚠️ WARNING: Sleep duration is more than 24 hours!');
    }

    const sleepRecord = {
      recordType: 'SleepSession' as const,
      startTime,
      endTime,
    };

    console.log('📝 Sleep record to insert:', JSON.stringify(sleepRecord, null, 2));
    console.log('🔄 Calling insertRecords...');

    const result = await insertRecords([sleepRecord]);

    console.log('✅ insertRecords result:', JSON.stringify(result, null, 2));
    console.log('✅ Sleep successfully written to Health Connect!');
    console.log('👉 You should now see this in Google Fit app');
    console.log('============ WRITE COMPLETE ============\n');

    return true;
  } catch (error) {
    console.error('\n❌ ========== ERROR WRITING SLEEP ==========');
    console.error('Error type:', error?.constructor?.name);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    console.error('Full error:', JSON.stringify(error, null, 2));
    console.error('Stack trace:', error instanceof Error ? error.stack : 'N/A');
    console.error('============================================\n');
    throw error;
  }
};
