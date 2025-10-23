import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'my-expo-app',
  slug: 'my-expo-app',
  extra: {
    supabaseUrl: 'https://wgqwelancuuwvcuhvpyz.supabase.co',
    supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndncXdlbGFuY3V1d3ZjdWh2cHl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU3MjU4NDAsImV4cCI6MjA1MTMwMTg0MH0.kYf3FVFf9jIzO6_B3ZuAz6csqzuchSaxBVXHxxr7L2Q',
  },
});
