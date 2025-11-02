import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'fithass',
  slug: 'fithass',
  owner: 'hass12',
  // scheme: 'fithass',
  plugins: [
    'expo-health-connect',
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
    ],
  },
  extra: {
    supabaseUrl: 'https://jpxnwplnexcevvlezoaf.supabase.co',
    supabaseAnonKey:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpweG53cGxuZXhjZXZ2bGV6b2FmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4MzU0MTAsImV4cCI6MjA2NTQxMTQxMH0.78HfwQ1r0uKcKgfOlwdYca21SIfUm8vMsj0fbvhlLIk',
    eas: {
      projectId: 'ce7f6b25-f00d-4d0d-b769-c6bd5e34bc3b',
    },
  },
});
