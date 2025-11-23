import { useRouter, useLocalSearchParams } from 'expo-router';
import { Filter, RefreshCw, Search, X } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PageHeader } from '../../../components/common/PageHeader';
import { BottomNavigation } from '../home/components/BottomNavigation';
import { useExerciseLibrary } from '../../../hooks/useExerciseLibrary';
import { useTheme } from '../../../hooks/useTheme';

// Body part icons mapping
const bodyPartIcons: { [key: string]: string } = {
  back: '🔙',
  cardio: '❤️',
  chest: '🏋️',
  'lower arms': '💪',
  'lower legs': '🦵',
  neck: '🦒',
  shoulders: '🎯',
  'upper arms': '💪',
  'upper legs': '🦵',
  waist: '⭐',
};

export default function ExercisesPage() {
  const router = useRouter();
  const theme = useTheme();
  const params = useLocalSearchParams<{ bodyPart?: string }>();
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const {
    exercises,
    bodyParts,
    isLoading,
    error,
    filters,
    updateFilters,
    resetFilters,
    refresh,
  } = useExerciseLibrary();

  // Apply bodyPart filter from navigation params
  useEffect(() => {
    if (params.bodyPart && params.bodyPart !== 'all') {
      console.log('🎯 Applying bodyPart filter from params:', params.bodyPart);
      updateFilters({ bodyPart: params.bodyPart });
    }
  }, [params.bodyPart]);

  const selectedBodyPart = filters.bodyPart || 'all';
  
  // Get exercise count by body part
  const getBodyPartCount = (bodyPart: string) => {
    if (bodyPart === 'all') return exercises.length;
    return exercises.filter((ex) => ex.bodyPart === bodyPart).length;
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      updateFilters({ search: searchQuery.trim() });
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    updateFilters({ search: undefined });
  };

  const handleFilterChange = (bodyPart: string) => {
    if (bodyPart === 'all') {
      updateFilters({ bodyPart: undefined });
    } else {
      updateFilters({ bodyPart });
    }
    setShowFilterModal(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#1A1B1E]">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }>
        <Animated.View entering={FadeInDown.springify()}>
          <PageHeader
            title="Exercise Library"
            imageUrl="https://images.unsplash.com/photo-1583454110551-21f2fa2afe61"
          />
        </Animated.View>

        {/* Search Bar */}
        <View className="px-6 py-4">
          <View className="flex-row items-center rounded-full bg-[#25262B] px-4 py-3">
            <Search size={20} color="#9CA3AF" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              placeholder="Search exercises..."
              placeholderTextColor="#9CA3AF"
              className="ml-3 flex-1 text-white"
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={clearSearch}>
                <X size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filter Button & Stats */}
        <View className="flex-row items-center justify-between px-6 pb-4">
          <View>
            <Text className="text-sm text-gray-400">Category</Text>
            <Text className="text-xl font-bold text-white capitalize">
              {selectedBodyPart === 'all' ? 'All Exercises' : selectedBodyPart}
            </Text>
            <Text className="text-sm" style={{ color: theme.primary }}>
              {exercises.length} exercises
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowFilterModal(true)}
            className="flex-row items-center rounded-full bg-[#25262B] px-4 py-2">
            <Filter size={20} color={theme.primary} />
            <Text className="ml-2" style={{ color: theme.primary }}>
              Filter
            </Text>
          </TouchableOpacity>
        </View>

        {/* Error State */}
        {error && (
          <View className="mx-6 mb-4 rounded-2xl bg-red-500/10 border border-red-500/30 p-4">
            <Text className="text-red-400">{error}</Text>
            <TouchableOpacity onPress={refresh} className="mt-2">
              <Text style={{ color: theme.primary }}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Loading State */}
        {isLoading && exercises.length === 0 ? (
          <View className="items-center justify-center py-20">
            <ActivityIndicator size="large" color={theme.primary} />
            <Text className="mt-4 text-gray-400">Loading exercises...</Text>
          </View>
        ) : exercises.length === 0 ? (
          <View className="items-center justify-center py-20">
            <Text className="text-xl text-white">No exercises found</Text>
            <Text className="mt-2 text-gray-400">Try adjusting your filters</Text>
            <TouchableOpacity
              onPress={() => {
                resetFilters();
                clearSearch();
              }}
              className="mt-4 rounded-full px-6 py-3"
              style={{ backgroundColor: theme.primary }}>
              <Text className="font-semibold text-white">Reset Filters</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Exercise List */
          <View className="px-6 pb-6">
            {exercises.map((exercise, index) => (
              <Animated.View
                key={exercise.id}
                entering={FadeInDown.delay(index * 50)}
                className="mb-4">
                <TouchableOpacity
                  onPress={() => router.push(`/workouts/exercise/${exercise.id}`)}
                  className="overflow-hidden rounded-2xl bg-[#25262B]">
                  <View className="flex-row">
                    {exercise.gifUrl ? (
                      <Image
                        source={{ uri: exercise.gifUrl }}
                        className="h-28 w-28 bg-gray-700"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="h-28 w-28 items-center justify-center bg-gray-700">
                        <Text className="text-4xl">💪</Text>
                      </View>
                    )}
                    <View className="flex-1 p-4">
                      <Text className="text-lg font-semibold text-white capitalize" numberOfLines={2}>
                        {exercise.name}
                      </Text>
                      <View className="mt-2 flex-row items-center">
                        <View className="mr-4">
                          <Text className="text-xs text-gray-500">Target</Text>
                          <Text className="text-sm capitalize" style={{ color: theme.primary }}>
                            {exercise.target}
                          </Text>
                        </View>
                        <View>
                          <Text className="text-xs text-gray-500">Equipment</Text>
                          <Text className="text-sm text-gray-300 capitalize">
                            {exercise.equipment}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}>
        <View className="flex-1 justify-end bg-black/50">
          <TouchableOpacity
            className="flex-1"
            activeOpacity={1}
            onPress={() => setShowFilterModal(false)}
          />
          <View className="rounded-t-3xl bg-[#1A1B1E]">
            <View className="mx-auto mt-4 h-1 w-12 rounded-full bg-gray-600" />

            <View className="p-6">
              <View className="mb-4 flex-row items-center justify-between">
                <Text className="text-xl font-bold text-white">Filter by Body Part</Text>
                {selectedBodyPart !== 'all' && (
                  <TouchableOpacity
                    onPress={() => {
                      resetFilters();
                      setShowFilterModal(false);
                    }}>
                    <Text style={{ color: theme.primary }}>Reset</Text>
                  </TouchableOpacity>
                )}
              </View>

              <ScrollView className="max-h-[400]">
                {/* All Exercises Option */}
                <TouchableOpacity
                  onPress={() => handleFilterChange('all')}
                  className={`mb-2 flex-row items-center justify-between rounded-xl p-4 ${
                    selectedBodyPart === 'all' ? 'bg-[#4ADE80]' : 'bg-[#25262B]'
                  }`}
                  style={
                    selectedBodyPart === 'all'
                      ? { backgroundColor: theme.primary }
                      : undefined
                  }>
                  <View className="flex-row items-center">
                    <Text className="mr-3 text-2xl">💪</Text>
                    <Text
                      className={`font-semibold capitalize ${
                        selectedBodyPart === 'all' ? 'text-white' : 'text-white'
                      }`}>
                      All Exercises
                    </Text>
                  </View>
                  <Text className={selectedBodyPart === 'all' ? 'text-white' : 'text-gray-400'}>
                    {getBodyPartCount('all')}
                  </Text>
                </TouchableOpacity>

                {/* Body Parts from API */}
                {bodyParts.map((part) => (
                  <TouchableOpacity
                    key={part}
                    onPress={() => handleFilterChange(part)}
                    className={`mb-2 flex-row items-center justify-between rounded-xl p-4 ${
                      selectedBodyPart === part ? 'bg-[#4ADE80]' : 'bg-[#25262B]'
                    }`}
                    style={
                      selectedBodyPart === part
                        ? { backgroundColor: theme.primary }
                        : undefined
                    }>
                    <View className="flex-row items-center">
                      <Text className="mr-3 text-2xl">
                        {bodyPartIcons[part] || '💪'}
                      </Text>
                      <Text
                        className={`font-semibold capitalize ${
                          selectedBodyPart === part ? 'text-white' : 'text-white'
                        }`}>
                        {part}
                      </Text>
                    </View>
                    <Text className={selectedBodyPart === part ? 'text-white' : 'text-gray-400'}>
                      {getBodyPartCount(part)}
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
