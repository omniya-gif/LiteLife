import { makeRedirectUri } from 'expo-auth-session';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import { View, TouchableOpacity, Image, Alert, Text } from 'react-native';
import { useQueryClient } from 'react-query';

import { supabase } from '../../lib/supabase';
import { useUserStore } from '../../lib/store/userStore';
import { useOnboardingStore } from '../../stores/onboardingStore';

WebBrowser.maybeCompleteAuthSession();

// Generate redirect URI - use native scheme for development builds
const redirectTo = makeRedirectUri({
  scheme: 'fithass',
  path: 'auth/callback',
});

console.log('[SocialLogin] Redirect URI configured as:', redirectTo);

interface SocialLoginProps {
  isSignUp?: boolean;
}

export const SocialLogin = ({ isSignUp = false }: SocialLoginProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setOnboardingCompleted = useOnboardingStore((state) => state.setCompleted);
  const { fetchUserData } = useUserStore();

  const createSessionFromUrl = async (url: string) => {
    try {
      console.log('[SocialLogin] ====== AUTH CALLBACK STARTED ======');
      console.log('[SocialLogin] Callback URL received:', url);
      
      const { params, errorCode } = QueryParams.getQueryParams(url);
      console.log('[SocialLogin] Query params:', params);
      console.log('[SocialLogin] Error code:', errorCode);
      
      if (errorCode) throw new Error(errorCode);
      const { access_token, refresh_token } = params;

      if (!access_token) {
        console.log('[SocialLogin] No access token found in URL');
        return;
      }

      console.log('[SocialLogin] Setting session with access token...');
      const { data, error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (error) {
        console.error('[SocialLogin] Session error:', error);
        throw error;
      }

      console.log('[SocialLogin] Session set successfully, user ID:', data.session.user.id);

      // After setting session, fetch onboarding status with retry
      const checkOnboardingStatus = async (userId: string, retryCount = 0): Promise<boolean> => {
        const { data, error } = await supabase
          .from('user_onboarding')
          .select('completed')
          .eq('user_id', userId)
          .single();

        if (error && retryCount < 3) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return checkOnboardingStatus(userId, retryCount + 1);
        }

        return data?.completed ?? false;
      };

      // Check if user exists and their onboarding status
      const { data: existingUser } = await supabase
        .from('user_onboarding')
        .select('completed')
        .eq('user_id', data.session.user.id)
        .single();

      if (!existingUser) {
        // New user signup flow
        console.log('[SocialLogin] New user, creating onboarding record');
        const { data: newOnboarding } = await supabase
          .from('user_onboarding')
          .insert({
            user_id: data.session.user.id,
            completed: false,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        setOnboardingCompleted(false);
        console.log('[SocialLogin] Redirecting new user to: /onboarding/expertise');
        router.replace('/onboarding/expertise');
      } else {
        // Existing user login flow
        console.log('[SocialLogin] Existing user, checking onboarding status');
        const isCompleted = await checkOnboardingStatus(data.session.user.id);
        console.log('[SocialLogin] Onboarding completed:', isCompleted);

        setOnboardingCompleted(isCompleted);
        
        // ✅ IMMEDIATELY fetch user data and cache it before navigation
        console.log('[SocialLogin] 📥 Fetching user profile data immediately...');
        await fetchUserData(data.session.user.id);
        console.log('[SocialLogin] ✅ User profile data cached successfully');

        if (isCompleted) {
          console.log('[SocialLogin] Redirecting existing user to: /(main)/home');
          router.replace('/(main)/home');
        } else {
          console.log('[SocialLogin] Redirecting incomplete user to: /onboarding/expertise');
          router.replace('/onboarding/expertise');
        }
      }

      console.log('[SocialLogin] ====== AUTH CALLBACK COMPLETED ======');
      return data.session;
    } catch (error) {
      console.error('[SocialLogin] Error:', error);
      Alert.alert('Error', 'Failed to sign in. Please try again.');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      console.log('[SocialLogin] Starting Google Sign In...');
      console.log('[SocialLogin] Using redirect URI:', redirectTo);
      console.log('');
      console.log('═══════════════════════════════════════════════════════');
      console.log('⚠️  IMPORTANT: Add this URL to Supabase Redirect URLs:');
      console.log('═══════════════════════════════════════════════════════');
      console.log(redirectTo);
      console.log('═══════════════════════════════════════════════════════');
      console.log('Go to: Supabase Dashboard → Authentication → URL Configuration');
      console.log('');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo,
          skipBrowserRedirect: true,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('[SocialLogin] OAuth error:', error);
        throw error;
      }

      console.log('[SocialLogin] Opening auth session with URL:', data?.url);
      const res = await WebBrowser.openAuthSessionAsync(
        data?.url ?? '', 
        redirectTo,
        {
          showInRecents: true,
          createTask: false,
          enableDefaultShareMenuItem: false,
          // This is important for Android to return to the app
          preferEphemeralSession: false,
        }
      );

      console.log('[SocialLogin] Auth session result:', res);
      console.log('[SocialLogin] Auth session type:', res.type);
      
      if (res.type === 'success') {
        console.log('[SocialLogin] Auth session successful, processing URL...');
        console.log('[SocialLogin] Returned URL:', res.url);
        await createSessionFromUrl(res.url);
      } else if (res.type === 'cancel') {
        console.log('[SocialLogin] User cancelled the auth flow');
        Alert.alert('Cancelled', 'Authentication was cancelled');
      } else if (res.type === 'dismiss') {
        console.log('[SocialLogin] User dismissed the auth flow');
      } else {
        console.log('[SocialLogin] Auth session not successful, type:', res.type);
      }
    } catch (error: any) {
      if (error.message.includes('Failed to download remote update')) {
        return;
      }
      console.error('Google sign in error:', error);
      Alert.alert('Error', 'Failed to sign in with Google. Please try again.');
    }
  };

  React.useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      console.log('[SocialLogin] Deep link received:', event.url);
      if (event.url) {
        createSessionFromUrl(event.url);
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => {
      subscription.remove();
    };
  }, []);
  return (
    <View className="w-full">
      <TouchableOpacity
        onPress={handleGoogleSignIn}
        className="h-14 w-full flex-row items-center justify-center space-x-3 rounded-full border border-gray-600 bg-gray-800 shadow-lg">
        <Image
          source={require('../../assets/images/social/google.png')}
          className="h-6 w-6"
          resizeMode="contain"
        />
        <Text className="text-lg font-semibold text-white">Continue with Google</Text>
      </TouchableOpacity>
    </View>
  );
};
