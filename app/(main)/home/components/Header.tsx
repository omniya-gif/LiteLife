import { useRouter } from 'expo-router';
import { Sun } from 'lucide-react-native';
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useAuth } from '../../../../hooks/useAuth';
import { NotificationBell } from '../../../../components/notifications/NotificationBell';

interface HeaderProps {
  userName?: string;
}

export const Header = ({ userName }: HeaderProps) => {
  const router = useRouter();
  const { user } = useAuth();
  const date = new Date();
  const formattedDate = date
    .toLocaleDateString('en-US', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
    })
    .toUpperCase();

  // Get the first letter of the email for the profile avatar
  const getProfileInitial = () => {
    if (!user?.email) return '?';
    return user.email[0].toUpperCase();
  };

  // Get username from user metadata
  const username = user?.user_metadata?.username || 'User';

  return (
    <View className="px-6 pb-2 pt-4">
      <View className="flex-row items-center justify-between">
        <View>
          {/* Date Row with updated color */}
          <Animated.View entering={FadeIn.delay(200)} className="flex-row items-center">
            <Sun size={16} color="#4ADE80" />
            <Text className="ml-1.5 text-xs font-medium text-[#4ADE80]">
              {formattedDate}
            </Text>
          </Animated.View>

          {/* Greeting */}
          <Animated.Text entering={FadeIn.delay(400)} className="mt-1.5 text-2xl text-white">
            Hi, <Text className="font-bold">{username}</Text>
          </Animated.Text>
        </View>

        {/* Right side icons with increased spacing */}
        <View className="flex-row items-center space-x-6">
          <NotificationBell />
          <TouchableOpacity
            onPress={() => router.push('/profile')}
            className="h-12 w-12 items-center justify-center rounded-full bg-[#4ADE80] overflow-hidden"
          >
            <Text className="text-xl font-bold text-[#1A1B1E]">
              {getProfileInitial()}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
