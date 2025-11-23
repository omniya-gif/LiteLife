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
            granted.accessType === required.accessType &&
            granted.recordType === required.recordType
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

  const requestHealthPermissions = async (): Promise<boolean> => {
    try {
      console.log('🔓 Requesting Health Connect permissions...');
      console.log('📋 Permissions to request:', requiredPermissions);
      
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

      const granted = await requestPermission(requiredPermissions as any);
      console.log('🔐 Permission request result:', granted);
      console.log('🔐 Result type:', typeof granted, 'Is array:', Array.isArray(granted));

      // Check if any permissions were actually granted
      // requestPermission returns an array of granted permissions
      const hasGrantedPermissions = Array.isArray(granted) && granted.length > 0;
      
      if (hasGrantedPermissions) {
        console.log('✅ Permissions granted!', granted);
        // Re-check status to update state correctly
        await checkHealthConnectStatus();
        return true;
      } else {
        console.log('⚠️ Permissions not granted (empty result)');
        console.log('🔧 Attempting to open Health Connect settings directly...');
        
        // The permission dialog didn't show, so open settings directly
        try {
          openHealthConnectSettings();
          console.log('✅ Health Connect settings opened');
        } catch (error) {
          console.error('❌ Failed to open Health Connect settings:', error);
          Alert.alert(
            'Permission Required',
            'Please open Health Connect app and grant permissions to LiteLife manually.',
            [{ text: 'OK' }]
          );
        }
        return false;
      }
    } catch (error) {
      console.error('Health Connect permission request error:', error);
      
      // Check if error is about missing permissions
      if (error instanceof Error && error.message.includes('lacks the following permissions')) {
        Alert.alert(
          'Permissions Not Granted',
          'LiteLife needs permission to access your health data. Would you like to grant permissions in Health Connect?',
          [
            {
              text: 'Not Now',
              style: 'cancel',
            },
            {
              text: 'Grant Permissions',
              onPress: async () => {
                try {
                  await requestPermission(requiredPermissions);
                  await checkHealthConnectStatus();
                } catch (retryError) {
                  openHealthConnectSettings();
                }
              },
            },
          ]
        );
      } else {
        Alert.alert(
          'Error',
          'An error occurred while requesting permissions. Please try again.'
        );
      }
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
            const url = 'https://play.google.com/store/apps/details?id=com.google.android.apps.healthdata';
            Linking.openURL(url);
          },
        },
      ]
    );
  };

  const updateHealthConnect = () => {
    Alert.alert(
      'Update Required',
      'Health Connect needs to be updated to the latest version.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Update',
          onPress: () => {
            const url = 'https://play.google.com/store/apps/details?id=com.google.android.apps.healthdata';
            Linking.openURL(url);
          },
        },
      ]
    );
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
    // Only log if it's not a permission error (those should be handled by the UI)
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (!errorMessage.includes('lacks the following permissions')) {
      console.error('Error reading steps data:', error);
    }
    throw error;
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
    // Only log if it's not a permission error
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (!errorMessage.includes('lacks the following permissions')) {
      console.error('Error reading distance data:', error);
    }
    throw error;
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
    // Only log if it's not a permission error
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (!errorMessage.includes('lacks the following permissions')) {
      console.error('Error reading floors data:', error);
    }
    throw error;
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
    // Only log if it's not a permission error
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (!errorMessage.includes('lacks the following permissions')) {
      console.error('Error reading calories data:', error);
    }
    throw error;
  }
};
