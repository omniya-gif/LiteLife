import { useRouter } from 'expo-router';
import { Clock, ChevronRight, Flame, Trophy, Target, Zap } from 'lucide-react-native';
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Header } from '../../../components/home/Header';
import { BottomNavigation } from '../home/components/BottomNavigation';
import { useTheme } from '../../../hooks/useTheme';

const getStats = (theme: any) => [
  {
    id: 'completed',
    title: 'Finished',
    value: '12',
    subtitle: 'Workouts',
    icon: Trophy,
  },
  {
    id: 'inProgress',
    title: 'In Progress',
    value: '2',
    subtitle: 'Active',
    icon: Target,
  },
  {
    id: 'timeSpent',
    title: 'Time Spent',
    value: '62',
    subtitle: 'Minutes',
    icon: Clock,
  },
  {
    id: 'caloriesBurned',
    title: 'Calories',
    value: '847',
    subtitle: 'Burned',
    icon: Flame,
  },
];

const workoutTypes = [
  {
    id: 'cardio',
    title: 'Cardio',
    exercises: 10,
    duration: '50 Minutes',
    color: '#FFB347',
    image: 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3',
  },
  {
    id: 'arms',
    title: 'Arms',
    exercises: 6,
    duration: '35 Minutes',
    color: '#66CDAA',
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e',
  },
  {
    id: 'yoga',
    title: 'Yoga',
    exercises: 8,
    duration: '40 Minutes',
    color: '#DDA0DD',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b',
  },
];

export default function WorkoutsPage() {
  const router = useRouter();
  const theme = useTheme();
  const stats = getStats(theme);

  return (
    <SafeAreaView className="flex-1 bg-[#1A1B1E]">
      <ScrollView className="flex-1">
        <Animated.View entering={FadeInDown.springify()}>
          <Header
            title="Workouts"
            imageUrl="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b"
          />
        </Animated.View>

        {/* Progress Card */}
        <Animated.View
          entering={FadeInDown.delay(200)}
          className="mx-6 mt-6 overflow-hidden rounded-3xl"
          style={{ backgroundColor: `${theme.primary}15` }}>
          <View className="flex-row items-center p-5">
            <View 
              className="mr-4 h-14 w-14 items-center justify-center rounded-2xl"
              style={{ backgroundColor: theme.primary }}>
              <Zap size={28} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-white">Keep the progress!</Text>
              <Text className="mt-1 text-sm text-gray-400">
                You're ahead of 88% of users 🎉
              </Text>
            </View>
          </View>
        </Animated.View>

        <View className="px-6">
          {/* Stats Grid - Compact 4 Column Layout */}
          <View className="mt-6 flex-row justify-between">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Animated.View
                  key={stat.id}
                  entering={FadeInDown.delay(300 + index * 50)}
                  className="items-center rounded-2xl bg-[#25262B] p-3"
                  style={{ width: '23%' }}>
                  <View 
                    className="mb-2 h-10 w-10 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${theme.primary}20` }}>
                    <Icon size={20} color={theme.primary} />
                  </View>
                  <Text className="mb-0.5 text-2xl font-bold text-white">{stat.value}</Text>
                  <Text className="text-center text-xs text-gray-400" numberOfLines={1}>
                    {stat.subtitle}
                  </Text>
                </Animated.View>
              );
            })}
          </View>

          {/* View All Exercises Button */}
          <Animated.View entering={FadeInDown.delay(500)} className="mt-6">
            <TouchableOpacity
              onPress={() => router.push('/workouts/exercises')}
              className="flex-row items-center justify-between rounded-2xl p-5"
              style={{ backgroundColor: theme.primary }}>
              <View className="flex-row items-center">
                <View className="mr-3 h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                  <Flame size={24} color="white" />
                </View>
                <View>
                  <Text className="text-lg font-bold text-white">View All Exercises</Text>
                  <Text className="text-sm text-white/80">Browse full library</Text>
                </View>
              </View>
              <ChevronRight size={24} color="white" />
            </TouchableOpacity>
          </Animated.View>

          {/* Discover Section */}
          <Animated.View entering={FadeInDown.delay(600)} className="mt-8 mb-6">
            <View className="mb-5 flex-row items-center justify-between">
              <Text className="text-2xl font-bold text-white">Discover Workouts</Text>
              <TouchableOpacity>
                <Text style={{ color: theme.primary }} className="font-medium">
                  See All
                </Text>
              </TouchableOpacity>
            </View>
            <View className="flex-row flex-wrap justify-between">
              {workoutTypes.map((workout, index) => (
                <Animated.View
                  key={workout.id}
                  entering={FadeInDown.delay(700 + index * 100)}
                  style={{ width: '48%' }}
                  className="mb-4">
                  <TouchableOpacity
                    onPress={() => router.push(`/workouts/${workout.id}`)}
                    className="overflow-hidden rounded-3xl bg-[#25262B]">
                    <Image
                      source={{ uri: workout.image }}
                      className="h-36 w-full"
                      style={{ opacity: 0.9 }}
                    />
                    <View 
                      className="absolute inset-0"
                      style={{ 
                        backgroundColor: workout.color,
                        opacity: 0.3 
                      }} 
                    />
                    <View className="absolute inset-0 justify-end p-4">
                      <Text className="mb-1 text-xl font-bold text-white drop-shadow-lg">
                        {workout.title}
                      </Text>
                      <View className="flex-row items-center">
                        <Clock size={14} color="white" />
                        <Text className="ml-1 text-sm font-medium text-white">
                          {workout.duration}
                        </Text>
                      </View>
                      <Text className="mt-1 text-xs text-white/90">
                        {workout.exercises} Exercises
                      </Text>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </Animated.View>
        </View>
      </ScrollView>
      <BottomNavigation />
    </SafeAreaView>
  );
}
