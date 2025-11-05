import { useRouter } from 'expo-router';
import { Dumbbell, ChevronRight, Filter } from 'lucide-react-native';
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Modal } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PageHeader } from '../../../components/common/PageHeader';
import { BottomNavigation } from '../home/components/BottomNavigation';

const bodyParts = [
  {
    id: 'all',
    name: 'All Exercises',
    icon: '💪',
    count: 24,
  },
  {
    id: 'chest',
    name: 'Chest',
    icon: '🏋️',
    count: 8,
  },
  {
    id: 'back',
    name: 'Back',
    icon: '🔙',
    count: 6,
  },
  {
    id: 'shoulders',
    name: 'Shoulders',
    icon: '🎯',
    count: 4,
  },
  {
    id: 'arms',
    name: 'Arms',
    icon: '💪',
    count: 10,
  },
  {
    id: 'legs',
    name: 'Legs',
    icon: '🦵',
    count: 8,
  },
  {
    id: 'core',
    name: 'Core',
    icon: '⭐',
    count: 6,
  },
];

const exercises = [
  {
    id: 'bench-press',
    name: 'Bench Press',
    bodyPart: 'chest',
    sets: '4 sets',
    duration: '15 mins',
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b',
  },
  {
    id: 'deadlift',
    name: 'Deadlift',
    bodyPart: 'back',
    sets: '3 sets',
    duration: '20 mins',
    image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61',
  },
  // Add more exercises here
];

export default function ExercisesPage() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const selectedCategory = bodyParts.find((part) => part.id === selectedFilter);

  const filteredExercises =
    selectedFilter === 'all' ? exercises : exercises.filter((ex) => ex.bodyPart === selectedFilter);

  return (
    <SafeAreaView className="flex-1 bg-[#1A1B1E]">
      <ScrollView className="flex-1">
        <Animated.View entering={FadeInDown.springify()}>
          <PageHeader
            title="Exercises"
            imageUrl="https://images.unsplash.com/photo-1583454110551-21f2fa2afe61"
          />
        </Animated.View>

        {/* Filter Button */}
        <View className="flex-row items-center justify-between px-6 py-4">
          <View>
            <Text className="text-sm text-gray-400">Category</Text>
            <Text className="text-xl font-bold text-white">
              {selectedCategory?.name || 'All Exercises'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowFilterModal(true)}
            className="flex-row items-center rounded-full bg-[#25262B] px-4 py-2">
            <Filter size={20} color="#4ADE80" />
            <Text className="ml-2 text-[#4ADE80]">Filter</Text>
          </TouchableOpacity>
        </View>

        {/* Exercise List */}
        <View className="px-6">
          {filteredExercises.map((exercise, index) => (
            <Animated.View
              key={exercise.id}
              entering={FadeInDown.delay(index * 100)}
              className="mb-4">
              <TouchableOpacity
                onPress={() => router.push(`/workouts/exercise/${exercise.id}`)}
                className="overflow-hidden rounded-2xl bg-[#25262B]">
                <View className="flex-row">
                  <Image source={{ uri: exercise.image }} className="h-24 w-24" />
                  <View className="flex-1 p-4">
                    <Text className="text-lg font-semibold text-white">{exercise.name}</Text>
                    <Text className="text-gray-400">{exercise.sets}</Text>
                    <Text className="text-gray-400">{exercise.duration}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}>
        <View className="flex-1 justify-end bg-black/50">
          <View className="rounded-t-3xl bg-[#1A1B1E]">
            <View className="mx-auto mt-4 h-1 w-12 rounded-full bg-gray-600" />

            <View className="p-6">
              <Text className="mb-4 text-xl font-bold text-white">Filter by Category</Text>

              <ScrollView className="max-h-[400]">
                {bodyParts.map((part) => (
                  <TouchableOpacity
                    key={part.id}
                    onPress={() => {
                      setSelectedFilter(part.id);
                      setShowFilterModal(false);
                    }}
                    className={`mb-2 flex-row items-center justify-between rounded-xl p-4 ${
                      selectedFilter === part.id ? 'bg-[#4ADE80]' : 'bg-[#25262B]'
                    }`}>
                    <View className="flex-row items-center">
                      <Text className="mr-3 text-2xl">{part.icon}</Text>
                      <Text
                        className={`font-semibold ${
                          selectedFilter === part.id ? 'text-[#1A1B1E]' : 'text-white'
                        }`}>
                        {part.name}
                      </Text>
                    </View>
                    <Text
                      className={selectedFilter === part.id ? 'text-[#1A1B1E]' : 'text-gray-400'}>
                      {part.count}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </View>
      </Modal>

      <BottomNavigation />
    </SafeAreaView>
  );
}
