import { useRouter } from 'expo-router';
import { Sun } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { NotificationBell } from '../../components/notifications/NotificationBell';
import { useAuth } from '../../hooks/useAuth';
import { useUserStore } from '../../stores/userStore';
import { CoinsDisplay } from '../coins/CoinsDisplay';

interface HeaderProps {
  userName?: string;
}

export const Header = ({ userName }: HeaderProps) => {
  const router = useRouter();
  const { user } = useAuth();
  const { profile } = useUserStore();

  // Add debugging logs
  console.log('Header - Current user:', user);
  console.log('Header - Current profile:', profile);
  console.log('Header - Profile username:', profile?.username);
  console.log('Header - User metadata username:', user?.user_metadata?.username);

  const date = useMemo(() => {
    return new Date()
      .toLocaleDateString('en-US', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
      })
      .toUpperCase();
  }, []);

  const getProfileInitial = useMemo(() => {
    if (!user?.email) return '?';
    return user.email[0].toUpperCase();
  }, [user?.email]);

  const username = useMemo(() => {
    console.log(
      'Header - Computing username with profile:',
      profile?.username,
      'user metadata:',
      user?.user_metadata?.username
    );
    return profile?.username || user?.user_metadata?.username || 'User';
  }, [profile?.username, user?.user_metadata?.username]);

  return (
    <View className="px-6 pb-2 pt-4">
      <View className="flex-row items-center justify-between">
        <View>
          <Animated.View entering={FadeIn.delay(200)} className="flex-row items-center">
            <Sun size={16} color="#4ADE80" />
            <Text className="ml-1.5 text-xs font-medium text-[#4ADE80]">{date}</Text>
          </Animated.View>

          <Text className="mt-1.5 text-2xl text-white">
            Hi, <Text className="font-bold">{username}</Text>
          </Text>
        </View>

        <View className="flex-row items-center space-x-4">
          <CoinsDisplay />
          <NotificationBell />
          <TouchableOpacity
            onPress={() => router.push('/profile')}
            className="h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-[#4ADE80]">
            <Text className="text-xl font-bold text-[#1A1B1E]">{getProfileInitial}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
