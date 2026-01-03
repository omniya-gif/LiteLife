// Global Legend-State configuration
import AsyncStorage from '@react-native-async-storage/async-storage'
import { configureSynced } from '@legendapp/state/sync'
import { observablePersistAsyncStorage } from '@legendapp/state/persist-plugins/async-storage'

/**
 * Global persistence configuration using AsyncStorage.
 * Note: Can be upgraded to MMKV later for 30x better performance.
 */
export const persistOptions = configureSynced({
  persist: {
    plugin: observablePersistAsyncStorage({
      AsyncStorage
    })
  }
})
