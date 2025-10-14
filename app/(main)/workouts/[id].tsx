import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Clock, ChevronRight } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

const exercises = [
  {
    id: 1,
    name: 'Reclining to big toe',
    duration: '12 minutes',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b'
  },
  {
    id: 2,
    name: 'Cow Pose',
    duration: '8 minutes',
    image: 'https://images.unsplash.com/photo-1588286840104-8957b019727f'
  },
  {
    id: 3,
    name: 'Warrior II Pose',
    duration: '12 minutes',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b'
  }
];

export default function WorkoutDetailsPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  return (
    <SafeAreaView className="flex-1 bg-[#1A1B1E]">
      {/* Header Image */}
      <View className="h-96">
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b' }}
          className="absolute w-full h-full"
        />
        <TouchableOpacity 
          onPress={() => router.back()}
          className="absolute top-4 left-4 bg-black/20 p-2 rounded-full"
        >
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View className="flex-1 bg-[#1A1B1E] -mt-8 rounded-t-3xl">
        <ScrollView className="px-6 pt-6">
          <Animated.View entering={FadeInDown.springify()}>
            <Text className="text-3xl font-bold text-white mb-2">
              Yoga Workout
            </Text>
            <View className="flex-row space-x-4 mb-6">
              <View className="bg-[#4ADE80]/20 px-4 py-2 rounded-full">
                <Text className="text-[#4ADE80]">52:00</Text>
              </View>
              <View className="bg-[#4ADE80]/20 px-4 py-2 rounded-full">
                <Text className="text-[#4ADE80]">16 exercises</Text>
              </View>
            </View>
          </Animated.View>

          {/* Exercise List */}
          {exercises.map((exercise, index) => (
            <Animated.View
              key={exercise.id}
              entering={FadeInDown.delay(index * 100)}
              className="mb-4"
            >
              <TouchableOpacity className="flex-row items-center bg-[#25262B] rounded-xl p-4">
                <Image
                  source={{ uri: exercise.image }}
                  className="w-16 h-16 rounded-xl"
                />
                <View className="flex-1 ml-4">
                  <Text className="text-white font-medium">{exercise.name}</Text>
                  <Text className="text-gray-400">{exercise.duration}</Text>
                </View>
                <ChevronRight size={20} color="#4ADE80" />
              </TouchableOpacity>
            </Animated.View>
          ))}
        </ScrollView>

        {/* Start Button */}
        <View className="p-6">
          <TouchableOpacity className="bg-[#4ADE80] rounded-xl py-4">
            <Text className="text-center text-white font-bold text-lg">
              Start Workout
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}