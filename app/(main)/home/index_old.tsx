import { usePathname, useRouter, useFocusEffect } from 'expo-router';
import {
  ChevronRight,
  Scale,
  Ruler,
  User,
  Dumbbell,
  TrendingUp,
} from 'lucide-react-native';
import React, { useEffect, useState, useCallback } from 'react';
import {
  ScrollView,
  View,
  Text,
  Image,
  BackHandler,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { LinearGradient } from 'expo-linear-gradient';

import { BottomNavigation } from './components/BottomNavigation';
import { useAuth } from '../../../hooks/useAuth';
import { useHealthConnect, readExerciseSessions } from '../../../hooks/useHealthConnect';
import { user$ } from '../../../lib/store/user';
import { useValue } from '@legendapp/state/react';

// Clean color palette
const COLORS = {
  primary: '#29E33C',
  white: '#FFFFFF',
  gray: '#B0B0B0',
  darkGray: '#404040',
  cardBg: '#181818',
};

// Workout categories - clean minimal
const workoutCategories = [
  {
    id: 'strength',
    title: 'Strength',
    count: '45 exercises',
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400',
    bodyPart: 'upper arms',
  },
  {
    id: 'cardio',
    title: 'Cardio',
    count: '30 exercises',
    image: 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=400',
    bodyPart: 'cardio',
  },
];

export default function HomePage() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const fetchUserData = user$.fetchUserData;
  const profile = useValue(user$.profile);
  const [workoutData, setWorkoutData] = useState({ count: 0, totalMinutes: 0 });

  // Health Connect setup for Exercise sessions
  const healthConnect = useHealthConnect([
    { accessType: 'read', recordType: 'ExerciseSession' },
  ]);

  // Fetch workout data from Health Connect
  const fetchWorkoutData = useCallback(async () => {
    if (Platform.OS !== 'android' || !healthConnect.hasPermissions || !user?.email) {
      return;
    }

    try {
      const now = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);

      const data = await readExerciseSessions(
        thirtyDaysAgo.toISOString(),
        now.toISOString(),
        user.email
      );

      setWorkoutData(data);
    } catch (error) {
      console.error('Error fetching workout data:', error);
    }
  }, [healthConnect.hasPermissions, user?.email]);

  useFocusEffect(
    useCallback(() => {
      fetchWorkoutData();
    }, [fetchWorkoutData])
  );

  useEffect(() => {
    const cachedProfile = user$.profile.peek();
    if (user?.id && (!cachedProfile || cachedProfile.id !== user.id)) {
      fetchUserData(user.id);
    }
  }, [user?.id]);

  // Handle back press
  useEffect(() => {
    let lastBackPress = 0;
    const handleBackPress = () => {
      if (pathname !== '/home') return false;
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
    return () => BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
  }, [pathname]);

  // Get username
  const username = profile?.username && profile.username !== 'User' 
    ? profile.username 
    : user?.user_metadata?.full_name?.split(' ')[0] || 'there';

  const getInitial = () => {
    if (profile?.username && profile.username !== 'User') return profile.username[0].toUpperCase();
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name[0].toUpperCase();
    if (user?.email) return user.email[0].toUpperCase();
    return '?';
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* ===== CLEAN HEADER ===== */}
        <Animated.View entering={FadeIn.duration(500)} className="px-6 pt-4 pb-2">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={() => router.push('/profile')}
                className="mr-4 h-12 w-12 items-center justify-center rounded-full"
                style={{ backgroundColor: COLORS.card }}
              >
                <Text style={{ color: COLORS.primary }} className="text-lg font-bold">
                  {getInitial()}
                </Text>
              </TouchableOpacity>
              <View>
                <Text style={{ color: COLORS.textSecondary }} className="text-sm">
                  Welcome Back!
                </Text>
                <Text style={{ color: COLORS.text }} className="text-xl font-semibold">
                  {username}
                </Text>
              </View>
            </View>
            <View className="flex-row items-center">
              <TouchableOpacity 
                className="mr-3 h-11 w-11 items-center justify-center rounded-full"
                style={{ backgroundColor: COLORS.card }}
              >
                <Search size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity 
                className="h-11 w-11 items-center justify-center rounded-full"
                style={{ backgroundColor: COLORS.card }}
              >
                <Bell size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        {/* ===== MOTIVATION TEXT - NO BACKGROUND ===== */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)} className="mx-6 mt-6">
          <Text className="text-2xl font-bold text-white">Always keep</Text>
          <Text className="text-2xl font-bold text-white">yourself safe and</Text>
          <Text className="text-2xl font-bold" style={{ color: COLORS.primary }}>
            Healthy
          </Text>
        </Animated.View>

        {/* ===== STATS ROW - CLEAN MINIMAL ===== */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)} className="mx-6 mt-6">
          <View 
            className="flex-row rounded-2xl p-4"
            style={{ backgroundColor: COLORS.card }}
          >
            {/* Weight */}
            <View className="flex-1 items-center">
              <View 
                className="mb-2 h-11 w-11 items-center justify-center rounded-xl"
                style={{ backgroundColor: COLORS.background }}
              >
                <Scale size={20} color={COLORS.textSecondary} />
              </View>
              <Text style={{ color: COLORS.primary }} className="text-lg font-bold">
                {profile?.weight || 60} KG
              </Text>
              <Text style={{ color: COLORS.textSecondary }} className="text-xs mt-1">
                Weight
              </Text>
            </View>

            {/* Height */}
            <View className="flex-1 items-center">
              <View 
                className="mb-2 h-11 w-11 items-center justify-center rounded-xl"
                style={{ backgroundColor: COLORS.background }}
              >
                <Ruler size={20} color={COLORS.textSecondary} />
              </View>
              <Text style={{ color: COLORS.text }} className="text-lg font-bold">
                {profile?.height ? (profile.height / 30.48).toFixed(1) : '5.6'} Ft
              </Text>
              <Text style={{ color: COLORS.textSecondary }} className="text-xs mt-1">
                Height
              </Text>
            </View>

            {/* Age */}
            <View className="flex-1 items-center">
              <View 
                className="mb-2 h-11 w-11 items-center justify-center rounded-xl"
                style={{ backgroundColor: COLORS.background }}
              >
                <User size={20} color={COLORS.textSecondary} />
              </View>
              <Text style={{ color: COLORS.text }} className="text-lg font-bold">
                {profile?.age || 25} year
              </Text>
              <Text style={{ color: COLORS.textSecondary }} className="text-xs mt-1">
                Age
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* ===== HEALTH STATS - MINIMAL ===== */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)} className="mx-6 mt-6">
          <TouchableOpacity 
            onPress={() => router.push('/health')}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center justify-between mb-4">
              <Text style={{ color: COLORS.text }} className="text-lg font-semibold">
                Health Stats
              </Text>
              <ChevronRight size={20} color={COLORS.textSecondary} />
            </View>
            
            <View 
              className="flex-row items-center justify-between rounded-2xl p-4"
              style={{ backgroundColor: COLORS.card }}
            >
              <View className="flex-row items-center">
                <View 
                  className="mr-4 h-12 w-12 items-center justify-center rounded-xl"
                  style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)' }}
                >
                  <Heart size={22} color="#EF4444" fill="#EF4444" />
                </View>
                <View>
                  <Text style={{ color: COLORS.textSecondary }} className="text-sm">
                    Heart Health
                  </Text>
                  <Text style={{ color: COLORS.text }} className="text-2xl font-bold">
                    55
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                className="rounded-xl px-5 py-2.5"
                style={{ backgroundColor: COLORS.primary }}
              >
                <Text className="font-semibold text-black">Measure</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* ===== DISCOVER WORKOUTS ===== */}
        <Animated.View entering={FadeInDown.delay(400).duration(500)} className="mt-8">
          <View className="mb-4 flex-row items-center justify-between px-6">
            <Text style={{ color: COLORS.text }} className="text-lg font-semibold">
              Discover Workouts
            </Text>
            <TouchableOpacity onPress={() => router.push('/workouts/exercises')}>
              <Text style={{ color: COLORS.primary }} className="font-medium">
                See All
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 24, paddingRight: 16 }}
          >
            {workoutTypes.map((workout, index) => (
              <Animated.View
                key={workout.id}
                entering={FadeInRight.delay(500 + index * 80).duration(400)}
              >
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: '/workouts/exercises',
                      params: { bodyPart: workout.bodyPart },
                    })
                  }
                  className="mr-3 overflow-hidden rounded-2xl"
                  style={{ width: width * 0.4, backgroundColor: COLORS.card }}
                  activeOpacity={0.8}
                >
                  <Image
                    source={{ uri: workout.image }}
                    className="h-32 w-full"
                    resizeMode="cover"
                  />
                  <View className="p-3">
                    <Text style={{ color: COLORS.text }} className="text-base font-semibold">
                      {workout.title}
                    </Text>
                    <View className="mt-1 flex-row items-center">
                      <Clock size={12} color={COLORS.primary} />
                      <Text style={{ color: COLORS.textSecondary }} className="ml-1 text-xs">
                        {workout.duration}
                      </Text>
                    </View>
                    <Text style={{ color: COLORS.textSecondary }} className="text-xs mt-0.5">
                      {workout.exercises} Exercises
                    </Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </ScrollView>
        </Animated.View>
      </ScrollView>

      <BottomNavigation />
    </SafeAreaView>
  );
}
