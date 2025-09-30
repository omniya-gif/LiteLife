import { Bell, Moon } from 'lucide-react-native';
import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';

export const Header = () => {
  const router = useRouter();
  
  return (
    <View className="flex-row items-center justify-between bg-white px-8 py-6 shadow-sm">
      <View className="flex-row items-center space-x-3">
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80' }}
          className="h-10 w-10 rounded-full"
        />
        <View>
          <Text className="text-sm text-gray-500">Welcome back</Text>
          <Text className="text-lg font-semibold text-gray-900">Hassan Mdala</Text>
        </View>
      </View>
      <View className="mr-2 flex-row items-center space-x-10">
        <TouchableOpacity
          className="h-12 w-12 items-center justify-center rounded-full bg-gray-100"
          onPress={() => {}}>
          <Moon size={22} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity
          className="h-12 w-12 items-center justify-center rounded-full bg-gray-100"
          onPress={() => router.push('/notifications')}>
          <Bell size={22} color="#666" />
          <View className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full bg-red-500" />
        </TouchableOpacity>
      </View>
    </View>
  );
};
