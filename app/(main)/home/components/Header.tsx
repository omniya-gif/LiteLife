import { useRouter } from 'expo-router';
import { Bell, Sun } from 'lucide-react-native';
import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

interface HeaderProps {
  userName?: string;
}

export const Header = ({ userName = 'Amelia' }: HeaderProps) => {
  const router = useRouter();
  const date = new Date();
  const formattedDate = date
    .toLocaleDateString('en-US', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
    })
    .toUpperCase();

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
            Hi, <Text className="font-bold">{userName}</Text>
          </Animated.Text>
        </View>

        {/* Right side icons - Updated sizes and replaced Settings with Profile */}
        <View className="flex-row items-center space-x-4">
          <TouchableOpacity className="h-12 w-12 items-center justify-center rounded-full bg-[#25262B]">
            <Bell size={24} color="#4ADE80" />
            <View className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-[#4ADE80]" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/profile')}
            className="h-12 w-12 items-center justify-center rounded-full bg-[#25262B] overflow-hidden">
            <Image
              source={{ 
                uri: 'https://lh3.googleusercontent.com/a/ACg8ocKNBFWV69JbUEJ0vivGR40_Ml5lhEhSm0aA19tZhT5C=s96-c'
              }}
              className="h-full w-full"
              resizeMode="cover"
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
