import { useRouter, usePathname } from 'expo-router';
import LottieView from 'lottie-react-native';
import { Home, Activity, CalendarDays, Heart, Users } from 'lucide-react-native';
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../../hooks/useTheme';

export const BottomNavigation = () => {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();

  const isActive = (path: string) => {
    if (path === '/home' && (pathname === '/home' || pathname === '/')) {
      return true;
    }
    return pathname.includes(path);
  };

  // Determine which chat animation to use based on theme
  const chatAnimation = theme.primary === '#FF69B4' 
    ? require('../../../../assets/lottie_animations/chatpink.json')
    : require('../../../../assets/lottie_animations/chat.json');

  return (
    <View className="border-t border-[#2C2D32] bg-[#25262B] px-6 py-4">
      <View className="flex-row items-center justify-around">
        <TouchableOpacity className="items-center" onPress={() => router.push('/home')}>
          <Home size={24} color={isActive('/home') ? theme.primary : '#666'} />
          <Text
            className="mt-1 text-sm"
            style={{ color: isActive('/home') ? theme.primary : '#9CA3AF' }}>
            Home
          </Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center" onPress={() => router.push('/health')}>
          <Activity size={24} color={isActive('/health') ? theme.primary : '#666'} />
          <Text
            className="mt-1 text-sm"
            style={{ color: isActive('/health') ? theme.primary : '#9CA3AF' }}>
            Health
          </Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center" onPress={() => router.push('/chat')}>
          <LottieView
            source={chatAnimation}
            autoPlay
            loop
            style={{ width: 64, height: 64, marginTop: -16 }}
          />
        </TouchableOpacity>
        <TouchableOpacity className="items-center" onPress={() => router.push('/nutrition/meal-planner')}>
          <CalendarDays size={24} color={isActive('/nutrition/meal-planner') ? theme.primary : '#666'} />
          <Text
            className="mt-1 text-xs"
            style={{ color: isActive('/nutrition/meal-planner') ? theme.primary : '#9CA3AF' }}>
            Meals
          </Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center" onPress={() => router.push('/favorites')}>
          <Heart size={24} color={isActive('/favorites') ? theme.primary : '#666'} />
          <Text
            className="mt-1 text-sm"
            style={{ color: isActive('/favorites') ? theme.primary : '#9CA3AF' }}>
            Favorites
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
