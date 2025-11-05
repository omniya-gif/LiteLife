import { useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function AuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    console.log('[AuthCallback] Page loaded');
    console.log('[AuthCallback] URL params:', params);
    console.log('[AuthCallback] Full params:', JSON.stringify(params));
    
    // Don't auto-redirect, let the SocialLogin component handle the auth flow
    // This page just shows a loading state
    
    // Optional: Add a timeout to redirect if stuck
    const timer = setTimeout(() => {
      console.log('[AuthCallback] Timeout reached, checking auth state...');
      // The auth state should have been handled by SocialLogin component
      // If we're still here, something went wrong
    }, 5000);

    return () => clearTimeout(timer);
  }, [params]);

  return (
    <View className="flex-1 items-center justify-center bg-[#1A1B1E]">
      <ActivityIndicator size="large" color="#4ADE80" />
      <Text className="mt-4 text-xl font-bold text-white">Loading...</Text>
      <Text className="mt-2 text-base text-gray-300">Waiting to redirect</Text>
      <Text className="mt-4 text-xs text-gray-500">Auth callback page</Text>
    </View>
  );
}