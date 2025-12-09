import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const HEALTH_CONNECT_MARKER_KEY = '@health_connect_user_marker';
const HEALTH_CONNECT_DATA_CONFIRMED_KEY = '@health_connect_data_confirmed';

export interface HealthConnectMarker {
  email: string;
  timestamp: string;
  dataConfirmed: boolean; // true if user chose to use existing data, false if cleared
}

/**
 * Set the Health Connect user marker with email
 */
export const setHealthConnectMarker = async (
  email: string,
  dataConfirmed: boolean = false
): Promise<void> => {
  try {
    const marker: HealthConnectMarker = {
      email,
      timestamp: new Date().toISOString(),
      dataConfirmed,
    };
    await AsyncStorage.setItem(HEALTH_CONNECT_MARKER_KEY, JSON.stringify(marker));
    console.log('✅ Health Connect marker set:', marker);
  } catch (error) {
    console.error('❌ Failed to set Health Connect marker:', error);
  }
};

/**
 * Get the current Health Connect user marker
 */
export const getHealthConnectMarker = async (): Promise<HealthConnectMarker | null> => {
  try {
    const markerStr = await AsyncStorage.getItem(HEALTH_CONNECT_MARKER_KEY);
    if (!markerStr) return null;
    return JSON.parse(markerStr);
  } catch (error) {
    console.error('❌ Failed to get Health Connect marker:', error);
    return null;
  }
};

/**
 * Clear the Health Connect user marker
 */
export const clearHealthConnectMarker = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(HEALTH_CONNECT_MARKER_KEY);
    console.log('✅ Health Connect marker cleared');
  } catch (error) {
    console.error('❌ Failed to clear Health Connect marker:', error);
  }
};

/**
 * Check if current user email matches the Health Connect marker
 * Returns: true if match or no marker exists, false if mismatch
 */
export const checkHealthConnectMarkerMatch = async (currentUserEmail: string): Promise<boolean> => {
  const marker = await getHealthConnectMarker();
  if (!marker) {
    // No marker exists yet - first time user
    return true;
  }
  return marker.email === currentUserEmail;
};

/**
 * Show alert when Health Connect marker doesn't match current user
 * Gives option to open settings or use existing data
 */
export const showHealthConnectMismatchAlert = async (
  currentUserEmail: string,
  onClearData: () => Promise<void>,
  onUseExisting: () => Promise<void>
): Promise<void> => {
  const marker = await getHealthConnectMarker();

  return new Promise((resolve) => {
    Alert.alert(
      '⚠️ Different User Detected',
      `Health Connect data belongs to:\n${marker?.email || 'Unknown user'}\n\nYou are logged in as:\n${currentUserEmail}\n\nNote: Data from other apps cannot be automatically deleted. You can manually clear it from Health Connect settings if needed.\n\nContinue with LiteLife?`,
      [
        {
          text: 'Open Settings',
          onPress: async () => {
            await onClearData();
            await setHealthConnectMarker(currentUserEmail, false);
            console.log('🗑️ Opening settings for manual data clear, marker updated');
            resolve();
          },
        },
        {
          text: 'Continue Anyway',
          onPress: async () => {
            await onUseExisting();
            await setHealthConnectMarker(currentUserEmail, true);
            console.log('✅ Continuing with existing data, marker confirmed');
            resolve();
          },
        },
      ],
      { cancelable: false }
    );
  });
};

/**
 * Show alert when existing Health Connect data is detected on first permission grant
 */
export const showExistingDataAlert = async (
  userEmail: string,
  dataType: string,
  onClearData: () => Promise<void>,
  onUseExisting: () => Promise<void>
): Promise<void> => {
  return new Promise((resolve) => {
    Alert.alert(
      '📊 Existing Health Data Detected',
      `We found existing ${dataType} data in Health Connect.\n\nThis data may be from another app (Google Fit, Samsung Health, etc.) and cannot be automatically deleted.\n\nYou can:\n• Use the existing data alongside new LiteLife data\n• Manually delete it from Health Connect settings if needed\n\nContinue with LiteLife?`,
      [
        {
          text: 'Open Settings',
          onPress: async () => {
            // Call the callback to trigger opening settings
            await onClearData();
            await setHealthConnectMarker(userEmail, true);
            console.log('✅ Redirecting to settings, marker set');
            resolve();
          },
        },
        {
          text: 'Continue Anyway',
          onPress: async () => {
            await onUseExisting();
            await setHealthConnectMarker(userEmail, true);
            console.log('✅ Continuing with existing data, marker set');
            resolve();
          },
        },
      ],
      { cancelable: false }
    );
  });
};
