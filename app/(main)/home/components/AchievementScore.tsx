import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronRight, Trophy, Medal, Award } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withRepeat,
  withTiming,
  withDelay,
  withSequence,
  FadeInUp
} from 'react-native-reanimated';

export const AchievementScore = () => {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    // Safe animation configuration
    rotation.value = withRepeat(
      withSequence(
        withTiming(-0.1, { duration: 1000 }),
        withTiming(0.1, { duration: 1000 }),
        withTiming(0, { duration: 1000 })
      ),
      -1,
      true
    );

    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const medalStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation.value * 30}deg` },
      { scale: scale.value }
    ]
  }));

  return (
    <View className="rounded-3xl bg-[#25262B] p-6">
      <View className="flex-row items-center">
        <Animated.View style={medalStyle} className="items-center justify-center">
          <View className="h-20 w-20 items-center justify-center rounded-full bg-[#4ADE80]/20">
            <Trophy size={40} color="#4ADE80" />
          </View>
        </Animated.View>
        <View className="ml-3 flex-1">
          <Text className="text-lg font-medium text-white">
            Health Pioneer
          </Text>
          <Text className="my-1.5 text-sm text-gray-400">
            You've unlocked your first badge! Complete daily tasks to earn more achievements
          </Text>
          <TouchableOpacity className="mt-2 flex-row items-center">
            <Text className="text-sm font-medium text-[#4ADE80] mr-1">
              View all badges
            </Text>
            <ChevronRight size={16} color="#4ADE80" />
          </TouchableOpacity>
        </View>
      </View>
      <View className="mt-4 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Text className="text-2xl font-bold text-[#4ADE80]">1</Text>
          <Text className="ml-1 text-sm text-gray-400">/ 24 badges</Text>
        </View>
        <View className="flex-row">
          {[...Array(3)].map((_, i) => (
            <Animated.View 
              key={i}
              entering={FadeInUp.delay(i * 200)}
              className="ml-1 h-8 w-8 rounded-full bg-[#2C2D32] items-center justify-center"
            >
              {i === 0 ? (
                <Medal size={16} color="#666666" />
              ) : i === 1 ? (
                <Trophy size={16} color="#666666" />
              ) : (
                <Award size={16} color="#666666" />
              )}
            </Animated.View>
          ))}
        </View>
      </View>
    </View>
  );
};
