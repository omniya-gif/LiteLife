import { useRouter } from 'expo-router';
import { ArrowLeft, Camera } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HEALTH_SERVICE_ICONS } from '../../../assets/icons/health';
import { LoadingScreen } from '../../../components/LoadingScreen';
import { useAuth } from '../../../hooks/useAuth';
import { useHealthConnect } from '../../../hooks/useHealthConnect';
import { useTheme } from '../../../hooks/useTheme';
import { useUserStore } from '../../../lib/store/userStore';

export default function ProfilePage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { profile, onboarding, fetchUserData, isLoading } = useUserStore();
  const theme = useTheme();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Health Connect setup
  const healthConnect = useHealthConnect([
    { accessType: 'read', recordType: 'Steps' },
    { accessType: 'read', recordType: 'Distance' },
    { accessType: 'read', recordType: 'FloorsClimbed' },
    { accessType: 'read', recordType: 'ActiveCaloriesBurned' },
  ]);

  useEffect(() => {
    if (user?.id) {
      // Always fetch to ensure data is current for this user
      fetchUserData(user.id);
    }
  }, [user?.id]);

  // Don't render profile data if it doesn't match current user
  const isProfileValid = profile?.id === user?.id;
  const displayProfile = isProfileValid ? profile : null;
  const displayOnboarding = isProfileValid ? onboarding : null;

  if (isLoading) {
    return <LoadingScreen />; // You'll need to create this component
  }

  const handleHealthConnectPress = () => {
    if (!healthConnect.isAvailable) {
      healthConnect.installHealthConnect();
    } else if (!healthConnect.hasPermissions) {
      healthConnect.requestHealthPermissions();
    } else {
      healthConnect.openSettings();
    }
  };

  const getHealthConnectStatus = () => {
    if (healthConnect.isChecking) {
      return { icon: '⏳', color: '#FCD34D', text: 'CHECKING...' };
    }
    if (!healthConnect.isAvailable) {
      return { icon: '❌', color: '#EF4444', text: 'NOT INSTALLED' };
    }
    if (!healthConnect.hasPermissions) {
      return { icon: '⚠️', color: '#F59E0B', text: 'NO PERMISSION' };
    }
    return { icon: '✅', color: '#10B981', text: 'CONNECTED' };
  };

  const renderHealthServices = () => {
    const services = [];

    // Add platform-specific health service
    if (Platform.OS === 'ios') {
      services.push(
        <TouchableOpacity
          key="apple-health"
          onPress={() => {
            /* Handle Apple Health */
          }}
          className="mx-1 flex-1 items-center rounded-2xl py-4"
          style={{ backgroundColor: `${theme.primary}30` }}>
          <Image
            source={HEALTH_SERVICE_ICONS.APPLE_HEALTH}
            className="h-8 w-8"
            resizeMode="contain"
          />
          <Text className="mt-2 text-xs font-medium text-white">APPLE HEALTH</Text>
        </TouchableOpacity>
      );
    } else if (Platform.OS === 'android') {
      const status = getHealthConnectStatus();
      services.push(
        <TouchableOpacity
          key="health-connect"
          onPress={handleHealthConnectPress}
          className="mx-1 flex-1 items-center rounded-2xl py-4"
          style={{ backgroundColor: `${theme.primary}30` }}>
          <View className="relative">
            <Image
              source={HEALTH_SERVICE_ICONS.GOOGLE_FIT}
              className="h-8 w-8"
              resizeMode="contain"
            />
            <View
              className="absolute -right-1 -top-1 h-4 w-4 items-center justify-center rounded-full"
              style={{ backgroundColor: status.color }}>
              <Text style={{ fontSize: 8 }}>{status.icon}</Text>
            </View>
          </View>
          <Text className="mt-2 text-xs font-medium text-white">HEALTH CONNECT</Text>
          <Text className="mt-1 text-[10px] text-gray-400">{status.text}</Text>
        </TouchableOpacity>
      );
    }

    // Always add Spoonacular
    services.push(
      <TouchableOpacity
        key="spoonacular"
        onPress={() => {
          /* Handle Spoonacular */
        }}
        className="mx-1 flex-1 items-center rounded-2xl py-4"
        style={{ backgroundColor: `${theme.primary}30` }}>
        <Image source={HEALTH_SERVICE_ICONS.SPOONACULAR} className="h-8 w-8" resizeMode="contain" />
        <Text className="mt-2 text-xs font-medium text-white">SPOONACULAR</Text>
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
              className="absolute h-full w-full"
              resizeMode="cover"
            />
            <View className="flex-row items-center justify-between px-6 pt-4">
              <TouchableOpacity
                onPress={() => router.back()}
                className="h-12 w-12 items-center justify-center rounded-xl bg-black/20">
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
            className="-mt-10 rounded-t-[36px] px-6 pt-12"
            style={{ backgroundColor: theme.background }}>
            {/* Profile Avatar with First Letter */}
            <View className="absolute -top-8 left-6">
              <View
                className="h-[60px] w-[60px] items-center justify-center rounded-2xl border-2 border-white"
                style={{ backgroundColor: theme.primary }}>
                <Text className="text-2xl font-bold text-white">
                  {(profile?.username || user?.email || 'U').charAt(0).toUpperCase()}
                </Text>
              </View>
            </View>

            {/* Profile Info */}
            <Animated.View
              entering={FadeInDown.delay(200)}
              className="mt-6 flex-row items-center justify-between">
              <View>
                <Text className="text-xl font-bold text-white">
                  {displayProfile?.username && displayProfile.username !== 'User'
                    ? displayProfile.username
                    : user?.user_metadata?.full_name?.split(' ')[0] ||
                      user?.user_metadata?.name?.split(' ')[0] ||
                      'User'}
                </Text>
                <Text className="mt-1 text-sm font-medium" style={{ color: theme.primary }}>
                  {displayOnboarding?.expertise?.toUpperCase() || 'BEGINNER'} MEMBER
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push('/profile/edit')}
                className="rounded-xl px-6 py-3"
                style={{ backgroundColor: `${theme.primary}10` }}>
                <Text className="font-medium" style={{ color: theme.primary }}>
                  Edit
                </Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Bio */}
            <Animated.Text
              entering={FadeInDown.delay(400)}
              className="mt-6 leading-5 text-gray-400">
              {displayProfile?.bio}
            </Animated.Text>

            {/* Goal Section - Updated styling */}
            <Animated.View
              entering={FadeInDown.delay(400)}
              className="mt-6 rounded-2xl p-4"
              style={{ backgroundColor: `${theme.primary}10` }}>
              <Text className="text-xs font-medium tracking-wider" style={{ color: theme.primary }}>
                GOAL
              </Text>
              <View className="mt-2 flex-row items-center">
                <Text className="text-xl font-bold text-white">
                  {displayOnboarding?.goal || 'Improve Health'}
                </Text>
                {displayOnboarding?.reason && (
                  <Text className="ml-2 flex-1 text-gray-400">• {onboarding.reason}</Text>
                )}
              </View>
            </Animated.View>

            {/* Stats */}
            <Animated.View
              entering={FadeInDown.delay(600)}
              className="mt-12 flex-row justify-between">
              <View>
                <Text
                  className="text-xs font-medium tracking-wider"
                  style={{ color: theme.primary }}>
                  WEIGHT
                </Text>
                <View className="mt-2 flex-row items-baseline">
                  <Text className="text-2xl font-bold text-white">
                    {displayOnboarding?.current_weight || '--'}
                  </Text>
                  <Text className="ml-1 text-gray-400">kg</Text>
                </View>
              </View>
              <View className="h-12 w-[1px]" style={{ backgroundColor: theme.backgroundDark }} />
              <View>
                <Text
                  className="text-xs font-medium tracking-wider"
                  style={{ color: theme.primary }}>
                  AGE
                </Text>
                <View className="mt-2 flex-row items-baseline">
                  <Text className="text-2xl font-bold text-white">
                    {displayOnboarding?.age || '--'}
                  </Text>
                  <Text className="ml-1 text-gray-400">yo</Text>
                </View>
              </View>
              <View className="h-12 w-[1px]" style={{ backgroundColor: theme.backgroundDark }} />
              <View>
                <Text
                  className="text-xs font-medium tracking-wider"
                  style={{ color: theme.primary }}>
                  HEIGHT
                </Text>
                <View className="mt-2 flex-row items-baseline">
                  <Text className="text-2xl font-bold text-white">
                    {displayOnboarding?.height || '--'}
                  </Text>
                  <Text className="ml-1 text-gray-400">cm</Text>
                </View>
              </View>
            </Animated.View>

            {/* Health Integrations */}
            <Animated.View entering={FadeInDown.delay(700)} className="mb-9 mt-12">
              <Text className="mb-4 text-lg font-bold text-white">Connect Health Services</Text>
              <View className="flex-row justify-between">{renderHealthServices()}</View>
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(750)} className="mb-6 mt-6">
              <TouchableOpacity
                onPress={async () => {
                  setIsLoggingOut(true);
                  await signOut();
                  router.replace('/signin');
                }}
                disabled={isLoggingOut}
                className="h-[54px] w-full items-center justify-center rounded-2xl bg-red-500/20"
                style={{ opacity: isLoggingOut ? 0.7 : 1 }}>
                <Text className="font-medium text-red-500">
                  {isLoggingOut ? 'Logging out...' : 'Log Out'}
                </Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Premium Card - Updated with darker green background */}
            <Animated.View
              entering={FadeInDown.delay(800)}
              className="mb-6 mt-9 rounded-3xl p-6"
              style={{ backgroundColor: theme.primaryDark }}>
              <Text className="text-xs font-medium" style={{ color: theme.primary }}>
                GO PREMIUM
              </Text>
              <Text className="mt-2 text-xl font-medium text-white">
                Unlock all features to improve your health
              </Text>
              <Text className="mt-1 text-white/60">Be a part of our healthy group</Text>

              {/* Member Images */}
              <View className="mt-6 flex-row">
                {[1, 2, 3, 4].map((_, i) => (
                  <Image
                    key={i}
                    source={{
                      uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=688&q=80',
                    }}
                    className="ml-3 h-[42px] w-[42px] rounded-xl first:ml-0"
                  />
                ))}
              </View>

              {/* Unlock Button */}
              <TouchableOpacity
                onPress={() => router.push('/subscription')}
                className="mt-6 h-[54px] w-full items-center justify-center rounded-2xl"
                style={{ backgroundColor: theme.primary }}>
                <Text className="font-medium text-white">Unlock now</Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
