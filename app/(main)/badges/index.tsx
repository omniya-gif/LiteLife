import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Lock } from 'lucide-react-native';
import { useQuery } from 'react-query';
import { supabase } from '../../../lib/supabase';
import { useHealthCoins } from '../../../hooks/useHealthCoins';
import { Badge } from '../../../types/coins';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { BadgeCard } from '../../../components/badges/BadgeCard';

export default function BadgeStore() {
  const router = useRouter();
  const { coins } = useHealthCoins();

  const { data: badges, isLoading: badgesLoading, error: badgesError } = useQuery<Badge[]>(
    'badges',
    async () => {
      console.log('Fetching badges...');
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .order('cost', { ascending: true });

      if (error) {
        console.error('Error fetching badges:', error);
        throw error;
      }
      console.log('Badges fetched:', data);
      return data;
    },
    {
      retry: 3,
      onError: (error) => {
        console.error('Badge fetch error:', error);
      }
    }
  );

  const { data: userBadges, isLoading: userBadgesLoading } = useQuery(
    'user-badges',
    async () => {
      console.log('Fetching user badges...');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found');
        return [];
      }

      const { data, error } = await supabase
        .from('user_badges')
        .select('badge_id')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching user badges:', error);
        throw error;
      }
      console.log('User badges fetched:', data);
      return data.map(b => b.badge_id);
    }
  );

  if (badgesError) {
    return (
      <SafeAreaView className="flex-1 bg-[#1A1B1E]">
        <View className="flex-1 items-center justify-center">
          <Text className="text-white">Error loading badges. Please try again.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (badgesLoading || userBadgesLoading) {
    return (
      <SafeAreaView className="flex-1 bg-[#1A1B1E]">
        <View className="flex-1 items-center justify-center">
          <Text className="text-white">Loading badges...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#1A1B1E]">
      <View className="flex-row items-center justify-between px-6 pt-4 pb-6">
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white">Badge Store</Text>
        <View className="h-12 w-12 items-center justify-center rounded-full bg-[#25262B]">
          <Text className="text-[#4ADE80] font-bold">{coins?.balance || 0}</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-6">
        {badges?.map((badge, index) => (
          <Animated.View
            key={badge.id}
            entering={FadeInDown.delay(index * 100)}
          >
            <BadgeCard
              badge={badge}
              isUnlocked={userBadges?.includes(badge.id) || false}
            />
          </Animated.View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}