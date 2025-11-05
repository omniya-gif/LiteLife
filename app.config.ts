import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'fithass',
  slug: 'fithass',
  owner: 'hass12',
  scheme: 'fithass',
  plugins: [
    'expo-health-connect',
    [
      'expo-image-picker',
      {
        photosPermission:
          'The app accesses your photos to let you share them with the AI chef for food analysis.',
        cameraPermission:
          'The app accesses your camera to let you take photos of food for analysis.',
      },
    ],
    [
      'expo-build-properties',
      {
        android: {
          compileSdkVersion: 34,
          targetSdkVersion: 34,
          minSdkVersion: 26,
        },
      },
    ],
  ],
  android: {
    package: 'com.fithass.app',
    permissions: [
      'android.permission.health.READ_STEPS',
      'android.permission.health.READ_FLOORS_CLIMBED',
      'android.permission.health.READ_DISTANCE',
      'android.permission.health.READ_HEART_RATE',
      'android.permission.health.READ_EXERCISE',
      'android.permission.health.READ_SPEED',
      'android.permission.health.READ_TOTAL_CALORIES_BURNED',
      'android.permission.health.READ_ACTIVE_CALORIES_BURNED',
      'android.permission.ACTIVITY_RECOGNITION',
      'android.permission.CAMERA',
      'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.WRITE_EXTERNAL_STORAGE',
    ],
  },
  extra: {
    supabaseUrl: 'https://zvbgtmlxzhiuxmimcqpd.supabase.co',
    supabaseAnonKey:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2Ymd0bWx4emhpdXhtaW1jcXBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNDgxMDUsImV4cCI6MjA3NjYyNDEwNX0.w4FTwYvZqGLDXuI3po1AjPErMHJfRvwN0V1Eu1Le1Pw',
    eas: {
      projectId: 'ce7f6b25-f00d-4d0d-b769-c6bd5e34bc3b',
    },
  },
});
