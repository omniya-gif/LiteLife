import { useRouter } from 'expo-router';
import { Sun, Trophy } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useQuery } from 'react-query';

import { NotificationBell } from '../../components/notifications/NotificationBell';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { supabase } from '../../lib/supabase';
import { useUserStore } from '../../lib/store/userStore';
import { CoinsDisplay } from '../coins/CoinsDisplay';

interface HeaderProps {
  userName?: string;
}

export const Header = ({ userName }: HeaderProps) => {
  const router = useRouter();
  const { user } = useAuth();
  const { profile } = useUserStore();
  const theme = useTheme();

  // Badge count query
  const { data: badgeCount = 0 } = useQuery(
    'user-badge-count',
    async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return 0;

      const { count, error } = await supabase
        .from('user_badges')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id);

      if (error) throw error;
      return count || 0;
    },
    {
      staleTime: 1000 * 30, // 30 seconds
      cacheTime: 1000 * 60 * 5, // 5 minutes
    }
  );

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

    // First priority: username from database profile
    if (profile?.username) {
      return profile.username;
    }

    // Second priority: user metadata username
    if (user?.user_metadata?.username) {
      return user.user_metadata.username;
    }

    // Third priority: full name from metadata (Google Auth)
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.split(' ')[0];
    }

    // Fourth priority: name from metadata
    if (user?.user_metadata?.name) {
      return user.user_metadata.name.split(' ')[0];
    }

    // Fallback to 'User' - no email processing
    return 'User';
  }, [
    profile?.username,
    user?.user_metadata?.username,
    user?.user_metadata?.full_name,
    user?.user_metadata?.name,
  ]);
  return (
    <View className="px-6 pb-2 pt-4">
      {/* App Title */}
      <Animated.View entering={FadeIn.delay(100)} className="mb-4">
        <Text className="text-3xl font-bold text-white">
          Lite<Text style={{ color: theme.primary }}>Life</Text>
        </Text>
        <View className="mt-1 h-1 w-16 rounded-full" style={{ backgroundColor: theme.primary }} />
      </Animated.View>

      <View className="flex-row items-center justify-between">
        <View className="flex-1 mr-4">
          <Animated.View entering={FadeIn.delay(200)} className="flex-row items-center">
            <Sun size={16} color={theme.primary} />
            <Text className="ml-1.5 text-xs font-medium" style={{ color: theme.primary }}>{date}</Text>
          </Animated.View>
          <Text className="mt-1.5 text-2xl text-white" numberOfLines={1} ellipsizeMode="tail">
            Hi, <Text className="font-bold">{username}</Text>
          </Text>
        </View>

        <View className="flex-row items-center space-x-4">
          <CoinsDisplay />

          {/* Achievements Icon */}
          <TouchableOpacity onPress={() => router.push('/badges')} className="relative">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-[#FFD700]/20">
              <Trophy size={20} color="#FFD700" />
            </View>
            {badgeCount > 0 && (
              <View className="absolute -right-1 -top-1 h-5 w-5 items-center justify-center rounded-full bg-[#FFD700]">
                <Text className="text-xs font-bold text-black">{badgeCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          <NotificationBell />
          <TouchableOpacity
            onPress={() => router.push('/profile')}
            className="h-12 w-12 items-center justify-center overflow-hidden rounded-full"
            style={{ backgroundColor: theme.primary }}>
            <Text className="text-xl font-bold text-[#1A1B1E]">{getProfileInitial}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
