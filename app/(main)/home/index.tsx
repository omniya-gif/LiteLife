import { usePathname, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ScrollView, View, Text, Image, BackHandler, TouchableOpacity } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { BottomNavigation } from './components/BottomNavigation';
import { MetricsOverview } from './components/MetricsOverview';
import { Header } from '../../../components/home/Header';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../hooks/useTheme';
import { useUserStore } from '../../../lib/store/userStore';

export default function HomePage() {
  const headerScale = useSharedValue(0.8);
  const headerOpacity = useSharedValue(0);
  const todayOpacity = useSharedValue(0);
  const todayTranslateY = useSharedValue(30);
  const workoutOpacity = useSharedValue(0);
  const workoutTranslateY = useSharedValue(50);
  const workoutScale = useSharedValue(0.95);
  const mealOpacity = useSharedValue(0);
  const mealTranslateY = useSharedValue(50);
  const mealScale = useSharedValue(0.95);

  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { fetchUserData } = useUserStore();
  const theme = useTheme();

  useEffect(() => {
    // Header animation - starts first
    headerScale.value = withDelay(100, withSpring(1, { damping: 15, stiffness: 150 }));
    headerOpacity.value = withDelay(100, withSpring(1, { damping: 15, stiffness: 150 }));

    // Today's Overview - starts after header
    todayOpacity.value = withDelay(300, withSpring(1, { damping: 20, stiffness: 100 }));
    todayTranslateY.value = withDelay(300, withSpring(0, { damping: 20, stiffness: 100 }));

    // Recent Workout - starts after today's overview
    workoutOpacity.value = withDelay(500, withSpring(1, { damping: 20, stiffness: 100 }));
    workoutTranslateY.value = withDelay(500, withSpring(0, { damping: 20, stiffness: 100 }));
    workoutScale.value = withDelay(500, withSpring(1, { damping: 15, stiffness: 120 }));

    // Recent Meal - starts after workout
    mealOpacity.value = withDelay(700, withSpring(1, { damping: 20, stiffness: 100 }));
    mealTranslateY.value = withDelay(700, withSpring(0, { damping: 20, stiffness: 100 }));
    mealScale.value = withDelay(700, withSpring(1, { damping: 15, stiffness: 120 }));
  }, []);

  // Fetch user data only if not already cached
  useEffect(() => {
    const { profile } = useUserStore.getState();

    // Only fetch if we don't have profile data or it doesn't match current user
    if (user?.id && (!profile || profile.id !== user.id)) {
      console.log('🏠 Home Page - Profile not cached, fetching for ID:', user.id);
      fetchUserData(user.id);
    } else if (profile) {
      console.log('🏠 Home Page - Profile already cached for user:', profile.username);
    }
  }, [user?.id]);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: headerScale.value }],
    opacity: headerOpacity.value,
  }));

  const todayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: todayOpacity.value,
    transform: [{ translateY: todayTranslateY.value }],
  }));

  const workoutAnimatedStyle = useAnimatedStyle(() => ({
    opacity: workoutOpacity.value,
    transform: [{ translateY: workoutTranslateY.value }, { scale: workoutScale.value }],
  }));

  const mealAnimatedStyle = useAnimatedStyle(() => ({
    opacity: mealOpacity.value,
    transform: [{ translateY: mealTranslateY.value }, { scale: mealScale.value }],
  }));

  useEffect(() => {
    let lastBackPress = 0;

    const handleBackPress = () => {
      // Only handle double-tap-to-exit on main home page
      if (pathname !== '/home') {
        return false; // Let the default back behavior work
      }

      const currentTime = new Date().getTime();

      if (currentTime - lastBackPress < 2000) {
        BackHandler.exitApp();
        return true;
      }

      lastBackPress = currentTime;
      Toast.show({
        type: 'info',
        text1: 'Press back again to exit',
        position: 'bottom',
        visibilityTime: 2000,
      });
      return true;
    };

    BackHandler.addEventListener('hardwareBackPress', handleBackPress);

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
    };
  }, [pathname]);

  return (
    <SafeAreaView className="flex-1 bg-[#1A1B1E]">
      <ScrollView className="flex-1">
        {/* Header Section - Animated */}
        <Animated.View style={headerAnimatedStyle}>
          <Header />
        </Animated.View>

        {/* Main Content with Large Workout Cards - No Tabs */}
        <View className="mt-6 px-4">
          {/* Today's Overview Section - Small Tab Style */}
          <Animated.View style={todayAnimatedStyle} className="mb-4">
            <View className="mb-3 rounded-xl bg-[#25262B] px-4 py-3">
              <Text className="text-lg font-semibold text-white">Today's Overview</Text>
            </View>
            <View className="rounded-3xl bg-[#25262B] p-4">
              <MetricsOverview />
            </View>
          </Animated.View>

          {/* Recent Workout Card */}
          <Animated.View style={workoutAnimatedStyle} className="mb-6">
            <TouchableOpacity
              onPress={() => router.push('/workouts')}
              activeOpacity={0.9}
              style={{
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 8,
                },
                shadowOpacity: 0.6,
                shadowRadius: 16,
                elevation: 20,
              }}>
              <View className="relative h-52 w-full justify-end overflow-hidden rounded-3xl">
                <Image
                  source={{
                    uri: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1887&auto=format&fit=crop',
                  }}
                  className="absolute inset-0 h-full w-full"
                  style={{ borderRadius: 24 }}
                  resizeMode="cover"
                />
                <View
                  className="absolute inset-0 h-full w-full justify-end p-6"
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.4)',
                    borderRadius: 24,
                  }}>
                  <View>
                    <Text className="mb-2 text-3xl font-bold text-white drop-shadow-lg">
                      Recent Workout
                    </Text>
                    <Text className="mb-4 text-lg text-white/95">Core - 15 min completed</Text>
                    <View
                      className="self-start rounded-full px-4 py-2"
                      style={{ backgroundColor: `${theme.primary}20` }}>
                      <Text className="text-sm font-semibold" style={{ color: theme.primary }}>
                        Explore more →
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* Recent Meal Card */}
          <Animated.View style={mealAnimatedStyle} className="mb-6">
            <TouchableOpacity
              onPress={() => router.push('/recipes')}
              activeOpacity={0.9}
              style={{
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 8,
                },
                shadowOpacity: 0.6,
                shadowRadius: 16,
                elevation: 20,
              }}>
              <View className="relative h-52 w-full justify-end overflow-hidden rounded-3xl">
                <Image
                  source={{
                    uri: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1887&auto=format&fit=crop',
                  }}
                  className="absolute inset-0 h-full w-full"
                  style={{ borderRadius: 24 }}
                  resizeMode="cover"
                />
                <View
                  className="absolute inset-0 h-full w-full justify-end p-6"
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    borderRadius: 24,
                  }}>
                  <View>
                    <Text className="mb-2 text-3xl font-bold text-white drop-shadow-lg">
                      Recent Meal
                    </Text>
                    <Text className="mb-4 text-lg text-white/95">
                      Grilled Chicken Salad - 420 cal
                    </Text>
                    <View
                      className="self-start rounded-full px-4 py-2"
                      style={{ backgroundColor: `${theme.primary}20` }}>
                      <Text className="text-sm font-semibold" style={{ color: theme.primary }}>
                        Explore more →
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </View>
        {/* Bottom padding for navigation */}
        <View className="pb-20" />
      </ScrollView>

      <BottomNavigation />
    </SafeAreaView>
  );
}
