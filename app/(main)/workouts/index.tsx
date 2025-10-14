import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Clock, ChevronRight } from 'lucide-react-native';
import { Flame } from 'lucide-react-native'; // Add this import
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { Header } from '../home/components/Header';
import { BottomNavigation } from '../home/components/BottomNavigation';

const stats = [
  {
    id: 'completed',
    title: 'Finished',
    value: '12',
    subtitle: 'Completed\nWorkouts',
    emoji: '💪'
  },
  {
    id: 'inProgress',
    title: 'In progress',
    value: '2',
    subtitle: 'Workouts',
    emoji: '🐣'
  },
  {
    id: 'timeSpent',
    title: 'Time spent',
    value: '62',
    subtitle: 'Minutes',
    emoji: '⏱️'
  },
  {
    id: 'caloriesBurned',
    title: 'Calories',
    value: '847',
    subtitle: 'Calories\nBurned',
    emoji: '🔥'
  }
];

const workoutTypes = [
  {
    id: 'cardio',
    title: 'Cardio',
    exercises: 10,
    duration: '50 Minutes',
    color: '#FFB347',
    image: 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3'
  },
  {
    id: 'arms',
    title: 'Arms',
    exercises: 6,
    duration: '35 Minutes',
    color: '#66CDAA',
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e'
  },
  {
    id: 'yoga',
    title: 'Yoga',
    exercises: 8,
    duration: '40 Minutes',
    color: '#DDA0DD',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b'
  }
];

export default function WorkoutsPage() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#1A1B1E]">
      <ScrollView className="flex-1">
        <Animated.View entering={FadeInDown.springify()}>
          <Header 
            title="Workouts" 
            imageUrl="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b"
          />
        </Animated.View>
        
        {/* Progress Section Moved to Top */}
        <Animated.View 
          entering={FadeInDown.delay(200)}
          className="mx-6 mt-6 bg-[#25262B] rounded-2xl p-4 flex-row items-center"
        >
          <View className="h-12 w-12 bg-[#4ADE80]/20 rounded-full items-center justify-center mr-4">
            <Text className="text-2xl">🎯</Text>
          </View>
          <View className="flex-1">
            <Text className="text-white font-bold text-lg">Keep the progress!</Text>
            <Text className="text-gray-400">
              You are more successful than 88% users.
            </Text>
          </View>
        </Animated.View>

        <View className="px-6">
          {/* Stats Section */}
          <View className="flex-row flex-wrap justify-between mt-6">
            {stats.map((stat, index) => (
              <Animated.View
                key={stat.id}
                entering={FadeInDown.delay(index * 100)}
                className="bg-[#25262B] rounded-2xl p-4 mb-4"
                style={{ width: '48%' }}
              >
                <Text className="text-2xl mb-1">{stat.emoji}</Text>
                <Text className="text-4xl font-bold text-white mb-1">
                  {stat.value}
                </Text>
                <Text className="text-gray-400 text-sm">
                  {stat.subtitle}
                </Text>
              </Animated.View>
            ))}
          </View>

          {/* View All Exercises Button */}
          <Animated.View 
            entering={FadeInDown.delay(250)}
            className="mt-6"
          >
            <TouchableOpacity 
              onPress={() => router.push('/workouts/exercises')}
              className="flex-row items-center justify-between bg-[#25262B] p-4 rounded-2xl"
            >
              <View className="flex-row items-center">
                <View className="h-10 w-10 bg-[#4ADE80]/20 rounded-full items-center justify-center mr-3">
                  <Flame size={20} color="#4ADE80" />
                </View>
                <Text className="text-white text-lg font-semibold">View All Exercises</Text>
              </View>
              <ChevronRight size={20} color="#4ADE80" />
            </TouchableOpacity>
          </Animated.View>

          {/* Discover Section */}
          <Animated.View 
            entering={FadeInDown.delay(300)}
            className="mt-6"
          >
            <Text className="text-2xl font-bold text-white mb-4">
              Discover new workouts
            </Text>
            <View className="flex-row flex-wrap justify-between">
              {workoutTypes.map((workout, index) => (
                <TouchableOpacity
                  key={workout.id}
                  onPress={() => router.push(`/workouts/${workout.id}`)}
                  className="mb-4 rounded-2xl overflow-hidden"
                  style={{ width: '48%', backgroundColor: workout.color }}
                >
                  <View className="p-4">
                    <Text className="text-xl font-bold text-white mb-2">
                      {workout.title}
                    </Text>
                    <Text className="text-white/80">
                      {workout.exercises} Exercises
                    </Text>
                    <Text className="text-white/80">
                      {workout.duration}
                    </Text>
                  </View>
                  <Image
                    source={{ uri: workout.image }}
                    className="w-full h-32"
                    style={{ opacity: 0.8 }}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        </View>
      </ScrollView>
      <BottomNavigation />
    </SafeAreaView>
  );
}