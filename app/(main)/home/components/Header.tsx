import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Bell, Settings } from 'lucide-react-native';

interface HeaderProps {
  title: string;
  imageUrl: string;
}

export const Header = ({ title, imageUrl }: HeaderProps) => {
  return (
    <View className="px-6 pb-2 pt-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center space-x-3">
          <Image
            source={{ uri: imageUrl }}
            className="h-12 w-12 rounded-full border-2 border-[#4ADE80]"
          />
          <View className="ml-3">
            <Text className="text-2xl font-bold text-white">{title}</Text>
          </View>
        </View>
        <View className="flex-row items-center space-x-6">
          <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-full bg-[#25262B]">
            <Bell size={20} color="#4ADE80" />
            <View className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#4ADE80]" />
          </TouchableOpacity>
          <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-full bg-[#25262B]">
            <Settings size={20} color="#4ADE80" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
