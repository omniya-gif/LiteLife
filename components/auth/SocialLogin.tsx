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
import { useOnboardingStore } from '../../stores/onboardingStore';

WebBrowser.maybeCompleteAuthSession();

const redirectTo = __DEV__
  ? `${Constants.expoConfig?.scheme}://auth/callback`
  : makeRedirectUri({
      scheme: 'myexpoapp',
      path: 'auth/callback',
    });

interface SocialLoginProps {
  isSignUp?: boolean;
}

export const SocialLogin = ({ isSignUp = false }: SocialLoginProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setOnboardingCompleted = useOnboardingStore((state) => state.setCompleted);

  const createSessionFromUrl = async (url: string) => {
    try {
      const { params, errorCode } = QueryParams.getQueryParams(url);
      if (errorCode) throw new Error(errorCode);
      const { access_token, refresh_token } = params;

      if (!access_token) return;

      const { data, error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (error) throw error;

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
        router.replace('/onboarding/expertise');
      } else {
        // Existing user login flow
        console.log('[SocialLogin] Existing user, checking onboarding status');
        const isCompleted = await checkOnboardingStatus(data.session.user.id);
        console.log('[SocialLogin] Onboarding completed:', isCompleted);

        setOnboardingCompleted(isCompleted);
        // Invalidate the onboarding query to force a fresh fetch
        await queryClient.invalidateQueries(['onboarding', data.session.user.id]);

        if (isCompleted) {
          router.replace('/(main)/home');
        } else {
          router.replace('/onboarding/expertise');
        }
      }

      return data.session;
    } catch (error) {
      console.error('[SocialLogin] Error:', error);
      Alert.alert('Error', 'Failed to sign in. Please try again.');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;

      const res = await WebBrowser.openAuthSessionAsync(data?.url ?? '', redirectTo, {
        showInRecents: true,
        createTask: false,
        enableDefaultShareMenuItem: false,
      });

      if (res.type === 'success') {
        await createSessionFromUrl(res.url);
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
        className="h-14 w-full flex-row items-center justify-center space-x-3 rounded-full border border-[#4ADE80]/20 bg-[#162116] shadow-lg shadow-[#4ADE80]/10">
        <Image
          source={require('../../assets/images/social/google.png')}
          className="h-5 w-5"
          resizeMode="contain"
        />
        <Text className="font-medium text-gray-300">
          {isSignUp ? 'Sign up with Google' : 'Sign in with Google'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
