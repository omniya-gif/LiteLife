import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Activity, 
  Droplets, 
  Scale, 
  Flame, 
  Moon, 
  Footprints,
  Heart,
  TrendingUp,
  ChevronRight,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useValue } from '@legendapp/state/react';

import { BottomNavigation } from '../home/components/BottomNavigation';
import { useTheme } from '../../../hooks/useTheme';
import { useAuth } from '../../../hooks/useAuth';
import { user$ } from '../../../lib/store/user';

const { width } = Dimensions.get('window');

export default function HealthPage() {
  const router = useRouter();
  const theme = useTheme();
  const { user } = useAuth();
  const profile = useValue(user$.profile);
  const fetchUserData = user$.fetchUserData;

  useEffect(() => {
    if (user?.id && (!profile || profile.id !== user.id)) {
      fetchUserData(user.id);
    }
  }, [user?.id]);

  const healthTrackers = [
    {
      id: 'weight',
      title: 'Weight',
      value: `${profile?.weight || 60} kg`,
      subtitle: 'Last updated today',
      icon: Scale,
      color: theme.primary,
      route: '/calculators/weight',
    },
    {
      id: 'hydration',
      title: 'Water',
      value: '1.2L',
      subtitle: 'Goal: 2.5L',
      icon: Droplets,
      color: '#3B82F6',
      route: '/calculators/hydration',
    },
    {
      id: 'steps',
      title: 'Steps',
      value: '3,456',
      subtitle: 'Goal: 8,000',
      icon: Footprints,
      color: '#8B5CF6',
      route: '/calculators/steps/',
    },
    {
      id: 'sleep',
      title: 'Sleep',
      value: '6.5h',
      subtitle: 'Goal: 8h',
      icon: Moon,
      color: '#6366F1',
      route: '/calculators/sleep',
    },
  ];

  const quickActions = [
    {
      id: 'bmi',
      title: 'BMI Calculator',
      icon: TrendingUp,
      color: '#10B981',
      route: '/calculators/bmi',
    },
    {
      id: 'bmr',
      title: 'BMR Calculator',
      icon: Flame,
      color: '#F59E0B',
      route: '/calculators/bmr',
    },
    {
      id: 'calories',
      title: 'Calorie Calculator',
      icon: Activity,
      color: '#EF4444',
      route: '/calculators/calorie',
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000000' }}>
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header */}
        <Animated.View entering={FadeIn.duration(600)} className="px-6 pt-4 pb-2">
          <Text className="text-3xl font-bold text-white">Health</Text>
          <Text className="mt-1 text-base text-gray-400">Track your wellness journey</Text>
        </Animated.View>

        {/* Heart Rate Card */}
        <Animated.View entering={FadeInDown.delay(200).duration(600)} className="mx-6 mt-6">
          <View
            className="overflow-hidden rounded-3xl p-5"
            style={{ backgroundColor: '#1A1A1A' }}
          >
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-sm text-gray-400">Heart AVG bpm</Text>
                <View className="flex-row items-baseline">
                  <Text className="text-4xl font-bold text-white">76</Text>
                  <Text className="ml-2 text-sm text-gray-400">bpm</Text>
                </View>
              </View>
              <View 
                className="h-16 w-16 items-center justify-center rounded-2xl"
                style={{ backgroundColor: `${theme.primary}20` }}
              >
                <Heart size={32} color="#EF4444" fill="#EF4444" />
              </View>
            </View>
            
            {/* Fake heart rate graph */}
            <View className="mt-6 h-20 flex-row items-end justify-between">
              {[40, 60, 45, 70, 55, 80, 65].map((height, i) => (
                <View 
                  key={i} 
                  className="w-8 rounded-t-lg"
                  style={{ 
                    height: `${height}%`, 
                    backgroundColor: i === 5 ? theme.primary : `${theme.primary}40` 
                  }} 
                />
              ))}
            </View>
            <View className="mt-2 flex-row justify-between">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day, i) => (
                <Text key={i} className="w-8 text-center text-xs text-gray-500">{day}</Text>
              ))}
            </View>
          </View>
        </Animated.View>

        {/* Health Trackers Grid */}
        <Animated.View entering={FadeInDown.delay(300).duration(600)} className="mx-6 mt-6">
          <Text className="mb-4 text-xl font-bold text-white">Daily Tracking</Text>
          <View className="flex-row flex-wrap justify-between">
            {healthTrackers.map((tracker, index) => {
              const Icon = tracker.icon;
              return (
                <TouchableOpacity
                  key={tracker.id}
                  onPress={() => router.push(tracker.route as any)}
                  className="mb-4 rounded-2xl p-4"
                  style={{ width: '48%', backgroundColor: '#1A1A1A' }}
                  activeOpacity={0.8}
                >
                  <View 
                    className="mb-3 h-12 w-12 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${tracker.color}20` }}
                  >
                    <Icon size={24} color={tracker.color} />
                  </View>
                  <Text className="text-sm text-gray-400">{tracker.title}</Text>
                  <Text 
                    className="mt-1 text-2xl font-bold"
                    style={{ color: tracker.color }}
                  >
                    {tracker.value}
                  </Text>
                  <Text className="mt-1 text-xs text-gray-500">{tracker.subtitle}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View entering={FadeInDown.delay(400).duration(600)} className="mx-6 mt-4">
          <Text className="mb-4 text-xl font-bold text-white">Quick Actions</Text>
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <TouchableOpacity
                key={action.id}
                onPress={() => router.push(action.route as any)}
                className="mb-3 flex-row items-center justify-between rounded-2xl p-4"
                style={{ backgroundColor: '#1A1A1A' }}
                activeOpacity={0.8}
              >
                <View className="flex-row items-center">
                  <View 
                    className="mr-4 h-12 w-12 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${action.color}20` }}
                  >
                    <Icon size={24} color={action.color} />
                  </View>
                  <Text className="text-base font-semibold text-white">{action.title}</Text>
                </View>
                <ChevronRight size={20} color="#666" />
              </TouchableOpacity>
            );
          })}
        </Animated.View>
      </ScrollView>

      <BottomNavigation />
    </SafeAreaView>
  );
}