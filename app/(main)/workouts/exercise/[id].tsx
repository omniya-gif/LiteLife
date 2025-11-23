import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Target, Dumbbell, Activity, ChevronRight, Play, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import YoutubePlayer from 'react-native-youtube-iframe';

import { useExerciseDetail } from '../../../../hooks/useExerciseDetail';
import { useExerciseVideos } from '../../../../hooks/useExerciseVideos';
import { useTheme } from '../../../../hooks/useTheme';

interface VideoPreview {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  channelName: string;
}

export default function ExerciseDetailPage() {
  const router = useRouter();
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [selectedVideo, setSelectedVideo] = useState<VideoPreview | null>(null);
  const [playing, setPlaying] = useState(false);
  
  const {
    exercise,
    similarByTarget,
    similarByEquipment,
    isLoading,
    error,
  } = useExerciseDetail(id || null);

  const { videos, isLoading: videosLoading } = useExerciseVideos(exercise?.name || null);

  const closeVideoModal = () => {
    setPlaying(false);
    setSelectedVideo(null);
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-[#1A1B1E]">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={theme.primary} />
          <Text className="mt-4 text-gray-400">Loading exercise...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !exercise) {
    return (
      <SafeAreaView className="flex-1 bg-[#1A1B1E]">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-xl text-white">Exercise not found</Text>
          <Text className="mt-2 text-center text-gray-400">{error}</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-6 rounded-full px-6 py-3"
            style={{ backgroundColor: theme.primary }}>
            <Text className="font-semibold text-white">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#1A1B1E]">
      <ScrollView className="flex-1">
        {/* Header */}
        <Animated.View entering={FadeIn} className="relative">
          <View className="absolute left-4 top-4 z-10">
            <TouchableOpacity
              onPress={() => router.back()}
              className="h-10 w-10 items-center justify-center rounded-full bg-black/60">
              <ArrowLeft size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Exercise GIF */}
          <View className="h-80 bg-gray-800">
            <Image
              source={{ uri: exercise.gifUrl }}
              className="h-full w-full"
              resizeMode="contain"
            />
          </View>
        </Animated.View>

        {/* Exercise Info */}
        <Animated.View entering={FadeInDown.delay(200)} className="px-6 pt-6">
          <Text className="text-3xl font-bold capitalize text-white">{exercise.name}</Text>

          {/* Tags */}
          <View className="mt-4 flex-row flex-wrap gap-2">
            <View className="flex-row items-center rounded-full bg-[#25262B] px-4 py-2">
              <Target size={16} color={theme.primary} />
              <Text className="ml-2 capitalize text-white">{exercise.target}</Text>
            </View>
            <View className="flex-row items-center rounded-full bg-[#25262B] px-4 py-2">
              <Dumbbell size={16} color={theme.primary} />
              <Text className="ml-2 capitalize text-white">{exercise.equipment}</Text>
            </View>
            <View className="flex-row items-center rounded-full bg-[#25262B] px-4 py-2">
              <Activity size={16} color={theme.primary} />
              <Text className="ml-2 capitalize text-white">{exercise.bodyPart}</Text>
            </View>
          </View>

          {/* YouTube Videos */}
          {videos.length > 0 && (
            <View className="mt-6">
              <View className="mb-4 flex-row items-center justify-between">
                <Text className="text-xl font-bold text-white">Watch Videos</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {videos.map((video, index) => (
                  <Animated.View
                    key={video.videoId}
                    entering={FadeInDown.delay(300 + index * 50)}>
                    <TouchableOpacity
                      onPress={() => setSelectedVideo(video)}
                      className="mr-4 w-64 overflow-hidden rounded-2xl bg-[#25262B]">
                      {/* Video Thumbnail */}
                      <View className="relative">
                        <Image
                          source={{ uri: video.thumbnailUrl }}
                          className="h-36 w-full bg-gray-700"
                          resizeMode="cover"
                        />
                        {/* Play Button Overlay */}
                        <View className="absolute inset-0 items-center justify-center bg-black/30">
                          <View
                            className="h-16 w-16 items-center justify-center rounded-full"
                            style={{ backgroundColor: theme.primary }}>
                            <Play size={28} color="white" fill="white" style={{ marginLeft: 3 }} />
                          </View>
                        </View>
                      </View>
                      <View className="p-3">
                        <Text className="text-white" numberOfLines={2}>
                          {video.title}
                        </Text>
                        <Text className="mt-1 text-xs text-gray-400">{video.channelName}</Text>
                      </View>
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Instructions */}
          {exercise.instructions && exercise.instructions.length > 0 && (
            <View className="mt-6">
              <Text className="mb-3 text-xl font-bold text-white">Instructions</Text>
              <View className="rounded-2xl bg-[#25262B] p-4">
                {exercise.instructions.map((instruction, index) => (
                  <View key={index} className="mb-3 flex-row">
                    <View
                      className="mr-3 h-6 w-6 items-center justify-center rounded-full"
                      style={{ backgroundColor: theme.primary }}>
                      <Text className="text-sm font-bold text-white">{index + 1}</Text>
                    </View>
                    <Text className="flex-1 text-gray-300">{instruction}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Secondary Muscles */}
          {exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0 && (
            <View className="mt-6">
              <Text className="mb-3 text-xl font-bold text-white">Secondary Muscles</Text>
              <View className="flex-row flex-wrap gap-2">
                {exercise.secondaryMuscles.map((muscle, index) => (
                  <View
                    key={index}
                    className="rounded-full bg-[#25262B] px-4 py-2"
                    style={{ borderWidth: 1, borderColor: `${theme.primary}30` }}>
                    <Text className="capitalize text-gray-300">{muscle}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Log Workout Button */}
          <TouchableOpacity
            onPress={() => {
              // TODO: Phase 4 - Implement workout logging
              console.log('Log workout for:', exercise.id);
            }}
            className="mt-6 rounded-2xl py-4"
            style={{ backgroundColor: theme.primary }}>
            <Text className="text-center text-lg font-bold text-white">Log Workout</Text>
          </TouchableOpacity>

          {/* Similar by Target */}
          {similarByTarget.length > 0 && (
            <View className="mt-8">
              <View className="mb-4 flex-row items-center justify-between">
                <Text className="text-xl font-bold text-white">
                  Similar Target: {exercise.target}
                </Text>
                <TouchableOpacity>
                  <ChevronRight size={24} color={theme.primary} />
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {similarByTarget.map((similarEx, index) => (
                  <Animated.View
                    key={similarEx.id}
                    entering={FadeInDown.delay(300 + index * 50)}>
                    <TouchableOpacity
                      onPress={() => router.push(`/workouts/exercise/${similarEx.id}`)}
                      className="mr-4 w-40 overflow-hidden rounded-2xl bg-[#25262B]">
                      <Image
                        source={{ uri: similarEx.gifUrl }}
                        className="h-40 w-full bg-gray-700"
                        resizeMode="cover"
                      />
                      <View className="p-3">
                        <Text className="capitalize text-white" numberOfLines={2}>
                          {similarEx.name}
                        </Text>
                        <Text className="mt-1 text-xs capitalize text-gray-400">
                          {similarEx.equipment}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Similar by Equipment */}
          {similarByEquipment.length > 0 && (
            <View className="mt-8 pb-8">
              <View className="mb-4 flex-row items-center justify-between">
                <Text className="text-xl font-bold text-white">
                  Using: {exercise.equipment}
                </Text>
                <TouchableOpacity>
                  <ChevronRight size={24} color={theme.primary} />
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {similarByEquipment.map((similarEx, index) => (
                  <Animated.View
                    key={similarEx.id}
                    entering={FadeInDown.delay(400 + index * 50)}>
                    <TouchableOpacity
                      onPress={() => router.push(`/workouts/exercise/${similarEx.id}`)}
                      className="mr-4 w-40 overflow-hidden rounded-2xl bg-[#25262B]">
                      <Image
                        source={{ uri: similarEx.gifUrl }}
                        className="h-40 w-full bg-gray-700"
                        resizeMode="cover"
                      />
                      <View className="p-3">
                        <Text className="capitalize text-white" numberOfLines={2}>
                          {similarEx.name}
                        </Text>
                        <Text className="mt-1 text-xs capitalize text-gray-400">
                          {similarEx.target}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </ScrollView>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* YouTube Player Modal - In-App Playback */}
      <Modal
        visible={selectedVideo !== null}
        transparent
        animationType="fade"
        onRequestClose={closeVideoModal}>
        <View className="flex-1 bg-black">
          <SafeAreaView className="flex-1">
            {/* Close Button */}
            <View className="absolute right-4 top-4 z-20">
              <TouchableOpacity
                onPress={closeVideoModal}
                className="h-12 w-12 items-center justify-center rounded-full bg-black/80">
                <X size={24} color="white" />
              </TouchableOpacity>
            </View>

            {/* Center Content */}
            <View className="flex-1 items-center justify-center">
              {selectedVideo && (
                <Animated.View 
                  entering={FadeInUp.springify()}
                  className="w-full"
                  style={{ maxWidth: Math.min(width, 500) }}>
                  
                  {/* YouTube Player */}
                  <View className="overflow-hidden rounded-2xl">
                    <YoutubePlayer
                      height={Math.min(width * 0.5625, 281)} // 16:9 aspect ratio
                      play={playing}
                      videoId={selectedVideo.videoId}
                      onReady={() => setPlaying(true)}
                      onChangeState={(state) => {
                        if (state === 'ended') {
                          setPlaying(false);
                        }
                      }}
                    />
                  </View>

                  {/* Video Info Below */}
                  <View className="mt-6 px-6">
                    <Text className="text-xl font-bold text-white" numberOfLines={3}>
                      {selectedVideo.title}
                    </Text>
                    <Text className="mt-2 text-sm text-gray-400">
                      By {selectedVideo.channelName}
                    </Text>
                  </View>
                </Animated.View>
              )}
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
