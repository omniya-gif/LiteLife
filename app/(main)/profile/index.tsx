import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Dimensions, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Camera } from 'lucide-react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { CircularProgress } from '../../../components/CircularProgress';
import { useUserStore } from '../../../lib/store/userStore';
import { useAuth } from '../../../hooks/useAuth';
import { LoadingScreen } from '../../../components/LoadingScreen';
import { HEALTH_SERVICE_ICONS } from '../../../assets/icons/health';
import { useTheme } from '../../../hooks/useTheme';

const { width } = Dimensions.get('window');

export default function ProfilePage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { profile, onboarding, fetchUserData, isLoading } = useUserStore();
  const theme = useTheme();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (user?.id) {
      console.log('Profile Page - User ID:', user.id);
      fetchUserData(user.id);
    }
  }, [user?.id]);

  useEffect(() => {
    console.log('Profile Page - Current profile:', profile);
    console.log('Profile Page - Current onboarding:', onboarding);
  }, [profile, onboarding]);

  if (isLoading) {
    return <LoadingScreen />; // You'll need to create this component
  }

  const renderHealthServices = () => {
    const services = [];

    // Add platform-specific health service
    if (Platform.OS === 'ios') {
      services.push(
        <TouchableOpacity 
          key="apple-health"
          onPress={() => {/* Handle Apple Health */}}
          className="flex-1 items-center py-4 rounded-2xl mx-1"
          style={{ backgroundColor: `${theme.primary}30` }}
        >
          <Image 
            source={HEALTH_SERVICE_ICONS.APPLE_HEALTH}
            className="w-8 h-8"
            resizeMode="contain"
          />
          <Text className="text-white text-xs font-medium mt-2">
            APPLE HEALTH
          </Text>
        </TouchableOpacity>
      );
    } else if (Platform.OS === 'android') {
      services.push(
        <TouchableOpacity 
          key="google-fit"
          onPress={() => {/* Handle Google Fit */}}
          className="flex-1 items-center py-4 rounded-2xl mx-1"
          style={{ backgroundColor: `${theme.primary}30` }}
        >
          <Image 
            source={HEALTH_SERVICE_ICONS.GOOGLE_FIT}
            className="w-8 h-8"
            resizeMode="contain"
          />
          <Text className="text-white text-xs font-medium mt-2">
            GOOGLE FIT
          </Text>
        </TouchableOpacity>
      );
    }

    // Always add Spoonacular
    services.push(
      <TouchableOpacity 
        key="spoonacular"
        onPress={() => {/* Handle Spoonacular */}}
        className="flex-1 items-center py-4 rounded-2xl mx-1"
        style={{ backgroundColor: `${theme.primary}30` }}
      >
        <Image 
          source={HEALTH_SERVICE_ICONS.SPOONACULAR}
          className="w-8 h-8"
          resizeMode="contain"
        />
        <Text className="text-white text-xs font-medium mt-2">
          SPOONACULAR
        </Text>
      </TouchableOpacity>
    );

    return services;
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScrollView className="flex-1">
        <View>
          {/* Header Image - Local workout composition image */}
          <View className="h-[300px]">
            <Image 
              source={require('../../../assets/images/background-image/workout-composition-with-clipboard.jpg')}
              className="absolute w-full h-full"
              resizeMode="cover"
            />
            <View className="flex-row items-center justify-between px-6 pt-4">
              <TouchableOpacity 
                onPress={() => router.back()}
                className="h-12 w-12 items-center justify-center rounded-xl bg-black/20"
              >
                <ArrowLeft size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity className="h-9 w-9 items-center justify-center rounded-xl bg-white/30">
                <Camera size={16} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Profile Content */}
          <Animated.View 
            entering={FadeInDown.springify()}
            className="-mt-10 rounded-t-[36px] pt-12 px-6"
            style={{ backgroundColor: theme.background }}
          >
            {/* Profile Avatar with First Letter */}
            <View className="absolute -top-8 left-6">
              <View 
                className="w-[60px] h-[60px] rounded-2xl border-2 border-white items-center justify-center"
                style={{ backgroundColor: theme.primary }}
              >
                <Text className="text-white text-2xl font-bold">
                  {(profile?.username || user?.email || 'U').charAt(0).toUpperCase()}
                </Text>
              </View>
            </View>

            {/* Profile Info */}
            <Animated.View 
              entering={FadeInDown.delay(200)}
              className="flex-row items-center justify-between mt-6"
            >
              <View>
                <Text className="text-xl font-bold text-white">{profile?.username || user?.email?.split('@')[0] || 'User'}</Text>
                <Text className="text-sm font-medium mt-1" style={{ color: theme.primary }}>
                  {onboarding?.expertise?.toUpperCase() || 'BEGINNER'} MEMBER
                </Text>
              </View>
              <TouchableOpacity 
                onPress={() => router.push('/profile/edit')}
                className="px-6 py-3 rounded-xl"
                style={{ backgroundColor: `${theme.primary}10` }}
              >
                <Text className="font-medium" style={{ color: theme.primary }}>Edit</Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Bio */}
            <Animated.Text 
              entering={FadeInDown.delay(400)}
              className="text-gray-400 mt-6 leading-5"
            >
              {profile?.bio}
            </Animated.Text>

            {/* Goal Section - Updated styling */}
            <Animated.View 
              entering={FadeInDown.delay(400)}
              className="mt-6 p-4 rounded-2xl"
              style={{ backgroundColor: `${theme.primary}10` }}
            >
              <Text className="text-xs font-medium tracking-wider" style={{ color: theme.primary }}>
                GOAL
              </Text>
              <View className="flex-row items-center mt-2">
                <Text className="text-xl font-bold text-white">
                  {onboarding?.goal || 'Improve Health'}
                </Text>
                {onboarding?.reason && (
                  <Text className="text-gray-400 ml-2 flex-1">
                    • {onboarding.reason}
                  </Text>
                )}
              </View>
            </Animated.View>

            {/* Stats */}
            <Animated.View 
              entering={FadeInDown.delay(600)}
              className="flex-row justify-between mt-12"
            >
              <View>
                <Text className="text-xs font-medium tracking-wider" style={{ color: theme.primary }}>WEIGHT</Text>
                <View className="flex-row items-baseline mt-2">
                  <Text className="text-2xl font-bold text-white">
                    {onboarding?.current_weight || '--'}
                  </Text>
                  <Text className="text-gray-400 ml-1">kg</Text>
                </View>
              </View>
              <View className="h-12 w-[1px]" style={{ backgroundColor: theme.backgroundDark }} />
              <View>
                <Text className="text-xs font-medium tracking-wider" style={{ color: theme.primary }}>AGE</Text>
                <View className="flex-row items-baseline mt-2">
                  <Text className="text-2xl font-bold text-white">
                    {onboarding?.age || '--'}
                  </Text>
                  <Text className="text-gray-400 ml-1">yo</Text>
                </View>
              </View>
              <View className="h-12 w-[1px]" style={{ backgroundColor: theme.backgroundDark }} />
              <View>
                <Text className="text-xs font-medium tracking-wider" style={{ color: theme.primary }}>HEIGHT</Text>
                <View className="flex-row items-baseline mt-2">
                  <Text className="text-2xl font-bold text-white">
                    {onboarding?.height || '--'}
                  </Text>
                  <Text className="text-gray-400 ml-1">cm</Text>
                </View>
              </View>
            </Animated.View>

            {/* Health Integrations */}
            <Animated.View 
              entering={FadeInDown.delay(700)}
              className="mt-12 mb-9"
            >
              <Text className="text-white text-lg font-bold mb-4">
                Connect Health Services
              </Text>
              <View className="flex-row justify-between">
                {renderHealthServices()}
              </View>
            </Animated.View>
            <Animated.View 
              entering={FadeInDown.delay(750)}
              className="mt-6 mb-6"
            >
              <TouchableOpacity 
                onPress={async () => {
                  setIsLoggingOut(true);
                  // Small delay to show loading state
                  await new Promise(resolve => setTimeout(resolve, 300));
                  await signOut();
                  router.replace('/signin');
                }}
                disabled={isLoggingOut}
                className="w-full h-[54px] bg-red-500/20 rounded-2xl items-center justify-center"
                style={{ opacity: isLoggingOut ? 0.7 : 1 }}
              >
                <Text className="text-red-500 font-medium">
                  {isLoggingOut ? 'Logging out...' : 'Log Out'}
                </Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Premium Card - Updated with darker green background */}
            <Animated.View 
              entering={FadeInDown.delay(800)}
              className="mt-9 mb-6 rounded-3xl p-6"
              style={{ backgroundColor: theme.primaryDark }}
            >
              <Text className="text-xs font-medium" style={{ color: theme.primary }}>GO PREMIUM</Text>
              <Text className="text-white text-xl font-medium mt-2">
                Unlock all features to improve your health
              </Text>
              <Text className="text-white/60 mt-1">
                Be a part of our healthy group
              </Text>

              {/* Member Images */}
              <View className="flex-row mt-6">
                {[1,2,3,4].map((_, i) => (
                  <Image 
                    key={i}
                    source={{ uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=688&q=80' }}
                    className="w-[42px] h-[42px] rounded-xl ml-3 first:ml-0"
                  />
                ))}
              </View>

              {/* Unlock Button */}
              <TouchableOpacity 
                onPress={() => router.push('/subscription')}
                className="w-full h-[54px] rounded-2xl mt-6 items-center justify-center"
                style={{ backgroundColor: theme.primary }}
              >
                <Text className="text-white font-medium">Unlock now</Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        </View>
      </ScrollView>

      {/* Full-screen loading overlay for logout */}
      {isLoggingOut && (
        <View className="absolute inset-0 items-center justify-center" style={{ backgroundColor: '#1A1B1E' }}>
          <ActivityIndicator size="large" color="#EF4444" />
          <Text className="mt-4 text-lg text-white">Logging out...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}