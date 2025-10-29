import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronRight, Trophy, Medal, Award } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useQuery } from 'react-query';
import { supabase } from '../../lib/supabase';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withRepeat,
  withSequence,
  FadeInUp,
  withTiming
} from 'react-native-reanimated';

export const AchievementScore = () => {
  const router = useRouter();
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  const { data: badgeCount } = useQuery('user-badge-count', async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;

    const { count, error } = await supabase
      .from('user_badges')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id);

    if (error) throw error;
    return count || 0;
  });

  React.useEffect(() => {
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
    <TouchableOpacity 
      onPress={() => router.push('/badges')}
      className="rounded-3xl bg-[#25262B] p-6"
    >
      <View className="flex-row items-center">
        <Animated.View style={medalStyle} className="items-center justify-center">
          <View className="h-20 w-20 items-center justify-center rounded-full bg-[#4ADE80]/20">
            {badgeCount ? (
              <Trophy size={40} color="#4ADE80" />
            ) : (
              <Text className="text-4xl">❓</Text>
            )}
          </View>
        </Animated.View>
        <View className="ml-3 flex-1">
          <Text className="text-lg font-medium text-white">
            {badgeCount ? 'Achievements' : 'Unlock Achievements'}
          </Text>
          <Text className="my-1.5 text-sm text-gray-400">
            {badgeCount 
              ? `You've unlocked ${badgeCount} badges! Keep going to earn more.`
              : 'Complete tasks and earn coins to unlock special badges'
            }
          </Text>
          <View className="flex-row items-center">
            <Text className="text-sm font-medium text-[#4ADE80] mr-1">
              View Badge Store
            </Text>
            <ChevronRight size={16} color="#4ADE80" />
          </View>
        </View>
      </View>
      {badgeCount > 0 && (
        <View className="mt-4 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Text className="text-2xl font-bold text-[#4ADE80]">{badgeCount}</Text>
            <Text className="ml-1 text-sm text-gray-400">badges unlocked</Text>
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
      )}
    </TouchableOpacity>
  );
};