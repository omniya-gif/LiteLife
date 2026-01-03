import { usePathname, useRouter, useFocusEffect } from 'expo-router';
import { ChevronRight, Scale, Ruler, User, Dumbbell, TrendingUp } from 'lucide-react-native';
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
  cardBg: '#181818',
};

// Workout categories
const workoutCategories = [
  {
    id: 'strength',
    title: 'Strength Training',
    count: '45 exercises',
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600',
    bodyPart: 'upper arms',
  },
  {
    id: 'cardio',
    title: 'Cardio Blast',
    count: '30 exercises',
    image: 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=600',
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

  const healthConnect = useHealthConnect([
    { accessType: 'read', recordType: 'ExerciseSession' },
  ]);

  const fetchWorkoutData = useCallback(async () => {
    if (Platform.OS !== 'android' || !healthConnect.hasPermissions || !user?.email) return;
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

  const username =
    profile?.username && profile.username !== 'User'
      ? profile.username
      : user?.user_metadata?.full_name?.split(' ')[0] || 'there';

  const getInitial = () => {
    if (profile?.username && profile.username !== 'User') return profile.username[0].toUpperCase();
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name[0].toUpperCase();
    if (user?.email) return user.email[0].toUpperCase();
    return '?';
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000000' }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header - Clean & Simple */}
        <Animated.View entering={FadeIn.duration(400)} className="px-6 pt-6 pb-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text style={{ color: '#6B7280', fontSize: 14 }}>Welcome back</Text>
              <Text style={{ color: '#FFFFFF', fontSize: 28, fontWeight: '700', marginTop: 4 }}>
                {username}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/profile')}
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: '#1F1F1F',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text style={{ color: COLORS.primary, fontSize: 18, fontWeight: '700' }}>
                {getInitial()}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Stats Card - Clean 3-column */}
        <Animated.View entering={FadeInDown.delay(100)} className="mx-6 mb-6">
          <View style={{ backgroundColor: '#1F1F1F', borderRadius: 20, padding: 20 }}>
            <View className="flex-row justify-between">
              <View className="flex-1 items-center">
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: 'rgba(41, 227, 60, 0.15)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 12,
                  }}>
                  <Scale size={22} color={COLORS.primary} />
                </View>
                <Text style={{ color: '#FFFFFF', fontSize: 24, fontWeight: '700' }}>
                  {profile?.weight || 60}
                </Text>
                <Text style={{ color: '#6B7280', fontSize: 12, marginTop: 4 }}>kg</Text>
              </View>

              <View className="flex-1 items-center">
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: 'rgba(41, 227, 60, 0.15)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 12,
                  }}>
                  <Ruler size={22} color={COLORS.primary} />
                </View>
                <Text style={{ color: '#FFFFFF', fontSize: 24, fontWeight: '700' }}>
                  {profile?.height ? (profile.height / 30.48).toFixed(1) : '5.6'}
                </Text>
                <Text style={{ color: '#6B7280', fontSize: 12, marginTop: 4 }}>ft</Text>
              </View>

              <View className="flex-1 items-center">
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: 'rgba(41, 227, 60, 0.15)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 12,
                  }}>
                  <User size={22} color={COLORS.primary} />
                </View>
                <Text style={{ color: '#FFFFFF', fontSize: 24, fontWeight: '700' }}>
                  {profile?.age || 25}
                </Text>
                <Text style={{ color: '#6B7280', fontSize: 12, marginTop: 4 }}>yrs</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Primary CTA - Exercises */}
        <Animated.View entering={FadeInDown.delay(200)} className="mx-6 mb-6">
          <TouchableOpacity
            onPress={() => router.push('/workouts/exercises')}
            style={{
              backgroundColor: COLORS.primary,
              borderRadius: 16,
              padding: 20,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <View className="flex-row items-center">
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: 'rgba(0,0,0,0.1)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 16,
                }}>
                <Dumbbell size={24} color="#000000" />
              </View>
              <View>
                <Text style={{ color: '#000000', fontSize: 18, fontWeight: '700' }}>
                  Browse Exercises
                </Text>
                <Text style={{ color: 'rgba(0,0,0,0.6)', fontSize: 14, marginTop: 2 }}>
                  1000+ exercises
                </Text>
              </View>
            </View>
            <ChevronRight size={24} color="#000000" />
          </TouchableOpacity>
        </Animated.View>

        {/* Secondary Action - Health */}
        <Animated.View entering={FadeInDown.delay(250)} className="mx-6 mb-8">
          <TouchableOpacity
            onPress={() => router.push('/health')}
            style={{
              backgroundColor: '#1F1F1F',
              borderRadius: 16,
              padding: 20,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <View className="flex-row items-center">
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: 'rgba(41, 227, 60, 0.15)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 16,
                }}>
                <TrendingUp size={24} color={COLORS.primary} />
              </View>
              <View>
                <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '700' }}>
                  Health Tracking
                </Text>
                <Text style={{ color: '#6B7280', fontSize: 14, marginTop: 2 }}>
                  Weight, water, steps
                </Text>
              </View>
            </View>
            <ChevronRight size={24} color="#6B7280" />
          </TouchableOpacity>
        </Animated.View>

        {/* Workouts Section */}
        <Animated.View entering={FadeInDown.delay(300)} className="px-6">
          <View className="mb-4 flex-row items-center justify-between">
            <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '700' }}>Workouts</Text>
            <TouchableOpacity onPress={() => router.push('/workouts/exercises')}>
              <Text style={{ color: COLORS.primary, fontSize: 14, fontWeight: '600' }}>
                See All
              </Text>
            </TouchableOpacity>
          </View>

          {workoutCategories.map((category, index) => (
            <TouchableOpacity
              key={category.id}
              onPress={() =>
                router.push({
                  pathname: '/workouts/exercises',
                  params: { bodyPart: category.bodyPart },
                })
              }
              style={{
                marginBottom: 16,
                borderRadius: 16,
                overflow: 'hidden',
                height: 180,
              }}
              activeOpacity={0.9}>
              <Image source={{ uri: category.image }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.85)']}
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: 20,
                }}>
                <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: '700', marginBottom: 4 }}>
                  {category.title}
                </Text>
                <Text style={{ color: '#9CA3AF', fontSize: 14 }}>{category.count}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </Animated.View>
      </ScrollView>

      <BottomNavigation />
    </SafeAreaView>
  );
}
